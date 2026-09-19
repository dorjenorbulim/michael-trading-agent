/**
 * Social Sentiment Service for BTC, ETH, SOL
 *
 * Analyzes social media sentiment for Bitcoin, Ethereum, and Solana
 * to augment trading decisions with crowd psychology insights.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { logger, type IAgentRuntime, Service } from "@elizaos/core";

const execFileAsync = promisify(execFile);

export interface SentimentData {
	symbol: string;
	overall: number; // -1 to 1
	volume: number; // Mention volume
	momentum: "increasing" | "decreasing" | "stable";
	sources: Record<string, { score: number; volume: number; trend: string }>;
	keywords: string[];
	influencerMentions: number;
	fearGreedIndex: number; // 0-100
	/** Where the data came from: "real" = Agent-Reach/Scrapling, "simulated" = built-in simulator */
	dataQuality?: "real" | "simulated";
}

export interface SentimentAlert {
	id: string;
	type: "bullish_surge" | "bearish_surge" | "volume_spike" | "viral_mention";
	symbol: string;
	message: string;
	severity: "low" | "medium" | "high";
	timestamp: number;
	data: SentimentData;
}

// Social data for major cryptos (mock data - in production use real APIs)
const SOCIAL_DATA: Record<string, {
	baseVolume: number;
	baseSentiment: number;
	keywords: { positive: string[]; negative: string[] };
}> = {
	BTC: {
		baseVolume: 50000,
		baseSentiment: 0.3,
		keywords: {
			positive: ["bullrun", "halving", "institution", "ETF", "moon", "ATH", "adoption"],
			negative: ["bear", "dump", "crash", "regulation", "ban", "hack"],
		},
	},
	ETH: {
		baseVolume: 35000,
		baseSentiment: 0.2,
		keywords: {
			positive: ["merge", "staking", "defi", "upgrade", "ETF", "growth"],
			negative: ["gas", "failed", "exploit", "dump", "regulation"],
		},
	},
	SOL: {
		baseVolume: 20000,
		baseSentiment: 0.1,
		keywords: {
			positive: ["growth", "adoption", "airdrop", "nft", "gamefi", "partnership"],
			negative: ["dump", "hack", "downtime", "regulation", "bear"],
		},
	},
};

// Generic crypto sentiment lexicon (applies to every symbol, in addition
// to the per-symbol keywords above)
const GENERIC_POSITIVE = [
	"bullish", "moon", "pump", "ath", "surge", "rally", "breakout",
	"accumulate", "accumulating", "buy", "buying", "gains", "green",
	"adoption", "partnership", "upgrade", "etf", "holding", "hodl",
];
const GENERIC_NEGATIVE = [
	"bearish", "dump", "dumping", "crash", "rug", "rugpull", "scam",
	"honeypot", "hack", "exploit", "liquidation", "fud", "selling",
	"ban", "lawsuit", "delist", "losses", "plunge", "capitulation",
];

export class SentimentAnalyzer extends Service {
	static serviceType = "sentiment-analyzer";
	capabilityDescription = "Analyzes social sentiment for BTC, ETH, SOL trading signals";

	private runtime: IAgentRuntime;
	private sentimentCache: Map<string, SentimentData> = new Map();
	private cacheTimestamps: Map<string, number> = new Map();
	private alerts: SentimentAlert[] = [];
	private readonly CACHE_TTL = 120000; // 2 minutes for crypto (less volatile than meme coins)

