/**
 * DCA Scheduler — Automated dollar-cost averaging for the trading bot.
 *
 * Schedules periodic buys of BTC, ETH, and SOL at configurable intervals
 * and allocations, with Fear & Greed-based size adjustments.
 *
 * Integrates with the existing AutoTradingManager and uses CoinGecko
 * for price data when the bot's own price feed is unavailable.
 */

export interface DCAConfig {
  /** Total capital to DCA (e.g. 100) */
  totalCapital: number;
  /** Number of DCA entries (e.g. 4 = 4 weekly buys) */
  entries: number;
  /** Per-entry amounts: [{ asset, percent }] */
  allocation: DCAAllocation[];
  /** Interval between entries (e.g. "weekly", "biweekly") */
  interval: "weekly" | "biweekly" | "monthly";
  /** Starting date (ISO) */
  startDate: string;
  /** Fear & Greed adjustments */
  fearGreedAdjust: {
    /** If F&G < threshold, multiply entry size by this factor (buy more in fear) */
    fearThreshold: number;
    fearMultiplier: number;
    /** If F&G > threshold, multiply entry size by this factor (buy less in greed) */
    greedThreshold: number;
    greedMultiplier: number;
  };
  /** Minimum order size (exchange minimum) */
  minOrderUsd: number;
  /** Whether DCA is enabled */
  enabled: boolean;
}

export interface DCAAllocation {
  asset: string;  // e.g. "BTC", "ETH", "SOL"
  percent: number; // e.g. 60 = 60% of each entry
}

export interface DCAEntry {
  week: number;
  date: string;
  status: "pending" | "skipped" | "executed" | "partial";
  allocations: DCAEntryAllocation[];
  fearGreedAtExecution?: number;
  adjustedSize?: number; // after F&G adjustment
  executedAt?: string;
  notes?: string;
}

export interface DCAEntryAllocation {
  asset: string;
  baseUsd: number;
  adjustedUsd: number;
  quantity?: number;
  priceAtExecution?: number;
}

export const DEFAULT_DCA_CONFIG: DCAConfig = {
  totalCapital: 100,
  entries: 4,
  allocation: [
    { asset: "BTC", percent: 60 },
    { asset: "ETH", percent: 30 },
    { asset: "SOL", percent: 10 },
  ],
  interval: "weekly",
  startDate: new Date().toISOString().split("T")[0],
  fearGreedAdjust: {
    fearThreshold: 40,
    fearMultiplier: 1.4,    // buy 40% more in fear
    greedThreshold: 75,
    greedMultiplier: 0.6,  // buy 40% less in greed
  },
  minOrderUsd: 1,
  enabled: true,
};

export class DCAScheduler {
  private config: DCAConfig;
  private schedule: DCAEntry[] = [];
  private fearGreedIndex: number | null = null;

  constructor(config: Partial<DCAConfig> = {}) {
    this.config = { ...DEFAULT_DCA_CONFIG, ...config };
    this.generateSchedule();
  }

  /** Generate the DCA schedule based on config */
  generateSchedule(): DCAEntry[] {
    this.schedule = [];
    const entryAmount = this.config.totalCapital / this.config.entries;
    const start = new Date(this.config.startDate);
    const intervalMs = this.getIntervalMs();

    for (let i = 0; i < this.config.entries; i++) {
      const entryDate = new Date(start.getTime() + i * intervalMs);
      const allocations: DCAEntryAllocation[] = this.config.allocation.map((alloc) => {
        const baseUsd = entryAmount * (alloc.percent / 100);
        return {
          asset: alloc.asset,
          baseUsd: Math.round(baseUsd * 100) / 100,
          adjustedUsd: Math.round(baseUsd * 100) / 100, // adjusted when fear/greed is known
        };
      });

      this.schedule.push({
        week: i + 1,
        date: entryDate.toISOString().split("T")[0],
        status: "pending",
        allocations,
      });
    }
    return this.schedule;
  }

  /** Get the next pending DCA entry */
  getNextEntry(): DCAEntry | undefined {
    return this.schedule.find((e) => e.status === "pending");
  }

  /** Check if a DCA entry should be executed now */
  shouldExecuteNow(): { execute: boolean; entry?: DCAEntry; reason?: string } {
    if (!this.config.enabled) {
      return { execute: false, reason: "DCA is disabled" };
    }

    const next = this.getNextEntry();
    if (!next) {
      return { execute: false, reason: "No pending entries" };
    }

    const today = new Date().toISOString().split("T")[0];
    if (next.date > today) {
      return { execute: false, reason: `Next entry scheduled for ${next.date}` };
    }

    return { execute: true, entry: next };
  }

