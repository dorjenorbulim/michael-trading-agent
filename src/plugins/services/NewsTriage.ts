/**
 * News Triage — Muse-style per-token news monitoring, built natively.
 *
 * Polls crypto news RSS feeds on a schedule, scans headlines for watched
 * symbols, scores materiality (severe vs informational), dedupes against a
 * seen-store, and pushes alerts through the NotificationService.
 *
 * Muse-pattern origin (Oct 2026): "continuously monitor major financial news;
 * if anything material breaks, immediately send a brief summary + source link".
 * X/Reddit channels via agent-reach slot in next; RSS first (zero new deps).
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";
import * as fs from "node:fs";
import * as path from "node:path";
import { NotificationService } from "./NotificationService.ts";

export interface NewsTriageConfig {
	/** RSS feed URLs, comma-separated */
	feeds: string[];
	/** Poll interval in minutes */
	pollMinutes: number;
	/** Symbols to watch (e.g. "BTC,ETH,SOL") */
	symbols: string;
	/** Minimum score to alert (2 = info, 3 = severe) */
	alertThreshold: number;
	/** Enable the triage */
	enabled: boolean;
}

export interface NewsItem {
	title: string;
	link: string;
	published: string;
	feed: string;
}

export interface ScoredNews {
	item: NewsItem;
	symbols: string[];
	score: number;
	severity: "low" | "medium" | "high";
}

/** Headline keywords that make a story actionable, by severity. */
const SEVERE_KEYWORDS = [
	"hack",
	"exploit",
	"breach",
	"stolen",
	"drain",
	"lawsuit",
	"charges",
	"fraud",
	"delist",
	"liquidation",
	"insolven",
	"arrest",
	"halt",
	"freeze",
	"banned",
	"sanction",
];
const INFO_KEYWORDS = [
	"etf",
	"listing",
	"partnership",
	"integrat",
	"upgrade",
	"launch",
	"mainnet",
	"staking",
	"treasury",
	"buyback",
	"adoption",
	"regulat",
	"approval",
	"inflow",
];

const DEFAULT_FEEDS = [
	"https://www.coindesk.com/arc/outboundfeeds/rss/",
	"https://cointelegraph.com/rss",
];

const ALIASES: Record<string, string[]> = {
	BTC: ["bitcoin"],
	ETH: ["ethereum"],
	SOL: ["solana"],
	DOGE: ["dogecoin"],
	XRP: ["ripple"],
	LINK: ["chainlink"],
};

export class NewsTriage extends Service {
	static serviceType = "news-triage";
	capabilityDescription =
		"Polls news feeds, triages watched-symbol material, and alerts";

	private config: NewsTriageConfig;
	private timer: ReturnType<typeof setInterval> | null = null;
	private seen: Set<string> = new Set();
	private seenPath: string;

	constructor(runtime?: IAgentRuntime, seenPathOverride?: string) {
		super(runtime);
		this.config = {
			feeds: [...DEFAULT_FEEDS],
			pollMinutes: 60,
			symbols: "BTC,ETH,SOL",
			alertThreshold: 2,
			enabled: true,
		};
		this.seenPath =
			seenPathOverride ?? path.join(process.cwd(), "data", "news-seen.json");
	}

	static async start(runtime?: IAgentRuntime): Promise<NewsTriage> {
		logger.info("*** Starting News Triage Service ***");
		const svc = new NewsTriage(runtime);
		if (runtime) await svc.initialize(runtime);
		return svc;
	}

	static async stop(): Promise<void> {
		logger.info("*** Stopping News Triage Service ***");
	}

	async stop(): Promise<void> {
		if (this.timer) clearInterval(this.timer);
		this.timer = null;
	}

	public async initialize(runtime: IAgentRuntime): Promise<void> {
		const feeds = String(runtime.getSetting("NEWS_FEEDS") || "");
		if (feeds) {
			this.config.feeds = feeds
				.split(",")
				.map((f) => f.trim())
				.filter(Boolean);
		}
		const symbols = String(runtime.getSetting("WATCHLIST_SYMBOLS") || "");
		if (symbols) this.config.symbols = symbols;
		const poll = runtime.getSetting("NEWS_POLL_MINUTES");
		if (poll) this.config.pollMinutes = Number(poll);
		const enabled = runtime.getSetting("NEWS_TRIAGE_ENABLED");
		if (enabled !== undefined && enabled !== null) {
			this.config.enabled = String(enabled) === "true";
		}
		this.loadSeen();
		if (this.config.enabled) this.startScheduler();
	}

	public startScheduler(): void {
		if (this.timer) return;
		const ms = this.config.pollMinutes * 60_000;
		this.timer = setInterval(() => {
			void this.runPollCycle();
		}, ms);
		logger.info(
			`[news-triage] polling ${this.config.feeds.length} feeds every ${this.config.pollMinutes}min for ${this.config.symbols}`,
		);
	}

