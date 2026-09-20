import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import type { AutoTradingManager } from "../services/AutoTradingManager.ts";

const PROVIDER_KEYWORDS = [
	"strategy",
	"strategyprovider",
	"plugin",
	"auto",
	"trader",
	"status",
	"state",
	"context",
	"info",
	"details",
	"chat",
	"conversation",
	"agent",
	"room",
];

function getMessageText(message: unknown): string {
	if (!message || typeof message !== "object") return "";
	const content = (message as { content?: unknown }).content;
	if (!content || typeof content !== "object") return "";
	const text = (content as { text?: unknown }).text;
	return typeof text === "string" ? text : "";
}

function isRelevant(message: Memory, state?: State): boolean {
	void message;
	void state;
	return true;
}

const STRATEGY_INFO: Record<
	string,
	{ type: string; bestFor: string; riskLevel: string }
> = {
	llm: {
		type: "AI-driven analysis",
		bestFor: "Complex market analysis",
		riskLevel: "Variable",
	},
	"momentum-breakout-v1": {
		type: "Technical analysis",
		bestFor: "Trending markets",
		riskLevel: "Moderate",
	},
	"mean-reversion": {
		type: "Statistical",
		bestFor: "Range-bound markets",
		riskLevel: "Moderate",
	},
	"rule-based": {
		type: "Technical indicators",
		bestFor: "Systematic trading",
		riskLevel: "Low-Moderate",
	},
	"random-v1": {
		type: "Probabilistic",
		bestFor: "Baseline testing",
		riskLevel: "High",
	},
	"trend-following-v1": {
		type: "Technical analysis",
		bestFor: "Persistent trends (EMA stack, ADX > 20)",
		riskLevel: "Low-Moderate",
	},
	"mean-reversion-simple-v1": {
		type: "Statistical",
		bestFor: "Range-bound markets, oversold bounces",
		riskLevel: "Moderate",
	},
};

export const strategyProvider: Provider = {
	name: "STRATEGY",
	dynamic: true,
	get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
		if (!isRelevant(message, state)) return { text: "" };

		const tradingManager = runtime.getService("AutoTradingManager") as
			| AutoTradingManager
			| undefined;

		if (!tradingManager) {
			return {
				text: "Strategy information unavailable - trading service not loaded.",
			};
		}

		const strategies = tradingManager.getStrategies();
		const status = tradingManager.getStatus();

		let text = `🎯 **Available Trading Strategies**\n\n`;

		for (const strategy of strategies) {
			const info = STRATEGY_INFO[strategy.id] || {
				type: "Custom",
				bestFor: "Various",
				riskLevel: "Variable",
			};
			const isActive = status.strategy === strategy.name;
			text += `**${strategy.name}** ${isActive ? "✅ Active" : ""}\n`;
			text += `• ID: \`${strategy.id}\`\n`;
			text += `• Type: ${info.type}\n`;
			text += `• Best for: ${info.bestFor}\n`;
			text += `• Risk: ${info.riskLevel}\n\n`;
		}

		text += `💡 **Quick Start:**\n`;
		text += `• "Start trading with LLM strategy"\n`;
		text += `• "Start momentum trading on BONK"\n`;
		text += `• "Run backtest with mean reversion"`;

		return { text };
	},
};
