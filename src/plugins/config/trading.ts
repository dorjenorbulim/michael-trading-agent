export const DEFAULT_CONFIG = {
	// Trading mode
	TRADING_MODE: "paper", // paper | live
	STARTING_BALANCE: 500, // $500 starting balance

	// Allowed tokens - BTC, ETH, SOL only
	ALLOWED_TOKENS: ["BTC", "ETH", "SOL"],

	intervals: {
		priceCheck: 60000,
		walletSync: 600000,
		performanceMonitor: 3600000,
	},
	thresholds: {
		minLiquidity: 50000,
		minVolume: 100000,
		minScore: 60,
	},
	riskLimits: {
		maxPositionSize: 0.35, // Max 35% per position (conservative for 3 tokens)
		maxDrawdown: 0.1,
		stopLossPercentage: 0.05,
		takeProfitPercentage: 0.15,
	},
	slippageSettings: {
		baseSlippage: 0.5,
		maxSlippage: 1.0,
		liquidityMultiplier: 1.0,
		volumeMultiplier: 1.0,
	},
};

export const SAFETY_LIMITS = {
	MINIMUM_TRADE: 0.1,
	MAX_SLIPPAGE: 0.05,
	MIN_LIQUIDITY: 50000,
	MIN_VOLUME: 10000,
	MAX_PRICE_CHANGE: 30,
};

/**
 * Strategy IDs skipped at registration time (checked in
 * AutoTradingManager.registerDefaultStrategies).
 *
 * New strategies are ENABLED by default — only list broken or unacceptably
 * high-risk strategies here. To re-enable one, remove its id from this set.
 * Currently disabled per the $100 portfolio review (fee-heavy / unbounded
 * risk); the 2026-09 quant additions (trend-following-v1,
 * mean-reversion-simple-v1) are enabled.
 */
export const DISABLED_STRATEGIES = new Set<string>([
	"random-v1", // random noise — guaranteed negative EV after fees
	"llm", // unbounded discretionary decisions, no hard risk controls
	"momentum-breakout-v1", // micro-breakouts where fees ate 10%+ (see review)
]);

// ── Stop-Loss / Take-Profit ─────────────────────────────────────
export const STOP_LOSS_CONFIG = {
	defaultStopPercent: 0.05, // 5% default stop
	trailPercent: 0.03, // 3% trailing
	atrMultiplier: 2.0, // 2×ATR for adaptive stops
	minStopPercent: 0.01, // 1% minimum stop (floor)
	breakevenTriggerPercent: 0.05, // Lock breakeven at 5% profit
	takeProfit1Percent: 0.10, // TP1 at 10% profit
	takeProfit2Percent: 0.20, // TP2 at 20% profit
	takeProfit1Portion: 0.50, // Sell 50% at TP1
	maxRiskPercent: 0.02, // Risk 2% of portfolio per trade
};

// ── DCA Scheduler ────────────────────────────────────────────────
export const DCA_CONFIG = {
	totalCapital: 100, // $100 total DCA budget
	entries: 4, // 4 weekly entries
	allocation: [
		{ asset: "BTC", percent: 60 },
		{ asset: "ETH", percent: 30 },
		{ asset: "SOL", percent: 10 },
	],
	interval: "weekly" as const,
	startDate: new Date().toISOString().split("T")[0],
	fearGreedAdjust: {
		fearThreshold: 40,
		fearMultiplier: 1.4, // Buy 40% more in fear
		greedThreshold: 75,
		greedMultiplier: 0.6, // Buy 40% less in greed
	},
	minOrderUsd: 1,
	enabled: true,
};

// ── Portfolio Rebalancer ──────────────────────────────────────────
export const REBALANCE_CONFIG = {
	targetWeights: { BTC: 0.60, ETH: 0.30, SOL: 0.10 },
	driftThreshold: 0.10, // Rebalance when 10% off target
	minTradeUsd: 5, // Skip trades under $5
	takerFeeRate: 0.001, // 0.1% Binance taker fee
	minHoldMs: 24 * 60 * 60 * 1000, // 24h min hold before selling
	enabled: true,
	checkIntervalMs: 60 * 60 * 1000, // 1 hour
};