	// Real-data layer (Agent-Reach upstream CLIs + Scrapling). Off by
	// default: the built-in simulator keeps running until the operator
	// sets SOCIAL_SENTIMENT_MODE=real and installs the tools.
	private readonly mode: "mock" | "real";
	private readonly searchCommand: string;
	private readonly webSources: string[];
	private readonly scraplingBin: string;
	private readonly scraplingBridgePath: string;
	private readonly execTimeoutMs: number;
	private readonly maxSearchResults: number;
	private bridgeUnavailableLogged = false;

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
		const mode = String(
			runtime.getSetting("SOCIAL_SENTIMENT_MODE") || "mock",
		).toLowerCase();
		this.mode = mode === "real" ? "real" : "mock";
		this.searchCommand = String(
			runtime.getSetting("SOCIAL_SEARCH_CMD") || "twitter-cli search",
		).trim();
		this.webSources = String(runtime.getSetting("SOCIAL_WEB_SOURCES") || "")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		this.scraplingBin = String(
			runtime.getSetting("SCRAPLING_BIN") || "python3",
		).trim();
		this.scraplingBridgePath = String(
			runtime.getSetting("SCRAPLING_BRIDGE") || "scripts/scrapling_bridge.py",
		).trim();
		const timeoutMs = Number(
			runtime.getSetting("SOCIAL_EXEC_TIMEOUT_MS") || 30000,
		);
		this.execTimeoutMs =
			Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000;
		this.maxSearchResults = Math.max(
			1,
			Number(runtime.getSetting("SOCIAL_MAX_RESULTS") || 15) || 15,
		);
	}

	static async start(runtime: IAgentRuntime): Promise<SentimentAnalyzer> {
		logger.info("*** Starting Social Sentiment Analyzer (BTC, ETH, SOL) ***");
		return new SentimentAnalyzer(runtime);
	}

	static async stop(runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Social Sentiment Analyzer ***");
	}

	async stop(): Promise<void> {}

	/**
	 * Analyze sentiment for BTC, ETH, or SOL
	 */
	async analyzeSentiment(symbol: string): Promise<SentimentData> {
		// Normalize symbol
		const normalizedSymbol = symbol.toUpperCase();
		if (!["BTC", "ETH", "SOL"].includes(normalizedSymbol)) {
			throw new Error(`Only BTC, ETH, SOL are supported. Got: ${symbol}`);
		}

		// Check cache (per-symbol TTL)
		const cached = this.sentimentCache.get(normalizedSymbol);
		const cachedAt = this.cacheTimestamps.get(normalizedSymbol) ?? 0;
		if (cached && Date.now() - cachedAt < this.CACHE_TTL) {
			return cached;
		}

		// Fetch sentiment data
		const sentiment = await this.fetchSocialSentiment(normalizedSymbol);
		this.sentimentCache.set(normalizedSymbol, sentiment);
		this.cacheTimestamps.set(normalizedSymbol, Date.now());

		// Check for alerts
		this.checkForAlerts(normalizedSymbol, sentiment);

		return sentiment;
	}

	/**
	 * Fetch social sentiment data.
	 *
	 * SOCIAL_SENTIMENT_MODE=real: collect real mentions through Agent-Reach's
	 * upstream CLIs (default twitter-cli) and Scrapling for web sources, then
	 * score them with a crypto keyword lexicon. Every failure path degrades
	 * to the built-in simulator so the trading loop never breaks on a scraper.
	 */
	private async fetchSocialSentiment(symbol: string): Promise<SentimentData> {
		if (this.mode === "real") {
			try {
				const real = await this.fetchRealSentiment(symbol);
				if (real) {
					return real;
				}
				logger.info(
					`[SentimentAnalyzer] No real social data collected for ${symbol} - using simulator`,
				);
			} catch (err) {
				logger.warn(
					`[SentimentAnalyzer] Real data collection failed for ${symbol} - falling back to simulator: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}
		return this.simulateSentiment(symbol);
	}

	/**
	 * Simulated sentiment (original behavior) - used when the real-data
	 * layer is off or unavailable.
	 */
	private async simulateSentiment(symbol: string): Promise<SentimentData> {
		const socialConfig = SOCIAL_DATA[symbol];
		if (!socialConfig) {
			throw new Error(`No social data for ${symbol}`);
		}

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Generate realistic sentiment based on market conditions
		// Use time-based variation to simulate trending
		const hourOfDay = new Date().getHours();
		const dayOfWeek = new Date().getDay();
		
		// More activity during US market hours
		const marketHoursMultiplier = (hourOfDay >= 14 && hourOfDay <= 21) ? 1.5 : 0.8;
		// Higher volume on weekends (more retail activity)
		const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;

		const volumeMultiplier = marketHoursMultiplier * weekendMultiplier;
		const volume = Math.floor(socialConfig.baseVolume * volumeMultiplier * (0.7 + Math.random() * 0.6));

		// Sentiment varies with market conditions
		const marketCondition = Math.sin(Date.now() / 3600000); // Based on time of day
		const sentimentBoost = marketCondition * 0.2;
		const overall = Math.max(-1, Math.min(1, socialConfig.baseSentiment + sentimentBoost + (Math.random() * 0.4 - 0.2)));

		// Volume trend
		const volumeTrend = volume > socialConfig.baseVolume * 1.2 ? "increasing" :
			volume < socialConfig.baseVolume * 0.8 ? "decreasing" : "stable";

		return {
			symbol,
			overall,
			volume,
			momentum: volumeTrend,
			sources: {
				twitter: {
					score: overall + (Math.random() * 0.2 - 0.1),
					volume: Math.floor(volume * 0.45),
					trend: volumeTrend,
				},
				reddit: {
					score: overall + (Math.random() * 0.2 - 0.1),
					volume: Math.floor(volume * 0.30),
					trend: volumeTrend,
				},
				telegram: {
					score: overall + (Math.random() * 0.2 - 0.1),
					volume: Math.floor(volume * 0.15),
					trend: volumeTrend,
				},
				news: {
					score: overall * 1.1, // News has stronger impact
					volume: Math.floor(volume * 0.10),
					trend: volumeTrend,
				},
			},
			keywords: this.generateKeywords(symbol, overall),
			influencerMentions: Math.floor(volume * 0.001),
			fearGreedIndex: Math.round(50 + overall * 30), // Map sentiment to 20-80 range
			dataQuality: "simulated",
		};
	}

	/**
	 * Collect real mentions through Agent-Reach's upstream CLIs and Scrapling.
	 * Returns null when nothing could be collected - the caller falls back
	 * to the built-in simulator.
	 */
	private async fetchRealSentiment(
		symbol: string,
	): Promise<SentimentData | null> {
		const collected: Array<{ source: string; text: string }> = [];

		// Path 1: X search via the configured upstream CLI (twitter-cli)
		if (this.searchCommand) {
			const parts = this.searchCommand.split(/\s+/).filter(Boolean);
			const cmd = parts[0];
			const args = [...parts.slice(1), `$${symbol}`];
			try {
				const stdout = await this.runCommand(cmd, args);
				collected.push(...this.extractItems(stdout, "twitter"));
			} catch (err) {
				this.logBridgeUnavailable(
					`${this.searchCommand} (${err instanceof Error ? err.message : String(err)})`,
				);
			}
		}

		// Path 2: configured web sources through the Scrapling bridge
		for (const url of this.webSources) {
			try {
				const stdout = await this.runCommand(this.scraplingBin, [
					this.scraplingBridgePath,
					url,
				]);
				const parsed = JSON.parse(stdout) as {
					ok?: boolean;
					title?: string;
					text?: string;
				};
				if (parsed.ok && typeof parsed.text === "string" && parsed.text.trim()) {
					const text = `${parsed.title || ""}\n${parsed.text}`.trim();
					if (this.mentionsToken(symbol, text)) {
						collected.push({ source: "web", text });
					}
				}
			} catch (err) {
				this.logBridgeUnavailable(
					`scrapling bridge (${err instanceof Error ? err.message : String(err)})`,
				);
			}
		}

		if (collected.length === 0) {
			return null;
		}

		return this.scoreItems(symbol, collected);
	}

	private mentionsToken(symbol: string, text: string): boolean {
		const lower = text.toLowerCase();
		const longName =
			symbol === "BTC"
				? "bitcoin"
				: symbol === "ETH"
					? "ethereum"
					: symbol === "SOL"
						? "solana"
						: symbol.toLowerCase();
		return lower.includes(symbol.toLowerCase()) || lower.includes(longName);
	}

	/**
	 * Run a configured command safely: arg array, no shell, hard timeout.
	 * Mirrors the execFileSync discipline from the command-injection fix.
	 */
	private async runCommand(cmd: string, args: string[]): Promise<string> {
		const { stdout } = await execFileAsync(cmd, args, {
			timeout: this.execTimeoutMs,
			shell: false,
			maxBuffer: 4 * 1024 * 1024,
		});
		return stdout;
	}

	private logBridgeUnavailable(why: string): void {
		if (!this.bridgeUnavailableLogged) {
			this.bridgeUnavailableLogged = true;
			logger.warn(
				`[SentimentAnalyzer] Real-data bridge unavailable (${why}) - falling back to the simulator. Install Agent-Reach + Scrapling, set SOCIAL_SENTIMENT_MODE=real and configure the tool commands to get real data.`,
			);
		}
	}

	/**
	 * Extract text items from tool output: JSON arrays/objects with text
	 * fields first, plain-text lines as fallback.
	 */
	private extractItems(
		stdout: string,
		source: string,
	): Array<{ source: string; text: string }> {
		const items: Array<{ source: string; text: string }> = [];
		const trimmed = stdout.trim();
		if (!trimmed) {
			return items;
		}

		try {
			const parsed = JSON.parse(trimmed) as unknown;
			const list = Array.isArray(parsed)
				? parsed
				: typeof parsed === "object" && parsed !== null
					? ((parsed as { data?: unknown[] }).data ??
						(parsed as { tweets?: unknown[] }).tweets ??
						(parsed as { items?: unknown[] }).items ??
						[parsed])
					: [];
			if (Array.isArray(list)) {
				for (const entry of list) {
					if (typeof entry === "string") {
						if (entry.trim()) items.push({ source, text: entry.trim() });
					} else if (entry && typeof entry === "object") {
						const text = String((entry as { text?: unknown }).text ?? "");
						if (text.trim()) items.push({ source, text: text.trim() });
					}
				}
			}
		} catch {
			for (const line of trimmed.split(/\r?\n/)) {
				if (line.trim()) items.push({ source, text: line.trim() });
			}
		}
		return items.slice(0, this.maxSearchResults);
	}

	/** Score collected items with a crypto keyword lexicon. */
	private scoreItems(
		symbol: string,
		collected: Array<{ source: string; text: string }>,
	): SentimentData {
		const socialConfig = SOCIAL_DATA[symbol];
		const positive = new Set(
			[...(socialConfig?.keywords.positive ?? []), ...GENERIC_POSITIVE].map(
				(word) => word.toLowerCase(),
			),
		);
		const negative = new Set(
			[...(socialConfig?.keywords.negative ?? []), ...GENERIC_NEGATIVE].map(
				(word) => word.toLowerCase(),
			),
		);

		let net = 0;
		const matchedKeywords = new Set<string>();
		const perSource: Record<string, { total: number; count: number }> = {};

		for (const item of collected) {
			const lower = item.text.toLowerCase();
			let itemScore = 0;
			for (const word of positive) {
				if (lower.includes(word)) {
					net += 1;
					itemScore += 1;
					matchedKeywords.add(word);
				}
			}
			for (const word of negative) {
				if (lower.includes(word)) {
					net -= 1;
					itemScore -= 1;
					matchedKeywords.add(word);
				}
			}
			perSource[item.source] = perSource[item.source] || {
				total: 0,
				count: 0,
			};
			perSource[item.source].total += itemScore;
			perSource[item.source].count += 1;
		}

		// Aggregate: clamp the average item score; a rough gauge, not a price signal.
		const overall = Math.max(
			-1,
			Math.min(1, (net / Math.max(1, collected.length)) * 0.5),
		);

		// Momentum: compare with the previous REAL reading only (the simulator's
		// volumes are a different scale).
		const previous = this.sentimentCache.get(symbol);
		const momentum =
			previous &&
			previous.dataQuality === "real" &&
			collected.length !== previous.volume
				? collected.length > previous.volume
					? "increasing"
					: previous.volume > 0
						? "decreasing"
						: "stable"
				: "stable";

		const sources: SentimentData["sources"] = {};
		for (const [source, { total, count }] of Object.entries(perSource)) {
			sources[source] = {
				score: Math.max(-1, Math.min(1, (total / Math.max(1, count)) * 0.5)),
				volume: count,
				trend: momentum,
			};
		}

		return {
			symbol,
			overall,
			volume: collected.length,
			momentum,
			sources,
			keywords: [...matchedKeywords].slice(0, 5),
			influencerMentions: 0,
			fearGreedIndex: Math.round(50 + overall * 30),
			dataQuality: "real",
		};
	}

	/**
	 * Generate relevant keywords based on symbol and sentiment
	 */
	private generateKeywords(symbol: string, sentiment: number): string[] {
		const config = SOCIAL_DATA[symbol];
		if (!config) return [];

		const { positive, negative } = config.keywords;
		const isBullish = sentiment > 0.2;
		const isBearish = sentiment < -0.2;

		const keywords: string[] = [];
		
		if (isBullish) {
			keywords.push(...positive.slice(0, 3));
		} else if (isBearish) {
			keywords.push(...negative.slice(0, 3));
		} else {
			keywords.push(positive[0] || "hodl");
			keywords.push(negative[0] || "correction");
		}

		return keywords.slice(0, 5);
	}

	/**
	 * Check for sentiment alerts
	 */
	private checkForAlerts(symbol: string, sentiment: SentimentData): void {
		// Strong bullish surge
		if (sentiment.overall > 0.5 && sentiment.momentum === "increasing") {
			this.createAlert({
				type: "bullish_surge",
				symbol,
				message: `🚀 ${symbol} showing strong bullish sentiment! Score: ${(sentiment.overall * 100).toFixed(0)}%`,
				severity: "high",
				data: sentiment,
			});
		}

		// Strong bearish surge
		if (sentiment.overall < -0.5 && sentiment.momentum === "increasing") {
			this.createAlert({
				type: "bearish_surge",
				symbol,
				message: `🔻 ${symbol} showing strong bearish sentiment! Score: ${(sentiment.overall * 100).toFixed(0)}%`,
				severity: "high",
				data: sentiment,
			});
		}

		// Volume spike (unusual activity)
		if (sentiment.volume > 30000) {
			this.createAlert({
				type: "volume_spike",
				symbol,
				message: `📊 ${symbol} social volume spiking! ${sentiment.volume.toLocaleString()} mentions`,
				severity: "medium",
				data: sentiment,
			});
		}

		// Viral mention (influencer activity)
		if (sentiment.influencerMentions > 30) {
			this.createAlert({
				type: "viral_mention",
				symbol,
				message: `🌟 ${symbol} getting major influencer attention!`,
				severity: "medium",
				data: sentiment,
			});
		}
	}

	/**
	 * Create sentiment alert
	 */
	private createAlert(params: Omit<SentimentAlert, "id" | "timestamp">): void {
		const alert: SentimentAlert = {
			id: `sentiment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			...params,
		};

		this.alerts.push(alert);
		logger.info(`[SentimentAnalyzer] ${alert.type}: ${alert.message}`);

		// Keep only last 50 alerts
		if (this.alerts.length > 50) {
			this.alerts = this.alerts.slice(-50);
		}
	}

	/**
	 * Get sentiment-enhanced trading signal
	 */
	async getTradingSignal(symbol: string): Promise<{
		recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
		confidence: number;
		reasoning: string;
		sentimentScore: number;
	}> {
		const sentiment = await this.analyzeSentiment(symbol);

		let recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
		let confidence: number;

		if (sentiment.overall > 0.6) {
			recommendation = "STRONG_BUY";
			confidence = Math.min(0.95, sentiment.overall + 0.1);
		} else if (sentiment.overall > 0.25) {
			recommendation = "BUY";
			confidence = sentiment.overall + 0.2;
		} else if (sentiment.overall < -0.6) {
			recommendation = "STRONG_SELL";
			confidence = Math.min(0.95, Math.abs(sentiment.overall) + 0.1);
		} else if (sentiment.overall < -0.25) {
			recommendation = "SELL";
			confidence = Math.abs(sentiment.overall) + 0.2;
		} else {
			recommendation = "HOLD";
			confidence = 0.5;
		}

		const fgEmoji = sentiment.fearGreedIndex > 65 ? "🤑" :
			sentiment.fearGreedIndex > 55 ? "🙂" :
			sentiment.fearGreedIndex > 45 ? "😐" :
			sentiment.fearGreedIndex > 35 ? "😰" : "😱";

		const reasoning = `${sentiment.overall > 0 ? "Bullish" : "Bearish"} sentiment (${(sentiment.overall * 100).toFixed(0)}%). ${fgEmoji} Fear/Greed: ${sentiment.fearGreedIndex}/100. ${sentiment.volume.toLocaleString()} social mentions. Top keywords: ${sentiment.keywords.join(", ")}.`;

		return { recommendation, confidence, reasoning, sentimentScore: sentiment.overall };
	}

	/**
	 * Get all sentiment data for monitoring
	 */
	async getAllSentiment(): Promise<Map<string, SentimentData>> {
		const symbols = ["BTC", "ETH", "SOL"];
		const results = new Map<string, SentimentData>();

		for (const symbol of symbols) {
			try {
				const sentiment = await this.analyzeSentiment(symbol);
				results.set(symbol, sentiment);
			} catch (error) {
				console.error(`[SentimentAnalyzer] Failed to get ${symbol} sentiment:`, error);
			}
		}

		return results;
	}

	/**
	 * Get recent sentiment alerts
	 */
	getAlerts(limit: number = 10): SentimentAlert[] {
		return this.alerts.slice(-limit).reverse();
	}

	/**
	 * Format sentiment for display
	 */
	formatSentiment(symbol: string): string {
		const sentiment = this.sentimentCache.get(symbol.toUpperCase());
		if (!sentiment) {
			return `No sentiment data for ${symbol}. Say "analyze sentiment" to fetch.`;
		}

		const emoji = sentiment.overall > 0.2 ? "🟢" :
			sentiment.overall < -0.2 ? "🔴" : "⚪";
		
		const fgEmoji = sentiment.fearGreedIndex > 65 ? "🤑" :
			sentiment.fearGreedIndex > 55 ? "🙂" :
			sentiment.fearGreedIndex > 45 ? "😐" :
			sentiment.fearGreedIndex > 35 ? "😰" : "😱";

		const trendEmoji = sentiment.momentum === "increasing" ? "📈" :
			sentiment.momentum === "decreasing" ? "📉" : "➡️";

		let output = `${emoji} **${symbol} Social Sentiment**

🧠 **Overall:** ${sentiment.overall > 0 ? "Bullish" : "Bearish"} (${(sentiment.overall * 100).toFixed(0)}%)
${fgEmoji} **Fear/Greed:** ${sentiment.fearGreedIndex}/100
${trendEmoji} **Momentum:** ${sentiment.momentum}
📊 **Volume:** ${sentiment.volume.toLocaleString()} mentions
👥 **Influencers:** ${sentiment.influencerMentions} mentions

**By Source:**
`;
		for (const [source, data] of Object.entries(sentiment.sources)) {
			const scoreEmoji = data.score > 0.2 ? "🟢" : data.score < -0.2 ? "🔴" : "⚪";
			output += `  ${scoreEmoji} ${source}: ${(data.score * 100).toFixed(0)}% (${data.volume.toLocaleString()})\n`;
		}

		output += `\n**Trending Keywords:** ${sentiment.keywords.join(", ")}`;

		return output;
	}

	/**
	 * Format all sentiments for dashboard
	 */
	formatAllSentiments(): string {
		const sentiments: string[] = [];

		for (const symbol of ["BTC", "ETH", "SOL"]) {
			const sentiment = this.sentimentCache.get(symbol);
			if (sentiment) {
				const emoji = sentiment.overall > 0.2 ? "🟢" :
					sentiment.overall < -0.2 ? "🔴" : "⚪";
				const fgEmoji = sentiment.fearGreedIndex > 65 ? "🤑" :
					sentiment.fearGreedIndex > 55 ? "🙂" :
					sentiment.fearGreedIndex > 45 ? "😐" :
					sentiment.fearGreedIndex > 35 ? "😰" : "😱";

				sentiments.push(
					`${emoji} ${symbol}: ${(sentiment.overall * 100).toFixed(0)}% ${fgEmoji}${sentiment.fearGreedIndex}`
				);
			}
		}

		return sentiments.length > 0
			? `**Social Sentiment:** ${sentiments.join(" | ")}`
			: "**Social Sentiment:** Loading...";
	}
}