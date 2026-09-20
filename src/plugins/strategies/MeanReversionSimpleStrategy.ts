/**
 * Mean-Reversion-Simple Strategy (adapted from a quant framework)
 *
 * Core thesis: crypto oscillates within ranges the majority of the time;
 * buy oversold dislocations and sell them back to the mean:
 *
 *  - RSI(14) < 30 AND close ≤ lower Bollinger band(20, 2) → oversold entry.
 *  - Volume confirmation required: recent volume ratio > 1.5 (the selling
 *    must be real capitulation flow, not a thin-tape drift).
 *  - Skip signals during strong trends (ADX > 40): a trend that strong keeps
 *    running through the band instead of snapping back.
 *  - Position size shrinks as volatility rises: base × (targetATR% / ATR%),
 *    clamped to 0.3–1.5×, then capped by the shared RiskManager.
 *  - Take profit at the middle band; stop loss just below the lower band
 *    (0.5×ATR buffer) — plus the RiskManager breakeven lock after +5%.
 */

import { ADX, ATR, BollingerBands, RSI } from "technicalindicators";
import type { IAgentRuntime } from "@elizaos/core";
import {
	type AgentState,
	type OHLCV,
	OrderType,
	type PortfolioSnapshot,
	type StrategyContextMarketData,
	type TradeOrder,
	TradeType,
	type TradingStrategy,
} from "../types.ts";
import { getSharedRiskManager, type RiskManager } from "../utils/riskManager.ts";
import type { RegimeDetector } from "../services/RegimeDetector.ts";

export interface MeanReversionSimpleConfig {
	rsiPeriod: number;
	rsiOversold: number;
	rsiOverbought: number;
	bbPeriod: number;
	bbStdDev: number;
	/** Required volume ratio (recent 5-bar avg vs 20-bar avg). */
	volumeRatioThreshold: number;
	/** Skip entries when ADX exceeds this — the range has become a trend. */
	maxAdx: number;
	/** Base position as a fraction of portfolio before volatility scaling. */
	basePositionPct: number;
	/** ATR-as-%-of-price baseline: sizes scale down when ATR% exceeds it. */
	targetAtrPct: number;
	/** Volatility scale clamp (× base position). */
	minVolScale: number;
	maxVolScale: number;
	/** Stop buffer below the lower band, in ATR multiples. */
	stopAtrBuffer: number;
}

export class MeanReversionSimpleStrategy implements TradingStrategy {
	public readonly id = "mean-reversion-simple-v1";
	public readonly name = "Mean Reversion Simple";
	public readonly description =
		"Buys RSI-oversold dislocations below the lower Bollinger band with volume confirmation, targets the middle band, sized inversely to volatility";

	private config: MeanReversionSimpleConfig;

	private readonly risk: RiskManager = getSharedRiskManager();

	private activePosition: {
		entryPrice: number;
		entryTime: number;
		highestPrice: number;
		stopPrice: number;
		pair: string;
	} | null = null;

	constructor(config?: Partial<MeanReversionSimpleConfig>) {
		this.config = {
			rsiPeriod: 14,
			rsiOversold: 30,
			rsiOverbought: 70,
			bbPeriod: 20,
			bbStdDev: 2,
			volumeRatioThreshold: 1.5,
			maxAdx: 40,
			basePositionPct: 0.1,
			// Baseline for 1-minute candles; real ATR% above this shrinks size.
			targetAtrPct: 0.004,
			minVolScale: 0.3,
			maxVolScale: 1.5,
			stopAtrBuffer: 0.5,
			...config,
		};
	}

	isReady(): boolean {
		return true;
	}

	private inferTradingPair(portfolioSnapshot: PortfolioSnapshot): string {
		const holdings = Object.keys(portfolioSnapshot.holdings);

		const existingPosition = holdings.find(
			(key) => key !== "USDC" && portfolioSnapshot.holdings[key] > 0,
		);
		if (existingPosition) return existingPosition;

		const potentialToken = holdings.find((key) => key !== "USDC");
		if (potentialToken) return potentialToken;

		console.warn(
			"[MeanReversionSimple] Could not infer trading pair from portfolio",
		);
		return "UNKNOWN";
	}

	/** Consult the RegimeDetector service when available (VOLATILE: half size, wider stops). */
	private getRegimeAdjustment(
		runtime: IAgentRuntime | undefined,
		symbol: string,
		priceData: OHLCV[],
	): { sizeMultiplier: number; stopMultiplier: number } {
		if (!runtime) return { sizeMultiplier: 1, stopMultiplier: 1 };
		try {
			const detector = runtime.getService("regime-detector") as
				| RegimeDetector
				| undefined;
			if (!detector) return { sizeMultiplier: 1, stopMultiplier: 1 };
			const signal = detector.analyze(symbol, priceData);
			return {
				sizeMultiplier: signal.positionSizeMultiplier,
				stopMultiplier: signal.stopMultiplier,
			};
		} catch {
			return { sizeMultiplier: 1, stopMultiplier: 1 };
		}
	}

