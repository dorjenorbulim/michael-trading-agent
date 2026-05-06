/**
 * Sentiment Analysis Action
 *
 * Analyzes social sentiment for BTC, ETH, and SOL
 * and provides trading signals based on social data.
 */

import type {
	Action,
	HandlerCallback,
	HandlerOptions,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import type { SentimentAnalyzer } from "../services/SentimentAnalyzer.ts";

export const analyzeSentimentAction: Action = {
	name: "ANALYZE_SENTIMENT",
	similes: [
		"CHECK_SENTIMENT",
		"SOCIAL_SENTIMENT",
		"GET_SENTIMENT",
		"ANALYZE_SOCIAL",
		"SENTIMENT_ANALYSIS",
	],
	description: "Analyzes social media sentiment for BTC, ETH, and SOL tokens",

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "What's the sentiment on BTC?" },
			},
			{
				name: "{{agentName}}",
				content: {
					text: "🧠 **BTC Social Sentiment Analysis**\n\nOverall: Bullish (65%) | Fear/Greed: 68 | Volume: 52,000 mentions\n\n🟢 Twitter: 68% | 🔴 Reddit: 58% | ⚪ Telegram: 62%\n\n**Trending:** bullrun, halving, institution, ETF",
				},
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Analyze sentiment for ETH and SOL" },
			},
			{
				name: "{{agentName}}",
				content: {
					text: "📊 **Social Sentiment Dashboard**\n\n🟢 ETH: Bullish (58%) | 😐 SOL: Neutral (45%)\n\nSay \"start trading\" to begin automated trading.",
				},
			},
		],
	],

	validate: async (
		_runtime: IAgentRuntime,
		message: any,
		_state?: any,
		_options?: HandlerOptions,
	): Promise<boolean> => {
		const text = (message.content?.text || "").toLowerCase();
		const keywords = ["sentiment", "social", "fear", "greed", "bullish", "bearish", "mention"];
		return keywords.some((kw) => text.includes(kw));
	},

	handler: async (
		runtime: IAgentRuntime,
		message: Memory,
		_state: State | undefined,
		_options: HandlerOptions | undefined,
		callback: HandlerCallback,
	): Promise<void> => {
		try {
			const sentimentAnalyzer = runtime.getService(
				"SentimentAnalyzer",
			) as SentimentAnalyzer;

			if (!sentimentAnalyzer) {
				await callback({
					text: "❌ Sentiment analyzer not available. Please ensure the trading plugin is loaded.",
				});
				return;
			}

			const messageText = (message.content?.text || "").toLowerCase();

			// Check if specific token is mentioned
			const tokenMatch = messageText.match(/\b(btc|ethereum|eth|sol|solana|bitcoin)\b/gi);
			const tokens = tokenMatch
				? tokenMatch.map((t: string) => {
					const upper = t.toUpperCase();
					if (upper === "ETH") return "ETH";
					if (upper === "BTC") return "BTC";
					if (upper === "SOL") return "SOL";
					if (upper === "ETHEREUM") return "ETH";
					if (upper === "SOLANA") return "SOL";
					if (upper === "BITCOIN") return "BTC";
					return upper;
				  })
				: [];

			// If specific tokens mentioned, analyze those
			if (tokens.length > 0) {
				const uniqueTokens = [...new Set(tokens)];
				const results: string[] = [];

				for (const token of uniqueTokens) {
					try {
						const result = await sentimentAnalyzer.getTradingSignal(token);
						const emoji = result.recommendation.includes("BUY") ? "🟢" :
							result.recommendation.includes("SELL") ? "🔴" : "⚪";

						results.push(
							`${emoji} **${token}**\n` +
							`   Signal: ${result.recommendation} (${(result.confidence * 100).toFixed(0)}% confidence)\n` +
							`   Sentiment: ${(result.sentimentScore * 100).toFixed(0)}%\n` +
							`   ${result.reasoning}`
						);
					} catch (error) {
						results.push(`❌ ${token}: ${(error as Error).message}`);
					}
				}

				await callback({
					text: `📊 **Social Sentiment Analysis**\n\n${results.join("\n\n")}`,
				});
				return;
			}

			// Otherwise, show all sentiments
			const allSentiment = await sentimentAnalyzer.getAllSentiment();

			if (allSentiment.size === 0) {
				await callback({
					text: "Loading sentiment data for BTC, ETH, SOL...",
				});
				return;
			}

			// Format all sentiments
			const lines: string[] = ["📊 **Social Sentiment - BTC, ETH, SOL**", ""];

			for (const [symbol, data] of allSentiment) {
				const emoji = data.overall > 0.2 ? "🟢" :
					data.overall < -0.2 ? "🔴" : "⚪";
				const fgEmoji = data.fearGreedIndex > 65 ? "🤑" :
					data.fearGreedIndex > 55 ? "🙂" :
					data.fearGreedIndex > 45 ? "😐" :
					data.fearGreedIndex > 35 ? "😰" : "😱";

				lines.push(
					`${emoji} **${symbol}** | Sentiment: ${(data.overall * 100).toFixed(0)}% | ${fgEmoji} Fear/Greed: ${data.fearGreedIndex} | 📊 Vol: ${(data.volume / 1000).toFixed(1)}K`
				);
			}

			lines.push("");
			lines.push("💡 Say \"analyze BTC sentiment\" for detailed analysis.");

			await callback({
				text: lines.join("\n"),
			});
		} catch (error) {
			logger.error("[AnalyzeSentimentAction] Error:", error);
			await callback({
				text: `Error analyzing sentiment: ${(error as Error).message}`,
			});
		}
	},
};