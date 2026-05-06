import type { Plugin, ServiceClass } from "@elizaos/core";
import { analyzePerformanceAction } from "./actions/analyzePerformanceAction.ts";
import { analyzeSentimentAction } from "./actions/analyzeSentimentAction.ts";
import { checkPortfolioAction } from "./actions/checkPortfolioAction.ts";
import { checkRiskStatusAction } from "./actions/checkRiskStatusAction.ts";
import { compareStrategiesAction } from "./actions/compareStrategiesAction.ts";
import { configureStrategyAction } from "./actions/configureStrategyAction.ts";
import { executeLiveTradeAction } from "./actions/executeLiveTradeAction.ts";
import { getMarketAnalysisAction } from "./actions/getMarketAnalysisAction.ts";
import { runBacktestAction } from "./actions/runBacktestAction.ts";
import { runBacktestComparisonAction } from "./actions/runBacktestComparisonAction.ts";
import { startMultiStrategyAction } from "./actions/startMultiStrategyAction.ts";
// Import actions
import { startTradingAction } from "./actions/startTradingAction.ts";
import { stopTradingAction } from "./actions/stopTradingAction.ts";
import { viewTradeJournalAction } from "./actions/viewTradeJournalAction.ts";
import { marketDataProvider } from "./providers/marketDataProvider.ts";
import { strategyProvider } from "./providers/strategyProvider.ts";

// Import providers
import { tradingProvider } from "./providers/tradingProvider.ts";
// Import services
import { AutoTradingManager } from "./services/AutoTradingManager.ts";
import { CopyTrading } from "./services/CopyTrading.ts";
import { MarketConditionDetector } from "./services/MarketConditionDetector.ts";
import { MultiStrategyManager } from "./services/MultiStrategyManager.ts";
import { NotificationService } from "./services/NotificationService.ts";
import { RiskDashboard } from "./services/RiskDashboard.ts";
import { SentimentAnalyzer } from "./services/SentimentAnalyzer.ts";
import { SwapService } from "./services/SwapService.ts";
import { TokenResolverService } from "./services/TokenResolverService.ts";
import { TokenValidationService } from "./services/TokenValidationService.ts";
import { TradeJournal } from "./services/TradeJournal.ts";
import { TradingTrajectoryService } from "./services/TradingTrajectoryService.ts";

/**
 * Auto Trader Plugin
 *
 * Provides autonomous trading capabilities with:
 * - LLM-powered trading strategies
 * - Jupiter DEX integration for token swaps
 * - RugCheck token validation
 * - Risk management with stop-loss/take-profit
 * - Backtesting and paper trading modes
 * - Multi-strategy allocation
 * - Market condition detection
 * - Risk dashboard and alerts
 * - Complete trade journal
 * - Social sentiment analysis
 * - Copy trading from smart wallets
 * - Multi-channel notifications
 */
const autoTraderPlugin: Plugin = {
	name: "plugin-auto-trader",
	description:
		"Autonomous trading plugin with LLM-powered strategies, social sentiment, copy trading, notifications, and comprehensive risk management",
		services: [
			AutoTradingManager,
			MultiStrategyManager,
			MarketConditionDetector,
			RiskDashboard,
			TradeJournal,
			SentimentAnalyzer as unknown as ServiceClass,
			CopyTrading,
			NotificationService,
			SwapService,
			TokenValidationService as unknown as ServiceClass,
			TokenResolverService as unknown as ServiceClass,
			TradingTrajectoryService,
		],
	actions: [
		startTradingAction,
		stopTradingAction,
		checkPortfolioAction,
		runBacktestAction,
		compareStrategiesAction,
		analyzePerformanceAction,
		getMarketAnalysisAction,
		configureStrategyAction,
		executeLiveTradeAction,
		startMultiStrategyAction,
		runBacktestComparisonAction,
		checkRiskStatusAction,
		viewTradeJournalAction,
		analyzeSentimentAction,
	],
	providers: [tradingProvider, marketDataProvider, strategyProvider],
};

export default autoTraderPlugin;
export { autoTraderPlugin };

export type {
	TradingConfig,
	TradingStatus,
} from "./services/AutoTradingManager.ts";
// Export services for direct access
export { AutoTradingManager } from "./services/AutoTradingManager.ts";
export { MultiStrategyManager } from "./services/MultiStrategyManager.ts";
export { MarketConditionDetector } from "./services/MarketConditionDetector.ts";
export { RiskDashboard } from "./services/RiskDashboard.ts";
export { TradeJournal } from "./services/TradeJournal.ts";
export { SentimentAnalyzer } from "./services/SentimentAnalyzer.ts";
export { CopyTrading } from "./services/CopyTrading.ts";
export { NotificationService } from "./services/NotificationService.ts";
export type {
	MarketAnalysis,
	MarketCondition,
} from "./services/MarketConditionDetector.ts";
export type {
	RiskAlert,
	RiskLimits,
	RiskMetrics,
} from "./services/RiskDashboard.ts";
export type {
	JournalStats,
	TradeEntry,
} from "./services/TradeJournal.ts";
export type {
	SentimentAlert,
	SentimentData,
} from "./services/SentimentAnalyzer.ts";
export type {
	CopiedTrade,
	TraderProfile,
} from "./services/CopyTrading.ts";
export type {
	NotificationConfig,
	NotificationEvent,
} from "./services/NotificationService.ts";
export type {
	SwapParams,
	SwapQuote,
	SwapResult,
	WalletBalance,
} from "./services/SwapService.ts";
export { KNOWN_TOKENS, SwapService } from "./services/SwapService.ts";
export type { TokenInfo } from "./services/TokenResolverService.ts";
export { TokenResolverService } from "./services/TokenResolverService.ts";
export type {
	RugCheckReport,
	TradingActivity,
	TradingRequirements,
	ValidationResult,
} from "./services/TokenValidationService.ts";
export { TokenValidationService } from "./services/TokenValidationService.ts";
export type { TradingEnvironmentState } from "./services/TradingTrajectoryService.ts";
export { TradingTrajectoryService } from "./services/TradingTrajectoryService.ts";
export type { LLMStrategyConfig } from "./strategies/LLMStrategy.ts";
// Export strategies
export { LLMStrategy } from "./strategies/LLMStrategy.ts";
export { MeanReversionStrategy } from "./strategies/MeanReversionStrategy.ts";
export { MomentumBreakoutStrategy } from "./strategies/MomentumBreakoutStrategy.ts";
export { RandomStrategy } from "./strategies/RandomStrategy.ts";
export { RuleBasedStrategy } from "./strategies/RuleBasedStrategy.ts";
// Export types from trading.ts (excluding TradingConfig which is also in AutoTradingManager)
// Re-export TradingConfig from trading.ts as TradingSettings to avoid conflict
export type {
	RiskLimits,
	TradingConfig as TradingSettings,
	WalletPortfolioItem,
} from "./types/trading.ts";
// Export types - these include PortfolioAssetHolding and WalletPortfolio
export * from "./types.ts";