	async decide(params: {
		marketData: StrategyContextMarketData;
		agentState: AgentState;
		portfolioSnapshot: PortfolioSnapshot;
		agentRuntime?: IAgentRuntime;
	}): Promise<TradeOrder | null> {
		const { marketData, portfolioSnapshot, agentRuntime } = params;
		const { priceData, currentPrice } = marketData;

		// 40 candles: BB(20), RSI(14), ADX(14) and ATR(14) all produce values,
		// and position exits must never be data-gated.
		if (!priceData || priceData.length < 40) return null;

		this.risk.updatePortfolioValue(portfolioSnapshot.totalValue);

		const tradingPair = this.inferTradingPair(portfolioSnapshot);
		const indicators = this.calculateIndicators(priceData);
		if (!indicators) return null;

		const holdings = Object.entries(portfolioSnapshot.holdings);
		const assetHolding = holdings.find(([key, value]) => key !== "USDC" && value > 0);
		const assetSymbol = assetHolding ? assetHolding[0] : null;

		// Position management first: TP at middle band, stop, overbought exit.
		if (assetHolding && this.activePosition && assetSymbol) {
			return this.managePosition(
				currentPrice,
				indicators,
				assetSymbol,
				portfolioSnapshot,
			);
		}

		if (assetHolding) return null;

		// Entry filter: skip strong trends — ADX > 40 means the "range" is a
		// runaway trend and bands will keep riding it.
		if (indicators.adx > this.config.maxAdx) return null;

		// Entry: oversold RSI + price at/below the lower band + volume spike.
		const oversoldByRsi = indicators.rsi < this.config.rsiOversold;
		const atLowerBand = currentPrice <= indicators.bb.lower;
		const volumeConfirmed =
			indicators.volumeRatio > this.config.volumeRatioThreshold;
		if (!oversoldByRsi || !atLowerBand || !volumeConfirmed) return null;

		// Volatility-inverse sizing: scale = targetATR% / currentATR%, clamped.
		// High volatility → smaller position, so the same dollar stop distance
		// risks roughly the same amount regardless of regime.
		const atrPct = indicators.atr / currentPrice;
		const volScale = Math.min(
			Math.max(this.config.targetAtrPct / atrPct, this.config.minVolScale),
			this.config.maxVolScale,
		);
		const desiredPositionValue =
			portfolioSnapshot.totalValue * this.config.basePositionPct * volScale;

		const regime = this.getRegimeAdjustment(agentRuntime, tradingPair, priceData);
		// Stop below the lower band, widened further in volatile regimes.
		const stopPrice =
			indicators.bb.lower -
			this.config.stopAtrBuffer * regime.stopMultiplier * indicators.atr;

		const sizing = this.risk.calculatePositionSize({
			symbol: tradingPair,
			portfolioValue: portfolioSnapshot.totalValue,
			entryPrice: currentPrice,
			stopPrice,
			desiredPositionValue,
			regimeMultiplier: regime.sizeMultiplier,
			openSymbols: [],
		});

		if (!sizing.allowed || sizing.quantity <= 0) {
			console.log(
				`[MeanReversionSimple] Entry blocked by risk manager: ${sizing.reason ?? "unknown"}`,
			);
			return null;
		}

		this.activePosition = {
			entryPrice: currentPrice,
			entryTime: Date.now(),
			highestPrice: currentPrice,
			stopPrice,
			pair: tradingPair,
		};

		console.log(`[MeanReversionSimple] 🎯 BUY SIGNAL:`, {
			pair: tradingPair,
			price: currentPrice,
			quantity: sizing.quantity.toFixed(6),
			positionValue: `$${sizing.positionValue.toFixed(2)}`,
			volScale: volScale.toFixed(2),
			rsi: indicators.rsi.toFixed(1),
			volumeRatio: indicators.volumeRatio.toFixed(2),
			stop: stopPrice.toFixed(2),
			target: indicators.bb.middle.toFixed(2),
		});

		return {
			action: TradeType.BUY,
			pair: tradingPair,
			quantity: sizing.quantity,
			orderType: OrderType.MARKET,
			timestamp: Date.now(),
			reason: `Mean reversion: RSI ${indicators.rsi.toFixed(0)} at lower band, ${indicators.volumeRatio.toFixed(1)}× volume, vol-scaled ${(volScale * 100).toFixed(0)}%`,
		};
	}

