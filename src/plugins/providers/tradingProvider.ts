import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import type { AutoTradingManager } from "../services/AutoTradingManager.ts";

const PROVIDER_KEYWORDS = [
	"trading",
	"tradingprovider",
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

interface PositionData {
	tokenAddress: string;
	amount: number;
	entryPrice: number;
	currentPrice?: number;
}

export const tradingProvider: Provider = {
	name: "TRADING",
	dynamic: true,
	get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
		if (!isRelevant(message, state)) return { text: "" };

		try {
			const tradingManager = runtime.getService(
				"AutoTradingManager",
			) as AutoTradingManager;
			if (!tradingManager) {
				return { text: "Trading services not available" };
			}

			const status = tradingManager.getStatus();
			const performance = status.performance;

			// Calculate unrealized P&L
			let unrealizedPnL = 0;
			status.positions.forEach((pos) => {
				if (pos.currentPrice && pos.currentPrice > 0) {
					const pnl = (pos.currentPrice - pos.entryPrice) * pos.amount;
					unrealizedPnL += pnl;
				}
			});

			const totalPnL = performance.totalPnL + unrealizedPnL;

			// Format position with proper token names
			const formatPosition = (pos: PositionData) => {
				const currentPrice = pos.currentPrice ?? pos.entryPrice;
				const pnl = (currentPrice - pos.entryPrice) * pos.amount;
				const pnlPercent =
					((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
				const tokenName = pos.tokenAddress.toUpperCase();
				const emoji = pnl >= 0 ? "🟢" : "🔴";
				return `${emoji} ${tokenName}: ${pos.amount.toFixed(6)} @ $${pos.entryPrice.toFixed(2)} (${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}% | ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)})`;
			};

			// Format comprehensive trading info
			const response = `📊 **Trading Dashboard**

🔴 **Status:** ${status.isTrading ? "ACTIVE 🟢" : "STOPPED 🔴"}
${status.strategy ? `📈 **Strategy:** ${status.strategy}` : ""}

💰 **Portfolio Performance (BTC, ETH, SOL):**
• Total P&L: ${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)} ${totalPnL >= 0 ? "📈" : "📉"}
• Today's P&L: ${performance.dailyPnL >= 0 ? "+" : ""}$${performance.dailyPnL.toFixed(2)}
• Unrealized P&L: ${unrealizedPnL >= 0 ? "+" : ""}$${unrealizedPnL.toFixed(2)}
• Starting Balance: $500 (Paper Trading)

📊 **Trading Statistics:**
• Total Trades: ${performance.totalTrades}
• Win Rate: ${performance.totalTrades > 0 ? (performance.winRate * 100).toFixed(1) : "0.0"}%
• Open Positions: ${status.positions.length}/3

${status.positions.length > 0 ? `\n📈 **Current Positions:**\n${status.positions.map(formatPosition).join("\n")}` : "\n📭 **No open positions**"}

${!status.isTrading ? '\n💡 Say "start trading" to begin automated trading.' : "\n⚡ Trading is active and monitoring BTC, ETH, SOL."}`;

			return { text: response };
		} catch (error) {
			console.error("Error in tradingProvider:", error);
			return { text: "Unable to fetch trading information" };
		}
	},
};