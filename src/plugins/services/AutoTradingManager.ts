import { type IAgentRuntime, logger, Service } from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";
import { LLMStrategy } from "../strategies/LLMStrategy.ts";
import { DISABLED_STRATEGIES, DCA_CONFIG, REBALANCE_CONFIG, STOP_LOSS_CONFIG } from "../config/trading.ts";
import { StopLossManager } from "./StopLossManager.ts";
import { DCAScheduler } from "./DCAScheduler.ts";
import { PortfolioRebalancer } from "./PortfolioRebalancer.ts";
import type {
	AgentState,
	OHLCV,
	PortfolioSnapshot,
	Position,
	StrategyContextMarketData,
	TradeOrder,
	TradingStrategy,
} from "../types.ts";
import { OrderType, TradeType } from "../types.ts";
import type { SwapService } from "./SwapService.ts";
import type { TokenValidationService } from "./TokenValidationService.ts";
import type {
	TradingEnvironmentState,
	TradingTrajectoryService,
} from "./TradingTrajectoryService.ts";

/** Risk management helper */
class RiskManager {
	constructor(
		private maxDailyLoss = 1000,
		private stopLossPercent = 0.05,
		private takeProfitPercent = 0.1,
	) {}

	checkLimits(
		dailyPnL: number,
		position: Position,
		currentPrice: number,
	): { shouldExit: boolean; reason?: string } {
		if (dailyPnL < -this.maxDailyLoss) {
			return { shouldExit: true, reason: "Daily loss limit exceeded" };
		}
		const pnlPercent =
			(currentPrice - position.entryPrice) / position.entryPrice;
		if (pnlPercent < -this.stopLossPercent) {
			return {
				shouldExit: true,
				reason: `Stop loss at ${(pnlPercent * 100).toFixed(1)}%`,
			};
		}
		if (pnlPercent > this.takeProfitPercent) {
			return {
				shouldExit: true,
				reason: `Take profit at ${(pnlPercent * 100).toFixed(1)}%`,
			};
		}
		return { shouldExit: false };
	}
}

/** Trade analytics tracker */
class Analytics {
	private trades: Array<{
		timestamp: number;
		type: TradeType;
		token: string;
		price: number;
		quantity: number;
		realizedPnL?: number;
		txId?: string;
	}> = [];

	trackTrade(trade: {
		timestamp?: number;
		type: TradeType;
		token: string;
		price: number;
		quantity: number;
		realizedPnL?: number;
		txId?: string;
	}): void {
		this.trades.push({ ...trade, timestamp: trade.timestamp || Date.now() });
	}

	getMetrics() {
		const todayStart = new Date().setHours(0, 0, 0, 0);
		const winning = this.trades.filter((t) => (t.realizedPnL || 0) > 0);
		const totalPnL = this.trades.reduce(
			(sum, t) => sum + (t.realizedPnL || 0),
			0,
		);
		const dailyPnL = this.trades
			.filter((t) => t.timestamp >= todayStart)
			.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);

		return {
			totalPnL,
			dailyPnL,
			winRate: this.trades.length > 0 ? winning.length / this.trades.length : 0,
			totalTrades: this.trades.length,
			winningTrades: winning.length,
			losingTrades: this.trades.length - winning.length,
		};
	}
}

export interface TradingConfig {
	strategy: string;
	tokens: string[];
	maxPositionSize: number;
	intervalMs: number;
	stopLossPercent?: number;
	takeProfitPercent?: number;
	maxDailyLoss?: number;
}

export interface TradingStatus {
	isTrading: boolean;
	strategy?: string;
	positions: Position[];
	performance: {
		totalPnL: number;
		dailyPnL: number;
		winRate: number;
		totalTrades: number;
	};
}

interface TransactionRecord {
	id: string;
	timestamp: number;
	action: TradeType;
	token: string;
	quantity: number;
	price: number;
	reason?: string;
	signature?: string;
}

