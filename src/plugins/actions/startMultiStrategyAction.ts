/**
 * Start Multi-Strategy Trading Action
 *
 * Start trading with multiple strategies simultaneously using configurable allocations.
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
import { STRATEGY_PROFILES, getStrategyProfile } from "../config/multiStrategy.ts";
import { MultiStrategyManager } from "../services/MultiStrategyManager.ts";
import { LLMStrategy } from "../strategies/LLMStrategy.ts";
import { MeanReversionStrategy } from "../strategies/MeanReversionStrategy.ts";
import { MomentumBreakoutStrategy } from "../strategies/MomentumBreakoutStrategy.ts";
import { RuleBasedStrategy } from "../strategies/RuleBasedStrategy.ts";

const PROFILE_DESCRIPTIONS: Record<string, string> = {
	conservative: "Low risk - 60% mean reversion, 30% rule-based, 10% LLM",
	balanced: "Moderate risk - 40% momentum, 40% mean reversion, 20% LLM",
	aggressive: "High risk - 50% momentum, 30% LLM, 20% rule-based",
	aiFirst: "AI-driven - 70% LLM decisions with technical confirmation",
};

export const startMultiStrategyAction: Action = {
	name: "START_MULTI_STRATEGY",
	similes: [
		"START_MULTI_TRADING",
		"BEGIN_MULTI_STRATEGY",
		"MULTI_STRATEGY_TRADING",
		"PORTFOLIO_STRATEGY",
		"DIVERSIFIED_TRADING",
	],
	description: "Start trading with multiple strategies simultaneously using configurable allocations",

	validate: async function(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
		const text = message.content.text?.toLowerCase() || "";
		return [
			"start multi strategy",
			"multi strategy",
			"portfolio strategy",
			"diversified trading",
			"start conservative",
			"start balanced",
			"start aggressive",
			"start ai first",
			"multi-strategy",
		].some((kw) => text.includes(kw));
	},

	handler: async function(
		runtime: IAgentRuntime,
		message: Memory,
		_state?: State,
		_options?: any,
		callback?: HandlerCallback,
	): Promise<ActionResult> {
		try {
			const text = message.content.text?.toLowerCase() || "";

			// Detect which profile to use
			let profileId: keyof typeof STRATEGY_PROFILES = "balanced";
			if (text.includes("conservative")) profileId = "conservative";
			else if (text.includes("aggressive")) profileId = "aggressive";
			else if (text.includes("ai first") || text.includes("aifirst")) profileId = "aiFirst";

			const profile = getStrategyProfile(profileId);

			// Get or create multi-strategy manager
			let manager = runtime.getService("multi-strategy-manager") as MultiStrategyManager | undefined;

			if (!manager) {
				manager = await MultiStrategyManager.start(runtime);
				runtime.registerService(manager);
			}

			// Initialize with profile config
			await manager.initialize(profile);

			// Instantiate strategies based on allocations
			for (const allocation of profile.allocations) {
				let strategy;
				switch (allocation.strategyId) {
					case "llm":
						strategy = new LLMStrategy(allocation.config as any);
						break;
					case "momentum-breakout-v1":
						strategy = new MomentumBreakoutStrategy();
						// Apply custom config
						Object.assign(strategy, allocation.config);
						break;
					case "mean-reversion":
						strategy = new MeanReversionStrategy(allocation.config as any);
						break;
					case "rule-based":
						strategy = new RuleBasedStrategy(allocation.config as any);
						break;
					default:
						continue;
				}

				manager.registerStrategy(strategy, allocation);
			}

			// Start all strategies
			await manager.startAllStrategies();

			const status = manager.getStatus();

			const responseContent: Content = {
				text: `🚀 **Multi-Strategy Trading Started: ${profile.name}**\n\n**Profile:** ${profileId}\n**Description:** ${profile.description}\n\n**Strategy Allocations:**\n${profile.allocations.map(a => {
	const emoji = a.strategyId === "llm" ? "🤖" : 
		a.strategyId.includes("momentum") ? "📈" : 
		a.strategyId.includes("reversion") ? "↔️" : "📋";
	return `• ${emoji} **${a.strategyId}**: ${a.weight * 100}%`;
}).join("\n")}\n\n**Configuration:**\n• Max Concurrent Positions: ${profile.maxConcurrentPositions}\n• Rebalance Interval: ${profile.rebalanceIntervalMs / 3600000} hours\n• Correlation Stop Loss: ${profile.stopLossCorrelation ? "Enabled" : "Disabled"}\n\n**Status:** ${status.activeStrategies} strategies active ✅\n\nCommands:\n• "Check multi-strategy status" - View performance\n• "Compare strategies" - See individual results\n• "Stop multi-strategy" - Stop all trading\n\n*Trading with diversified strategy allocations.*`,
				actions: ["START_MULTI_STRATEGY"],
			};

			callback?.(responseContent);

			return {
				text: "Multi-strategy trading started successfully",
				success: true,
				data: {
					profile: profileId,
					strategies: profile.allocations.map(a => a.strategyId),
					active: status.activeStrategies,
				},
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error({ error: errorMessage }, "Error starting multi-strategy trading");

			const errorContent: Content = {
				text: `❌ **Failed to Start Multi-Strategy Trading**\n\nError: ${errorMessage}\n\nPlease check:\n• Required API keys (BIRDEYE_API_KEY, OPENAI_API_KEY)\n• Wallet configuration (SOLANA_PRIVATE_KEY)\n• Trading mode is set to "paper" for testing`,
				actions: ["START_MULTI_STRATEGY"],
			};

			callback?.(errorContent);

			return {
				text: "Failed to start multi-strategy trading",
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	},

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "Start multi-strategy trading with conservative profile" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Starting conservative multi-strategy trading..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Begin balanced strategy trading" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Initializing balanced multi-strategy portfolio..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "Start aggressive trading with multiple strategies" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Starting aggressive multi-strategy trading..." },
			},
		],
	],
};
