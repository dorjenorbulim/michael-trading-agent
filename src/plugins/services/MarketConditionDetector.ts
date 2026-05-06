/**
 * Market Condition Detector
 *
 * Analyzes market data to detect bull, bear, or sideways conditions
 * and recommends optimal strategy adjustments.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";
import type { OHLCV } from "../types.ts";

export type MarketCondition = "bull" | "bear" | "sideways" | "volatile";

export interface MarketAnalysis {
	condition: MarketCondition;
	confidence: number; // 0-1
	trendStrength: number;
	volatility: number;
	volumeTrend: "increasing" | "decreasing" | "stable";
	recommendation: string;
	optimalStrategies: string[];
	avoidStrategies: string[];
}

export class MarketConditionDetector extends Service {
	static serviceType = "market-condition-detector";
	capabilityDescription = "Detects market conditions and recommends strategy adjustments";

	private runtime: IAgentRuntime;
	private recentConditions: Array<{ condition: MarketCondition; timestamp: number }> = [];
	private readonly HISTORY_SIZE = 10;

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
	}

	static async start(runtime: IAgentRuntime): Promise<MarketConditionDetector> {
		logger.info("*** Starting Market Condition Detector ***");
		return new MarketConditionDetector(runtime);
	}

	static async stop(runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Market Condition Detector ***");
	}

	async stop(): Promise<void> {}

	/**
	 * Analyze current market condition based on OHLCV data
	 */
	analyze(symbol: string, ohlcv: OHLCV[]): MarketAnalysis {
		if (ohlcv.length < 20) {
			return {
				condition: "sideways",
				confidence: 0.5,
				trendStrength: 0,
				volatility: 0,
				volumeTrend: "stable",
				recommendation: "Insufficient data for analysis",
				optimalStrategies: ["mean-reversion"],
				avoidStrategies: [],
			};
		}

		// Calculate trend
		const recent = ohlcv.slice(-20);
		const oldPrice = recent[0].close;
		const newPrice = recent[recent.length - 1].close;
		const priceChange = (newPrice - oldPrice) / oldPrice;

		// Calculate volatility (ATR-like)
		const ranges = recent.map(c => c.high - c.low);
		const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
		const volatility = avgRange / newPrice;

		// Calculate volume trend
		const recentVolume = recent.slice(-5).reduce((sum, c) => sum + c.volume, 0) / 5;
		const oldVolume = recent.slice(0, 5).reduce((sum, c) => sum + c.volume, 0) / 5;
		const volumeChange = (recentVolume - oldVolume) / oldVolume;

		// Determine condition
		let condition: MarketCondition;
		let confidence = 0.7;

		if (volatility > 0.05) {
			condition = "volatile";
			confidence = Math.min(0.9, volatility * 10);
		} else if (priceChange > 0.1) {
			condition = "bull";
			confidence = Math.min(0.95, Math.abs(priceChange) * 5 + 0.5);
		} else if (priceChange < -0.1) {
			condition = "bear";
			confidence = Math.min(0.95, Math.abs(priceChange) * 5 + 0.5);
		} else {
			condition = "sideways";
			confidence = 0.8;
		}

		// Store in history
		this.recentConditions.push({ condition, timestamp: Date.now() });
		if (this.recentConditions.length > this.HISTORY_SIZE) {
			this.recentConditions.shift();
		}

		// Generate recommendations
		const { optimal, avoid, recommendation } = this.getRecommendations(
			condition,
			volatility,
			priceChange
		);

		return {
			condition,
			confidence,
			trendStrength: Math.abs(priceChange),
			volatility,
			volumeTrend: volumeChange > 0.1 ? "increasing" : volumeChange < -0.1 ? "decreasing" : "stable",
			recommendation,
			optimalStrategies: optimal,
			avoidStrategies: avoid,
		};
	}

	/**
	 * Get strategy recommendations based on market condition
	 */
	private getRecommendations(
		condition: MarketCondition,
		volatility: number,
		priceChange: number
	): { optimal: string[]; avoid: string[]; recommendation: string } {
		switch (condition) {
			case "bull":
				return {
					optimal: ["momentum-breakout-v1", "llm"],
					avoid: ["mean-reversion"],
					recommendation: "Strong uptrend detected. Momentum strategies will capture breakouts. Consider increasing position sizes.",
				};
			case "bear":
				return {
					optimal: ["mean-reversion", "rule-based"],
					avoid: ["momentum-breakout-v1"],
					recommendation: "Downtrend detected. Mean reversion may find oversold bounces. Reduce overall exposure or pause momentum strategies.",
				};
			case "volatile":
				return {
					optimal: ["mean-reversion", "llm"],
					avoid: ["momentum-breakout-v1"],
					recommendation: "High volatility detected. Mean reversion can capture swings. Tighten stop losses and reduce position sizes.",
				};
			case "sideways":
				return {
					optimal: ["mean-reversion", "rule-based"],
					avoid: ["momentum-breakout-v1"],
					recommendation: "Range-bound market. Mean reversion strategies excel here. Set clear support/resistance levels.",
				};
		}
	}

	/**
	 * Detect if market condition has changed
	 */
	hasConditionChanged(): { changed: boolean; previous?: MarketCondition; current?: MarketCondition } {
		if (this.recentConditions.length < 2) {
			return { changed: false };
		}

		const current = this.recentConditions[this.recentConditions.length - 1];
		const previous = this.recentConditions[this.recentConditions.length - 2];

		return {
			changed: current.condition !== previous.condition,
			previous: previous.condition,
			current: current.condition,
		};
	}

	/**
	 * Get current market status
	 */
	getStatus(): {
		currentCondition: MarketCondition | null;
		conditionHistory: MarketCondition[];
		recommendation: string;
	} {
		const current = this.recentConditions[this.recentConditions.length - 1];
		return {
			currentCondition: current?.condition || null,
			conditionHistory: this.recentConditions.map(c => c.condition),
			recommendation: current
				? this.getRecommendations(current.condition, 0, 0).recommendation
				: "No market data available",
		};
	}
}
