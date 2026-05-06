/**
 * Backtesting Comparison Feature
 *
 * Run multiple strategies against historical data simultaneously
 * to compare performance before deploying live.
 */

import type { IAgentRuntime, logger } from "@elizaos/core";
import { STRATEGY_PROFILES, type StrategyPerformance } from "../config/multiStrategy.ts";
import { LLMStrategy } from "../strategies/LLMStrategy.ts";
import { MeanReversionStrategy } from "../strategies/MeanReversionStrategy.ts";
import { MomentumBreakoutStrategy } from "../strategies/MomentumBreakoutStrategy.ts";
import { RuleBasedStrategy } from "../strategies/RuleBasedStrategy.ts";
import type { TradingStrategy, OHLCV, TradeOrder, AgentState, PortfolioSnapshot, StrategyContextMarketData } from "../types.ts";

export interface BacktestConfig {
	strategyId: string;
	strategyConfig: Record<string, unknown>;
	startTime: number;
	endTime: number;
	startingBalance: number;
	symbols: string[];
}

export interface BacktestResult {
	strategyId: string;
	strategyName: string;
	config: Record<string, unknown>;
	startTime: number;
	endTime: number;
	duration: number;
	startingBalance: number;
	endingBalance: number;
	totalPnL: number;
	totalPnLPercent: number;
	winRate: number;
	totalTrades: number;
	winningTrades: number;
	losingTrades: number;
	avgWin: number;
	avgLoss: number;
	profitFactor: number;
	maxDrawdown: number;
	maxDrawdownPercent: number;
	sharpeRatio: number;
	trades: Array<{
		timestamp: number;
		type: "BUY" | "SELL";
		symbol: string;
		price: number;
		amount: number;
		pnl?: number;
		note?: string;
	}>;
	equityCurve: Array<{ timestamp: number; value: number }>;
}

export interface ComparisonResult {
	profileName: string;
	backtestDate: number;
	results: BacktestResult[];
	winner: string;
	recommendation: string;
}

/**
 * Mock historical data generator for backtesting
 * In production, this would fetch from Birdeye/helius API
 */
function generateMockHistoricalData(
	symbol: string,
	startTime: number,
	endTime: number,
	intervalMs: number = 60000
): OHLCV[] {
	const data: OHLCV[] = [];
	let price = 100 + Math.random() * 100; // Starting price $100-200
	let volume = 1000000 + Math.random() * 5000000;

	for (let t = startTime; t < endTime; t += intervalMs) {
		// Simulate realistic price movement with trend and volatility
		const trend = Math.sin(t / 86400000) * 0.1; // Daily cycle
		const volatility = (Math.random() - 0.5) * 0.05; // 5% volatility
		const change = trend + volatility;

		const open = price;
		const close = price * (1 + change);
		const high = Math.max(open, close) * (1 + Math.random() * 0.02);
		const low = Math.min(open, close) * (1 - Math.random() * 0.02);
		volume = volume * (0.9 + Math.random() * 0.2);

		data.push({
			timestamp: t,
			open,
			high,
			low,
			close,
			volume,
		});

		price = close;
	}

	return data;
}

/**
 * Run backtest for a single strategy
 */