  /** Adjust entry size based on Fear & Greed */
  adjustForFearGreed(entry: DCAEntry, fearGreed: number): DCAEntry {
    const { fearThreshold, fearMultiplier, greedThreshold, greedMultiplier } =
      this.config.fearGreedAdjust;

    let multiplier = 1.0;
    if (fearGreed < fearThreshold) {
      multiplier = fearMultiplier; // Buy more in fear
    } else if (fearGreed > greedThreshold) {
      multiplier = greedMultiplier; // Buy less in greed
    }

    entry.fearGreedAtExecution = fearGreed;
    entry.adjustedSize = Math.round(
      (entry.allocations.reduce((sum, a) => sum + a.baseUsd, 0) * multiplier) * 100
    ) / 100;

    entry.allocations = entry.allocations.map((a) => ({
      ...a,
      adjustedUsd: Math.round(a.baseUsd * multiplier * 100) / 100,
    }));

    return entry;
  }

  /** Mark an entry as executed */
  markExecuted(week: number, prices: Record<string, number>): DCAEntry {
    const entry = this.schedule.find((e) => e.week === week);
    if (!entry) throw new Error(`DCA entry week ${week} not found`);

    entry.status = "executed";
    entry.executedAt = new Date().toISOString();

    entry.allocations = entry.allocations.map((a) => {
      const price = prices[a.asset];
      if (price && price > 0) {
        return {
          ...a,
          priceAtExecution: price,
          quantity: Math.round((a.adjustedUsd / price) * 100000000) / 100000000,
        };
      }
      return a;
    });

    return entry;
  }

  /** Skip an entry (e.g., extreme market conditions) */
  skipEntry(week: number, reason: string): DCAEntry {
    const entry = this.schedule.find((e) => e.week === week);
    if (!entry) throw new Error(`DCA entry week ${week} not found`);
    entry.status = "skipped";
    entry.notes = reason;
    return entry;
  }

  /** Get the full schedule */
  getSchedule(): DCAEntry[] {
    return this.schedule;
  }

  /** Get portfolio tracker data */
  getPortfolioSummary(): {
    totalInvested: number;
    currentValue: number;
    pnl: number;
    pnlPct: number;
    holdings: Record<string, { quantity: number; avgPrice: number; currentPrice?: number }>;
  } {
    const holdings: Record<string, { quantity: number; totalUsd: number; avgPrice: number; currentPrice?: number }> = {};
    let totalInvested = 0;

    for (const entry of this.schedule) {
      if (entry.status !== "executed") continue;
      for (const alloc of entry.allocations) {
        if (!holdings[alloc.asset]) {
          holdings[alloc.asset] = { quantity: 0, totalUsd: 0, avgPrice: 0, currentPrice: alloc.priceAtExecution };
        }
        holdings[alloc.asset].quantity += alloc.quantity || 0;
        holdings[alloc.asset].totalUsd += alloc.adjustedUsd;
        if (alloc.priceAtExecution) {
          holdings[alloc.asset].currentPrice = alloc.priceAtExecution;
        }
        totalInvested += alloc.adjustedUsd;
      }
    }

    // Calculate average prices
    for (const asset of Object.keys(holdings)) {
      const h = holdings[asset];
      h.avgPrice = h.quantity > 0 ? h.totalUsd / h.quantity : 0;
    }

    const currentValue = Object.values(holdings).reduce(
      (sum, h) => sum + (h.quantity * (h.currentPrice || h.avgPrice)),
      0
    );

    return {
      totalInvested: Math.round(totalInvested * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      pnl: Math.round((currentValue - totalInvested) * 100) / 100,
      pnlPct: totalInvested > 0 ? Math.round(((currentValue - totalInvested) / totalInvested) * 10000) / 100 : 0,
      holdings: Object.fromEntries(
        Object.entries(holdings).map(([asset, h]) => [
          asset,
          { quantity: h.quantity, avgPrice: Math.round(h.avgPrice * 100) / 100, currentPrice: h.currentPrice },
        ])
      ),
    };
  }

  private getIntervalMs(): number {
    switch (this.config.interval) {
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      case "biweekly":
        return 14 * 24 * 60 * 60 * 1000;
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /** Serialize for persistence */
  toJSON(): object {
    return {
      config: this.config,
      schedule: this.schedule,
      fearGreedIndex: this.fearGreedIndex,
    };
  }

  /** Restore from persistence */
  static fromJSON(data: any): DCAScheduler {
    const scheduler = new DCAScheduler(data.config);
    if (data.schedule) scheduler.schedule = data.schedule;
    if (data.fearGreedIndex) scheduler.fearGreedIndex = data.fearGreedIndex;
    return scheduler;
  }
}