/**
 * View Trade Journal Action
 *
 * View complete trade history with reasoning and performance analytics.
 */

import type {
	Action,
	ActionResult,
	Content,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import { TradeJournal } from "../services/TradeJournal.ts";

export const viewTradeJournalAction: Action = {
	name: "VIEW_TRADE_JOURNAL",
	similes: [
		"TRADE_HISTORY",
		"TRADE_LOG",
		"JOURNAL",
		"TRADE_STATS",
		"TRADE_PERFORMANCE",
	],
	description: "View complete trade history with reasoning and performance analytics",

	validate: async function(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
		const text = message.content.text?.toLowerCase() || "";
		return [
			"trade journal",
			"trade history",
			"trade log",
			"journal",
			"trade stats",
			"trade performance",
			"view trades",
			"show trades",
			"recent trades",
		].some((kw) => text.includes(kw));
	},

	handler: async function(
		runtime: IAgentRuntime,
		message: Memory,
		_state?: State,
		_options?: any,
		callback?: HandlerCallback
	): Promise<ActionResult> {
		try {
			const text = message.content.text?.toLowerCase() || "";
			const journal = runtime.getService("trade-journal") as TradeJournal | undefined;

			if (!journal) {
				callback?.({
					text: "📓 Trade Journal is empty. No trades have been executed yet.",
				});
				return {
					text: "No trades recorded",
					success: true,
				};
			}

			// Check if user wants stats or recent trades
			const wantStats = text.includes("stats") || text.includes("performance") || text.includes("analytics");
			const wantOpen = text.includes("open");
			const wantClosed = text.includes("closed") || text.includes("completed");

			if (wantStats) {
				const stats = journal.formatStats();
				callback?.({
					text: stats,
					actions: ["VIEW_TRADE_JOURNAL"],
				});
			} else if (wantOpen) {
				const openTrades = journal.getOpenTrades();
				if (openTrades.length === 0) {
					callback?.({
						text: "No open trades currently.",
					});
				} else {
					let output = `⏳ **Open Trades (${openTrades.length})**\n\n`;
					for (const trade of openTrades.slice(0, 5)) {
						output += journal.formatTradeSummary(trade) + "\n";
					}
					callback?.({
						text: output,
						actions: ["VIEW_TRADE_JOURNAL"],
					});
				}
			} else if (wantClosed) {
				const closedTrades = journal.getClosedTrades();
				if (closedTrades.length === 0) {
					callback?.({
						text: "No closed trades yet.",
					});
				} else {
					let output = `✅ **Recent Closed Trades**\n\n`;
					for (const trade of closedTrades.slice(0, 5)) {
						output += journal.formatTradeSummary(trade) + "\n";
					}
					callback?.({
						text: output,
						actions: ["VIEW_TRADE_JOURNAL"],
					});
				}
			} else {
				// Default: show stats + recent trades
				const stats = journal.formatStats();
				const recentTrades = journal.getAllTrades().slice(0, 3);
				
				let output = stats + "\n\n";
				output += `**Recent Trades:**\n\n`;
				for (const trade of recentTrades) {
					output += journal.formatTradeSummary(trade) + "\n";
				}

				callback?.({
					text: output,
					actions: ["VIEW_TRADE_JOURNAL"],
				});
			}

			return {
				text: "Trade journal displayed",
				success: true,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			callback?.({
				text: `❌ Error viewing trade journal: ${errorMessage}`,
			});

			return {
				text: "Failed to view trade journal",
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	},

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "View trade journal" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Here is your trade history..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Show trade stats" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Your trading statistics..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Show open trades" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Your current open positions..." },
			},
		],
	],
};
