/**
 * Stop-Loss / Take-Profit Manager for the trading bot.
 *
 * Manages trailing stops, breakeven locks, and take-profit levels
 * for open positions. Integrates with the existing AutoTradingManager
 * and RiskManager.
 *
 * Features:
 * - Trailing stop: starts at X% below entry, trails up with price
 * - Breakeven lock: moves stop to entry after Y% profit
 * - Take-profit: partial sells at TP1 (50% position), TP2 (remaining)
 * - ATR-based adaptive stops: wider in volatile regimes
 * - Stop floor: minimum 1% stop to avoid fee-eaten stops on 1m candles
 * - Risk per trade: caps loss at Z% of portfolio per stop event
 */

export interface StopLevel {
  entryPrice: number;
  currentStop: number;
  stopType: "fixed" | "trailing" | "atr";
  breakevenTrigger: number; // % profit to lock breakeven (default 5%)
  breakevenLocked: boolean;
  takeProfit1: number | null; // first TP level (partial sell)
  takeProfit2: number | null; // final TP level
  takeProfit1Hit: boolean;
  highestPrice: number;
  atrValue: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface StopLossConfig {
  /** Default stop distance as % below entry (e.g. 0.05 = 5%) */
  defaultStopPercent: number;
  /** Trailing: how close the stop follows price (e.g. 0.03 = 3% trail) */
  trailPercent: number;
  /** ATR multiplier for adaptive stops (e.g. 2.0 = 2×ATR) */
  atrMultiplier: number;
  /** Minimum stop as % of price (floor to avoid fee-eaten stops) */
  minStopPercent: number;
  /** % profit to lock breakeven (move stop to entry) */
  breakevenTriggerPercent: number;
  /** Take-profit 1: % above entry for first partial sell */
  takeProfit1Percent: number;
  /** Take-profit 2: % above entry for final sell */
  takeProfit2Percent: number;
  /** Portion of position to sell at TP1 (0.5 = 50%) */
  takeProfit1Portion: number;
  /** Max % of portfolio to risk per trade */
  maxRiskPercent: number;
}

export const DEFAULT_STOP_LOSS_CONFIG: StopLossConfig = {
  defaultStopPercent: 0.05,      // 5% default stop
  trailPercent: 0.03,            // 3% trailing
  atrMultiplier: 2.0,            // 2×ATR for adaptive stops
  minStopPercent: 0.01,          // 1% minimum stop (floor)
  breakevenTriggerPercent: 0.05, // Lock breakeven at 5% profit
  takeProfit1Percent: 0.10,      // TP1 at 10% profit
  takeProfit2Percent: 0.20,      // TP2 at 20% profit
  takeProfit1Portion: 0.50,      // Sell 50% at TP1
  maxRiskPercent: 0.02,          // Risk 2% of portfolio per trade
};

export class StopLossManager {
  private stops: Map<string, StopLevel> = new Map();
  private config: StopLossConfig;
  private listeners: Array<(symbol: string, event: StopEvent) => void> = [];

  constructor(config: Partial<StopLossConfig> = {}) {
    this.config = { ...DEFAULT_STOP_LOSS_CONFIG, ...config };
  }

