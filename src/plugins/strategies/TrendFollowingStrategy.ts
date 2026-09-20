/**
 * Trend-Following Strategy (adapted from a Goldman Sachs-style quant framework)
 *
 * Core thesis: crypto trends persist — retail momentum chases price and
 * exchange liquidation cascades force follow-through. With a $100 portfolio,
 * the goal is to catch the middle of a trend while risking as little as
 * possible per attempt:
 *
 *  - 8/21/55 EMA stack identifies the trend; only trade with the stack.
 *  - Higher-timeframe filter: price above a *rising* EMA55 (the bigger current
 *    must agree — never counter-trend against the 55-period structure).
 *  - ADX > 20 required: filters chop where trend systems bleed fees.
 *  - Position sized by the shared RiskManager to risk 1.5% of the portfolio
 *    between entry and the initial 2×ATR stop (Kelly / drawdown caps apply).
 *  - The stop tightens as profit grows: 2×ATR trail initially, 1.5×ATR after
 *    +1×ATR of profit, 1×ATR after +2×ATR — plus the RiskManager overlay that
 *    locks breakeven after +5%.
 */

import { ADX, ATR, EMA } from "technicalindicators";
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

interface TrendIndicators {
	ema8: number;
	ema21: number;
	/** Null when the series is too short for the higher-timeframe filter. */
	ema55: number | null;
	/** EMA55 % change over the last 10 bars — higher-timeframe direction. */
	ema55SlopePct: number;
	adx: number;
	/** +DI / −DI directional movement. */
	pdi: number;
	mdi: number;
	atr: number;
	atrPct: number;
}

export class TrendFollowingStrategy implements TradingStrategy {
	public readonly id = "trend-following-v1";
	public readonly name = "Trend Following Strategy";
	public readonly description =
		"Trades persistent trends via 8/21/55 EMA stack with ADX confirmation, ATR-based risk sizing, and a progressively tightening trailing stop";

	/** Risk 1.5% of the portfolio per trade (middle of the 1–2% band for $100). */
	private readonly riskPerTradePct = 0.015;
	/** Initial stop distance in ATR multiples. */
	private readonly stopAtrMultiplier = 2;
	/** ADX must exceed this for a trend to be tradeable. */
	private readonly minAdx = 20;
	/** ADX above this is parabolic exhaustion — do not chase. */
	private readonly maxAdx = 60;
	/** Higher-timeframe filter needs ≥ 11 EMA55 points → ≥ 65 candles. */
	private readonly minCandles = 70;
	/** Managing an open position only needs ATR(14) + EMA(8/21). */
	private readonly minManageCandles = 40;
	/** On 1-minute candles 2×ATR is ~0.2% — tighter than fees + slippage.
	 *  This floor keeps the initial stop wide enough to survive costs. */
	private readonly minStopDistancePct = 0.01;

	private readonly risk: RiskManager = getSharedRiskManager();

	private activePosition: {
		entryPrice: number;
		entryTime: number;
		highestPrice: number;
		stopPrice: number;
		atrAtEntry: number;
		pair: string;
	} | null = null;

	isReady(): boolean {
		return true;
	}

	/**
	 * The SimulationService keys holdings by asset; find the non-USDC key.
	 * Same inference pattern as MomentumBreakoutStrategy.
	 */
	private inferTradingPair(portfolioSnapshot: PortfolioSnapshot): string {
		const holdings = Object.keys(portfolioSnapshot.holdings);

		const existingPosition = holdings.find(
			(key) => key !== "USDC" && portfolioSnapshot.holdings[key] > 0,
		);
		if (existingPosition) return existingPosition;

		const potentialToken = holdings.find((key) => key !== "USDC");
		if (potentialToken) return potentialToken;

		console.warn("[TrendFollowing] Could not infer trading pair from portfolio");
		return "UNKNOWN";
	}

	/**
	 * Consult the RegimeDetector service when available: VOLATILE regimes
	 * halve position size and widen stops; TRENDING_DOWN signals stand-aside.
	 */
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

		// 40 candles is enough to manage an existing position (ATR14, EMA8/21);
		// full entry analysis additionally requires ≥ minCandles for EMA55.
		if (!priceData || priceData.length < this.minManageCandles) return null;

		// Keep drawdown tracking current on every evaluation.
		this.risk.updatePortfolioValue(portfolioSnapshot.totalValue);

		const tradingPair = this.inferTradingPair(portfolioSnapshot);
		const indicators = this.calculateIndicators(priceData);
		if (!indicators) return null;

