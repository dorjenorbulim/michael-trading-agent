/**
 * Portfolio Rebalancer for the trading bot.
 *
 * Periodically checks portfolio allocation against target weights
 * and generates rebalancing orders when drift exceeds thresholds.
 * Designed for the BTC/ETH/SOL portfolio with DCA integration.
 *
 * Features:
 * - Target allocation weights per asset
 * - Drift threshold (rebalance when off-target by X%)
 * - Minimum trade size enforcement (skip tiny rebalances)
 * - Fee-aware: accounts for 0.1% taker fee in cost calculations
 * - Tax-lot awareness: avoids selling positions held < 24h (wash sale)
 * - Integrates with DCA scheduler for combined entry/rebalance
 */

export interface RebalanceConfig {
  /** Target allocation weights (e.g. { BTC: 0.60, ETH: 0.30, SOL: 0.10 }) */
  targetWeights: Record<string, number>;
  /** Drift threshold: rebalance when any asset drifts by this % (default 10%) */
  driftThreshold: number;
  /** Minimum trade size in USD (skip rebalances smaller than this) */
  minTradeUsd: number;
  /** Taker fee rate (default 0.1% for Binance market orders) */
  takerFeeRate: number;
  /** Minimum hold time before selling (ms, default 24h) */
  minHoldMs: number;
  /** Whether rebalancing is enabled */
  enabled: boolean;
  /** How often to check for rebalancing (ms, default 1 hour) */
  checkIntervalMs: number;
}

export interface RebalanceOrder {
  action: "BUY" | "SELL";
  asset: string;
  quantity: number;
  estimatedUsd: number;
  fromWeight: number;
  toWeight: number;
  drift: number;
  feeEstimate: number;
}

export interface RebalanceResult {
  timestamp: string;
  totalValue: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  orders: RebalanceOrder[];
  totalFees: number;
  totalRebalanceUsd: number;
  skipped: Array<{ asset: string; reason: string }>;
}

export const DEFAULT_REBALANCE_CONFIG: RebalanceConfig = {
  targetWeights: { BTC: 0.60, ETH: 0.30, SOL: 0.10 },
  driftThreshold: 0.10,     // 10% drift triggers rebalance
  minTradeUsd: 5,           // Skip trades under $5
  takerFeeRate: 0.001,      // 0.1% Binance taker fee
  minHoldMs: 24 * 60 * 60 * 1000, // 24 hours
  enabled: true,
  checkIntervalMs: 60 * 60 * 1000, // 1 hour
};

export class PortfolioRebalancer {
  private config: RebalanceConfig;
  private lastRebalance: string | null = null;
  private rebalanceHistory: RebalanceResult[] = [];

  constructor(config: Partial<RebalanceConfig> = {}) {
    this.config = { ...DEFAULT_REBALANCE_CONFIG, ...config };
  }

  /**
   * Check if rebalancing is needed and generate orders.
   * @param holdings Current holdings: { asset: { quantity, avgPrice } }
   * @param prices Current prices: { asset: price }
   * @param totalPortfolioValue Total portfolio value in USD
   * @param entryDates When each position was first entered (for min hold check)
   */
  check(
    holdings: Record<string, { quantity: number; avgPrice: number }>,
    prices: Record<string, number>,
    totalPortfolioValue: number,
    entryDates?: Record<string, number>
  ): RebalanceResult {
    const result: RebalanceResult = {
      timestamp: new Date().toISOString(),
      totalValue: totalPortfolioValue,
      currentWeights: {},
      targetWeights: this.config.targetWeights,
      orders: [],
      totalFees: 0,
      totalRebalanceUsd: 0,
      skipped: [],
    };

    // Calculate current weights
    const allAssets = new Set([
      ...Object.keys(this.config.targetWeights),
      ...Object.keys(holdings),
    ]);

    for (const asset of allAssets) {
      const qty = holdings[asset]?.quantity || 0;
      const price = prices[asset] || 0;
      const value = qty * price;
      result.currentWeights[asset] = totalPortfolioValue > 0 ? value / totalPortfolioValue : 0;
    }

    // Check drift and generate orders
    for (const asset of allAssets) {
      const currentWeight = result.currentWeights[asset] || 0;
      const targetWeight = this.config.targetWeights[asset] || 0;
      const drift = currentWeight - targetWeight;

      // Skip if drift is within threshold
      if (Math.abs(drift) < this.config.driftThreshold) {
        if (Math.abs(drift) > 0.01) {
          // Only log skip if meaningful drift
          result.skipped.push({
            asset,
            reason: `Drift ${(drift * 100).toFixed(1)}% within threshold ${(this.config.driftThreshold * 100).toFixed(0)}%`,
          });
        }
        continue;
      }

      const price = prices[asset] || 0;
      if (price <= 0) {
        result.skipped.push({ asset, reason: "No price data" });
        continue;
      }

      // Calculate the dollar amount to buy/sell
      const targetValue = totalPortfolioValue * targetWeight;
      const currentValue = totalPortfolioValue * currentWeight;
      const deltaValue = targetValue - currentValue; // positive = buy, negative = sell

      // Skip tiny trades
      if (Math.abs(deltaValue) < this.config.minTradeUsd) {
        result.skipped.push({
          asset,
          reason: `Trade $${Math.abs(deltaValue).toFixed(2)} below minimum $${this.config.minTradeUsd}`,
        });
        continue;
      }

      // Check min hold time for sells
      if (deltaValue < 0 && entryDates && entryDates[asset]) {
        const heldMs = Date.now() - entryDates[asset];
        if (heldMs < this.config.minHoldMs) {
          result.skipped.push({
            asset,
            reason: `Held for ${(heldMs / 3600000).toFixed(1)}h, minimum ${(this.config.minHoldMs / 3600000).toFixed(0)}h`,
          });
          continue;
        }
      }

      const action: "BUY" | "SELL" = deltaValue > 0 ? "BUY" : "SELL";
      const quantity = Math.abs(deltaValue) / price;
      const feeEstimate = Math.abs(deltaValue) * this.config.takerFeeRate;

      const order: RebalanceOrder = {
        action,
        asset,
        quantity: Math.round(quantity * 100000000) / 100000000, // 8 decimal precision
        estimatedUsd: Math.abs(deltaValue),
        fromWeight: currentWeight,
        toWeight: targetWeight,
        drift,
        feeEstimate,
      };

      result.orders.push(order);
      result.totalFees += feeEstimate;
      result.totalRebalanceUsd += Math.abs(deltaValue);
    }

    // Sort orders: sells first (free up cash), then buys
    result.orders.sort((a, b) => {
      if (a.action === "SELL" && b.action === "BUY") return -1;
      if (a.action === "BUY" && b.action === "SELL") return 1;
      return Math.abs(b.drift) - Math.abs(a.drift); // Larger drifts first
    });

    // Round totals
    result.totalFees = Math.round(result.totalFees * 100) / 100;
    result.totalRebalanceUsd = Math.round(result.totalRebalanceUsd * 100) / 100;

    return result;
  }