export class AutoTradingManager extends Service {
	public static readonly serviceType = "AutoTradingManager";
	public readonly capabilityDescription =
		"Trading service with LLM strategies and Jupiter swap execution";

	private strategies = new Map<string, TradingStrategy>();
	private activeStrategy?: TradingStrategy;
	private isTrading = false;
	private positions = new Map<string, Position>();
	private tradingInterval?: NodeJS.Timeout;
	private currentConfig?: TradingConfig;
	private transactionHistory: TransactionRecord[] = [];
	private riskManager = new RiskManager();
	private analytics = new Analytics();
	private swapService: SwapService | null = null;
	private validationService: TokenValidationService | null = null;
	private trajectoryService: TradingTrajectoryService | null = null;

	// New risk management modules
	private stopLossManager = new StopLossManager(STOP_LOSS_CONFIG);
	private dcaScheduler = new DCAScheduler(DCA_CONFIG);
	private rebalancer = new PortfolioRebalancer(REBALANCE_CONFIG);
	private _dcaInterval?: NodeJS.Timeout;
	private _rebalanceInterval?: NodeJS.Timeout;

	public static async start(
		runtime: IAgentRuntime,
	): Promise<AutoTradingManager> {
		const instance = new AutoTradingManager(runtime);
		await instance.initialize();
		return instance;
	}

	private async initialize(): Promise<void> {
		this.swapService = this.runtime.getService(
			"SwapService",
		) as SwapService | null;
		this.validationService = this.runtime.getService(
			"TokenValidationService",
		) as TokenValidationService | null;
		this.trajectoryService = this.runtime.getService(
			"TradingTrajectoryService",
		) as TradingTrajectoryService | null;

		const liveReady = this.swapService?.isReady();
		const trajectoryEnabled = this.trajectoryService?.isEnabled();
		logger.info(
			`[AutoTradingManager] Initialized (live: ${liveReady ? "yes" : "no"}, trajectory: ${trajectoryEnabled ? "yes" : "no"})`,
		);

		await this.registerDefaultStrategies();
		logger.info(
			`[AutoTradingManager] Loaded ${this.strategies.size} strategies`,
		);
	}

	public async stop(): Promise<void> {
		await this.stopTrading();
	}

	private async registerDefaultStrategies(): Promise<void> {
		const [
			{ MomentumBreakoutStrategy },
			{ MeanReversionStrategy },
			{ RuleBasedStrategy },
			{ RandomStrategy },
			{ TrendFollowingStrategy },
			{ MeanReversionSimpleStrategy },
		] = await Promise.all([
			import("../strategies/MomentumBreakoutStrategy.ts"),
			import("../strategies/MeanReversionStrategy.ts"),
			import("../strategies/RuleBasedStrategy.ts"),
			import("../strategies/RandomStrategy.ts"),
			import("../strategies/TrendFollowingStrategy.ts"),
			import("../strategies/MeanReversionSimpleStrategy.ts"),
		]);

		const llm = new LLMStrategy();
		await llm.initialize(this.runtime);

		// Register in a stable order, skipping anything in DISABLED_STRATEGIES
		// (new strategies are enabled by default unless listed there).
		const candidates: TradingStrategy[] = [
			llm,
			new MomentumBreakoutStrategy(),
			new MeanReversionStrategy(),
			new RuleBasedStrategy(),
			new RandomStrategy(),
			new TrendFollowingStrategy(),
			new MeanReversionSimpleStrategy(),
		];

		for (const strategy of candidates) {
			if (DISABLED_STRATEGIES.has(strategy.id)) {
				logger.info(
					`[AutoTradingManager] Skipping disabled strategy: ${strategy.id}`,
				);
				continue;
			}
			this.registerStrategy(strategy);
		}
	}

	public registerStrategy(strategy: TradingStrategy): void {
		this.strategies.set(strategy.id, strategy);
	}

