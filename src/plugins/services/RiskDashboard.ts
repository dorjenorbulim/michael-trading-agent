/**
 * Risk Dashboard Service
 *
 * Real-time risk monitoring with configurable alerts and circuit breakers.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";

export interface RiskMetrics {
  dailyPnL: number;
  dailyPnLPercent: number;
  totalDrawdown: number;
  maxDrawdownPercent: number;
  currentExposure: number; // Percentage of portfolio in positions
  marginUsed: number;
  openPositions: number;
  winRate: number;
  volatility: number;
  sharpeRatio: number;
}

export interface RiskAlert {
  id: string;
  type: "warning" | "critical" | "info";
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

export interface RiskLimits {
  maxDailyLoss: number; // Max $ loss per day
  maxDailyLossPercent: number; // Max % loss per day
  maxDrawdownPercent: number; // Max portfolio drawdown
  maxExposurePercent: number; // Max % in open positions
  maxPositionSize: number; // Max $ per position
  maxOpenPositions: number;
  minWinRate: number; // Minimum acceptable win rate
}

const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxDailyLoss: 500,
  maxDailyLossPercent: 5,
  maxDrawdownPercent: 10,
  maxExposurePercent: 80,
  maxPositionSize: 1000,
  maxOpenPositions: 5,
  minWinRate: 0.4,
};

export class RiskDashboard extends Service {
  static serviceType = "risk-dashboard";
  capabilityDescription = "Real-time risk monitoring and alerting";

  private runtime: IAgentRuntime;
  private limits: RiskLimits;
  private metrics: RiskMetrics;
  private alerts: RiskAlert[] = [];
  private circuitBreaker: {
    triggered: boolean;
    reason: string;
    timestamp: number;
  } | null = null;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.runtime = runtime;
    this.limits = DEFAULT_RISK_LIMITS;
    this.metrics = {
      dailyPnL: 0,
      dailyPnLPercent: 0,
      totalDrawdown: 0,
      maxDrawdownPercent: 0,
      currentExposure: 0,
      marginUsed: 0,
      openPositions: 0,
      winRate: 0,
      volatility: 0,
      sharpeRatio: 0,
    };
  }

  static async start(runtime: IAgentRuntime): Promise<RiskDashboard> {
    logger.info("*** Starting Risk Dashboard ***");
    return new RiskDashboard(runtime);
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info("*** Stopping Risk Dashboard ***");
  }

  async stop(): Promise<void> {}

  /**
   * Update risk limits
   */
  updateLimits(limits: Partial<RiskLimits>): void {
    this.limits = { ...this.limits, ...limits };
    logger.info({ limits: this.limits }, "Risk limits updated");
  }

  /**
   * Update current metrics
   */
  updateMetrics(metrics: Partial<RiskMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics };
    this.checkRiskLimits();
  }

  /**
   * Check if any risk limits are breached
   */
  private checkRiskLimits(): void {
    const checks = [
      {
        name: "dailyLoss",
        condition: this.metrics.dailyPnL < -this.limits.maxDailyLoss,
        value: this.metrics.dailyPnL,
        threshold: -this.limits.maxDailyLoss,
        message: `Daily loss limit exceeded: $${this.metrics.dailyPnL.toFixed(2)}`,
      },
      {
        name: "dailyLossPercent",
        condition: this.metrics.dailyPnLPercent < -this.limits.maxDailyLossPercent,
        value: this.metrics.dailyPnLPercent,
        threshold: -this.limits.maxDailyLossPercent,
        message: `Daily loss percent exceeded: ${this.metrics.dailyPnLPercent.toFixed(2)}%`,
      },
      {
        name: "drawdown",
        condition: this.metrics.maxDrawdownPercent > this.limits.maxDrawdownPercent,
        value: this.metrics.maxDrawdownPercent,
        threshold: this.limits.maxDrawdownPercent,
        message: `Max drawdown exceeded: ${this.metrics.maxDrawdownPercent.toFixed(2)}%`,
      },
      {
        name: "exposure",
        condition: this.metrics.currentExposure > this.limits.maxExposurePercent,
        value: this.metrics.currentExposure,
        threshold: this.limits.maxExposurePercent,
        message: `Max exposure exceeded: ${this.metrics.currentExposure.toFixed(2)}%`,
      },
      {
        name: "winRate",
        condition: this.metrics.winRate < this.limits.minWinRate && this.metrics.winRate > 0,
        value: this.metrics.winRate,
        threshold: this.limits.minWinRate,
        message: `Win rate below minimum: ${(this.metrics.winRate * 100).toFixed(1)}%`,
      },
    ];

    for (const check of checks) {
      if (check.condition) {
        this.createAlert({
          type: check.name === "dailyLoss" || check.name === "drawdown" ? "critical" : "warning",
          metric: check.name,
          message: check.message,
          value: check.value,
          threshold: check.threshold,
        });

        // Trigger circuit breaker for critical alerts
        if (check.name === "dailyLoss" || check.name === "drawdown") {
          this.triggerCircuitBreaker(check.message);
        }
      }
    }
  }

  /**
   * Create a risk alert
   */
  private createAlert(params: Omit<RiskAlert, "id" | "timestamp" | "acknowledged">): void {
    const alert: RiskAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
      ...params,
    };

    this.alerts.push(alert);
    logger.warn({ alert }, `Risk ${alert.type}: ${alert.message}`);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Trigger circuit breaker (emergency stop)
   */
  private triggerCircuitBreaker(reason: string): void {
    this.circuitBreaker = {
      triggered: true,
      reason,
      timestamp: Date.now(),
    };
    logger.error({ reason }, "CIRCUIT BREAKER TRIGGERED");
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker = null;
    logger.info("Circuit breaker reset");
  }

  /**
   * Get current risk status
   */
  getStatus(): {
    metrics: RiskMetrics;
    limits: RiskLimits;
    alerts: RiskAlert[];
    circuitBreaker: typeof this.circuitBreaker;
    riskLevel: "low" | "medium" | "high" | "critical";
  } {
    const unacknowledgedCritical = this.alerts.filter(
      (a) => a.type === "critical" && !a.acknowledged
    ).length;
    const unacknowledgedWarnings = this.alerts.filter(
      (a) => a.type === "warning" && !a.acknowledged
    ).length;

    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (this.circuitBreaker?.triggered) {
      riskLevel = "critical";
    } else if (unacknowledgedCritical > 0) {
      riskLevel = "high";
    } else if (unacknowledgedWarnings > 0) {
      riskLevel = "medium";
    }

    return {
      metrics: this.metrics,
      limits: this.limits,
      alerts: this.alerts.slice(-20), // Last 20 alerts
      circuitBreaker: this.circuitBreaker,
      riskLevel,
    };
  }

  /**
   * Format risk status for display
   */
  formatStatus(): string {
    const status = this.getStatus();
    const riskEmoji = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      critical: "🔴",
    };

    let output = `${riskEmoji[status.riskLevel]} **Risk Dashboard**\n\n`;

    output += `**Current Metrics:**\n`;
    output += `• Daily PnL: $${status.metrics.dailyPnL.toFixed(2)} (${status.metrics.dailyPnLPercent.toFixed(2)}%)\n`;
    output += `• Max Drawdown: ${status.metrics.maxDrawdownPercent.toFixed(2)}%\n`;
    output += `• Current Exposure: ${status.metrics.currentExposure.toFixed(2)}%\n`;
    output += `• Open Positions: ${status.metrics.openPositions}\n`;
    output += `• Win Rate: ${(status.metrics.winRate * 100).toFixed(1)}%\n\n`;

    if (status.circuitBreaker?.triggered) {
      output += `**⚠️ CIRCUIT BREAKER ACTIVE**\n`;
      output += `Reason: ${status.circuitBreaker.reason}\n`;
      output += `Triggered: ${new Date(status.circuitBreaker.timestamp).toLocaleString()}\n\n`;
    }

    const unacknowledged = status.alerts.filter((a) => !a.acknowledged);
    if (unacknowledged.length > 0) {
      output += `**Active Alerts:**\n`;
      for (const alert of unacknowledged.slice(-5)) {
        const emoji = alert.type === "critical" ? "🔴" : "🟠";
        output += `${emoji} ${alert.message}\n`;
      }
      output += `\n`;
    }

    output += `**Risk Level:** ${status.riskLevel.toUpperCase()}\n`;

    return output;
  }
}