async function runSingleBacktest(
	strategy: TradingStrategy,
	config: BacktestConfig,
	runtime: IAgentRuntime
): Promise<BacktestResult> {
	logger.info(`Running backtest for ${strategy.name}...`);

	const historicalData: Record<string, OHLCV[]> = {};
	for (const symbol of config.symbols) {
		historicalData[symbol] = generateMockHistoricalData(
			symbol,
			config.startTime,
			config.endTime
		);
	}

	// Initialize strategy state
	let balance = config.startingBalance;
	let position: { symbol: string; amount: number; entryPrice: number } | null = null;
	const trades: BacktestResult["trades"] = [];
	const equityCurve: BacktestResult["equityCurve"] = [];

	let winningTrades = 0;
	let losingTrades = 0;
	let totalWinAmount = 0;
	let totalLossAmount = 0;
	let maxBalance = config.startingBalance;
	let maxDrawdown = 0;

	// Simulate each time step
	const timestamps = Object.values(historicalData)[0].map(d => d.timestamp);

	for (const timestamp of timestamps) {
		const currentData: Record<string, OHLCV> = {};
		for (const symbol of config.symbols) {
			const candle = historicalData[symbol].find(d => d.timestamp === timestamp);
			if (candle) currentData[symbol] = candle;
		}

		// Build market data context
		const marketData: StrategyContextMarketData = {
			currentPrices: Object.fromEntries(
				Object.entries(currentData).map(([s, d]) => [s, d.close])
			),
			ohlcv: Object.fromEntries(
				Object.entries(historicalData).map(([s, data]) => [
					s,
					data.filter(d => d.timestamp <= timestamp),
				])
			),
			volume24h: Object.fromEntries(
				Object.entries(currentData).map(([s, d]) => [s, d.volume])
			),
			liquidity: Object.fromEntries(
				config.symbols.map(s => [s, 100000 + Math.random() * 500000])
			),
		};

		const portfolio: PortfolioSnapshot = {
			cash: balance,
			holdings: position
				? { [position.symbol]: position.amount }
				: {},
			totalValue: position
				? balance + position.amount * currentData[position.symbol]?.close || 0
				: balance,
			timestamp,
		};

		const agentState: AgentState = {
			cash: balance,
			portfolioValue: portfolio.totalValue,
			currentPositions: position ? [position.symbol] : [],
			lastAction: trades.length > 0 ? trades[trades.length - 1].type : undefined,
			timestamp,
		};

		// Check if strategy is ready
		if (!strategy.isReady()) {
			if (strategy.initialize) {
				await strategy.initialize(runtime);
			}
		}

		// Get strategy decision
		const decision = await strategy.decide({
			marketData,
			agentState,
			portfolioSnapshot: portfolio,
		});

		// Execute trades
		if (decision && decision.length > 0) {
			for (const order of decision) {
				const currentPrice = currentData[order.pair]?.close || order.price;

				if (order.type === "BUY" && !position) {
					const amount = (balance * 0.95) / currentPrice; // Use 95% of balance
					position = {
						symbol: order.pair,
						amount,
						entryPrice: currentPrice,
					};
					balance -= amount * currentPrice;
					trades.push({
						timestamp,
						type: "BUY",
						symbol: order.pair,
						price: currentPrice,
						amount,
						note: `Strategy: ${strategy.name}`,
					});
				} else if (order.type === "SELL" && position) {
					const sellValue = position.amount * currentPrice;
					const pnl = sellValue - position.amount * position.entryPrice;
					balance += sellValue;

					if (pnl > 0) {
						winningTrades++;
						totalWinAmount += pnl;
					} else {
						losingTrades++;
						totalLossAmount += Math.abs(pnl);
					}

					trades.push({
						timestamp,
						type: "SELL",
						symbol: order.pair,
						price: currentPrice,
						amount: position.amount,
						pnl,
						note: `Strategy: ${strategy.name} | PnL: $${pnl.toFixed(2)}`,
					});

					position = null;
				}
			}
		}

		// Update equity curve
		const currentValue = position
			? balance + position.amount * (currentData[position.symbol]?.close || 0)
			: balance;
		equityCurve.push({ timestamp, value: currentValue });

		// Track max drawdown
		if (currentValue > maxBalance) {
			maxBalance = currentValue;
		}
		const drawdown = maxBalance - currentValue;
		if (drawdown > maxDrawdown) {
			maxDrawdown = drawdown;
		}
	}

	// Close any open position at end
	const endingBalance = equityCurve.length > 0
		? equityCurve[equityCurve.length - 1].value
		: balance;

	const totalPnL = endingBalance - config.startingBalance;
	const totalTrades = winningTrades + losingTrades;

	return {
		strategyId: strategy.id,
		strategyName: strategy.name,
		config: config.strategyConfig,
		startTime: config.startTime,
		endTime: config.endTime,
		duration: config.endTime - config.startTime,
		startingBalance: config.startingBalance,
		endingBalance,
		totalPnL,
		totalPnLPercent: (totalPnL / config.startingBalance) * 100,
		winRate: totalTrades > 0 ? winningTrades / totalTrades : 0,
		totalTrades,
		winningTrades,
		losingTrades,
		avgWin: winningTrades > 0 ? totalWinAmount / winningTrades : 0,
		avgLoss: losingTrades > 0 ? totalLossAmount / losingTrades : 0,
		profitFactor: totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0,
		maxDrawdown,
		maxDrawdownPercent: (maxDrawdown / config.startingBalance) * 100,
		sharpeRatio: calculateSharpeRatio(equityCurve),
		trades,
		equityCurve,
	};
}

/**
 * Calculate Sharpe ratio from equity curve
 */