  /**
   * Execute rebalance orders (returns order list for the trading executor).
   * In paper trading mode, this just logs the orders.
   */
  generateExecutionPlan(result: RebalanceResult): {
    orders: Array<{
      symbol: string;
      action: string;
      quantity: number;
      estimatedUsd: number;
      feeEstimate: number;
    }>;
    summary: {
      totalBuys: number;
      totalSells: number;
      netCashFlow: number;
      totalFees: number;
    };
  } {
    const buys = result.orders.filter((o) => o.action === "BUY");
    const sells = result.orders.filter((o) => o.action === "SELL");

    const totalBuys = buys.reduce((sum, o) => sum + o.estimatedUsd, 0);
    const totalSells = sells.reduce((sum, o) => sum + o.estimatedUsd, 0);

    return {
      orders: result.orders.map((o) => ({
        symbol: o.asset,
        action: o.action,
        quantity: o.quantity,
        estimatedUsd: o.estimatedUsd,
        feeEstimate: o.feeEstimate,
      })),
      summary: {
        totalBuys: Math.round(totalBuys * 100) / 100,
        totalSells: Math.round(totalSells * 100) / 100,
        netCashFlow: Math.round((totalSells - totalBuys) * 100) / 100,
        totalFees: result.totalFees,
      },
    };
  }

  /** Update target weights (e.g., after rebalancing cycle) */
  updateTargetWeights(newWeights: Record<string, number>): void {
    // Normalize weights to sum to 1
    const total = Object.values(newWeights).reduce((s, w) => s + w, 0);
    if (total > 0) {
      for (const asset of Object.keys(newWeights)) {
        newWeights[asset] = newWeights[asset] / total;
      }
    }
    this.config.targetWeights = newWeights;
  }

  /** Get current config */
  getConfig(): RebalanceConfig {
    return { ...this.config };
  }

  /** Get rebalance history */
  getHistory(): RebalanceResult[] {
    return this.rebalanceHistory;
  }

  /** Record a rebalance result */
  recordRebalance(result: RebalanceResult): void {
    this.lastRebalance = result.timestamp;
    this.rebalanceHistory.push(result);
    // Keep last 100 rebalance records
    if (this.rebalanceHistory.length > 100) {
      this.rebalanceHistory = this.rebalanceHistory.slice(-100);
    }
  }

  /** Check if rebalancing is needed based on time interval */
  shouldCheck(): boolean {
    if (!this.config.enabled) return false;
    if (!this.lastRebalance) return true;
    const elapsed = Date.now() - new Date(this.lastRebalance).getTime();
    return elapsed >= this.config.checkIntervalMs;
  }

  /** Serialize for persistence */
  toJSON(): object {
    return {
      config: this.config,
      lastRebalance: this.lastRebalance,
      rebalanceHistory: this.rebalanceHistory.slice(-50), // Keep last 50
    };
  }

  /** Restore from persistence */
  static fromJSON(data: any): PortfolioRebalancer {
    const rebalancer = new PortfolioRebalancer(data.config);
    if (data.lastRebalance) rebalancer.lastRebalance = data.lastRebalance;
    if (data.rebalanceHistory) rebalancer.rebalanceHistory = data.rebalanceHistory;
    return rebalancer;
  }
}