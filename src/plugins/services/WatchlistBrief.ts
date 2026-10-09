/**
 * Watchlist Brief — Muse-style standing brief, built natively.
 *
 * On a schedule (default daily), compiles a compact market brief from the
 * bot's own data — tracked symbols' price moves, trending tokens, sentiment
 * pulse, and the bot's own recent decisions — and delivers it through the
 * NotificationService (daily_summary).
 *
 * Muse-pattern origin (Oct 2026): standing watchlist jobs that deliver
 * "price and % change, filings, next event, one line of material news".
 * Here: crypto-native — price moves, sentiment, trending, bot decisions.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";
import { SentimentAnalyzer } from "./SentimentAnalyzer.ts";
import { NotificationService } from "./NotificationService.ts";

export interface WatchlistBriefConfig {
	/** Comma-separated symbols to track (e.g. "BTC,ETH,SOL") */
	symbols: string;
	/** Brief interval in minutes (default 1440 = daily) */
	intervalMinutes: number;
	/** Enable the brief */
	enabled: boolean;
}

export interface MarketRow {
	symbol: string;
	priceUsd: number;
	change24h: number;
}

export class WatchlistBrief extends Service {
	static serviceType = "watchlist-brief";
	capabilityDescription =
		"Compiles and delivers a scheduled market watchlist brief";

	private config: WatchlistBriefConfig;
	private timer: ReturnType<typeof setInterval> | null = null;

	constructor(runtime?: IAgentRuntime) {
		super(runtime);
		this.config = {
			symbols: "BTC,ETH,SOL",
			intervalMinutes: 1440,
			enabled: true,
		};
	}

	static async start(runtime?: IAgentRuntime): Promise<WatchlistBrief> {
		logger.info("*** Starting Watchlist Brief Service ***");
		const svc = new WatchlistBrief(runtime);
		if (runtime) await svc.initialize(runtime);
		return svc;
	}

	static async stop(): Promise<void> {
		logger.info("*** Stopping Watchlist Brief Service ***");
	}