		const holdings = Object.entries(portfolioSnapshot.holdings);
		const assetHolding = holdings.find(([key, value]) => key !== "USDC" && value > 0);
		const assetSymbol = assetHolding ? assetHolding[0] : null;

		// Position management takes priority over new entries — and over the
		// entry data gate, so an open position can always exit.
		if (assetHolding && this.activePosition && assetSymbol) {
			return this.managePosition(
				currentPrice,
				indicators,
				assetSymbol,
				portfolioSnapshot,
			);
		}

		if (assetHolding) return null; // position we didn't open — don't fight it

		// Entry logic: stacked EMAs + strong ADX + higher-timeframe alignment.
		if (
			priceData.length < this.minCandles ||
			indicators.ema55 === null ||
			!this.shouldEnter(indicators, currentPrice)
		) {
			return null;
		}

		const regime = this.getRegimeAdjustment(agentRuntime, tradingPair, priceData);
		// Widen the initial stop in a volatile regime; VOLATILE also halves size.
		// Floor the stop distance so 1-minute ATR noise can't make it tighter
		// than trading costs.
		const stopDistance = Math.max(
			this.stopAtrMultiplier * regime.stopMultiplier * indicators.atr,
			currentPrice * this.minStopDistancePct,
		);
		const initialStop = currentPrice - stopDistance;

		const sizing = this.risk.calculatePositionSize({
			symbol: tradingPair,
			portfolioValue: portfolioSnapshot.totalValue,
			entryPrice: currentPrice,
			stopPrice: initialStop,
			riskPerTradePct: this.riskPerTradePct,
			regimeMultiplier: regime.sizeMultiplier,
			openSymbols: [],
		});

		if (!sizing.allowed || sizing.quantity <= 0) {
			console.log(
				`[TrendFollowing] Entry blocked by risk manager: ${sizing.reason ?? "unknown"}`,
			);
			return null;
		}

		this.activePosition = {
			entryPrice: currentPrice,
			entryTime: Date.now(),
			highestPrice: currentPrice,
			stopPrice: initialStop,
			atrAtEntry: indicators.atr,
			pair: tradingPair,
		};

		console.log(`[TrendFollowing] 🎯 BUY SIGNAL:`, {
			pair: tradingPair,
			price: currentPrice,
			quantity: sizing.quantity.toFixed(6),
			positionValue: `$${sizing.positionValue.toFixed(2)}`,
			riskAmount: `$${sizing.riskAmount.toFixed(2)}`,
			stop: initialStop.toFixed(2),
			adx: indicators.adx.toFixed(1),
			emaStack: `${indicators.ema8.toFixed(2)} > ${indicators.ema21.toFixed(2)} > ${indicators.ema55.toFixed(2)}`,
		});