  /** Register a new position for stop management */
  openPosition(symbol: string, entryPrice: number, atrValue?: number): StopLevel {
    const stopDistance = this.calculateInitialStop(entryPrice, atrValue);
    const level: StopLevel = {
      entryPrice,
      currentStop: stopDistance,
      stopType: atrValue ? "atr" : "trailing",
      breakevenTrigger: this.config.breakevenTriggerPercent,
      breakevenLocked: false,
      takeProfit1: entryPrice * (1 + this.config.takeProfit1Percent),
      takeProfit2: entryPrice * (1 + this.config.takeProfit2Percent),
      takeProfit1Hit: false,
      highestPrice: entryPrice,
      atrValue: atrValue ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.stops.set(symbol, level);
    return level;
  }

  /** Close a position (remove stop management) */
  closePosition(symbol: string): StopLevel | undefined {
    const level = this.stops.get(symbol);
    this.stops.delete(symbol);
    return level;
  }

  /** Update stop level with current price. Returns action if stop/TP hit. */
  update(symbol: string, currentPrice: number, currentAtr?: number): StopAction {
    const level = this.stops.get(symbol);
    if (!level) return { action: "none", symbol, price: currentPrice };

    level.updatedAt = Date.now();

    // Update highest price seen
    if (currentPrice > level.highestPrice) {
      level.highestPrice = currentPrice;
    }

    // Update ATR if provided
    if (currentAtr !== undefined && currentAtr > 0) {
      level.atrValue = currentAtr;
    }

    // Check take-profit levels first
    if (!level.takeProfit1Hit && level.takeProfit1 !== null && currentPrice >= level.takeProfit1) {
      level.takeProfit1Hit = true;
      this.emit(symbol, { type: "take-profit-1", symbol, price: currentPrice, portion: this.config.takeProfit1Portion });
      return { action: "take-profit-1", symbol, price: currentPrice, portion: this.config.takeProfit1Portion };
    }

    if (level.takeProfit1Hit && level.takeProfit2 !== null && currentPrice >= level.takeProfit2) {
      this.closePosition(symbol);
      this.emit(symbol, { type: "take-profit-2", symbol, price: currentPrice, portion: 1.0 });
      return { action: "take-profit-2", symbol, price: currentPrice, portion: 1.0 };
    }

    // Check breakeven lock
    const profitPct = (currentPrice - level.entryPrice) / level.entryPrice;
    if (!level.breakevenLocked && profitPct >= level.breakevenTrigger) {
      level.breakevenLocked = true;
      level.currentStop = level.entryPrice; // Move stop to breakeven
      this.emit(symbol, { type: "breakeven-locked", symbol, price: currentPrice });
    }

    // Trail stop upward (never move stop down)
    if (level.breakevenLocked) {
      // After breakeven lock, trail with tighter distance
      const trailDistance = currentPrice * this.config.trailPercent;
      const newStop = currentPrice - trailDistance;
      if (newStop > level.currentStop) {
        level.currentStop = newStop;
      }
    } else if (level.atrValue && level.atrValue > 0) {
      // ATR-based trailing
      const atrStop = currentPrice - level.atrValue * this.config.atrMultiplier;
      const floorStop = currentPrice * (1 - this.config.minStopPercent);
      const newStop = Math.max(atrStop, floorStop);
      if (newStop > level.currentStop) {
        level.currentStop = newStop;
      }
    } else {
      // Fixed percentage trailing
      const trailStop = currentPrice * (1 - this.config.trailPercent);
      const floorStop = currentPrice * (1 - this.config.minStopPercent);
      const newStop = Math.max(trailStop, floorStop);
      if (newStop > level.currentStop) {
        level.currentStop = newStop;
      }
    }

    // Check stop hit
    if (currentPrice <= level.currentStop) {
      const stopPrice = level.currentStop;
      this.closePosition(symbol);
      this.emit(symbol, { type: "stop-loss", symbol, price: currentPrice, stopPrice });
      return { action: "stop-loss", symbol, price: currentPrice, stopPrice };
    }

    return { action: "none", symbol, price: currentPrice };
  }

  /** Get current stop level for a position */
  getStop(symbol: string): StopLevel | undefined {
    return this.stops.get(symbol);
  }

  /** Get all managed positions */
  getAllStops(): Map<string, StopLevel> {
    return this.stops;
  }

  /** Calculate position size based on risk parameters */
  calculatePositionSize(
    entryPrice: number,
    portfolioValue: number,
    atrValue?: number
  ): number {
    const stopDistance = atrValue
      ? atrValue * this.config.atrMultiplier
      : entryPrice * this.config.defaultStopPercent;

    const floorStop = entryPrice * this.config.minStopPercent;
    const actualStop = Math.max(stopDistance, floorStop);
    const stopPercent = actualStop / entryPrice;

    // Risk = portfolio × maxRiskPercent = position × stopPercent
    // position = portfolio × maxRiskPercent / stopPercent
    const positionSize = (portfolioValue * this.config.maxRiskPercent) / stopPercent;

    // Cap at 35% of portfolio
    const maxPosition = portfolioValue * 0.35;
    return Math.min(positionSize, maxPosition);
  }

  /** Register event listener */
  onStopEvent(listener: (symbol: string, event: StopEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  private emit(symbol: string, event: StopEvent): void {
    for (const listener of this.listeners) {
      try { listener(symbol, event); } catch {}
    }
  }

  private calculateInitialStop(entryPrice: number, atrValue?: number): number {
    if (atrValue && atrValue > 0) {
      const atrStop = entryPrice - atrValue * this.config.atrMultiplier;
      const floorStop = entryPrice * (1 - this.config.minStopPercent);
      return Math.max(atrStop, floorStop);
    }
    return entryPrice * (1 - this.config.defaultStopPercent);
  }

  /** Serialize for persistence */
  toJSON(): object {
    return {
      config: this.config,
      stops: Object.fromEntries(this.stops),
    };
  }

  /** Restore from persistence */
  static fromJSON(data: any): StopLossManager {
    const manager = new StopLossManager(data.config);
    if (data.stops) {
      for (const [symbol, level] of Object.entries(data.stops)) {
        manager.stops.set(symbol, level as StopLevel);
      }
    }
    return manager;
  }
}

export type StopAction = {
  action: "none" | "stop-loss" | "take-profit-1" | "take-profit-2";
  symbol: string;
  price: number;
  stopPrice?: number;
  portion?: number;
};

export type StopEvent = {
  type: "stop-loss" | "take-profit-1" | "take-profit-2" | "breakeven-locked";
  symbol: string;
  price: number;
  stopPrice?: number;
  portion?: number;
};