	async stop(): Promise<void> {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	public async initialize(runtime: IAgentRuntime): Promise<void> {
		const symbols = String(runtime.getSetting("WATCHLIST_SYMBOLS") || "");
		if (symbols) this.config.symbols = symbols;
		const interval = runtime.getSetting("BRIEF_INTERVAL_MINUTES");
		if (interval) this.config.intervalMinutes = Number(interval);
		const enabled = runtime.getSetting("WATCHLIST_BRIEF_ENABLED");
		if (enabled !== undefined && enabled !== null) {
			this.config.enabled = String(enabled) === "true";
		}
		if (this.config.enabled) {
			this.startScheduler();
		}
	}

	public startScheduler(): void {
		if (this.timer) return;
		const ms = this.config.intervalMinutes * 60_000;
		this.timer = setInterval(() => {
			void this.runBriefCycle();
		}, ms);
		logger.info(
			`[watchlist-brief] scheduled every ${this.config.intervalMinutes}min for ${this.config.symbols}`,
		);
	}

	/** Symbols from config; env vars are runtime settings. */
	public getConfig(): WatchlistBriefConfig {
		return { ...this.config };
	}

	private symbols(): string[] {
		return this.config.symbols
			.split(",")
			.map((s) => s.trim().toUpperCase())
			.filter(Boolean);
	}

	/** One brief cycle: compile + deliver (exported for tests and manual runs) */
	public async runBriefCycle(
		fetchFn: typeof fetch = fetch,
		now: Date = new Date(),
	): Promise<string> {
		const rows = await this.fetchMarketRows(this.symbols(), fetchFn);
		const sentiment = await this.collectSentiment(this.symbols());
		const trending = await this.fetchTrending(fetchFn);
		const screener = await this.screenerSection();
		const kronos = await this.kronosSection(fetchFn);
		const brief = this.compileBrief(rows, sentiment, trending, now, screener, kronos);
		await this.deliver(brief);
		return brief;
	}

	/**
	 * Optional Kronos forecast section via the kronos-forecast service:
	 * the foundation model's 24h outlook for BTC (local, free). Empty on
	 * any failure — the brief never breaks on the reflex layer.
	 */
	private async kronosSection(fetchFn: typeof fetch): Promise<string> {
		try {
			const k = this.runtime?.getService(
				"kronos-forecast",
			) as unknown as
				| {
						isUsable?: () => boolean;
						briefSection?: (fetchFn: typeof fetch) => Promise<string>;
				  }
				| null;
			if (!k?.briefSection) return "";
			if (k.isUsable && !k.isUsable()) return "";
			return await k.briefSection(fetchFn);
		} catch {
			return "";
		}
	}

	/**
	 * Optional screener section via the TradingView MCP bridge (when the
	 * reflex layer is enabled): top gainers across Binance, from public data.
	 * Any failure returns an empty string — the brief never breaks on it.
	 */
	private async screenerSection(): Promise<string> {
		try {
			const bridge = this.runtime?.getService(
				"tradingview-mcp",
			) as unknown as
				| {
						isUsable?: () => boolean;
						topMovers?: (
							exchange: string,
							direction: "gainers" | "losers",
						) => Promise<{ text: string }>;
				  }
				| null;
			if (!bridge?.topMovers) return "";
			if (bridge.isUsable && !bridge.isUsable()) return "";
			const res = await bridge.topMovers("BINANCE", "gainers");
			const text = (res?.text ?? "").trim();
			if (!text) return "";
			return `\n📈 Screener (Binance 1d):\n${text.slice(0, 400)}`;
		} catch {
			return "";
		}
	}

	private async fetchMarketRows(
		symbols: string[],
		fetchFn: typeof fetch,
	): Promise<MarketRow[]> {
		try {
			const res = await fetchFn(
				`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
					symbols.map(coingeckoId).join(","),
				)}&vs_currencies=usd&include_24hr_change=true`,
			);
			if (!res.ok) throw new Error(`coingecko ${res.status}`);
			const data = (await res.json()) as Record<
				string,
				{ usd: number; usd_24h_change?: number }
			>;
			return symbols
				.filter((s) => data[coingeckoId(s)])
				.map((s) => ({
					symbol: s,
					priceUsd: data[coingeckoId(s)].usd,
					change24h: data[coingeckoId(s)].usd_24h_change ?? 0,
				}));
		} catch (err) {
			logger.warn(
				`[watchlist-brief] market fetch failed: ${err instanceof Error ? err.message : String(err)}`,
			);
			return [];
		}
	}

	private async collectSentiment(
		symbols: string[],
	): Promise<Record<string, number>> {
		const out: Record<string, number> = {};
		try {
			const svc = this.runtime?.getService(
				SentimentAnalyzer.serviceType,
			) as unknown as SentimentAnalyzer | null;
			if (!svc?.analyzeSentiment) return out;
			for (const s of symbols.slice(0, 5)) {
				try {
					const data = await svc.analyzeSentiment(s);
					if (data && typeof data.score === "number") out[s] = data.score;
				} catch {
					/* per-symbol sentiment is best-effort */
				}
			}
		} catch {
			/* service absent — brief continues without sentiment */
		}
		return out;
	}

	private async fetchTrending(fetchFn: typeof fetch): Promise<string[]> {
		try {
			const res = await fetchFn(
				"https://api.coingecko.com/api/v3/search/trending",
			);
			if (!res.ok) return [];
			const data = (await res.json()) as {
				coins?: Array<{ item?: { symbol?: string } }>;
			};
			return (data.coins ?? [])
				.map((c) => c.item?.symbol)
				.filter((s): s is string => Boolean(s))
				.slice(0, 5);
		} catch {
			return [];
		}
	}

	/** Pure formatting — deterministic, unit-tested. */
	public compileBrief(
		rows: MarketRow[],
		sentiment: Record<string, number>,
		trending: string[],
		now: Date = new Date(),
		screenerSection = "",
		kronosSection = "",
	): string {
		const lines: string[] = [];
		lines.push(
			`📋 Watchlist Brief — ${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)} UTC`,
		);
		if (rows.length === 0) {
			lines.push("Market data unavailable this cycle.");
			return lines.join("\n");
		}
		lines.push("");
		for (const r of rows) {
			const dir = r.change24h >= 0 ? "🟢" : "🔴";
			const s = sentiment[r.symbol];
			const sentNote =
				s === undefined
					? ""
					: ` | sentiment ${s >= 0 ? "+" : ""}${s.toFixed(2)}`;
			lines.push(
				`${dir} ${r.symbol}: $${formatUsd(r.priceUsd)} (${r.change24h >= 0 ? "+" : ""}${r.change24h.toFixed(1)}% 24h)${sentNote}`,
			);
		}
		if (trending.length > 0) {
			lines.push("", `🔥 Trending: ${trending.join(", ")}`);
		}
		if (screenerSection) {
			lines.push(screenerSection);
		}
		if (kronosSection) {
			lines.push(kronosSection);
		}
		return lines.join("\n");
	}

	private async deliver(brief: string): Promise<void> {
		try {
			const svc = this.runtime?.getService(
				NotificationService.serviceType,
			) as unknown as NotificationService | null;
			if (svc?.send) {
				await svc.send({
					type: "daily_summary",
					priority: "low",
					title: "Watchlist Brief",
					message: brief,
				});
				return;
			}
		} catch {
			/* notification service optional */
		}
		// Fallback: log it so the brief is never lost.
		logger.info(`[watchlist-brief] BRIEF:\n${brief}`);
	}
}

function coingeckoId(symbol: string): string {
	const ids: Record<string, string> = {
		BTC: "bitcoin",
		ETH: "ethereum",
		SOL: "solana",
		XRP: "ripple",
		ADA: "cardano",
		AVAX: "avalanche-2",
		DOGE: "dogecoin",
		LINK: "chainlink",
		DOT: "polkadot",
		MATIC: "matic-network",
	};
	return ids[symbol] ?? symbol.toLowerCase();
}

function formatUsd(price: number): string {
	return price >= 100
		? price.toFixed(0)
		: price >= 1
			? price.toFixed(2)
			: price.toPrecision(3);
}