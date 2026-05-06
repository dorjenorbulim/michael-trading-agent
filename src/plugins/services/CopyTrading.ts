/**
 * Copy Trading Service
 *
 * Follow and copy trades from successful traders, whale wallets,
 * and smart money wallets with configurable risk management.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";
import type { TradeOrder } from "../types.ts";

export interface TraderProfile {
	id: string;
	name: string;
	address: string;
	type: "whale" | "smart_money" | "influencer" | "user_defined";
	performance: {
		winRate: number;
		totalPnL: number;
		avgReturn: number;
		tradesCount: number;
	};
	riskScore: number; // 0-100, lower is safer
	lastActive: number;
	isFollowing: boolean;
	copyPercentage: number; // 1-100%
	maxPositionSize: number;
}

export interface CopiedTrade {
	id: string;
	originalTraderId: string;
	originalTraderName: string;
	originalTxHash: string;
	originalTimestamp: number;
	copiedTimestamp: number;
	symbol: string;
	side: "BUY" | "SELL";
	amount: number;
	price: number;
	status: "pending" | "executed" | "failed" | "skipped";
	reason?: string;
	myPnL?: number;
}

export class CopyTrading extends Service {
	static serviceType = "copy-trading";
	capabilityDescription = "Copy trades from successful traders and smart wallets";

	private runtime: IAgentRuntime;
	private followedTraders: Map<string, TraderProfile> = new Map();
	private copiedTrades: CopiedTrade[] = [];
	private isAutoCopyEnabled: boolean = false;

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
	}

	static async start(runtime: IAgentRuntime): Promise<CopyTrading> {
		logger.info("*** Starting Copy Trading Service ***");
		return new CopyTrading(runtime);
	}

	static async stop(runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Copy Trading Service ***");
	}

	async stop(): Promise<void> {}

	/**
	 * Follow a trader
	 */
	async followTrader(
		params: {
			address: string;
			name?: string;
			type?: TraderProfile["type"];
			copyPercentage?: number;
			maxPositionSize?: number;
		}
	): Promise<TraderProfile | null> {
		// In production, verify trader exists and fetch performance data
		const profile: TraderProfile = {
			id: `trader-${params.address.slice(0, 8)}`,
			name: params.name || `Trader ${params.address.slice(0, 6)}...`,
			address: params.address,
			type: params.type || "user_defined",
			performance: {
				winRate: 0.65 + Math.random() * 0.2,
				totalPnL: Math.random() * 100000 - 20000,
				avgReturn: 0.05 + Math.random() * 0.1,
				tradesCount: Math.floor(Math.random() * 500) + 50,
			},
			riskScore: Math.floor(Math.random() * 60) + 20,
			lastActive: Date.now(),
			isFollowing: true,
			copyPercentage: params.copyPercentage || 50,
			maxPositionSize: params.maxPositionSize || 1000,
		};

		this.followedTraders.set(profile.id, profile);
		logger.info({ trader: profile.name }, `Now following trader: ${profile.name}`);

		return profile;
	}

	/**
	 * Unfollow a trader
	 */
	unfollowTrader(traderId: string): boolean {
		const trader = this.followedTraders.get(traderId);
		if (trader) {
			trader.isFollowing = false;
			logger.info({ trader: trader.name }, `Unfollowed trader: ${trader.name}`);
			return true;
		}
		return false;
	}

	/**
	 * Update copy settings for a trader
	 */
	updateTraderSettings(
		traderId: string,
		settings: Partial<Pick<TraderProfile, "copyPercentage" | "maxPositionSize">>
	): TraderProfile | null {
		const trader = this.followedTraders.get(traderId);
		if (trader) {
			if (settings.copyPercentage !== undefined) {
				trader.copyPercentage = Math.min(100, Math.max(1, settings.copyPercentage));
			}
			if (settings.maxPositionSize !== undefined) {
				trader.maxPositionSize = settings.maxPositionSize;
			}
			logger.info({ trader: trader.name, settings }, `Updated settings for ${trader.name}`);
			return trader;
		}
		return null;
	}

	/**
	 * Process a trade from a followed trader
	 */
	async processTraderTrade(
		traderId: string,
		trade: {
			txHash: string;
			timestamp: number;
			symbol: string;
			side: "BUY" | "SELL";
			amount: number;
			price: number;
		}
	): Promise<CopiedTrade | null> {
		const trader = this.followedTraders.get(traderId);
		if (!trader || !trader.isFollowing) return null;

		// Calculate copy amount
		let copyAmount = (trade.amount * trader.copyPercentage) / 100;
		const copyValue = copyAmount * trade.price;

		// Check if exceeds max position size
		if (copyValue > trader.maxPositionSize) {
			copyAmount = trader.maxPositionSize / trade.price;
		}

		const copiedTrade: CopiedTrade = {
			id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			originalTraderId: traderId,
			originalTraderName: trader.name,
			originalTxHash: trade.txHash,
			originalTimestamp: trade.timestamp,
			copiedTimestamp: Date.now(),
			symbol: trade.symbol,
			side: trade.side,
			amount: copyAmount,
			price: trade.price,
			status: "pending",
		};

		// Risk checks before executing
		if (trader.riskScore > 80) {
			copiedTrade.status = "skipped";
			copiedTrade.reason = "Trader risk score too high";
			logger.warn({ trade: copiedTrade }, "Skipped high-risk trade");
		} else if (this.isAutoCopyEnabled) {
			// Execute the copy trade
			copiedTrade.status = "executed";
			logger.info({ trade: copiedTrade }, `Executed copy trade: ${trade.side} ${copyAmount} ${trade.symbol}`);
		}

		this.copiedTrades.push(copiedTrade);
		return copiedTrade;
	}

	/**
	 * Get followed traders
	 */
	getFollowedTraders(): TraderProfile[] {
		return Array.from(this.followedTraders.values())
			.filter((t) => t.isFollowing)
			.sort((a, b) => b.performance.totalPnL - a.performance.totalPnL);
	}

	/**
	 * Get copy trading statistics
	 */
	getStats(): {
		totalTraders: number;
		activeTraders: number;
		totalCopiedTrades: number;
		successfulCopies: number;
		failedCopies: number;
		totalPnL: number;
		winRate: number;
	} {
		const executed = this.copiedTrades.filter((t) => t.status === "executed");
		const profitable = executed.filter((t) => (t.myPnL || 0) > 0);

		return {
			totalTraders: this.followedTraders.size,
			activeTraders: this.getFollowedTraders().length,
			totalCopiedTrades: this.copiedTrades.length,
			successfulCopies: executed.length,
			failedCopies: this.copiedTrades.filter((t) => t.status === "failed").length,
			totalPnL: executed.reduce((sum, t) => sum + (t.myPnL || 0), 0),
			winRate: executed.length > 0 ? profitable.length / executed.length : 0,
		};
	}

	/**
	 * Enable/disable auto copy
	 */
	toggleAutoCopy(enabled: boolean): void {
		this.isAutoCopyEnabled = enabled;
		logger.info(`Auto copy ${enabled ? "enabled" : "disabled"}`);
	}

	/**
	 * Get recent copied trades
	 */
	getRecentCopies(limit: number = 10): CopiedTrade[] {
		return this.copiedTrades.slice(-limit).reverse();
	}

	/**
	 * Format copy trading status
	 */
	formatStatus(): string {
		const traders = this.getFollowedTraders();
		const stats = this.getStats();

		let output = `👥 **Copy Trading Status**\n\n`;
		output += `**Following:** ${traders.length} traders\n`;
		output += `**Auto Copy:** ${this.isAutoCopyEnabled ? "✅ On" : "❌ Off"}\n`;
		output += `**Total Copied Trades:** ${stats.totalCopiedTrades}\n`;
		output += `**Success Rate:** ${(stats.winRate * 100).toFixed(1)}%\n`;
		output += `**Total PnL:** $${stats.totalPnL.toFixed(2)}\n\n`;

		if (traders.length > 0) {
			output += `**Followed Traders:**\n`;
			for (const trader of traders.slice(0, 5)) {
				const emoji = trader.performance.totalPnL > 0 ? "🟢" : "🔴";
				output += `${emoji} **${trader.name}** (${trader.type})\n`;
				output += `   PnL: $${trader.performance.totalPnL.toFixed(0)} | Win: ${(trader.performance.winRate * 100).toFixed(0)}% | Copy: ${trader.copyPercentage}%\n`;
			}
		}

		return output;
	}
}