	public async startTrading(config: TradingConfig): Promise<void> {
		if (this.isTrading) throw new Error("Already trading");

		const strategy = this.strategies.get(config.strategy);
		if (!strategy) throw new Error(`Strategy "${config.strategy}" not found`);

		this.riskManager = new RiskManager(
			config.maxDailyLoss,
			config.stopLossPercent,
			config.takeProfitPercent,
		);
		this.activeStrategy = strategy;
		this.currentConfig = config;
		this.isTrading = true;

		// Start trajectory logging session
		if (this.trajectoryService?.isEnabled()) {
			const envState = await this.getEnvironmentState();
			this.trajectoryService.startSession({
				strategy: strategy.id,
				initialState: envState,
				scenarioId: `auto-trade-${strategy.id}`,
			});
		}

		logger.info(
			`[AutoTradingManager] Started: ${strategy.name}, interval: ${config.intervalMs}ms`,
		);

		this.tradingInterval = setInterval(
			() =>
				this.tradingLoop().catch((e) =>
					logger.error("[AutoTradingManager] Loop error:", e),
				),
			config.intervalMs,
		);
		this.tradingLoop().catch((e) =>
			logger.error("[AutoTradingManager] Initial loop error:", e),
		);

		// Start DCA and rebalance check timers (1 hour interval)
		this._dcaInterval = setInterval(() => this.checkDCA().catch(e => logger.error("[AutoTradingManager] DCA error:", e)), 3600000);
		this._rebalanceInterval = setInterval(() => this.checkRebalance().catch(e => logger.error("[AutoTradingManager] Rebalance error:", e)), 3600000);
	}

	public async stopTrading(): Promise<void> {
		// End trajectory logging session
		if (this.trajectoryService?.isEnabled()) {
			const envState = await this.getEnvironmentState();
			await this.trajectoryService.endSession("completed", envState);
		}

		this.isTrading = false;
		this.activeStrategy = undefined;
		if (this.tradingInterval) {
			clearInterval(this.tradingInterval);
			this.tradingInterval = undefined;
		}
		if (this._dcaInterval) { clearInterval(this._dcaInterval); this._dcaInterval = undefined; }
		if (this._rebalanceInterval) { clearInterval(this._rebalanceInterval); this._rebalanceInterval = undefined; }

		// Clear stop-loss positions on stop
		for (const symbol of this.stopLossManager.getAllStops().keys()) {
			this.stopLossManager.closePosition(symbol);
		}

		logger.info("[AutoTradingManager] Stopped");
	}

	private async tradingLoop(): Promise<void> {
		if (!this.isTrading || !this.activeStrategy || !this.currentConfig) return;

		// Check stop-losses for all open positions on every tick
		await this.checkStopLosses();

		// For 'auto' mode (LLM strategy), the strategy handles token discovery
		// We call processToken once with null to trigger the strategy's internal token selection
		if (
			this.currentConfig.tokens.length === 1 &&
			this.currentConfig.tokens[0] === "auto"
		) {
			await this.processToken(null);
		} else {
			// For explicit token lists, process each token
			for (const token of this.currentConfig.tokens) {
				await this.processToken(token);
			}
		}
	}

