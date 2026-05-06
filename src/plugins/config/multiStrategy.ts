/**
 * Multi-Strategy Configuration
 *
 * Configure multiple strategies to run simultaneously with different allocations
 * or compare them via backtesting before going live.
 */

import type { LLMStrategyConfig } from "../strategies/LLMStrategy.ts";
import type { MeanReversionConfig } from "../strategies/MeanReversionStrategy.ts";

// Strategy allocation weights (must sum to 1.0)
export interface StrategyAllocation {
	strategyId: string;
	weight: number; // 0.0 to 1.0
	config: Record<string, unknown>;
}

// Multi-strategy portfolio configuration
export interface MultiStrategyConfig {
	name: string;
	description: string;
	allocations: StrategyAllocation[];
	rebalanceIntervalMs: number; // How often to rebalance
	maxConcurrentPositions: number;
	stopLossCorrelation: boolean; // If true, correlated losses trigger global stop
}

// Pre-configured strategy profiles
export const STRATEGY_PROFILES = {
	// Conservative: Focus on mean reversion + small LLM allocation
	conservative: {
		name: "Conservative Multi-Strategy",
		description: "Low risk with 60% mean reversion, 30% rule-based, 10% LLM",
		allocations: [
			{
				strategyId: "mean-reversion",
				weight: 0.6,
				config: {
					bbPeriod: 20,
					bbStdDev: 2,
					rsiOversold: 25, // More conservative entry
					rsiOverbought: 75, // More conservative exit
					positionSizePercent: 0.01, // 1% positions
					stopLossPercent: 0.02, // 2% stop loss
					takeProfitPercent: 0.03, // 3% take profit
				},
			},
			{
				strategyId: "rule-based",
				weight: 0.3,
				config: {
					rules: [
						{
							type: "RSI",
							rsiPeriod: 14,
							rsiOversold: 30,
							rsiOverbought: 70,
							action: "BUY",
						},
					],
					tradeSizePercentage: 0.01,
					stopLossTakeProfit: {
						stopLossPercentage: 0.02,
						takeProfitPercentage: 0.04,
					},
				},
			},
			{
				strategyId: "llm",
				weight: 0.1,
				config: {
					maxBuyAmountPercent: 5, // Conservative 5% max
					minOpportunityScore: 75, // High threshold
					maxRiskScore: 50, // Low risk only
					minLiquidity: 100000, // Higher liquidity requirement
					minVolume24h: 500000, // Higher volume requirement
				},
			},
		],
		rebalanceIntervalMs: 86400000, // Daily rebalance
		maxConcurrentPositions: 3,
		stopLossCorrelation: true,
	},

	// Balanced: Equal mix of momentum and mean reversion with moderate LLM
	balanced: {
		name: "Balanced Multi-Strategy",
		description: "Moderate risk with 40% momentum, 40% mean reversion, 20% LLM",
		allocations: [
			{
				strategyId: "momentum-breakout-v1",
				weight: 0.4,
				config: {
					minVolumeRatio: 1.5,
					minPriceChange: 0.005, // 0.5%
					maxRiskPerTrade: 0.02,
					profitTarget: 0.03,
					stopLoss: 0.015,
				},
			},
			{
				strategyId: "mean-reversion",
				weight: 0.4,
				config: {
					bbPeriod: 20,
					bbStdDev: 2,
					rsiOversold: 30,
					rsiOverbought: 70,
					positionSizePercent: 0.015,
					stopLossPercent: 0.03,
					takeProfitPercent: 0.04,
				},
			},
			{
				strategyId: "llm",
				weight: 0.2,
				config: {
					maxBuyAmountPercent: 10,
					minOpportunityScore: 65,
					maxRiskScore: 60,
					minLiquidity: 75000,
					minVolume24h: 200000,
				},
			},
		],
		rebalanceIntervalMs: 43200000, // 12 hour rebalance
		maxConcurrentPositions: 5,
		stopLossCorrelation: true,
	},

	// Aggressive: High momentum + aggressive LLM with wider stops
	aggressive: {
		name: "Aggressive Multi-Strategy",
		description: "High risk with 50% momentum, 30% LLM, 20% rule-based",
		allocations: [
			{
				strategyId: "momentum-breakout-v1",
				weight: 0.5,
				config: {
					minVolumeRatio: 1.2, // Lower threshold for more trades
					minPriceChange: 0.003, // 0.3%
					maxRiskPerTrade: 0.05, // 5%
					profitTarget: 0.05, // 5%
					stopLoss: 0.025, // 2.5%
				},
			},
			{
				strategyId: "llm",
				weight: 0.3,
				config: {
					maxBuyAmountPercent: 15, // Max 15%
					minOpportunityScore: 55, // Lower threshold
					maxRiskScore: 75, // Higher risk tolerance
					minLiquidity: 30000, // Lower liquidity
					minVolume24h: 50000, // Lower volume
					birdeyeApiKey: process.env.BIRDEYE_API_KEY,
				},
			},
			{
				strategyId: "rule-based",
				weight: 0.2,
				config: {
					rules: [
						{
							type: "MACD_CROSS",
							macdFastPeriod: 12,
							macdSlowPeriod: 26,
							macdSignalPeriod: 9,
							action: "BUY",
						},
						{
							type: "VOLUME",
							minVolume24h: 50000,
							action: "BUY",
						},
					],
					tradeSizePercentage: 0.03,
					stopLossTakeProfit: {
						stopLossPercentage: 0.04,
						takeProfitPercentage: 0.08,
					},
				},
			},
		],
		rebalanceIntervalMs: 21600000, // 6 hour rebalance
		maxConcurrentPositions: 10,
		stopLossCorrelation: false,
	},

	// AI-First: Mostly LLM with technical confirmation
	aiFirst: {
		name: "AI-First Multi-Strategy",
		description: "LLM makes primary decisions, technicals for confirmation",
		allocations: [
			{
				strategyId: "llm",
				weight: 0.7,
				config: {
					maxBuyAmountPercent: 12,
					minOpportunityScore: 60,
					maxRiskScore: 65,
					minLiquidity: 50000,
					minVolume24h: 150000,
					birdeyeApiKey: process.env.BIRDEYE_API_KEY,
				},
			},
			{
				strategyId: "mean-reversion",
				weight: 0.3,
				config: {
					bbPeriod: 20,
					bbStdDev: 2,
					rsiOversold: 28,
					rsiOverbought: 72,
					positionSizePercent: 0.01,
					stopLossPercent: 0.025,
					takeProfitPercent: 0.035,
					rsiConfirmation: true,
				},
			},
		],
		rebalanceIntervalMs: 3600000, // 1 hour rebalance
		maxConcurrentPositions: 7,
		stopLossCorrelation: true,
	},
};