function calculateSharpeRatio(equityCurve: Array<{ timestamp: number; value: number }>): number {
	if (equityCurve.length < 2) return 0;

	const returns: number[] = [];
	for (let i = 1; i < equityCurve.length; i++) {
		returns.push(
			(equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value
		);
	}

	const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
	const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
	const stdDev = Math.sqrt(variance);

	return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0; // Annualized
}

/**
 * Run backtesting comparison across all strategy profiles
 */
export async function runBacktestComparison(
	profileName: keyof typeof STRATEGY_PROFILES,
	options: {
		days?: number;
		startingBalance?: number;
		symbols?: string[];
	},
	runtime: IAgentRuntime
): Promise<ComparisonResult> {
	const profile = STRATEGY_PROFILES[profileName];
	logger.info(`Starting backtest comparison for: ${profile.name}`);

	const endTime = Date.now();
	const startTime = endTime - (options.days || 7) * 24 * 60 * 60 * 1000;
	const startingBalance = options.startingBalance || 1000;
	const symbols = options.symbols || ["SOL", "BONK", "WIF"];

	const results: BacktestResult[] = [];

	// Run backtest for each strategy in the profile
	for (const allocation of profile.allocations) {
		let strategy: TradingStrategy;
		switch (allocation.strategyId) {
			case "llm":
				strategy = new LLMStrategy(allocation.config);
				break;
			case "momentum-breakout-v1":
				strategy = new MomentumBreakoutStrategy();
				Object.assign(strategy, allocation.config);
				break;
			case "mean-reversion":
				strategy = new MeanReversionStrategy(allocation.config);
				break;
			case "rule-based":
				strategy = new RuleBasedStrategy(allocation.config);
				break;
			default:
				continue;
		}

		const result = await runSingleBacktest(
			strategy,
			{
				strategyId: allocation.strategyId,
				strategyConfig: allocation.config,
				startTime,
				endTime,
				startingBalance,
				symbols,
			},
			runtime
		);

		results.push(result);
	}

	// Determine winner
	const winner = results.reduce((best, current) =>
		current.totalPnLPercent > best.totalPnLPercent ? current : best
	);

	// Generate recommendation
	const profitableStrategies = results.filter(r => r.totalPnL > 0);
	const recommendation = generateRecommendation(winner, profitableStrategies, results);

	return {
		profileName,
		backtestDate: Date.now(),
		results,
		winner: winner.strategyName,
		recommendation,
	};
}

/**
 * Generate human-readable recommendation
 */
function generateRecommendation(
	winner: BacktestResult,
	profitable: BacktestResult[],
	all: BacktestResult[]
): string {
	if (profitable.length === 0) {
		return "⚠️ None of the strategies were profitable during this backtest period. Consider adjusting parameters or waiting for better market conditions.";
	}

	if (winner.maxDrawdownPercent > 20) {
		return `⚠️ ${winner.strategyName} had the highest returns (${winner.totalPnLPercent.toFixed(2)}%) but also significant drawdown (${winner.maxDrawdownPercent.toFixed(2)}%). Consider using with reduced position sizes.`;
	}

	if (winner.winRate < 0.4) {
		return `⚠️ ${winner.strategyName} won despite low win rate (${(winner.winRate * 100).toFixed(1)}%). Profits came from few large wins. Ensure you can handle consecutive losses.`;
	}

	if (profitable.length === all.length) {
		return `[OK] All strategies were profitable! ${winner.strategyName} performed best with ${winner.totalPnLPercent.toFixed(2)}% returns. Consider the multi-strategy approach to diversify.`;
	}

	return `[OK] ${winner.strategyName} is the recommended strategy with ${winner.totalPnLPercent.toFixed(2)}% returns, ${winner.winRate.toFixed(1)}% win rate, and manageable ${winner.maxDrawdownPercent.toFixed(2)}% max drawdown.`;
}

/**
 * Format backtest results for display
 */
export function formatBacktestResults(result: ComparisonResult): string {
	let output = `📊 **Backtest Comparison Results: ${result.profileName}**\n\n`;
	output += `*Test Period:* ${new Date(result.results[0]?.startTime || 0).toLocaleDateString()} - ${new Date(result.results[0]?.endTime || 0).toLocaleDateString()}\n\n`;

	// Sort by performance
	const sorted = [...result.results].sort((a, b) => b.totalPnL - a.totalPnL);

	for (let i = 0; i < sorted.length; i++) {
		const r = sorted[i];
		const emoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📊";
		const pnlEmoji = r.totalPnL >= 0 ? "🟢" : "🔴";

		output += `${emoji} **${r.strategyName}**\n`;
		output += `${pnlEmoji} PnL: $${r.totalPnL.toFixed(2)} (${r.totalPnLPercent >= 0 ? "+" : ""}${r.totalPnLPercent.toFixed(2)}%)\n`;
		output += `📈 Win Rate: ${(r.winRate * 100).toFixed(1)}% (${r.winningTrades}/${r.totalTrades} trades)\n`;
		output += `💰 Profit Factor: ${r.profitFactor.toFixed(2)}\n`;
		output += `📉 Max Drawdown: ${r.maxDrawdownPercent.toFixed(2)}%\n`;
		output += `⚖️ Sharpe Ratio: ${r.sharpeRatio.toFixed(2)}\n`;
		output += `\n`;
	}

	output += `---\n\n`;
	output += `🏆 **Winner:** ${result.winner}\n\n`;
	output += `💡 **Recommendation:**\n${result.recommendation}\n`;

	return output;
}
