/**
 * Regime Detector (adapted from a Bridgewater-style macro framework)
 *
 * Core thesis: different strategies work in different market regimes — a
 * trend system in chop bleeds fees; a mean-reverter in a trend gets run over.
 * This service classifies each symbol into one of four regimes and maps the
 * regime to a strategy recommendation plus sizing/stop adjustments:
 *
 *   TRENDING_UP   → trend-following strategy, normal size
 *   TRENDING_DOWN → stand aside (auto-switcher reduces positions, tightens stops)
 *   RANGING       → mean-reversion strategy, normal size
 *   VOLATILE      → no entries; halve sizes, widen stops 1.5×
 *
 * Detection inputs (all computed from OHLCV, plus an optional Fear & Greed
 * index fetched from api.alternative.me with a 5s timeout and 30-min cache):
 *   - EMA(21) slope over the last 10 bars (trend direction & persistence)
 *   - ADX(14) (trend strength; ≥ 20 = real trend)
 *   - ATR(14) percentile within the last 100 bars (volatility regime)
 *
 * Regime changes are logged and broadcast to registered listeners
 * (`onRegimeChange`) so an auto-switcher can react without polling.
 */

import { logger, Service, type IAgentRuntime } from "@elizaos/core";
import { ADX, ATR, EMA } from "technicalindicators";
import type { OHLCV } from "../types.ts";

export type MarketRegime =
	| "TRENDING_UP"
	| "TRENDING_DOWN"
	| "RANGING"
	| "VOLATILE";

export interface RegimeSignal {
	symbol: string;
	regime: MarketRegime;
	/** 0–1 confidence in the classification. */
	confidence: number;
	adx: number;
	/** EMA(21) % change over the last 10 bars. */
	emaSlopePct: number;
	/** Current ATR percentile within the last 100 bars (0–1). */
	atrPercentile: number;
	/** ATR as a fraction of price. */
	atrPct: number;
	/** CNN Fear & Greed index (0–100), null when unavailable. */
	fearGreed: number | null;
	/** Strategy the auto-switcher should run, null = stand aside / defensive. */
	recommendedStrategyId: string | null;
	/** Multiply new position sizes by this (0.5 in VOLATILE / TRENDING_DOWN). */
	positionSizeMultiplier: number;
	/** Multiply stop distances by this (1.5 in VOLATILE — wider stops). */
	stopMultiplier: number;
	/** Human-readable instruction for the auto-switcher. */
	action: string;
}

export interface RegimeStrategyMap {
	recommendedStrategyId: string | null;
	positionSizeMultiplier: number;
	stopMultiplier: number;
	action: string;
}

export const REGIME_STRATEGY_MAP: Record<MarketRegime, RegimeStrategyMap> = {
	TRENDING_UP: {
		recommendedStrategyId: "trend-following-v1",
		positionSizeMultiplier: 1,
		stopMultiplier: 1,
		action: "Run trend-following strategy at normal size",
	},
	TRENDING_DOWN: {
		recommendedStrategyId: null,
		positionSizeMultiplier: 0.5,
		stopMultiplier: 0.75,
		action: "Reduce existing positions, tighten stops — no new longs",
	},
	RANGING: {
		recommendedStrategyId: "mean-reversion-simple-v1",
		positionSizeMultiplier: 1,
		stopMultiplier: 1,
		action: "Run mean-reversion strategy at normal size",
	},
	VOLATILE: {
		recommendedStrategyId: null,
		positionSizeMultiplier: 0.5,
		stopMultiplier: 1.5,
		action: "Halve position sizes, widen stops — capital preservation mode",
	},
};

const FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=1";
const FEAR_GREED_TTL_MS = 30 * 60 * 1000; // refresh at most every 30 minutes
const FEAR_GREED_TIMEOUT_MS = 5000;

export class RegimeDetector extends Service {
	static serviceType = "regime-detector";
	capabilityDescription =
		"Detects market regime (trending/ranging/volatile) and signals strategy switching";

	private runtime: IAgentRuntime;
	private regimeBySymbol = new Map<string, RegimeSignal>();
	private changeListeners: Array<(signal: RegimeSignal) => void> = [];
	private fearGreed: number | null = null;
	private fearGreedFetchedAt = 0;

