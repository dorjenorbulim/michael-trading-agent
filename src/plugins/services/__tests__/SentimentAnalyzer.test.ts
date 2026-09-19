import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IAgentRuntime } from "@elizaos/core";
import { SentimentAnalyzer } from "../SentimentAnalyzer.ts";

/**
 * Tests for the real-data layer (Agent-Reach upstream CLIs + Scrapling
 * bridge) layered on the sentiment analyzer, including graceful fallback
 * to the built-in simulator.
 */

const BULLISH_TWEETS = JSON.stringify([
	{
		text: "$BTC bullish! new ATH incoming, adoption rising",
		author: "trader1",
	},
	{ text: "BTC breakout rally, accumulating more", author: "trader2" },
	{ text: "BTC momentum strong, holding through the green", author: "trader3" },
]);

const WEB_SOURCE = "https://example.com/crypto-news";

function makeRuntime(settings: Record<string, string> = {}) {
	return {
		getSetting: vi.fn((key: string) => settings[key]),
	} as unknown as IAgentRuntime;
}

describe("SentimentAnalyzer real-data layer", () => {
	let analyzer: SentimentAnalyzer;
	let runCommand: ReturnType<typeof vi.fn>;

	const build = (settings: Record<string, string> = {}) => {
		const runtime = makeRuntime(settings);
		analyzer = new SentimentAnalyzer(runtime);
		runCommand = vi.fn();
		(analyzer as unknown as { runCommand: unknown }).runCommand = runCommand;
		return analyzer;
	};

	const analyze = (symbol = "BTC") => analyzer.analyzeSentiment(symbol);

	const decideParams = () => undefined as unknown;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("defaults to the simulator (no exec, backward compatible)", async () => {
		build();
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("simulated");
		expect(data.volume).toBeGreaterThan(0);
		expect(runCommand).not.toHaveBeenCalled();
	});

	it("real mode collects and scores mentions", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_SEARCH_CMD: "twitter-cli search",
		});
		runCommand.mockResolvedValue(BULLISH_TWEETS);
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("real");
		expect(data.volume).toBe(3);
		expect(data.overall).toBeGreaterThan(0.3);
		expect(data.sources.twitter.volume).toBe(3);
		expect(data.keywords.length).toBeGreaterThan(0);
	});

	it("sends the cashtag query to the search command", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_SEARCH_CMD: "twitter-cli search",
		});
		runCommand.mockResolvedValue(BULLISH_TWEETS);
		await analyze("BTC");
		expect(runCommand).toHaveBeenCalledWith("twitter-cli", ["search", "$BTC"]);
	});

	it("falls back to the simulator when the search CLI is missing", async () => {
		build({ SOCIAL_SENTIMENT_MODE: "real" });
		runCommand.mockRejectedValue(
			Object.assign(new Error("spawn twitter-cli ENOENT"), {
				code: "ENOENT",
			}),
		);
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("simulated");
	});

	it("falls back to the simulator after an exec timeout", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_EXEC_TIMEOUT_MS: "50",
		});
		runCommand.mockRejectedValue(new Error("Command timed out after 50ms"));
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("simulated");
	});

	it("collects web sources through the Scrapling bridge", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_WEB_SOURCES: "https://example.com/crypto-news",
		});
		runCommand
			.mockRejectedValueOnce(new Error("spawn twitter-cli ENOENT"))
			.mockResolvedValueOnce(
				JSON.stringify({
					ok: true,
					title: "BTC news",
					text: "Bitcoin dumps hard, crash warnings everywhere",
				}),
			);
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("real");
		expect(data.overall).toBeLessThan(0);
		expect(data.sources.web.volume).toBe(1);
	});

	it("falls back to the simulator when every bridge fails", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_WEB_SOURCES: "https://example.com/crypto-news",
		});
		runCommand
			.mockRejectedValueOnce(new Error("spawn twitter-cli ENOENT"))
			.mockResolvedValueOnce(
				JSON.stringify({ ok: false, error: "scrapling not installed" }),
			);
		const data = await analyze("BTC");
		expect(data.dataQuality).toBe("simulated");
	});

	it("caches per symbol within the TTL", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_SEARCH_CMD: "twitter-cli search",
		});
		runCommand.mockResolvedValue(BULLISH_TWEETS);
		await analyze("BTC");
		await analyze("BTC");
		expect(runCommand).toHaveBeenCalledTimes(1); // second BTC call is cached
		await analyze("SOL");
		expect(runCommand).toHaveBeenCalledTimes(2); // separate cache per symbol
	});

	it("getTradingSignal maps strong sentiment", async () => {
		build({
			SOCIAL_SENTIMENT_MODE: "real",
			SOCIAL_SEARCH_CMD: "twitter-cli search",
		});
		runCommand.mockResolvedValue(BULLISH_TWEETS);
		const signal = await analyzer.getTradingSignal("BTC");
		expect(["STRONG_BUY", "BUY"]).toContain(signal.recommendation);
		expect(signal.sentimentScore).toBeGreaterThan(0);
	});

	it("rejects unsupported symbols", async () => {
		build();
		await expect(analyze("DOGE")).rejects.toThrow(
			"Only BTC, ETH, SOL are supported",
		);
	});
});