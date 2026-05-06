/**
 * Multi-Strategy Manager
 *
 * Manages multiple trading strategies simultaneously with configurable allocations.
 * Supports backtesting comparison and live trading with strategy rotation.
 */

import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import type { MultiStrategyConfig, StrategyAllocation, StrategyPerformance } from "../config/multiStrategy.ts";
import type { TradingStrategy } from "../types.ts";
import type { AutoTradingManager } from "./AutoTradingManager.ts";

interface StrategyInstance {
	strategy: TradingStrategy;
	allocation: StrategyAllocation;
	performance: Partial<StrategyPerformance>;
	isActive: boolean;
	lastTradeTime: number;
	currentPosition: {
		token: string;
		amount: number;
		entryPrice: number;
	} | null;
}

export class MultiStrategyManager extends Service {
	static serviceType = "multi-strategy-manager";
	capabilityDescription = "Manages multiple trading strategies with configurable allocations";

	private runtime: IAgentRuntime;
	private config: MultiStrategyConfig;
	private strategies: Map<string, StrategyInstance> = new Map();
	private isRunning = false;
	private lastRebalanceTime = 0;
	private performanceHistory: StrategyPerformance[] = [];
	private totalPortfolioValue = 0;

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
		// Default to balanced config
		this.config = {
			name: "Default Multi-Strategy",
			description: "Balanced allocation across strategies",
			allocations: [],
			rebalanceIntervalMs: 43200000,
			maxConcurrentPositions: 5,
			stopLossCorrelation: true,
		};
	}

	static async start(runtime: IAgentRuntime): Promise<MultiStrategyManager> {
		logger.info("*** Starting Multi-Strategy Manager ***");
		const manager = new MultiStrategyManager(runtime);
		return manager;
	}

	static async stop(runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Multi-Strategy Manager ***");
		const manager = runtime.getService("multi-strategy-manager") as MultiStrategyManager;
		if (manager) {
			await manager.stopAllStrategies();
		}
	}

	async stop(): Promise<void> {
		await this.stopAllStrategies();
	}

	/**
	 * Initialize with a multi-strategy configuration
	 */
	async initialize(config: MultiStrategyConfig): Promise<void> {
		this.config = config;
		logger.info(`Initializing Multi-Strategy Manager: ${config.name}`);
		logger.info(`Description: ${config.description}`);
		logger.info(`Allocations: ${config.allocations.map(a => `${a.strategyId} (${a.weight * 100}%)`).join(", ")}`);
	}

	/**
	 * Register a strategy instance
	 */
	registerStrategy(strategy: TradingStrategy, allocation: StrategyAllocation): void {
		this.strategies.set(strategy.id, {
			strategy,
			allocation,
			performance: {
				strategyId: strategy.id,
				strategyName: strategy.name,
				totalPnL: 0,
				winRate: 0,
				totalTrades: 0,
				winningTrades: 0,
				losingTrades: 0,
				avgWinAmount: 0,
				avgLossAmount: 0,
				profitFactor: 0,
				maxDrawdown: 0,
				sharpeRatio: 0,
			},
			isActive: false,
			lastTradeTime: 0,
			currentPosition: null,
		});
		logger.info(`Registered strategy: ${strategy.name} with ${allocation.weight * 100}% allocation`);
	}

	/**
	 * Start all strategies
	 */
	async startAllStrategies(): Promise<void> {
		if (this.isRunning) {
			logger.warn("Multi-strategy manager already running");
			return;
		}

		this.isRunning = true;
		this.lastRebalanceTime = Date.now();

		for (const [id, instance] of this.strategies) {
			instance.isActive = true;
			logger.info(`Activated strategy: ${instance.strategy.name}`);
		}

		logger.info("All strategies started");
	}

	/**
	 * Stop all strategies
	 */
	async stopAllStrategies(): Promise<void> {
		this.isRunning = false;
		for (const [id, instance] of this.strategies) {
			instance.isActive = false;
			logger.info(`Deactivated strategy: ${instance.strategy.name}`);
		}
		logger.info("All strategies stopped");
	}

	/**
	 * Get active strategy count
	 */
	getActiveStrategyCount(): number {
		return Array.from(this.strategies.values()).filter(s => s.isActive).length;
	}

	/**
	 * Get strategy performance summary
	 */
	getPerformanceSummary(): Record<string, Partial<StrategyPerformance>> {
		const summary: Record<string, Partial<StrategyPerformance>> = {};
		for (const [id, instance] of this.strategies) {
			summary[id] = instance.performance;
		}
		return summary;
	}

	/**
	 * Get combined portfolio performance
	 */
	getCombinedPerformance(): {
		totalPnL: number;
		weightedWinRate: number;
		totalTrades: number;
		activeStrategies: number;
	} {
		let totalPnL = 0;
		let weightedWinRate = 0;
		let totalTrades = 0;
		let activeCount = 0;

		for (const [id, instance] of this.strategies) {
			if (instance.isActive) {
				totalPnL += instance.performance.totalPnL || 0;
				weightedWinRate += (instance.performance.winRate || 0) * instance.allocation.weight;
				totalTrades += instance.performance.totalTrades || 0;
				activeCount++;
			}
		}

		return {
			totalPnL,
			weightedWinRate,
			totalTrades,
			activeStrategies: activeCount,
		};
	}

	/**
	 * Rebalance strategy allocations based on performance
	 */
	async rebalance(): Promise<void> {
		const now = Date.now();
		if (now - this.lastRebalanceTime < this.config.rebalanceIntervalMs) {
			return; // Not time to rebalance yet
		}

		logger.info("Rebalancing strategy allocations...");

		// Simple rebalancing: increase allocation to best performing strategy
		let bestStrategyId = "";
		let bestPerformance = -Infinity;

		for (const [id, instance] of this.strategies) {
			const pnl = instance.performance.totalPnL || 0;
			if (pnl > bestPerformance) {
				bestPerformance = pnl;
				bestStrategyId = id;
			}
		}

		if (bestStrategyId) {
			logger.info(`Best performing strategy: ${bestStrategyId} with ${bestPerformance} PnL`);
			// Could implement dynamic reallocation here
		}

		this.lastRebalanceTime = now;
	}

	/**
	 * Check if we should trigger correlated stop loss
	 */
	checkCorrelationStopLoss(): boolean {
		if (!this.config.stopLossCorrelation) return false;

		const activeStrategies = Array.from(this.strategies.values()).filter(s => s.isActive);
		if (activeStrategies.length < 2) return false;

		// Check if multiple strategies are losing simultaneously
		const losingStrategies = activeStrategies.filter(s => (s.performance.totalPnL || 0) < 0);
		const correlationThreshold = 0.5; // 50% of strategies losing

		return losingStrategies.length / activeStrategies.length >= correlationThreshold;
	}

	/**
	 * Get current status
	 */
	getStatus(): {
		isRunning: boolean;
		config: string;
		activeStrategies: number;
		allocations: Array<{ strategyId: string; weight: number; isActive: boolean }>;
		lastRebalance: number;
		nextRebalance: number;
	} {
		const now = Date.now();
		return {
			isRunning: this.isRunning,
			config: this.config.name,
			activeStrategies: this.getActiveStrategyCount(),
			allocations: Array.from(this.strategies.entries()).map(([id, instance]) => ({
				strategyId: id,
				weight: instance.allocation.weight,
				isActive: instance.isActive,
			})),
			lastRebalance: this.lastRebalanceTime,
			nextRebalance: this.lastRebalanceTime + this.config.rebalanceIntervalMs,
		};
	}
}
