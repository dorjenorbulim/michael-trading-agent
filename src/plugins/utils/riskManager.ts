/**
 * Shared Risk Manager — a portfolio-level risk overlay that every strategy
 * should route position sizing and stop management through.
 *
 * Adapted from Two Sigma-style portfolio risk discipline, scaled for a $100
 * account where a single undisciplined trade can wipe out the book:
 *
 *  - Kelly Criterion position sizing: f* = (bp - q) / b, halved ("half-Kelly")
 *    for parameter-uncertainty safety. Kelly uses *recorded trade outcomes*,
 *    so it starts conservative (fixed fractional) and sharpens as evidence
 *    accumulates.
 *  - Daily loss cap: lose 5% of the day's starting portfolio value → halt for
 *    the rest of the calendar day.
 *  - Weekly loss cap: lose 10% → halve position sizes for the rest of the week.
 *  - Max drawdown: fall 15% below the peak portfolio value → hard halt until
 *    an explicit manual reset (`resetDrawdownHalt`).
 *  - Correlation gate: BTC/ETH historically correlate ~0.85; never hold both.
 *  - Position limit: at most 3 open positions at once.
 *  - Trailing stop: move stop to breakeven after +5% profit, then trail the
 *    highest price at 2×ATR.
 *
 * This module is pure math + state; it performs no I/O. Strategies obtain a
 * shared instance via `getSharedRiskManager()` so loss/halt state is common.
 */

/** Normalizes a symbol like "BTC/USDC" or a raw holdings key to "BTC". */
export function normalizeSymbol(symbol: string): string {
	const base = symbol.split("/")[0];
	return base.toUpperCase();
}

/**
 * Historical average pairwise correlations (daily returns, ~2y window).
 * Values above `correlationBlockThreshold` (0.8) cannot be held simultaneously.
 */
export const ASSET_CORRELATIONS: Record<string, Record<string, number>> = {
	BTC: { BTC: 1.0, ETH: 0.85, SOL: 0.75 },
	ETH: { BTC: 0.85, ETH: 1.0, SOL: 0.8 },
	SOL: { BTC: 0.75, ETH: 0.8, SOL: 1.0 },
};

export interface RiskManagerConfig {
	/** Daily loss cap as a fraction of the day's starting portfolio value. */
	maxDailyLossPct: number;
	/** Weekly loss cap that triggers reduced position sizing. */
	maxWeeklyLossPct: number;
	/** Peak-to-trough drawdown that hard-halts trading until manual reset. */
	maxDrawdownPct: number;
	/** Maximum simultaneously open positions. */
	maxOpenPositions: number;
	/** Pairwise correlation at or above which a second position is blocked. */
	correlationBlockThreshold: number;
	/** Fraction of full Kelly to actually use (0.5 = "half-Kelly"). */
	halfKellyFraction: number;
	/** Minimum recorded trades before Kelly sizing is trusted. */
	minTradesForKelly: number;
	/** Kelly fraction is floored at this portfolio fraction so a bad early
	 *  sample can't zero out all activity (floor = 2% of portfolio). */
	kellyFloor: number;
	/** Hard cap on any single position as a fraction of portfolio value. */
	maxPositionValuePct: number;
	/** Risk per trade used when no Kelly estimate exists yet (1–2% band). */
	fallbackRiskPerTradePct: number;
	/** Profit at which the stop is moved to breakeven. */
	trailingActivationPct: number;
	/** ATR multiple used to trail the highest price. */
	trailingAtrMultiplier: number;
	/** Orders below this notional are rejected (matches exchange minimums). */
	minOrderValueUsd: number;
}

export const DEFAULT_RISK_CONFIG: RiskManagerConfig = {
	maxDailyLossPct: 0.05,
	maxWeeklyLossPct: 0.1,
	maxDrawdownPct: 0.15,
	maxOpenPositions: 3,
	correlationBlockThreshold: 0.8,
	halfKellyFraction: 0.5,
	minTradesForKelly: 10,
	kellyFloor: 0.02,
	maxPositionValuePct: 0.35,
	fallbackRiskPerTradePct: 0.02,
	trailingActivationPct: 0.05,
	trailingAtrMultiplier: 2,
	minOrderValueUsd: 5,
};

