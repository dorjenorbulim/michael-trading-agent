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