	private async processToken(token: string | null): Promise<void> {
		if (!this.activeStrategy) return;

		// Start trajectory step
		const envState = await this.getEnvironmentState();
		this.trajectoryService?.startTradingStep(envState);

		// For auto mode (token=null), LLM strategy handles its own token discovery
		// For explicit tokens, we get market data for that specific token
		const marketData = token
			? await this.getMarketData(token)
			: this.createAutoModeMarketData();
		if (!marketData) return;

		// Check risk limits for existing positions
		if (token) {
			const position = this.positions.get(token);
			if (position && marketData.currentPrice) {
				const exitCheck = this.riskManager.checkLimits(
					this.analytics.getMetrics().dailyPnL,
					position,
					marketData.currentPrice,
				);
				if (exitCheck.shouldExit) {
					const order: TradeOrder = {
						action: TradeType.SELL,
						pair: `${token}/USDC`,
						quantity: position.amount,
						orderType: OrderType.MARKET,
						timestamp: Date.now(),
						reason: exitCheck.reason || "Risk limit exit",
					};
					await this.executeTrade(order);
					return;
				}
			}
		}

		// Also check all open positions for risk limits
		for (const [posToken, position] of this.positions) {
			if (posToken !== token) {
				const posMarketData = await this.getMarketData(posToken);
				if (posMarketData?.currentPrice) {
					const exitCheck = this.riskManager.checkLimits(
						this.analytics.getMetrics().dailyPnL,
						position,
						posMarketData.currentPrice,
					);
					if (exitCheck.shouldExit) {
						const order: TradeOrder = {
							action: TradeType.SELL,
							pair: `${posToken}/USDC`,
							quantity: position.amount,
							orderType: OrderType.MARKET,
							timestamp: Date.now(),
							reason: exitCheck.reason || "Risk limit exit",
						};
						await this.executeTrade(order);
					}
				}
			}
		}

		const portfolioSnapshot: PortfolioSnapshot = {
			timestamp: Date.now(),
			holdings: this.getHoldingsSnapshot(),
			totalValue: await this.calculatePortfolioValue(),
		};

		const agentState: AgentState = {
			portfolioValue: portfolioSnapshot.totalValue,
			volatility: 0.02,
			confidenceLevel: 0.7,
			recentTrades: this.analytics.getMetrics().totalTrades,
		};

		const decision = await this.activeStrategy.decide({
			marketData,
			agentState,
			portfolioSnapshot,
			agentRuntime: this.runtime,
		});

		if (decision) {
			await this.executeTrade(decision);
		} else {
			// Log HOLD decision
			this.trajectoryService?.completeTradingStep({
				order: null,
				success: true,
			});
		}
	}

	private createAutoModeMarketData(): StrategyContextMarketData {
		// For auto mode, provide minimal market data - the strategy will fetch its own
		return {
			currentPrice: 0,
			lastPrices: [],
			priceData: [],
		};
	}