export interface SizingRequest {
	/** Normalized asset symbol, e.g. "BTC". */
	symbol: string;
	/** Current total portfolio value in USD. */
	portfolioValue: number;
	/** Intended entry price. */
	entryPrice: number;
	/** Initial stop price. Enables risk-per-trade sizing: value = risk / stopDist. */
	stopPrice?: number;
	/** Strategy-proposed position value (e.g. volatility-scaled). Overrides
	 *  risk-based sizing; Kelly/drawdown caps still apply. */
	desiredPositionValue?: number;
	/** Strategy-specific risk per trade as a portfolio fraction (default 2%). */
	riskPerTradePct?: number;
	/** Optional regime adjustment, e.g. 0.5 in a VOLATILE regime. */
	regimeMultiplier?: number;
	/** Symbols with currently open positions. */
	openSymbols?: string[];
}

export interface SizingResult {
	allowed: boolean;
	reason?: string;
	quantity: number;
	positionValue: number;
	/** Dollars of the portfolio at risk if the stop is hit. */
	riskAmount: number;
	/** Half-Kelly fraction actually applied as a cap (0 = not applied). */
	kellyFractionUsed: number;
	/** Combined reduction factor (weekly 0.5 × regime × …). */
	sizeMultiplier: number;
}

export interface KellyStats {
	sampleSize: number;
	winRate: number;
	payoffRatio: number; // b = avgWin / |avgLoss|
	fullKelly: number;
	halfKelly: number;
}

export interface RiskStatus {
	tradingHalted: boolean;
	haltReason?: string;
	drawdownHalt: boolean;
	dailyLossHalt: boolean;
	weeklyReductionActive: boolean;
	dayPnlPct: number;
	weekPnlPct: number;
	drawdownPct: number;
	peakPortfolioValue: number;
	sizeMultiplier: number;
	kelly: KellyStats;
}

interface DayBucket {
	startValue: number;
	realizedPnl: number;
}

const DAY_MS = 86_400_000;

/** UTC calendar-day key, e.g. "2026-09-19". */
function dayKey(timestamp: number): string {
	return new Date(timestamp).toISOString().slice(0, 10);
}

