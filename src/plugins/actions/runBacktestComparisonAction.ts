/**
 * Run Backtest Comparison Action
 *
 * Run multiple strategies against historical data to compare performance
 * before deploying live trading.
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
import { STRATEGY_PROFILES } from "../config/multiStrategy.ts";
import {
	formatBacktestResults,
	runBacktestComparison,
} from "../services/BacktestComparison.ts";

export const runBacktestComparisonAction: Action = {
	name: "RUN_BACKTEST_COMPARISON",
	similes: [
		"COMPARE_STRATEGIES_BACKTEST",
		"BACKTEST_STRATEGIES",
		"TEST_STRATEGIES",
		"SIMULATE_STRATEGIES",
		"HISTORICAL_TEST",
	],
	description:
		"Run backtesting comparison of multiple strategies against historical data",

	validate: async function(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
		const text = message.content.text?.toLowerCase() || "";
		return [
			"backtest comparison",
			"compare strategies backtest",
			"test strategies",
			"simulate strategies",
			"historical test",
			"backtest conservative",
			"backtest balanced",
			"backtest aggressive",
			"backtest ai",
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

			// Parse duration from message
			let days = 7;
			const dayMatch = text.match(/(\d+)\s*day/);
			if (dayMatch) {
				days = parseInt(dayMatch[1]);
				days = Math.min(Math.max(days, 1), 30); // Clamp 1-30 days
			}

			// Parse starting balance
			let startingBalance = 1000;
			const balanceMatch = text.match(/\$(\d+)/);
			if (balanceMatch) {
				startingBalance = parseInt(balanceMatch[1]);
			}

			// Determine which profile to backtest
			let profileId: keyof typeof STRATEGY_PROFILES = "balanced";
			if (text.includes("conservative")) profileId = "conservative";
			else if (text.includes("aggressive")) profileId = "aggressive";
			else if (text.includes("ai first") || text.includes("aifirst")) profileId = "aiFirst";

			callback?.({
				text: `⏳ **Running Backtest Comparison...**\n\nProfile: **${profileId}**\nDuration: ${days} days\nStarting Balance: $${startingBalance}\n\nRunning historical simulation for all strategies in the profile. This may take a moment...`,
			});

			const result = await runBacktestComparison(
				profileId,
				{
					days,
					startingBalance,
					symbols: ["SOL", "BONK", "WIF", "PEPE"],
				},
				runtime
			);

			const formattedResults = formatBacktestResults(result);

			callback?.({
				text: formattedResults,
				actions: ["RUN_BACKTEST_COMPARISON"],
			});

			return {
				text: "Backtest comparison completed",
				success: true,
				data: {
					profile: profileId,
					winner: result.winner,
					strategiesTested: result.results.length,
				},
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			logger.error(
				{ error: errorMessage },
				"Error running backtest comparison"
			);

			callback?.({
				text: `❌ **Backtest Failed**\n\nError: ${errorMessage}\n\nPlease ensure all required services are available.`,
				actions: ["RUN_BACKTEST_COMPARISON"],
			});

			return {
				text: "Backtest comparison failed",
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	},

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "Run backtest comparison for 7 days" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Running backtest comparison for 7 days..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Backtest conservative strategy for 14 days with $5000" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Running conservative strategy backtest for 14 days..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Compare strategies historically" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Running historical strategy comparison..." },
			},
		],
	],
};