	public async executeTrade(order: TradeOrder): Promise<string> {
		if (!this.isTrading) throw new Error("Not currently trading");

		const [token] = order.pair.split("/");
		const isLive =
			this.runtime.getSetting("TRADING_MODE") === "live" &&
			this.swapService?.isReady();
		const slippageBps = Number(this.runtime.getSetting("SLIPPAGE_BPS")) || 100;
		let txId: string;
		let signature: string | undefined;

		if (isLive) {
			// Validate token for buys
			if (order.action === TradeType.BUY && this.validationService) {
				const validation = await this.validationService.validateToken(token);
				if (!validation.isValid) {
					throw new Error(
						`Validation failed: ${validation.rejectionReasons.join(", ")}`,
					);
				}
			}

			const result =
				order.action === TradeType.BUY
					? await this.swapService?.buy(
							token,
							((order.price || 0) * order.quantity) /
								(await this.getSolPrice()),
							slippageBps,
						)
					: await this.swapService?.sell(token, order.quantity, slippageBps);

			if (!result) throw new Error("Swap service not available");
			if (!result.success) throw new Error(`Swap failed: ${result.error}`);
			txId = result.signature ?? `unknown_${Date.now()}`;
			signature = result.signature;
			logger.info(
				`[AutoTradingManager] ${order.action}: ${result.inputAmount} → ${result.outputAmount} (${result.explorerUrl})`,
			);
		} else {
			txId = `paper_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
			logger.info(
				`[AutoTradingManager] Paper ${order.action}: ${order.quantity} ${token}`,
			);
		}

		this.transactionHistory.push({
			id: txId,
			timestamp: Date.now(),
			action: order.action,
			token,
			quantity: order.quantity,
			price: order.price || 100,
			reason: order.reason,
			signature,
		});

		// Calculate P&L change for this trade
		const pnlBefore = this.analytics.getMetrics().totalPnL;
		this.updatePosition(token, order, txId);
		const pnlAfter = this.analytics.getMetrics().totalPnL;

		// Log trajectory step completion
		this.trajectoryService?.completeTradingStep({
			order,
			success: true,
			txId,
			pnlChange: pnlAfter - pnlBefore,
		});

		return txId;
	}

	private updatePosition(token: string, order: TradeOrder, txId: string): void {
		const price = order.price || 100;

		if (order.action === TradeType.BUY) {
			const existing = this.positions.get(token);
			if (existing) {
				const newQty = existing.amount + order.quantity;
				existing.entryPrice =
					(existing.entryPrice * existing.amount + price * order.quantity) /
					newQty;
				existing.amount = newQty;
			} else {
				this.positions.set(token, {
					id: uuidv4() as `${string}-${string}-${string}-${string}-${string}`,
					tokenAddress: token,
					amount: order.quantity,
					entryPrice: price,
					currentPrice: price,
				});
			}
		} else {
			const position = this.positions.get(token);
			if (position) {
				const realizedPnL = order.quantity * (price - position.entryPrice);
				this.analytics.trackTrade({
					type: order.action,
					price,
					quantity: order.quantity,
					realizedPnL,
					txId,
				});
				position.amount -= order.quantity;
				if (position.amount <= 0) this.positions.delete(token);
			}
		}
	}

	private async getSolPrice(): Promise<number> {
		const resp = await fetch(
			"https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
		);
		if (resp.ok) {
			const data = (await resp.json()) as { solana: { usd: number } };
			return data.solana.usd;
		}
		return 150;
	}

	public getStatus(): TradingStatus {
		return {
			isTrading: this.isTrading,
			strategy: this.activeStrategy?.name,
			positions: Array.from(this.positions.values()),
			performance: this.getPerformance(),
		};
	}

	public getPerformance() {
		return this.analytics.getMetrics();
	}

	public getStrategies(): TradingStrategy[] {
		return Array.from(this.strategies.values());
	}

	public getTransactionHistory(): TransactionRecord[] {
		return [...this.transactionHistory];
	}

	public getLatestTransactions(limit = 10): TransactionRecord[] {
		return this.transactionHistory.slice(-limit);
	}

	private async getMarketData(
		token: string,
	): Promise<StrategyContextMarketData | null> {
		// Map token names to CoinGecko IDs
		const tokenMap: Record<string, string> = {
			BTC: "bitcoin",
			ETH: "ethereum",
			SOL: "solana",
			bitcoin: "bitcoin",
			ethereum: "ethereum",
			solana: "solana",
		};

		const coingeckoId = tokenMap[token.toUpperCase()];
		let currentPrice = 0;

		// Try to fetch real price from CoinGecko
		if (coingeckoId) {
			try {
				const response = await fetch(
					`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
				);
				if (response.ok) {
					const data = (await response.json()) as Record<string, { usd: number }>;
					if (data[coingeckoId]) {
						currentPrice = data[coingeckoId].usd;
					}
				}
			} catch (error) {
				console.error(`[AutoTradingManager] Failed to fetch ${token} price:`, error);
			}
		}

		// Fallback prices if API fails
		if (currentPrice === 0) {
			const fallbackPrices: Record<string, number> = {
				BTC: 45000,
				ETH: 2500,
				SOL: 100,
			};
			currentPrice = fallbackPrices[token.toUpperCase()] || 100;
		}

		// Generate realistic OHLCV data based on current price
		const priceData: OHLCV[] = Array.from({ length: 100 }, (_, i) => {
			const volatility = currentPrice * 0.002; // 0.2% volatility per candle
			const trend = Math.sin(i / 20) * volatility; // Gentle trend
			const base = currentPrice + trend;
			return {
				timestamp: Date.now() - (100 - i) * 60000,
				open: base + (Math.random() - 0.5) * volatility,
				high: base + Math.random() * volatility * 1.5,
				low: base - Math.random() * volatility * 1.5,
				close: base + (Math.random() - 0.5) * volatility,
				volume: 1000000 + Math.random() * 5000000,
			};
		});

		// Update current price in positions
		const position = this.positions.get(token);
		if (position) {
			position.currentPrice = currentPrice;
		}

		return {
			currentPrice,
			lastPrices: priceData.slice(-10).map((d) => d.close),
			priceData,
		};
	}

	private getHoldingsSnapshot(): Record<string, number> {
		// Start with $500 USD for paper trading
		const holdings: Record<string, number> = { USDC: 500 };
		for (const [token, pos] of this.positions) holdings[token] = pos.amount;
		return holdings;
	}

	private async calculatePortfolioValue(): Promise<number> {
		// Start with $500 for paper trading
		let total = 500;
		for (const pos of this.positions.values()) {
			total += pos.amount * (pos.currentPrice || pos.entryPrice);
		}
		return total;
	}

	/**
	 * Get current environment state for trajectory logging
	 */
	private async getEnvironmentState(): Promise<TradingEnvironmentState> {
		const metrics = this.analytics.getMetrics();
		let solBalance = 10;

		if (this.swapService?.isReady()) {
			const balances = await this.swapService.getWalletBalances();
			solBalance = balances.solBalance;
		}

		return {
			solBalance,
			portfolioValue: await this.calculatePortfolioValue(),
			totalPnL: metrics.totalPnL,
			dailyPnL: metrics.dailyPnL,
			openPositions: Array.from(this.positions.values()),
			winRate: metrics.winRate,
			totalTrades: metrics.totalTrades,
		};
	}

	// ── Stop-Loss / Take-Profit ─────────────────────────────────────

	/** Estimate ATR from price data */
	private estimateATR(priceData?: OHLCV[]): number | null {
		if (!priceData || priceData.length < 14) return null;
		const recent = priceData.slice(-14);
		const trueRanges = recent.map((candle, i) => {
			if (i === 0) return candle.high - candle.low;
			const prev = recent[i - 1];
			return Math.max(
				candle.high - candle.low,
				Math.abs(candle.high - prev.close),
				Math.abs(candle.low - prev.close),
			);
		});
		return trueRanges.reduce((s, v) => s + v, 0) / trueRanges.length;
	}

	/** Check stop-loss and take-profit levels for all positions */
	private async checkStopLosses(): Promise<void> {
		for (const [symbol, position] of this.positions) {
			const marketData = await this.getMarketData(symbol);
			if (!marketData?.currentPrice) continue;

			const atrValue = this.estimateATR(marketData.priceData);
			const action = this.stopLossManager.update(symbol, marketData.currentPrice, atrValue ?? undefined);

			if (action.action === "stop-loss") {
				logger.warn(`[AutoTradingManager] Stop-loss triggered for ${symbol} at $${action.price.toFixed(2)}, stop: $${action.stopPrice?.toFixed(2)}`);
				const order: TradeOrder = {
					action: TradeType.SELL,
					pair: `${symbol}/USDC`,
					quantity: position.amount,
					orderType: OrderType.MARKET,
					timestamp: Date.now(),
					reason: `Stop-loss at $${action.stopPrice?.toFixed(2)}`,
				};
				await this.executeTrade(order);
			} else if (action.action === "take-profit-1") {
				logger.info(`[AutoTradingManager] Take-profit 1 for ${symbol} at $${action.price.toFixed(2)}, selling ${((action.portion ?? 0.5) * 100).toFixed(0)}%`);
				const sellQty = position.amount * (action.portion ?? 0.5);
				const order: TradeOrder = {
					action: TradeType.SELL,
					pair: `${symbol}/USDC`,
					quantity: sellQty,
					orderType: OrderType.MARKET,
					timestamp: Date.now(),
					reason: `Take-profit 1 at $${action.price.toFixed(2)}`,
				};
				await this.executeTrade(order);
			} else if (action.action === "take-profit-2") {
				logger.info(`[AutoTradingManager] Take-profit 2 for ${symbol} at $${action.price.toFixed(2)}, closing position`);
				const order: TradeOrder = {
					action: TradeType.SELL,
					pair: `${symbol}/USDC`,
					quantity: position.amount,
					orderType: OrderType.MARKET,
					timestamp: Date.now(),
					reason: `Take-profit 2 at $${action.price.toFixed(2)}`,
				};
				await this.executeTrade(order);
			}
		}
	}

	// ── DCA Scheduler ───────────────────────────────────────────────

	/** Get Fear & Greed Index */
	private async getFearGreedIndex(): Promise<number> {
		try {
			const resp = await fetch("https://api.alternative.me/fng/?limit=1");
			if (resp.ok) {
				const data = (await resp.json()) as { data: Array<{ value: string }> };
				return parseInt(data.data[0].value);
			}
		} catch { /* fall through to default */ }
		return 50; // neutral default
	}

	/** Check if DCA should execute */
	private async checkDCA(): Promise<void> {
		const shouldDCA = this.dcaScheduler.shouldExecuteNow();
		if (!shouldDCA.execute || !shouldDCA.entry) return;

		logger.info(`[AutoTradingManager] DCA entry #${shouldDCA.entry.week} due, executing`);

		const prices: Record<string, number> = {};
		for (const alloc of shouldDCA.entry.allocations) {
			const marketData = await this.getMarketData(alloc.asset);
			if (marketData?.currentPrice) prices[alloc.asset] = marketData.currentPrice;
		}

		if (Object.keys(prices).length === 0) {
			logger.warn("[AutoTradingManager] DCA: no prices available, skipping");
			return;
		}

		this.dcaScheduler.adjustForFearGreed(shouldDCA.entry, await this.getFearGreedIndex());

		for (const alloc of shouldDCA.entry.allocations) {
			if (!prices[alloc.asset]) continue;
			const order: TradeOrder = {
				action: TradeType.BUY,
					pair: `${alloc.asset}/USDC`,
					quantity: alloc.adjustedUsd / prices[alloc.asset],
					orderType: OrderType.MARKET,
					timestamp: Date.now(),
					price: prices[alloc.asset],
					reason: `DCA week ${shouldDCA.entry.week}`,
				};
			await this.executeTrade(order);
		}

		this.dcaScheduler.markExecuted(shouldDCA.entry.week, prices);
	}

	// ── Portfolio Rebalancer ────────────────────────────────────────

	/** Check if portfolio needs rebalancing */
	private async checkRebalance(): Promise<void> {
		if (!this.rebalancer.shouldCheck()) return;

		const holdings: Record<string, { quantity: number; avgPrice: number }> = {};
		const prices: Record<string, number> = {};
		const entryDates: Record<string, number> = {};

		for (const [symbol, position] of this.positions) {
			holdings[symbol] = { quantity: position.amount, avgPrice: position.entryPrice };
			const marketData = await this.getMarketData(symbol);
			if (marketData?.currentPrice) prices[symbol] = marketData.currentPrice;
			entryDates[symbol] = Date.now();
		}

		const totalValue = await this.calculatePortfolioValue();
		const result = this.rebalancer.check(holdings, prices, totalValue, entryDates);

		if (result.orders.length === 0) return;

		logger.info(`[AutoTradingManager] Rebalance needed: ${result.orders.length} orders, $${result.totalRebalanceUsd.toFixed(2)} total`);

		for (const order of result.orders) {
			const tradeOrder: TradeOrder = {
				action: order.action === "BUY" ? TradeType.BUY : TradeType.SELL,
				pair: `${order.asset}/USDC`,
				quantity: order.quantity,
				orderType: OrderType.MARKET,
				timestamp: Date.now(),
				reason: `Rebalance: ${order.action} ${order.asset} (drift ${(order.drift * 100).toFixed(1)}%)`,
			};
			await this.executeTrade(tradeOrder);
		}

		this.rebalancer.recordRebalance(result);
	}

	// ── Public accessors for new modules ────────────────────────────

	getStopLossManager(): StopLossManager { return this.stopLossManager; }
	getDCAScheduler(): DCAScheduler { return this.dcaScheduler; }
	getRebalancer(): PortfolioRebalancer { return this.rebalancer; }
}