/** ISO-8601 week key, e.g. "2026-W38". */
function weekKey(timestamp: number): string {
	const d = new Date(timestamp);
	// ISO week: Thursday-based. Compute week number per ISO 8601.
	const target = new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
	);
	const dayNum = (target.getUTCDay() + 6) % 7; // Mon=0..Sun=6
	target.setUTCDate(target.getUTCDate() - dayNum + 3); // nearest Thursday
	const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
	const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
	const week =
		1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
	return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export class RiskManager {
	public readonly config: RiskManagerConfig;

	/** All recorded trade outcomes (realized PnL in USD), newest last. */
	private outcomes: number[] = [];

	/** Realized PnL per calendar day, plus the portfolio value when the day began. */
	private daily = new Map<string, DayBucket>();

	/** Realized PnL per ISO week. */
	private weekly = new Map<string, number>();

	/** Current portfolio value and running peak, for drawdown tracking. */
	private currentPortfolioValue: number;
	private peakPortfolioValue: number;

	/** True once the 15% max drawdown halt has triggered; only `resetDrawdownHalt()` clears it. */
	private drawdownHalted = false;

	constructor(config?: Partial<RiskManagerConfig>, initialPortfolioValue = 100) {
		this.config = { ...DEFAULT_RISK_CONFIG, ...config };
		this.currentPortfolioValue = initialPortfolioValue;
		this.peakPortfolioValue = initialPortfolioValue;
	}

	// ------------------------------------------------------------------
	// Kelly Criterion
	// ------------------------------------------------------------------

	/**
	 * f* = (b·p − q) / b  where
	 *   p = win rate, q = 1 − p, b = avgWin / |avgLoss| (payoff ratio).
	 * Returns the fraction of the portfolio to risk. We report the FULL Kelly
	 * value but the sizing path applies half of it (half-Kelly), floored at
	 * `kellyFloor`, because win-rate estimates from <100 trades are noisy.
	 */
	computeKelly(): KellyStats {
		const wins = this.outcomes.filter((p) => p > 0);
		const losses = this.outcomes.filter((p) => p < 0);
		const sampleSize = wins.length + losses.length;

		if (sampleSize === 0) {
			return {
				sampleSize: 0,
				winRate: 0,
				payoffRatio: 0,
				fullKelly: 0,
				halfKelly: 0,
			};
		}

		const p = wins.length / sampleSize;
		const q = 1 - p;
		const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
		const avgLoss = losses.length
			? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
			: 0;

		// Without measurable losses the payoff ratio is undefined; treat the
		// edge as unproven and return a conservative zero-Kelly.
		if (avgLoss === 0 || avgWin === 0) {
			return {
				sampleSize,
				winRate: p,
				payoffRatio: avgLoss === 0 ? Number.POSITIVE_INFINITY : avgWin / avgLoss,
				fullKelly: 0,
				halfKelly: 0,
			};
		}

		const b = avgWin / avgLoss;
		const fullKelly = Math.max(0, (b * p - q) / b); // clamp negatives to 0
		const halfKelly = Math.min(
			Math.max(fullKelly * this.config.halfKellyFraction, this.config.kellyFloor),
			0.25, // absolute cap: never bet more than 25% of the book per trade
		);

		return { sampleSize, winRate: p, payoffRatio: b, fullKelly, halfKelly };
	}

	// ------------------------------------------------------------------
	// Gates and limits
	// ------------------------------------------------------------------

	/**
	 * Daily loss cap: 5% → halt for the rest of the calendar day.
	 * Weekly cap: 10% → halve sizes for the rest of that week.
	 * Drawdown: 15% below peak → hard halt until manual reset.
	 */
	isTradingHalted(now = Date.now()): { halted: boolean; reason?: string } {
		const drawdownPct = this.getDrawdownPct();
		if (this.drawdownHalted || drawdownPct >= this.config.maxDrawdownPct) {
			return {
				halted: true,
				reason: `Max drawdown ${(drawdownPct * 100).toFixed(1)}% ≥ ${(this.config.maxDrawdownPct * 100).toFixed(0)}% — trading halted until manual reset`,
			};
		}

		const day = this.daily.get(dayKey(now));
		if (day && day.startValue > 0) {
			const dayPnlPct = day.realizedPnl / day.startValue;
			if (dayPnlPct <= -this.config.maxDailyLossPct) {
				return {
					halted: true,
					reason: `Daily loss ${(dayPnlPct * 100).toFixed(1)}% ≤ −${(this.config.maxDailyLossPct * 100).toFixed(0)}% — halting until next day`,
				};
			}
		}

		return { halted: false };
	}

	/** 0.5 while the weekly loss cap is breached, otherwise 1. */
	getSizeMultiplier(now = Date.now()): number {
		const week = this.weekly.get(weekKey(now));
		if (week === undefined || this.currentPortfolioValue <= 0) return 1;
		const weekPnlPct = week / this.currentPortfolioValue;
		return weekPnlPct <= -this.config.maxWeeklyLossPct ? 0.5 : 1;
	}

	getDrawdownPct(): number {
		if (this.peakPortfolioValue <= 0) return 0;
		const dd =
			(this.peakPortfolioValue - this.currentPortfolioValue) /
			this.peakPortfolioValue;
		return Math.max(0, dd);
	}

	/**
	 * Correlation + position-count gate. Blocks the new symbol when:
	 *  - the position limit is reached, or
	 *  - any open position correlates ≥ threshold (e.g. BTC vs ETH ≈ 0.85).
	 * Unknown symbols are treated as uncorrelated (allowed).
	 */
	canOpenPosition(
		symbol: string,
		openSymbols: string[],
	): { allowed: boolean; reason?: string } {
		const normalized = normalizeSymbol(symbol);
		if (openSymbols.length >= this.config.maxOpenPositions) {
			return {
				allowed: false,
				reason: `Position limit (${this.config.maxOpenPositions}) reached`,
			};
		}

		for (const open of openSymbols) {
			const correlation =
				ASSET_CORRELATIONS[normalized]?.[normalizeSymbol(open)] ?? 0;
			if (correlation >= this.config.correlationBlockThreshold) {
				return {
					allowed: false,
					reason: `${normalized} correlates ${correlation} with open position ${normalizeSymbol(open)} — refusing correlated exposure`,
				};
			}
		}
		return { allowed: true };
	}

	// ------------------------------------------------------------------
	// Position sizing
	// ------------------------------------------------------------------

	/**
	 * Combines three sizing layers, taking the most conservative:
	 *  1. Base value — either the strategy's proposal (e.g. volatility-scaled)
	 *     or classic fixed-fractional risk sizing: value = (portfolio × riskPct)
	 *     / stopDistancePct, so a stop-out loses exactly `riskPct` of the book.
	 *  2. Kelly cap — half-Kelly fraction of the portfolio (floored at
	 *     `kellyFloor`, capped at 25%) once ≥ `minTradesForKelly` outcomes exist.
	 *  3. Hard cap — `maxPositionValuePct` of the portfolio.
	 * Weekly loss reduction and regime multipliers scale the result down.
	 */
	calculatePositionSize(req: SizingRequest): SizingResult {
		const empty = {
			allowed: false,
			quantity: 0,
			positionValue: 0,
			riskAmount: 0,
			kellyFractionUsed: 0,
			sizeMultiplier: 1,
		};

		const halt = this.isTradingHalted();
		if (halt.halted) {
			return { ...empty, reason: halt.reason };
		}

		const openCheck = this.canOpenPosition(req.symbol, req.openSymbols ?? []);
		if (!openCheck.allowed) {
			return { ...empty, reason: openCheck.reason };
		}

		if (req.portfolioValue <= 0 || req.entryPrice <= 0) {
			return { ...empty, reason: "Non-positive portfolio value or price" };
		}

		// Layer 1: base position value.
		let baseValue: number;
		let stopDistancePct = 0;
		if (req.desiredPositionValue != null) {
			baseValue = req.desiredPositionValue;
		} else if (req.stopPrice != null) {
			stopDistancePct = (req.entryPrice - req.stopPrice) / req.entryPrice;
			if (stopDistancePct <= 0) {
				return { ...empty, reason: "Stop price must be below entry price" };
			}
			const riskPct = req.riskPerTradePct ?? this.config.fallbackRiskPerTradePct;
			const baseRiskAmount = req.portfolioValue * riskPct;
			baseValue = baseRiskAmount / stopDistancePct;
		} else {
			return {
				...empty,
				reason: "Provide stopPrice (risk sizing) or desiredPositionValue",
			};
		}

		// Layer 2: half-Kelly cap (only once the outcome sample is meaningful).
		const kelly = this.computeKelly();
		let kellyFractionUsed = 0;
		if (kelly.sampleSize >= this.config.minTradesForKelly) {
			kellyFractionUsed = kelly.halfKelly;
			const kellyCap = req.portfolioValue * kellyFractionUsed;
			baseValue = Math.min(baseValue, kellyCap);
		}

		// Layer 3: hard portfolio cap.
		baseValue = Math.min(baseValue, req.portfolioValue * this.config.maxPositionValuePct);

		// Down-scaling: weekly loss reduction × regime multiplier.
		const sizeMultiplier =
			this.getSizeMultiplier() * (req.regimeMultiplier ?? 1);
		const positionValue = baseValue * sizeMultiplier;

		if (positionValue < this.config.minOrderValueUsd) {
			return {
				...empty,
				kellyFractionUsed,
				sizeMultiplier,
				reason: `Position value $${positionValue.toFixed(2)} below minimum order $${this.config.minOrderValueUsd}`,
			};
		}

		const quantity = positionValue / req.entryPrice;
		// Dollars lost if the stop is hit = stop distance × position notional.
		const riskAmount = req.stopPrice != null ? stopDistancePct * positionValue : 0;
		return {
			allowed: true,
			quantity,
			positionValue,
			riskAmount,
			kellyFractionUsed,
			sizeMultiplier,
		};
	}

	// ------------------------------------------------------------------
	// Trailing stop
	// ------------------------------------------------------------------

	/**
	 * Ratchets a long stop upward, never downward:
	 *  - after +`trailingActivationPct` (5%) profit → stop ≥ breakeven;
	 *  - with `useAtrTrail` (default true): stop ≥ highestPrice − 2×ATR.
	 * Mean-reversion strategies pass `useAtrTrail: false` — a 2×ATR trail from
	 * the peak overrides their structural band stop in low-ATR conditions.
	 * Returns the new stop; the caller persists it on the position.
	 */
	updateTrailingStop(params: {
		entryPrice: number;
		currentPrice: number;
		atr: number;
		highestPrice: number;
		currentStop: number;
		useAtrTrail?: boolean;
	}): number {
		const { entryPrice, currentPrice, atr, highestPrice, currentStop, useAtrTrail = true } = params;
		const profitPct = (currentPrice - entryPrice) / entryPrice;

		let stop = currentStop;
		if (profitPct >= this.config.trailingActivationPct) {
			stop = Math.max(stop, entryPrice); // lock breakeven
		}
		if (useAtrTrail) {
			const atrTrail = highestPrice - this.config.trailingAtrMultiplier * atr;
			stop = Math.max(stop, atrTrail);
		}
		return stop;
	}

	// ------------------------------------------------------------------
	// State recording
	// ------------------------------------------------------------------

	/** Record a closed trade's realized PnL (feeds the Kelly estimator). */
	recordTradeOutcome(symbol: string, realizedPnl: number, now = Date.now()): void {
		void symbol;
		this.outcomes.push(realizedPnl);
		if (this.outcomes.length > 200) this.outcomes.shift(); // bounded window

		const key = dayKey(now);
		const day = this.daily.get(key) ?? { startValue: this.currentPortfolioValue, realizedPnl: 0 };
		day.realizedPnl += realizedPnl;
		this.daily.set(key, day);

		const week = weekKey(now);
		this.weekly.set(week, (this.weekly.get(week) ?? 0) + realizedPnl);
	}

	/** Keep portfolio value + peak current (call on every decide()). */
	updatePortfolioValue(value: number): void {
		if (!Number.isFinite(value) || value <= 0) return;
		this.currentPortfolioValue = value;
		this.peakPortfolioValue = Math.max(this.peakPortfolioValue, value);
	}

	/** Manual reset for the drawdown halt (the only way to clear it). */
	resetDrawdownHalt(): void {
		this.drawdownHalted = false;
		this.peakPortfolioValue = this.currentPortfolioValue;
	}

	getStatus(now = Date.now()): RiskStatus {
		const halt = this.isTradingHalted(now);
		const day = this.daily.get(dayKey(now));
		const week = this.weekly.get(weekKey(now));
		const dayPnlPct = day && day.startValue > 0 ? day.realizedPnl / day.startValue : 0;
		const weekPnlPct =
			week !== undefined && this.currentPortfolioValue > 0
				? week / this.currentPortfolioValue
				: 0;

		return {
			tradingHalted: halt.halted,
			haltReason: halt.reason,
			drawdownHalt: this.drawdownHalted || this.getDrawdownPct() >= this.config.maxDrawdownPct,
			dailyLossHalt: halt.reason?.includes("Daily loss") ?? false,
			weeklyReductionActive: weekPnlPct <= -this.config.maxWeeklyLossPct,
			dayPnlPct,
			weekPnlPct,
			drawdownPct: this.getDrawdownPct(),
			peakPortfolioValue: this.peakPortfolioValue,
			sizeMultiplier: this.getSizeMultiplier(now),
			kelly: this.computeKelly(),
			openPositionLimit: this.config.maxOpenPositions,
		};
	}
}

/**
 * Process-wide shared instance so every strategy contributes to and respects
 * the same daily/weekly loss, drawdown, and Kelly state.
 */
let sharedRiskManager: RiskManager | null = null;

export function getSharedRiskManager(
	initialPortfolioValue?: number,
): RiskManager {
	if (!sharedRiskManager) {
		sharedRiskManager = new RiskManager(undefined, initialPortfolioValue ?? 100);
	}
	if (initialPortfolioValue != null) {
		sharedRiskManager.updatePortfolioValue(initialPortfolioValue);
	}
	return sharedRiskManager;
}