		return {
			action: TradeType.BUY,
			pair: tradingPair,
			quantity: sizing.quantity,
			orderType: OrderType.MARKET,
			timestamp: Date.now(),
			reason: `Trend following: EMA 8>21>55, ADX ${indicators.adx.toFixed(0)}, EMA55 slope ${(indicators.ema55SlopePct * 100).toFixed(2)}%, risking ${(this.riskPerTradePct * 100).toFixed(1)}% over ${(this.stopAtrMultiplier * regime.stopMultiplier).toFixed(1)}×ATR`,
		};
	}

	private shouldEnter(ind: TrendIndicators, currentPrice: number): boolean {
		if (ind.ema55 === null) return false; // no higher-timeframe context
		// 1) EMA stack: short > mid > long = established uptrend.
		const stacked = ind.ema8 > ind.ema21 && ind.ema21 > ind.ema55;
		// 2) Trend strength: below 20 is chop, above 60 is blow-off exhaustion.
		const strongEnough = ind.adx > this.minAdx && ind.adx < this.maxAdx;
		// 3) Directional movement confirms buyers are in control.
		const directional = ind.pdi > ind.mdi;
		// 4) Higher-timeframe filter: price above a rising EMA55.
		const htfAligned = currentPrice > ind.ema55 && ind.ema55SlopePct > 0;
		return stacked && strongEnough && directional && htfAligned;
	}

	private managePosition(
		currentPrice: number,
		indicators: TrendIndicators,
		assetSymbol: string,
		portfolio: PortfolioSnapshot,
	): TradeOrder | null {
		const pos = this.activePosition;
		if (!pos) return null;

		if (currentPrice > pos.highestPrice) pos.highestPrice = currentPrice;

		const profitPct = (currentPrice - pos.entryPrice) / pos.entryPrice;
		// Profit measured in ATR units — the scale the stop was built on.
		const profitAtr = (currentPrice - pos.entryPrice) / pos.atrAtEntry;

		// Progressive tightening: the further the trade runs, the tighter the
		// trail (2×ATR → 1.5×ATR after +1 ATR → 1×ATR after +2 ATR).
		const trailMultiplier =
			profitAtr >= 2 ? 1 : profitAtr >= 1 ? 1.5 : this.stopAtrMultiplier;
		const tightenedTrail = pos.highestPrice - trailMultiplier * indicators.atr;

		// RiskManager overlay: breakeven lock after +5%, plus a 2×ATR peak trail.
		const overlayStop = this.risk.updateTrailingStop({
			entryPrice: pos.entryPrice,
			currentPrice,
			atr: indicators.atr,
			highestPrice: pos.highestPrice,
			currentStop: pos.stopPrice,
		});

		// Stops only ever move up (ratchet).
		const newStop = Math.max(overlayStop, tightenedTrail);
		if (newStop > pos.stopPrice) pos.stopPrice = newStop;

		// Exit 1: stop hit.
		if (currentPrice <= pos.stopPrice) {
			const reason =
				profitPct >= 0
					? `Trailing stop at ${(profitPct * 100).toFixed(1)}% profit (stop ${(pos.stopPrice / pos.entryPrice).toFixed(4)}× entry)`
					: `Stop loss at ${(profitPct * 100).toFixed(1)}%`;
			return this.closePosition(
				assetSymbol,
				portfolio,
				currentPrice,
				reason,
			);
		}

		// Exit 2: trend structure broken (fast EMA crossed below mid EMA).
		if (indicators.ema8 < indicators.ema21) {
			return this.closePosition(
				assetSymbol,
				portfolio,
				currentPrice,
				"EMA8 crossed below EMA21 — trend structure broken",
			);
		}

		return null;
	}

	/** Emit a SELL for the full holding and record the (pre-fee) outcome. */
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
		// Feeds the shared Kelly estimator (estimate; fees not included).
		this.risk.recordTradeOutcome(assetSymbol, estimatedPnl);
		this.activePosition = null;

		console.log(`[TrendFollowing] 🚪 EXIT: ${reason}`);
		return {
			action: TradeType.SELL,
			pair: `${assetSymbol}/USDC`,
			quantity,
			orderType: OrderType.MARKET,
			timestamp: Date.now(),
			reason,
		};
	}

	private calculateIndicators(priceData: OHLCV[]): TrendIndicators | null {
		const closes = priceData.map((c) => c.close);
		const highs = priceData.map((c) => c.high);
		const lows = priceData.map((c) => c.low);

		const ema8 = EMA.calculate({ period: 8, values: closes });
		const ema21 = EMA.calculate({ period: 21, values: closes });
		// EMA55 only when the series is long enough for the 10-point slope.
		const ema55 =
			closes.length >= 65 ? EMA.calculate({ period: 55, values: closes }) : [];
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

		// technicalindicators emits only bars where the full window fits, so
		// every series is shorter than the input — guard each tail read.
		const ema8Last = ema8.length ? ema8[ema8.length - 1] : undefined;
		const ema21Last = ema21.length ? ema21[ema21.length - 1] : undefined;
		const ema55Last = ema55.length ? ema55[ema55.length - 1] : undefined;
		const adxLast = adxSeries.length ? adxSeries[adxSeries.length - 1] : undefined;
		const atrLast = atrSeries.length ? atrSeries[atrSeries.length - 1] : undefined;
		if (
			ema8Last === undefined ||
			ema21Last === undefined ||
			!adxLast ||
			atrLast === undefined ||
			atrLast <= 0
		) {
			return null;
		}

		// EMA55 slope over the last 10 EMA points = higher-timeframe direction.
		let ema55Value: number | null = null;
		let ema55SlopePct = 0;
		if (ema55Last !== undefined) {
			const ema55Prev =
				ema55.length >= 11 ? ema55[ema55.length - 11] : ema55[0];
			if (ema55Prev !== undefined && ema55Prev > 0) {
				ema55Value = ema55Last;
				ema55SlopePct = (ema55Last - ema55Prev) / ema55Prev;
			}
		}

		const currentPrice = closes[closes.length - 1];
		return {
			ema8: ema8Last,
			ema21: ema21Last,
			ema55: ema55Value,
			ema55SlopePct,
			adx: adxLast.adx ?? 0,
			pdi: adxLast.pdi ?? 0,
			mdi: adxLast.mdi ?? 0,
			atr: atrLast,
			atrPct: atrLast / currentPrice,
		};
	}
}