// Trading tokens - BTC, ETH, SOL only
export const TRADING_TOKENS = {
	BTC: {
		address: "BTC",
		symbol: "BTC",
		name: "Bitcoin",
		coingeckoId: "bitcoin",
		minLiquidity: 1000000,
		maxPositionPercent: 0.4,
	},
	ETH: {
		address: "ETH",
		symbol: "ETH",
		name: "Ethereum",
		coingeckoId: "ethereum",
		minLiquidity: 500000,
		maxPositionPercent: 0.35,
	},
	SOL: {
		address: "SOL",
		symbol: "SOL",
		name: "Solana",
		coingeckoId: "solana",
		minLiquidity: 250000,
		maxPositionPercent: 0.3,
	},
};

// Paper trading comparison config
export const PAPER_TRADING_COMPARISON = {
	duration: 7 * 24 * 60 * 60 * 1000, // 7 days
	startingBalance: 500, // $500 starting balance
	parallelMode: true, // Run all strategies simultaneously
	strategies: [
		"conservative",
		"balanced",
		"aggressive",
		"aiFirst",
	] as const,
	allowedTokens: ["BTC", "ETH", "SOL"],
};

// Performance metrics to track
export interface StrategyPerformance {
	strategyId: string;
	strategyName: string;
	totalPnL: number;
	winRate: number;
	totalTrades: number;
	winningTrades: number;
	losingTrades: number;
	avgWinAmount: number;
	avgLossAmount: number;
	profitFactor: number; // Gross profit / Gross loss
	maxDrawdown: number;
	sharpeRatio: number;
	startTime: number;
	endTime: number;
}

// Helper to get strategy profile
export function getStrategyProfile(profileId: keyof typeof STRATEGY_PROFILES): MultiStrategyConfig {
	return STRATEGY_PROFILES[profileId];
}

// Helper to validate allocation weights sum to 1.0
export function validateAllocations(allocations: StrategyAllocation[]): boolean {
	const totalWeight = allocations.reduce((sum, a) => sum + a.weight, 0);
	return Math.abs(totalWeight - 1.0) < 0.001; // Allow small floating point error
}