	/** One poll cycle: fetch feeds, triage, alert. Exported for tests. */
	public async runPollCycle(fetchFn: typeof fetch = fetch): Promise<number> {
		const items: NewsItem[] = [];
		for (const feed of this.config.feeds) {
			try {
				const res = await fetchFn(feed, {
					signal: AbortSignal.timeout(10_000),
				});
				if (!res.ok) continue;
				const xml = await res.text();
				items.push(...this.parseFeed(xml, feed));
			} catch (err) {
				logger.warn(
					`[news-triage] feed failed: ${feed}: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}
		const byLink = new Map<string, NewsItem>();
		for (const it of items) {
			if (!byLink.has(it.link)) byLink.set(it.link, it);
		}
		const fresh = [...byLink.values()].filter((it) => !this.seen.has(it.link));
		if (fresh.length === 0) return 0;

		const watched = this.config.symbols
			.split(",")
			.map((s) => s.trim().toUpperCase())
			.filter(Boolean);
		let alerted = 0;
		for (const item of fresh) {
			this.seen.add(item.link);
			const scored = this.scoreItem(item, watched);
			if (scored && scored.score >= this.config.alertThreshold) {
				await this.alert(scored);
				alerted += 1;
			}
		}
		this.saveSeen();
		return alerted;
	}

	/**
	 * Parse a minimal RSS/Atom surface: <item><title>/<link>/<pubDate> and
	 * <entry><title>/<link href>/<updated>. Regex-based on purpose — zero deps.
	 */
	public parseFeed(xml: string, feed: string): NewsItem[] {
		const out: NewsItem[] = [];
		const itemRe = /<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/g;
		const items = xml.match(itemRe) ?? [];
		for (const block of items) {
			const title = this.tag(block, "title");
			if (!title) continue;
			let link = this.tag(block, "link");
			if (!link) {
				const href = block.match(
					/href=["']([^"']+)["']/,
				);
				if (href) link = href[1];
			}
			const published =
				this.tag(block, "pubDate") ?? this.tag(block, "updated");
			if (link) {
				out.push({ title, link, published: published ?? "", feed });
			}
		}
		return out;
	}

	private tag(block: string, name: string): string | null {
		const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
		if (!m) return null;
		return m[1]
			.replace(/<!\[CDATA\[|\]\]>/g, "")
			.replace(/<[^>]+>/g, "")
			.trim();
	}

	/**
	 * Materiality triage: headline mentions a watched symbol + keywords lift
	 * the score. severe=3, info=2, mention-only=1. Null when no watched symbol.
	 */
	public scoreItem(item: NewsItem, watched: string[]): ScoredNews | null {
		const title = item.title.toLowerCase();
		const symbols = watched.filter((s) =>
			[
				s.toLowerCase(),
				...(ALIASES[s.toUpperCase()] ?? []).map((a) => a.toLowerCase()),
			].some((alias) => new RegExp(`\\b${alias}\\b`).test(title)),
		);
		if (symbols.length === 0) return null;
		let score = 1;
		let severity: ScoredNews["severity"] = "low";
		if (SEVERE_KEYWORDS.some((k) => title.includes(k))) {
			score = 3;
			severity = "high";
		} else if (INFO_KEYWORDS.some((k) => title.includes(k))) {
			score = 2;
			severity = "medium";
		}
		return { item, symbols, score, severity };
	}

	private async alert(scored: ScoredNews): Promise<void> {
		const priority =
			scored.severity === "high"
				? "high"
				: ("medium" as "medium" | "high");
		try {
			const svc = this.runtime?.getService(
				NotificationService.serviceType,
			) as unknown as NotificationService | null;
			if (svc?.send) {
				await svc.send({
					type: "market_change",
					priority,
					title: scored.symbols.join("/") + ": " + scored.item.title,
					message: `${scored.item.title}\n${scored.item.link}`,
					data: { link: scored.item.link, symbols: scored.symbols },
				});
				return;
			}
		} catch {
			/* notification service optional */
		}
		logger.info(
			`[news-triage] ${scored.severity.toUpperCase()} ${scored.symbols.join("/")}: ${scored.item.title} (${scored.item.link})`,
		);
	}

	private loadSeen(): void {
		try {
			if (fs.existsSync(this.seenPath)) {
				const data = JSON.parse(
					fs.readFileSync(this.seenPath, "utf8"),
				) as string[];
				if (Array.isArray(data)) this.seen = new Set(data);
			}
		} catch {
			this.seen = new Set();
		}
	}

	private saveSeen(): void {
		try {
			const list = [...this.seen].slice(-500);
			fs.mkdirSync(path.dirname(this.seenPath), { recursive: true });
			fs.writeFileSync(this.seenPath, JSON.stringify(list), "utf8");
		} catch (err) {
			logger.warn(
				`[news-triage] seen-store save failed: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}
}