	/** Classification thresholds (documented so they are tunable on purpose). */
	private readonly trendAdxThreshold = 20; // ADX ≥ this = real trend
	private readonly trendSlopePct = 0.003; // |EMA21 slope| over 10 bars ≥ 0.3%
	private readonly volatileAtrPercentile = 0.9; // top decile of ATR
	private readonly volatileAtrPctFloor = 0.01; // or ATR ≥ 1% of price

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
	}

	static async start(runtime: IAgentRuntime): Promise<RegimeDetector> {
		logger.info("*** Starting Regime Detector ***");
		const detector = new RegimeDetector(runtime);
		// Prime the Fear & Greed cache; failures are non-fatal (field stays null).
		await detector.refreshFearGreed();
		return detector;
	}

	static async stop(_runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Regime Detector ***");
	}

	async stop(): Promise<void> {}

	/**
	 * Classify the current regime for one symbol from its OHLCV series.
	 * Synchronous; the Fear & Greed value comes from the background cache.
	 */
	analyze(symbol: string, ohlcv: OHLCV[]): RegimeSignal {
		if (!ohlcv || ohlcv.length < 60) {
			// Not enough data: return a neutral, low-confidence default.
			return this.buildSignal(symbol, "RANGING", 0.3, {
				adx: 0,
				emaSlopePct: 0,
				atrPercentile: 0.5,
				atrPct: 0,
			});
		}

		const closes = ohlcv.map((c) => c.close);
		const highs = ohlcv.map((c) => c.high);
		const lows = ohlcv.map((c) => c.low);
		const currentPrice = closes[closes.length - 1];

		// --- EMA(21) slope ------------------------------------------------
		const ema = EMA.calculate({ period: 21, values: closes });
		let emaSlopePct = 0;
		if (ema.length >= 11 && ema[ema.length - 11] > 0) {
			emaSlopePct = (ema[ema.length - 1] - ema[ema.length - 11]) / ema[ema.length - 11];
		}

		// --- ADX(14) --------------------------------------------------------
		const adxSeries = ADX.calculate({
			period: 14,
			close: closes,
			high: highs,
			low: lows,
		});
		const adx = adxSeries.length ? (adxSeries[adxSeries.length - 1].adx ?? 0) : 0;

		// --- ATR(14) percentile within the last 100 bars --------------------
		const atrSeries = ATR.calculate({
			period: 14,
			high: highs,
			low: lows,
			close: closes,
		});
		let atrPercentile = 0.5;
		let atrPct = 0;
		if (atrSeries.length > 0) {
			const atrWindow = atrSeries.slice(-100);
			const currentAtr = atrWindow[atrWindow.length - 1];
			if (currentAtr > 0) {
				atrPct = currentAtr / currentPrice;
				// Percentile is computed on price-normalized ATR (ATR / that bar's
				// close) so a steadily rising price with proportional ranges does
				// not read as a volatility spike. Tail alignment: last ATR ↔ last close.
				const atrPctWindow = atrWindow.map(
					(atr, j) => {
						const offsetFromEnd = atrWindow.length - 1 - j;
						const refClose = closes[closes.length - 1 - offsetFromEnd] ?? currentPrice;
						return refClose > 0 ? atr / refClose : atr / currentPrice;
					},
				);
				const currentAtrPct = atrPctWindow[atrPctWindow.length - 1];
				const below = atrPctWindow.filter((v) => v < currentAtrPct).length;
				atrPercentile =
					atrPctWindow.length > 1
						? below / (atrPctWindow.length - 1)
						: 0.5;
			}
		}

		// --- Classification (VOLATILE overrides everything) -----------------
		const isVolatile =
			atrPercentile >= this.volatileAtrPercentile ||
			atrPct >= this.volatileAtrPctFloor;
		const isTrending =
			adx >= this.trendAdxThreshold && Math.abs(emaSlopePct) >= this.trendSlopePct;

		let regime: MarketRegime;
		if (isVolatile) {
			regime = "VOLATILE";
		} else if (isTrending && emaSlopePct > 0) {
			regime = "TRENDING_UP";
		} else if (isTrending) {
			regime = "TRENDING_DOWN";
		} else {
			regime = "RANGING";
		}

		// --- Confidence heuristic --------------------------------------------
		let confidence = 0.5;
		if (regime === "TRENDING_UP" || regime === "TRENDING_DOWN") {
			// The further ADX and slope are past their thresholds, the more sure.
			confidence +=
				0.1 * Math.min(1, (adx - this.trendAdxThreshold) / 20) +
				0.1 * Math.min(1, Math.abs(emaSlopePct) / 0.01);
		} else if (regime === "RANGING") {
			confidence += 0.1 * (1 - Math.min(1, adx / this.trendAdxThreshold));
		} else {
			confidence += 0.2 * atrPercentile;
		}

		// --- Fear & Greed adjustments ---------------------------------------
		if (this.fearGreed !== null) {
			if (regime === "TRENDING_UP" && this.fearGreed >= 75) {
				confidence += 0.1; // euphoria supports momentum continuation
			}
			if (this.fearGreed <= 25) {
				// Extreme fear: downtrends accelerate, "ranges" break down.
				confidence = Math.min(confidence, 0.6);
			}
		}
		confidence = Math.min(0.95, Math.max(0.3, confidence));

		return this.buildSignal(symbol, regime, confidence, {
			adx,
			emaSlopePct,
			atrPercentile,
			atrPct,
		});
	}

	private buildSignal(
		symbol: string,
		regime: MarketRegime,
		confidence: number,
		parts: {
			adx: number;
			emaSlopePct: number;
			atrPercentile: number;
			atrPct: number;
		},
	): RegimeSignal {
		const map = REGIME_STRATEGY_MAP[regime];
		const signal: RegimeSignal = {
			symbol,
			regime,
			confidence,
			adx: parts.adx,
			emaSlopePct: parts.emaSlopePct,
			atrPercentile: parts.atrPercentile,
			atrPct: parts.atrPct,
			fearGreed: this.fearGreed,
			recommendedStrategyId: map.recommendedStrategyId,
			positionSizeMultiplier: map.positionSizeMultiplier,
			stopMultiplier: map.stopMultiplier,
			action: map.action,
		};
		this.detectAndBroadcastChange(symbol, signal);
		return signal;
	}

	/** Log + broadcast whenever a symbol's regime changes. */
	private detectAndBroadcastChange(symbol: string, signal: RegimeSignal): void {
		const previous = this.regimeBySymbol.get(symbol);
		this.regimeBySymbol.set(symbol, signal);
		if (previous && previous.regime === signal.regime) return;

		logger.info(
			`[RegimeDetector] ${symbol} regime: ${previous?.regime ?? "unknown"} → ${signal.regime} ` +
				`(ADX ${signal.adx.toFixed(1)}, slope ${(signal.emaSlopePct * 100).toFixed(2)}%, ` +
				`ATR pct ${(signal.atrPercentile * 100).toFixed(0)}%, F&G ${signal.fearGreed ?? "n/a"}) — ${signal.action}`,
		);
		for (const listener of this.changeListeners) {
			try {
				listener(signal);
			} catch (error) {
				logger.warn(`[RegimeDetector] Listener error: ${error}`);
			}
		}
	}

	/** Register a callback fired on every regime change (auto-switcher hook). */
	onRegimeChange(listener: (signal: RegimeSignal) => void): void {
		this.changeListeners.push(listener);
	}

	/** Latest signal for a symbol, if one has been computed. */
	getRegime(symbol: string): RegimeSignal | null {
		return this.regimeBySymbol.get(symbol) ?? null;
	}

	/**
	 * Fetch the CNN Fear & Greed index via the alternative.me mirror.
	 * Cached for 30 minutes; any failure leaves the previous value intact and
	 * simply keeps `fearGreed` null-safe for classification.
	 */
	async refreshFearGreed(): Promise<void> {
		if (Date.now() - this.fearGreedFetchedAt < FEAR_GREED_TTL_MS) return;
		this.fearGreedFetchedAt = Date.now(); // rate-limit even on failure
		try {
			const response = await fetch(FEAR_GREED_URL, {
				signal: AbortSignal.timeout(FEAR_GREED_TIMEOUT_MS),
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const payload = (await response.json()) as {
				data?: Array<{ value?: string }>;
			};
			const value = Number(payload.data?.[0]?.value);
			if (Number.isFinite(value) && value >= 0 && value <= 100) {
				this.fearGreed = value;
				logger.debug(`[RegimeDetector] Fear & Greed: ${value}`);
			}
		} catch (error) {
			logger.debug(`[RegimeDetector] Fear & Greed fetch failed: ${error}`);
		}
	}
}