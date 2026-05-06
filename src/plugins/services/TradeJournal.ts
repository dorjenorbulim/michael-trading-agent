/**
 * Trade Journal Service
 *
 * Complete logging of all trades with reasoning, performance tracking, and analytics.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";

export interface TradeEntry {
  id: string;
  timestamp: number;
  symbol: string;
  side: "BUY" | "SELL";
  amount: number;
  price: number;
  total: number;
  strategy: string;
  reasoning: string;
  confidence?: number;
  marketCondition?: string;
  riskLevel?: string;
  stopLoss?: number;
  takeProfit?: number;
  status: "open" | "closed" | "cancelled";
  pnl?: number;
  pnlPercent?: number;
  exitPrice?: number;
  exitReason?: string;
  exitTimestamp?: number;
  duration?: number; // milliseconds
  tags: string[];
  notes?: string;
}

export interface JournalStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnL: number;
  bestTrade: TradeEntry | null;
  worstTrade: TradeEntry | null;
  avgTradeDuration: number;
  strategyPerformance: Record<string, { trades: number; pnl: number; winRate: number }>;
}

export class TradeJournal extends Service {
  static serviceType = "trade-journal";
  capabilityDescription = "Complete trade logging with reasoning and analytics";

  private runtime: IAgentRuntime;
  private trades: Map<string, TradeEntry> = new Map();
  private tags: Set<string> = new Set();

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.runtime = runtime;
  }

  static async start(runtime: IAgentRuntime): Promise<TradeJournal> {
    logger.info("*** Starting Trade Journal ***");
    return new TradeJournal(runtime);
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info("*** Stopping Trade Journal ***");
  }

  async stop(): Promise<void> {}

  /**
   * Log a new trade
   */
  logTrade(entry: Omit<TradeEntry, "id" | "timestamp" | "status" | "tags"> & { tags?: string[] }): TradeEntry {
    const trade: TradeEntry = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: "open",
      tags: entry.tags || [],
      ...entry,
    };

    this.trades.set(trade.id, trade);
    
    // Track tags
    for (const tag of trade.tags) {
      this.tags.add(tag);
    }

    logger.info(
      { trade: { id: trade.id, symbol: trade.symbol, side: trade.side, strategy: trade.strategy } },
      `Trade logged: ${trade.side} ${trade.amount} ${trade.symbol}`
    );

    return trade;
  }

  /**
   * Close a trade
   */
  closeTrade(
    tradeId: string,
    params: {
      exitPrice: number;
      exitReason: string;
      notes?: string;
    }
  ): TradeEntry | null {
    const trade = this.trades.get(tradeId);
    if (!trade) return null;

    const exitTimestamp = Date.now();
    const pnl = (params.exitPrice - trade.price) * trade.amount * (trade.side === "BUY" ? 1 : -1);
    const pnlPercent = (pnl / trade.total) * 100;
    const duration = exitTimestamp - trade.timestamp;

    const closedTrade: TradeEntry = {
      ...trade,
      status: "closed",
      exitPrice: params.exitPrice,
      exitReason: params.exitReason,
      exitTimestamp,
      pnl,
      pnlPercent,
      duration,
      notes: params.notes ? `${trade.notes || ""}\n${params.notes}` : trade.notes,
    };

    this.trades.set(tradeId, closedTrade);

    logger.info(
      { trade: { id: tradeId, pnl, pnlPercent, duration } },
      `Trade closed: ${trade.symbol} PnL: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`
    );

    return closedTrade;
  }

  /**
   * Cancel a trade
   */
  cancelTrade(tradeId: string, reason: string): TradeEntry | null {
    const trade = this.trades.get(tradeId);
    if (!trade || trade.status !== "open") return null;

    const cancelledTrade: TradeEntry = {
      ...trade,
      status: "cancelled",
      exitReason: reason,
      exitTimestamp: Date.now(),
    };

    this.trades.set(tradeId, cancelledTrade);
    logger.info({ tradeId, reason }, "Trade cancelled");

    return cancelledTrade;
  }

  /**
   * Get trade by ID
   */
  getTrade(tradeId: string): TradeEntry | undefined {
    return this.trades.get(tradeId);
  }

  /**
   * Get all trades
   */
  getAllTrades(): TradeEntry[] {
    return Array.from(this.trades.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get open trades
   */
  getOpenTrades(): TradeEntry[] {
    return this.getAllTrades().filter((t) => t.status === "open");
  }

  /**
   * Get closed trades
   */
  getClosedTrades(): TradeEntry[] {
    return this.getAllTrades().filter((t) => t.status === "closed");
  }

  /**
   * Get trades by strategy
   */
  getTradesByStrategy(strategy: string): TradeEntry[] {
    return this.getAllTrades().filter((t) => t.strategy === strategy);
  }

  /**
   * Get trades by tag
   */
  getTradesByTag(tag: string): TradeEntry[] {
    return this.getAllTrades().filter((t) => t.tags.includes(tag));
  }

  /**
   * Get trades by date range
   */
  getTradesByDateRange(start: number, end: number): TradeEntry[] {
    return this.getAllTrades().filter((t) => t.timestamp >= start && t.timestamp <= end);
  }

  /**
   * Get journal statistics
   */
  getStats(): JournalStats {
    const allTrades = this.getAllTrades();
    const closedTrades = allTrades.filter((t) => t.status === "closed");
    const openTrades = allTrades.filter((t) => t.status === "open");
    const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter((t) => (t.pnl || 0) <= 0);

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
      : 0;

    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    const avgDuration = closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + (t.duration || 0), 0) / closedTrades.length
      : 0;

    // Strategy performance
    const strategyPerformance: JournalStats["strategyPerformance"] = {};
    for (const trade of closedTrades) {
      if (!strategyPerformance[trade.strategy]) {
        strategyPerformance[trade.strategy] = { trades: 0, pnl: 0, winRate: 0 };
      }
      strategyPerformance[trade.strategy].trades++;
      strategyPerformance[trade.strategy].pnl += trade.pnl || 0;
    }
    for (const [strategy, stats] of Object.entries(strategyPerformance)) {
      const strategyTrades = closedTrades.filter((t) => t.strategy === strategy);
      const wins = strategyTrades.filter((t) => (t.pnl || 0) > 0).length;
      stats.winRate = strategyTrades.length > 0 ? wins / strategyTrades.length : 0;
    }

    // Best and worst trades
    const sortedByPnL = [...closedTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));

    return {
      totalTrades: allTrades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0,
      avgWin,
      avgLoss,
      profitFactor,
      totalPnL,
      bestTrade: sortedByPnL[0] || null,
      worstTrade: sortedByPnL[sortedByPnL.length - 1] || null,
      avgTradeDuration: avgDuration,
      strategyPerformance,
    };
  }

  /**
   * Format trade summary
   */
  formatTradeSummary(trade: TradeEntry): string {
    const emoji = trade.side === "BUY" ? "🟢" : "🔴";
    const statusEmoji = trade.status === "open" ? "⏳" : trade.status === "closed" ? "✅" : "❌";
    
    let output = `${emoji} ${statusEmoji} **${trade.side} ${trade.symbol}**\n`;
    output += `Amount: ${trade.amount} @ $${trade.price.toFixed(6)}\n`;
    output += `Total: $${trade.total.toFixed(2)} | Strategy: ${trade.strategy}\n`;
    
    if (trade.status === "closed" && trade.pnl !== undefined) {
      const pnlEmoji = trade.pnl >= 0 ? "🟢" : "🔴";
      output += `${pnlEmoji} PnL: $${trade.pnl.toFixed(2)} (${trade.pnlPercent?.toFixed(2)}%)\n`;
      output += `Exit: $${trade.exitPrice?.toFixed(6)} | Reason: ${trade.exitReason}\n`;
    }
    
    output += `Reasoning: ${trade.reasoning}\n`;
    
    if (trade.tags.length > 0) {
      output += `Tags: ${trade.tags.join(", ")}\n`;
    }
    
    return output;
  }

  /**
   * Format journal statistics
   */
  formatStats(): string {
    const stats = this.getStats();
    
    let output = `📊 **Trade Journal Statistics**\n\n`;
    
    output += `**Overview:**\n`;
    output += `• Total Trades: ${stats.totalTrades} (${stats.openTrades} open)\n`;
    output += `• Win Rate: ${(stats.winRate * 100).toFixed(1)}% (${stats.winningTrades}/${stats.closedTrades})\n`;
    output += `• Total PnL: $${stats.totalPnL.toFixed(2)}\n`;
    output += `• Profit Factor: ${stats.profitFactor.toFixed(2)}\n`;
    output += `• Avg Win: $${stats.avgWin.toFixed(2)} | Avg Loss: $${stats.avgLoss.toFixed(2)}\n\n`;
    
    if (stats.bestTrade) {
      output += `**Best Trade:** +$${stats.bestTrade.pnl?.toFixed(2)} (${stats.bestTrade.symbol})\n`;
    }
    if (stats.worstTrade) {
      output += `**Worst Trade:** $${stats.worstTrade.pnl?.toFixed(2)} (${stats.worstTrade.symbol})\n\n`;
    }
    
    if (Object.keys(stats.strategyPerformance).length > 0) {
      output += `**Strategy Performance:**\n`;
      for (const [strategy, perf] of Object.entries(stats.strategyPerformance)) {
        const emoji = perf.pnl >= 0 ? "🟢" : "🔴";
        output += `${emoji} ${strategy}: ${perf.trades} trades, $${perf.pnl.toFixed(2)} PnL (${(perf.winRate * 100).toFixed(1)}% win)\n`;
      }
    }
    
    return output;
  }

  /**
   * Export journal to JSON
   */
  export(): { trades: TradeEntry[]; stats: JournalStats; tags: string[] } {
    return {
      trades: this.getAllTrades(),
      stats: this.getStats(),
      tags: Array.from(this.tags),
    };
  }
}