	private managePosition(
		currentPrice: number,
		indicators: ReversionIndicators,
		assetSymbol: string,
		portfolio: PortfolioSnapshot,
	): TradeOrder | null {
		const pos = this.activePosition;
		if (!pos) return null;

		if (currentPrice > pos.highestPrice) pos.highestPrice = currentPrice;

		// RiskManager overlay: after +5% profit the stop locks at breakeven.
		// No 2×ATR trail here — this strategy's stop is structural (below the
		// lower band); a peak-ATR trail would override it in low-ATR conditions.
		const overlayStop = this.risk.updateTrailingStop({
			entryPrice: pos.entryPrice,
			currentPrice,
			atr: indicators.atr,
			highestPrice: pos.highestPrice,
			currentStop: pos.stopPrice,
			useAtrTrail: false,
		});
		if (overlayStop > pos.stopPrice) pos.stopPrice = overlayStop;

		const profitPct = (currentPrice - pos.entryPrice) / pos.entryPrice;

		// Exit 1: stop loss below the entry-time lower band (risk comes first).
		if (currentPrice <= pos.stopPrice) {
			return this.closePosition(
				assetSymbol,
				portfolio,
				currentPrice,
				`Stop loss at ${(profitPct * 100).toFixed(1)}%`,
			);
		}

		// Exit 2: overbought with band confirmation — sell the stretch instead
		// of waiting for the mean (must be checked before the middle-band TP,
		// or the upper-band condition could never fire).
		if (
			indicators.rsi > this.config.rsiOverbought &&
			currentPrice >= indicators.bb.upper
		) {
			return this.closePosition(
				assetSymbol,
				portfolio,
				currentPrice,
				`Overbought exit: RSI ${indicators.rsi.toFixed(0)} at upper band`,
			);
		}

		// Exit 3: take profit at the middle band (the mean we revert to).
		if (currentPrice >= indicators.bb.middle) {
			return this.closePosition(
				assetSymbol,
				portfolio,
				currentPrice,
				`Take profit at middle band ($${indicators.bb.middle.toFixed(2)}), +${(profitPct * 100).toFixed(1)}%`,
			);
		}

		return null;
	}

	private closePosition(
		assetSymbol: string,
		portfolio: PortfolioSnapshot,
		currentPrice: number,
		reason: string,
	): TradeOrder {
		const quantity = portfolio.holdings[assetSymbol] ?? 0;
		const estimatedPnl = this.activePosition
			? (currentPrice - this.activePosition.entryPrice) * quantity
			: 0;
		this.risk.recordTradeOutcome(assetSymbol, estimatedPnl);
		this.activePosition = null;

		console.log(`[MeanReversionSimple] 🚪 EXIT: ${reason}`);
		return {
			action: TradeType.SELL,
			pair: `${assetSymbol}/USDC`,
			quantity,
			orderType: OrderType.MARKET,
			timestamp: Date.now(),
			reason,
		};
	}

	private calculateIndicators(priceData: OHLCV[]): ReversionIndicators | null {
		const closes = priceData.map((c) => c.close);
		const highs = priceData.map((c) => c.high);
		const lows = priceData.map((c) => c.low);
		const volumes = priceData.map((c) => c.volume);

		const rsiSeries = RSI.calculate({
			period: this.config.rsiPeriod,
			values: closes,
		});
		const bbSeries = BollingerBands.calculate({
			period: this.config.bbPeriod,
			values: closes,
			stdDev: this.config.bbStdDev,
		});
		const adxSeries = ADX.calculate({
			period: 14,
			close: closes,
			high: highs,
			low: lows,
		});
		const atrSeries = ATR.calculate({
			period: 14,
			high: highs,
			low: lows,
			close: closes,
		});

		const rsiLast = rsiSeries.length ? rsiSeries[rsiSeries.length - 1] : undefined;
		const bbLast = bbSeries.length ? bbSeries[bbSeries.length - 1] : undefined;
		const adxLast = adxSeries.length ? adxSeries[adxSeries.length - 1] : undefined;
		const atrLast = atrSeries.length ? atrSeries[atrSeries.length - 1] : undefined;
		if (
			rsiLast === undefined ||
			!bbLast ||
			!adxLast ||
			atrLast === undefined ||
			atrLast <= 0
		) {
			return null;
		}

		// Volume ratio: recent 5-bar average vs 20-bar average (> 1.5 = spike).
		const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
		const baselineVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
		const volumeRatio = baselineVolume > 0 ? recentVolume / baselineVolume : 0;

		return {
			rsi: rsiLast,
			bb: bbLast,
			adx: adxLast.adx ?? 0,
			atr: atrLast,
			volumeRatio,
		};
	}
}

interface ReversionIndicators {
	rsi: number;
	bb: { middle: number; upper: number; lower: number };
	adx: number;
	atr: number;
	volumeRatio: number;
}