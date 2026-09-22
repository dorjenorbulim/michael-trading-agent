import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import {
	type IAgentRuntime,
	logger,
	ModelType,
	parseJSONObjectFromText,
} from "@elizaos/core";
import { LayaGate } from "../services/LayaGate.ts";
import type { TokenValidationService } from "../services/TokenValidationService.ts";
import type {
	AgentState,
	PortfolioSnapshot,
	StrategyContextMarketData,
	TradeOrder,
	TradingStrategy,
} from "../types.ts";
import { OrderType, TradeType } from "../types.ts";

/**
 * Token data from Birdeye trending API
 */
interface TrendingToken {
	address: string;
	symbol: string;
	name: string;
	price: number;
	priceChange24h: number;
	volume24h: number;
	liquidity: number;
	marketCap: number;
	logoURI?: string;
}

/**
 * LLM trading decision response
 */
interface LLMTradingDecision {
	marketAssessment: string;
	/** Market regime classification from the decision battery */
	regime: string;
	/** Calibrated confidence in this recommendation (0-1); the policy layer gates on it */
	confidence: number;
	pickedNothing: boolean;
	recommendBuyIndex: number | null;
	reason: string;
	opportunityScore: number;
	riskScore: number;
	buyAmountPercent: number;
	tokenStrengths: string;
	tokenWeaknesses: string;
	exitConditions: string;
	exitLiquidityThreshold: number;
	exitVolumeThreshold: number;
	currentPrice: number;
	stopLossPrice: number;
	takeProfitPrice: number;
	stopLossReasoning: string;
	takeProfitReasoning: string;
}

/**
 * Configuration for LLM Strategy
 */
export interface LLMStrategyConfig {
	maxBuyAmountPercent: number;
	minOpportunityScore: number;
	maxRiskScore: number;
	minLiquidity: number;
	minVolume24h: number;
	trendingTokensCount: number;
	/** Max wait for an LLM decision in ms; a timeout resolves to SKIP */
	decisionTimeoutMs: number;
	/** Max tolerated deviation (%) between the LLM-reported price and market data */
	maxPriceDeviationPercent: number;
	/** Calibrated-decision discipline: below this confidence the strategy abstains */
	minConfidence: number;
	/** At/above this confidence the strategy trades full size; between min and this, reduced size */
	fullConfidence: number;
	/** Size multiplier applied when confidence sits between min and full */
	lowConfidenceSizeFactor: number;
	/** JSONL decision log for calibration analysis; empty string disables */
	calibrationLogPath: string;
	/** Path to a python with laya-mlx installed; empty string disables the fast local regime gate */
	layaPython: string;
	/** laya-mlx checkpoint to load */
	layaModel: string;
	/** laya bridge script path */
	layaBridge: string;
	birdeyeApiKey?: string;
}

const DEFAULT_CONFIG: LLMStrategyConfig = {
	maxBuyAmountPercent: 15,
	minOpportunityScore: 60,
	maxRiskScore: 70,
	minLiquidity: 50000,
	minVolume24h: 100000,
	trendingTokensCount: 25,
	decisionTimeoutMs: 60000,
	maxPriceDeviationPercent: 10,
	minConfidence: 0.55,
	fullConfidence: 0.75,
	lowConfidenceSizeFactor: 0.5,
	calibrationLogPath: "data/llm-calibration.jsonl",
	layaPython: "",
	layaModel: "aac6fef/laya-mlx",
	layaBridge: "scripts/laya_bridge.py",
};

const KNOWN_REGIMES = ["trending", "mean_reverting", "high_vol", "chaotic"];
const CALIBRATION_VERSION = "battery-v1";

/**
 * LLM-based trading prompt template
 */
const TRADING_DECISION_PROMPT = `You are an expert cryptocurrency trader analyzing trending Solana tokens for trading opportunities.

TASK: Analyze the trending tokens below and decide whether to buy any of them.

RULES:
1. Only recommend a buy if you see a genuine opportunity with good risk/reward
2. Buy amount should be between 1-15% of available balance
3. Stop loss must be BELOW current price
4. Take profit must be ABOVE current price
5. Consider liquidity and volume - avoid illiquid tokens
6. It's perfectly acceptable to pick nothing if no good opportunities exist
7. If you are not confident, set "pickedNothing" to true. A missed trade costs nothing; a bad trade costs money
8. "confidence" must be calibrated honesty: 0.9+ only for textbook setups; lower it when evidence is thin - the policy layer skips low-confidence decisions and shrinks lukewarm ones

PREVIOUS PICKS:
{{previousPicks}}

TRENDING TOKENS (Solana):
{{trendingTokens}}

CURRENT PORTFOLIO VALUE: $PORTFOLIO_VALUE_PLACEHOLDER

Respond ONLY with a single JSON object in this exact format - no markdown fences, no prose before or after:
{
  "marketAssessment": "Brief overall market assessment without mentioning specific tokens",
  "regime": "trending|mean_reverting|high_vol|chaotic (classify the current market regime)",
  "confidence": number 0-1 (your calibrated confidence in THIS recommendation),
  "pickedNothing": true/false,
  "recommendBuyIndex": number or null (1-based index from the trending list),
  "reason": "Detailed reasoning for your decision",
  "opportunityScore": number 0-100,
  "riskScore": number 0-100,
  "buyAmountPercent": number 1-15,
  "tokenStrengths": "Why this token is strong (if buying)",
  "tokenWeaknesses": "What's weak about this token (if buying)",
  "exitConditions": "Conditions that would trigger an exit",
  "exitLiquidityThreshold": number (minimum liquidity in USD),
  "exitVolumeThreshold": number (minimum 24h volume in USD),
  "currentPrice": number (current token price in USD),
  "stopLossPrice": number (absolute price for stop loss, must be < currentPrice),
  "takeProfitPrice": number (absolute price for take profit, must be > currentPrice),
  "stopLossReasoning": "Why this stop loss level",
  "takeProfitReasoning": "Why this take profit level"
}`;

/**
 * LLMStrategy - AI-powered trading strategy using language models
 *
 * This strategy:
 * 1. Fetches trending tokens from Birdeye
 * 2. Uses an LLM to analyze opportunities
 * 3. Validates tokens via RugCheck
 * 4. Generates buy signals with proper exit conditions
 * 5. Gates decisions on calibrated confidence (abstain when uncertain,
 *    reduce size when lukewarm) and logs every decision to a JSONL
 *    calibration file for skill-vs-noise analysis
 */
export class LLMStrategy implements TradingStrategy {
	public readonly id = "llm";
	public readonly name = "LLM Trading Strategy";
	public readonly description =
		"AI-powered trading using language models to analyze trending tokens";

	private runtime: IAgentRuntime | null = null;
	private config: LLMStrategyConfig;
	/** Optional laya-mlx gate: fast local regime read (milliseconds, free) */
	private layaGate: LayaGate | null = null;
	private previousPicks: Array<{
		timestamp: number;
		token: string;
		reason: string;
	}> = [];
	private trendingTokensCache: TrendingToken[] = [];
	private lastTrendingFetch = 0;
	private readonly TRENDING_CACHE_TTL = 60000; // 1 minute

	constructor(config: Partial<LLMStrategyConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	public async initialize(runtime?: IAgentRuntime): Promise<void> {
		if (runtime) {
			this.runtime = runtime;

			const birdeyeKey = runtime.getSetting("BIRDEYE_API_KEY");
			if (birdeyeKey && typeof birdeyeKey === "string") {
				this.config.birdeyeApiKey = birdeyeKey;
			}

			const maxBuy = runtime.getSetting("MAX_PORTFOLIO_ALLOCATION");
			if (maxBuy) {
				this.config.maxBuyAmountPercent = Number(maxBuy) * 100;
			}

			const minLiquidity = runtime.getSetting("MIN_LIQUIDITY_USD");
			if (minLiquidity) {
				this.config.minLiquidity = Number(minLiquidity);
			}

			const timeoutSetting = runtime.getSetting("LLM_DECISION_TIMEOUT_MS");
			if (timeoutSetting) {
				const timeoutMs = Number(timeoutSetting);
				if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
					this.config.decisionTimeoutMs = timeoutMs;
				}
			}

			const minConfidenceSetting = Number(
				runtime.getSetting("LLM_MIN_CONFIDENCE"),
			);
			if (
				Number.isFinite(minConfidenceSetting) &&
				minConfidenceSetting >= 0 &&
				minConfidenceSetting <= 1
			) {
				this.config.minConfidence = minConfidenceSetting;
			}
			const fullConfidenceSetting = Number(
				runtime.getSetting("LLM_FULL_CONFIDENCE"),
			);
			if (
				Number.isFinite(fullConfidenceSetting) &&
				fullConfidenceSetting > 0 &&
				fullConfidenceSetting <= 1
			) {
				this.config.fullConfidence = fullConfidenceSetting;
			}
			const sizeFactorSetting = Number(
				runtime.getSetting("LLM_LOW_CONFIDENCE_SIZE_FACTOR"),
			);
			if (
				Number.isFinite(sizeFactorSetting) &&
				sizeFactorSetting > 0 &&
				sizeFactorSetting <= 1
			) {
				this.config.lowConfidenceSizeFactor = sizeFactorSetting;
			}
			const calibrationSetting = runtime.getSetting("LLM_CALIBRATION_LOG");
			if (calibrationSetting !== undefined && calibrationSetting !== null) {
				this.config.calibrationLogPath = String(calibrationSetting);
			}

			// Optional reflex layer: laya-mlx reads the market regime locally
			// in milliseconds (free, private). Off unless LAYA_PYTHON is set.
			const layaPythonSetting = runtime.getSetting("LAYA_PYTHON");
			if (layaPythonSetting) {
				this.layaGate = new LayaGate({
					pythonPath: String(layaPythonSetting),
					bridgePath: String(
						runtime.getSetting("LAYA_BRIDGE") || this.config.layaBridge,
					),
					model: String(runtime.getSetting("LAYA_MODEL") || this.config.layaModel),
				});
				logger.info(`[${this.name}] laya decision gate enabled: ${this.config.layaModel}`);
			}

			logger.info(
				`[${this.name}] Initialized: maxBuy=${this.config.maxBuyAmountPercent}% minOpportunity=${this.config.minOpportunityScore} maxRisk=${this.config.maxRiskScore} timeout=${this.config.decisionTimeoutMs}ms maxPriceDeviation=${this.config.maxPriceDeviationPercent}% minConfidence=${this.config.minConfidence} fullConfidence=${this.config.fullConfidence}`,
			);
		}
	}

	public isReady(): boolean {
		return this.runtime !== null && !!this.config.birdeyeApiKey;
	}

	public configure(params: Partial<LLMStrategyConfig>): void {
		this.config = { ...this.config, ...params };
	}

	/**
	 * Main decision function called by the trading loop
	 */
	public async decide(params: {
		marketData: StrategyContextMarketData;
		agentState: AgentState;
		portfolioSnapshot: PortfolioSnapshot;
		agentRuntime?: IAgentRuntime;
	}): Promise<TradeOrder | null> {
		const runtime = params.agentRuntime || this.runtime;
		if (!runtime) {
			logger.warn(`[${this.name}] Runtime not available`);
			return null;
		}

		// Brain contract: any unexpected failure resolves to SKIP, never a trade.
		try {
			return await this.decideInternal(params, runtime);
		} catch (err) {
			logger.error(
				`[${this.name}] Decision failed - resolving to SKIP: ${err instanceof Error ? err.message : String(err)}`,
			);
			return null;
		}
	}

	private async decideInternal(
		params: {
			marketData: StrategyContextMarketData;
			agentState: AgentState;
			portfolioSnapshot: PortfolioSnapshot;
		},
		runtime: IAgentRuntime,
	): Promise<TradeOrder | null> {
		// Fetch trending tokens (pre-filtered by basic criteria)
		const trendingTokens = await this.fetchTrendingTokens(runtime);
		if (trendingTokens.length === 0) {
			logger.info(`[${this.name}] No trending tokens available`);
			return null;
		}

		// Pre-validate tokens to filter out obvious scams/honeypots BEFORE LLM analysis
		const validationService = runtime.getService("TokenValidationService") as
			| TokenValidationService
			| undefined;
		let validTokens = trendingTokens;

		if (validationService) {
			const validationResults = await Promise.all(
				trendingTokens.map(async (token) => ({
					token,
					validation: await validationService.validateToken(token.address),
				})),
			);

			validTokens = validationResults
				.filter((r) => r.validation.isValid)
				.map((r) => r.token);

			const rejected = validationResults.filter((r) => !r.validation.isValid);
			if (rejected.length > 0) {
				logger.info(
					`[${this.name}] Pre-filtered ${rejected.length} tokens (honeypot/scam indicators)`,
				);
				rejected.slice(0, 3).forEach((r) => {
					logger.debug(
						`[${this.name}] Rejected ${r.token.symbol}: ${r.validation.rejectionReasons.join(", ")}`,
					);
				});
			}
		}

		if (validTokens.length === 0) {
			logger.info(
				`[${this.name}] All trending tokens failed safety validation`,
			);
			return null;
		}

		// Fast local regime read via the laya gate (optional reflex layer).
		// Every failure degrades silently — the LLM battery continues as before.
		let layaRegime: string | null = null;
		let layaConfidence: number | null = null;
		if (this.layaGate) {
			try {
				const regime = await this.layaGate.classifyRegime({
					currentPrice: params.marketData.currentPrice,
					recentPrices: params.marketData.lastPrices.slice(-5),
				});
				if (regime) {
					layaRegime = regime.choice;
					layaConfidence = regime.confidence;
					logger.info(
						`[${this.name}] laya regime read: ${regime.choice} (${regime.confidence.toFixed(2)})`,
					);
				}
			} catch (err) {
				logger.info(
					`[${this.name}] laya regime read skipped: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}

		// Get LLM decision from pre-validated tokens only
		const decision = await this.getLLMDecision(
			runtime,
			validTokens,
			params.portfolioSnapshot.totalValue,
			layaRegime,
			layaConfidence,
		);

		if (
			!decision ||
			decision.pickedNothing ||
			decision.recommendBuyIndex === null
		) {
			logger.info(
				`[${this.name}] LLM decided not to trade:`,
				decision?.marketAssessment,
			);
			if (decision) {
				await this.logCalibration({
					dataVersion: CALIBRATION_VERSION,
					action: "skip_no_pick",
					symbol: null,
					regime: decision.regime,
					confidence: decision.confidence,
					opportunityScore: decision.opportunityScore,
					riskScore: decision.riskScore,
					reason: decision.reason.slice(0, 300),
				});
			}
			return null;
		}

		// Validate the decision
		const tokenIndex = decision.recommendBuyIndex - 1;
		if (
			!Number.isInteger(tokenIndex) ||
			tokenIndex < 0 ||
			tokenIndex >= validTokens.length
		) {
			logger.warn(
				`[${this.name}] Invalid token index from LLM: ${decision.recommendBuyIndex}`,
			);
			return null;
		}

		const selectedToken = validTokens[tokenIndex];

		// Guard against bad market data: a non-positive price would produce an
		// infinite or absurd quantity below.
		if (!Number.isFinite(selectedToken.price) || selectedToken.price <= 0) {
			logger.warn(
				`[${this.name}] Invalid market price for ${selectedToken.symbol}: ${selectedToken.price}`,
			);
			return null;
		}

		// Cross-check the LLM-reported price against market data. A large
		// deviation means the model hallucinated or anchored on stale data.
		const priceDeviation =
			Math.abs(decision.currentPrice - selectedToken.price) /
			selectedToken.price;
		if (priceDeviation > this.config.maxPriceDeviationPercent / 100) {
			logger.warn(
				`[${this.name}] LLM price $${decision.currentPrice.toFixed(6)} deviates ${(priceDeviation * 100).toFixed(1)}% from market price $${selectedToken.price.toFixed(6)} for ${selectedToken.symbol} - skipping`,
			);
			return null;
		}

		// Validate opportunity and risk scores
		if (decision.opportunityScore < this.config.minOpportunityScore) {
			logger.info(
				`[${this.name}] Opportunity score too low: ${decision.opportunityScore}`,
			);
			await this.logCalibration({
				dataVersion: CALIBRATION_VERSION,
				action: "skip_thresholds",
				symbol: selectedToken.symbol,
				regime: decision.regime,
				confidence: decision.confidence,
				opportunityScore: decision.opportunityScore,
				riskScore: decision.riskScore,
				note: `opportunity ${decision.opportunityScore} < ${this.config.minOpportunityScore}`,
			});
			return null;
		}

		if (decision.riskScore > this.config.maxRiskScore) {
			logger.info(`[${this.name}] Risk score too high: ${decision.riskScore}`);
			await this.logCalibration({
				dataVersion: CALIBRATION_VERSION,
				action: "skip_thresholds",
				symbol: selectedToken.symbol,
				regime: decision.regime,
				confidence: decision.confidence,
				opportunityScore: decision.opportunityScore,
				riskScore: decision.riskScore,
				note: `risk ${decision.riskScore} > ${this.config.maxRiskScore}`,
			});
			return null;
		}

		// Validate exit prices
		if (decision.stopLossPrice >= selectedToken.price) {
			logger.warn(
				`[${this.name}] Invalid stop loss price - must be below current price`,
			);
			return null;
		}

		if (decision.takeProfitPrice <= selectedToken.price) {
			logger.warn(
				`[${this.name}] Invalid take profit price - must be above current price`,
			);
			return null;
		}

		// Confidence gating (calibrated-decision discipline): abstain when
		// uncertain, reduce size when lukewarm. Thresholds live in code, not
		// in the model's output.
		if (decision.confidence < this.config.minConfidence) {
			logger.info(
				`[${this.name}] Confidence ${decision.confidence.toFixed(2)} below minimum ${this.config.minConfidence} - skipping`,
			);
			await this.logCalibration({
				dataVersion: CALIBRATION_VERSION,
				action: "skip_low_confidence",
				symbol: selectedToken.symbol,
				regime: decision.regime,
				confidence: decision.confidence,
				opportunityScore: decision.opportunityScore,
				riskScore: decision.riskScore,
				note: `confidence ${decision.confidence} < ${this.config.minConfidence}`,
			});
			return null;
		}
		const sizeFactor =
			decision.confidence < this.config.fullConfidence
				? this.config.lowConfidenceSizeFactor
				: 1;
		const calibrationAction = sizeFactor === 1 ? "buy_full" : "buy_reduced";

		// Calculate trade amount. Size cap enforced in code AFTER the model
		// answers - the model never controls real exposure. Confidence scales
		// the size: lukewarm decisions trade reduced size.
		const buyPercent = Math.max(
			0,
			Math.min(
				decision.buyAmountPercent * sizeFactor,
				this.config.maxBuyAmountPercent,
			),
		);
		if (buyPercent <= 0) {
			logger.info(`[${this.name}] Buy amount resolved to zero - skipping`);
			await this.logCalibration({
				dataVersion: CALIBRATION_VERSION,
				action: "skip_zero_size",
				symbol: selectedToken.symbol,
				regime: decision.regime,
				confidence: decision.confidence,
				opportunityScore: decision.opportunityScore,
				riskScore: decision.riskScore,
			});
			return null;
		}
		await this.logCalibration({
			dataVersion: CALIBRATION_VERSION,
			action: calibrationAction,
			symbol: selectedToken.symbol,
			regime: decision.regime,
			confidence: decision.confidence,
			opportunityScore: decision.opportunityScore,
			riskScore: decision.riskScore,
			buyAmountPercentRaw: decision.buyAmountPercent,
			buyPercentFinal: buyPercent,
			layaRegime: decision.layaRegime ?? null,
			currentPrice: decision.currentPrice,
			stopLossPrice: decision.stopLossPrice,
			takeProfitPrice: decision.takeProfitPrice,
			portfolioValue: params.portfolioSnapshot.totalValue,
			reason: decision.reason.slice(0, 300),
		});
		const tradeValueUsd =
			params.portfolioSnapshot.totalValue * (buyPercent / 100);
		const tradeQuantity = tradeValueUsd / selectedToken.price;

		// Record this pick
		this.previousPicks.push({
			timestamp: Date.now(),
			token: selectedToken.symbol,
			reason: decision.reason,
		});

		// Keep only last 10 picks
		if (this.previousPicks.length > 10) {
			this.previousPicks = this.previousPicks.slice(-10);
		}

		logger.info(
			`[${this.name}] Generating buy signal: ${selectedToken.symbol} price=$${selectedToken.price.toFixed(6)} buyPercent=${buyPercent}% opportunity=${decision.opportunityScore} risk=${decision.riskScore}`,
		);

		return {
			pair: `${selectedToken.address}/SOL`,
			action: TradeType.BUY,
			quantity: tradeQuantity,
			orderType: OrderType.MARKET,
			price: selectedToken.price,
			timestamp: Date.now(),
			reason: `LLM Strategy: ${decision.reason} | Stop: $${decision.stopLossPrice.toFixed(6)} | Target: $${decision.takeProfitPrice.toFixed(6)}`,
		};
	}

	/**
	 * Append a decision record for calibration analysis (does "80% confident"
	 * mean 80% right on our data?). Best-effort: a log failure must never
	 * break trading.
	 */
	private async logCalibration(entry: Record<string, unknown>): Promise<void> {
		const path = this.config.calibrationLogPath;
		if (!path) {
			return;
		}
		try {
			await mkdir(dirname(path), { recursive: true });
			await appendFile(
				path,
				`${JSON.stringify({ ts: Date.now(), ...entry })}\n`,
				"utf8",
			);
		} catch (err) {
			logger.warn(
				`[${this.name}] Calibration log write failed: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	}

	/**
	 * Fetch trending tokens from Birdeye API
	 */
	private async fetchTrendingTokens(
		runtime: IAgentRuntime,
	): Promise<TrendingToken[]> {
		// Check cache
		if (
			Date.now() - this.lastTrendingFetch < this.TRENDING_CACHE_TTL &&
			this.trendingTokensCache.length > 0
		) {
			return this.trendingTokensCache;
		}

		const settingKey = runtime.getSetting("BIRDEYE_API_KEY");
		const apiKey =
			this.config.birdeyeApiKey ||
			(typeof settingKey === "string" ? settingKey : null);
		if (!apiKey) {
			logger.error(`[${this.name}] Birdeye API key not configured`);
			return [];
		}

		const response = await fetch(
			`https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=${this.config.trendingTokensCount}`,
			{
				headers: {
					"X-API-KEY": apiKey,
					"x-chain": "solana",
				},
			},
		);

		if (!response.ok) {
			logger.error(`[${this.name}] Birdeye API error: ${response.status}`);
			return [];
		}

		const data = (await response.json()) as {
			success: boolean;
			data: {
				tokens: Array<{
					address: string;
					symbol: string;
					name: string;
					price: number;
					priceChange24hPercent: number;
					v24hUSD: number;
					liquidity: number;
					mc: number;
					logoURI?: string;
				}>;
			};
		};

		if (!data.success || !data.data?.tokens) {
			logger.warn(`[${this.name}] Invalid Birdeye response`);
			return [];
		}

		// Filter tokens by liquidity and volume
		const filteredTokens = data.data.tokens
			.filter(
				(t) =>
					t.liquidity >= this.config.minLiquidity &&
					t.v24hUSD >= this.config.minVolume24h,
			)
			.map((t) => ({
				address: t.address,
				symbol: t.symbol,
				name: t.name,
				price: t.price,
				priceChange24h: t.priceChange24hPercent,
				volume24h: t.v24hUSD,
				liquidity: t.liquidity,
				marketCap: t.mc,
				logoURI: t.logoURI,
			}));

		this.trendingTokensCache = filteredTokens;
		this.lastTrendingFetch = Date.now();

		logger.info(
			`[${this.name}] Fetched ${filteredTokens.length} trending tokens`,
		);
		return filteredTokens;
	}

	/**
	 * Get trading decision from LLM
	 */
	private async getLLMDecision(
		runtime: IAgentRuntime,
		trendingTokens: TrendingToken[],
		portfolioValue: number,
		layaRegime?: string | null,
		layaConfidence?: number | null,
	): Promise<LLMTradingDecision | null> {
		// Format trending tokens for prompt
		const tokensText = trendingTokens
			.map(
				(t, i) =>
					`${i + 1}. ${t.symbol}: $${t.price.toFixed(6)} | 24h: ${t.priceChange24h.toFixed(2)}% | Vol: $${(t.volume24h / 1e6).toFixed(2)}M | Liq: $${(t.liquidity / 1e6).toFixed(2)}M | MCap: $${(t.marketCap / 1e6).toFixed(2)}M`,
			)
			.join("\n");

		// Format previous picks
		const previousPicksText =
			this.previousPicks.length > 0
				? this.previousPicks
						.map(
							(p) =>
								`${new Date(p.timestamp).toISOString()}: ${p.token} - ${p.reason}`,
						)
						.join("\n")
				: "No previous picks in this session.";

		const systemPrompt =
			"You are an expert cryptocurrency trading analyst. Respond only with valid JSON.";
		let userPrompt = TRADING_DECISION_PROMPT.replace(
			"{{trendingTokens}}",
			tokensText,
		)
			.replace("{{previousPicks}}", previousPicksText)
			.replace("PORTFOLIO_VALUE_PLACEHOLDER", portfolioValue.toFixed(2));

		// Fast local regime read (optional laya gate): a millisecond-scale
		// second opinion the battery can weigh. Clearly marked as possibly
		// wrong — the model treats it as one signal among many.
		if (layaRegime) {
			userPrompt +=
				`\n\nFast local regime read (may be wrong): ${layaRegime}` +
				(layaConfidence != null
					? ` (confidence ${layaConfidence.toFixed(2)})`
					: "") +
				".";
		}

		const response = await this.callLLM(
			runtime,
			`${systemPrompt}\n\n${userPrompt}`,
		);
		if (response === null) {
			return null; // callLLM already logged the reason
		}

		const parsed = parseJSONObjectFromText(response) as Record<
			string,
			unknown
		> | null;
		if (!parsed) {
			logger.warn(
				`[${this.name}] Failed to parse LLM response - skipping decision`,
			);
			return null;
		}

		const decision = this.validateLLMDecision(parsed);
		if (!decision) {
			return null; // validation failure already logged
		}
		decision.layaRegime = layaRegime ?? null;
		decision.layaConfidence = layaConfidence ?? null;

		logger.debug(
			`[${this.name}] LLM decision: pickedNothing=${decision.pickedNothing} buyIndex=${decision.recommendBuyIndex} opportunity=${decision.opportunityScore} risk=${decision.riskScore}`,
		);

		return decision;
	}

	/**
	 * Call the LLM with a hard timeout. Every failure path - exception,
	 * timeout, or empty response - resolves to null (SKIP).
	 */
	private async callLLM(
		runtime: IAgentRuntime,
		prompt: string,
	): Promise<string | null> {
		let timer: ReturnType<typeof setTimeout> | undefined;
		try {
			const result = await Promise.race([
				runtime.useModel(ModelType.TEXT_LARGE, {
					prompt,
					temperature: 0, // replayable, auditable decisions
				}),
				new Promise<never>((_, reject) => {
					timer = setTimeout(
						() =>
							reject(
								new Error(
									`LLM decision timed out after ${this.config.decisionTimeoutMs}ms`,
								),
							),
						this.config.decisionTimeoutMs,
					);
				}),
			]);
			if (typeof result !== "string" || result.trim() === "") {
				logger.warn(`[${this.name}] Empty LLM response - skipping decision`);
				return null;
			}
			return result;
		} catch (err) {
			logger.warn(
				`[${this.name}] LLM call failed - skipping decision: ${err instanceof Error ? err.message : String(err)}`,
			);
			return null;
		} finally {
			if (timer) {
				clearTimeout(timer);
			}
		}
	}

	/**
	 * Strict validation of the LLM decision. Any violation of a
	 * safety-relevant field rejects the entire decision (SKIP) instead of
	 * substituting defaults that could pass as a trade.
	 */
	private validateLLMDecision(
		parsed: Record<string, unknown>,
	): LLMTradingDecision | null {
		const reject = (why: string): null => {
			logger.warn(`[${this.name}] LLM decision rejected: ${why}`);
			return null;
		};

		const num = (value: unknown): number | null => {
			const n =
				typeof value === "number"
					? value
					: typeof value === "string" && value.trim() !== ""
						? Number(value)
						: Number.NaN;
			return Number.isFinite(n) ? n : null;
		};
		const str = (value: unknown): string =>
			typeof value === "string" ? value : "";

		const reason = str(parsed.reason).trim();
		if (reason === "") {
			return reject("missing reason");
		}

		// Calibrated confidence is required on every decision - the policy
		// layer gates on it, so a missing value is fail-closed.
		const confidence = num(parsed.confidence);
		if (confidence === null || confidence < 0 || confidence > 1) {
			return reject("confidence must be a number between 0 and 1");
		}

		const regimeRaw = str(parsed.regime).trim().toLowerCase();
		const regime = KNOWN_REGIMES.includes(regimeRaw) ? regimeRaw : "unknown";

		const pickedNothing =
			parsed.pickedNothing === true || parsed.pickedNothing === "true";
		const rawIndex = num(parsed.recommendBuyIndex);
		const recommendBuyIndex = pickedNothing ? null : rawIndex;
		if (!pickedNothing && recommendBuyIndex === null) {
			return reject("recommendBuyIndex missing while pickedNothing is false");
		}
		if (
			recommendBuyIndex !== null &&
			(!Number.isInteger(recommendBuyIndex) || recommendBuyIndex < 1)
		) {
			return reject(
				`recommendBuyIndex must be a positive integer, got ${recommendBuyIndex}`,
			);
		}

		const opportunityScore = num(parsed.opportunityScore);
		if (
			opportunityScore === null ||
			opportunityScore < 0 ||
			opportunityScore > 100
		) {
			return reject("opportunityScore must be a number between 0 and 100");
		}

		const riskScore = num(parsed.riskScore);
		if (riskScore === null || riskScore < 0 || riskScore > 100) {
			return reject("riskScore must be a number between 0 and 100");
		}

		const rawBuyAmountPercent = num(parsed.buyAmountPercent);
		if (rawBuyAmountPercent === null || rawBuyAmountPercent < 0) {
			return reject(
				`buyAmountPercent must be a non-negative number, got ${String(parsed.buyAmountPercent)}`,
			);
		}
		// Size cap enforced in code AFTER the model answers.
		const buyAmountPercent = Math.min(
			rawBuyAmountPercent,
			this.config.maxBuyAmountPercent,
		);

		const currentPrice = num(parsed.currentPrice);
		if (currentPrice === null || currentPrice <= 0) {
			return reject("currentPrice must be a positive number");
		}

		const stopLossPrice = num(parsed.stopLossPrice);
		if (stopLossPrice === null || stopLossPrice <= 0) {
			return reject("stopLossPrice must be a positive number");
		}

		const takeProfitPrice = num(parsed.takeProfitPrice);
		if (takeProfitPrice === null || takeProfitPrice <= 0) {
			return reject("takeProfitPrice must be a positive number");
		}

		return {
			marketAssessment: str(parsed.marketAssessment),
			regime,
			confidence,
			pickedNothing,
			recommendBuyIndex,
			reason,
			opportunityScore,
			riskScore,
			buyAmountPercent,
			tokenStrengths: str(parsed.tokenStrengths),
			tokenWeaknesses: str(parsed.tokenWeaknesses),
			exitConditions: str(parsed.exitConditions),
			exitLiquidityThreshold:
				num(parsed.exitLiquidityThreshold) ?? this.config.minLiquidity,
			exitVolumeThreshold:
				num(parsed.exitVolumeThreshold) ?? this.config.minVolume24h,
			currentPrice,
			stopLossPrice,
			takeProfitPrice,
			stopLossReasoning: str(parsed.stopLossReasoning),
			takeProfitReasoning: str(parsed.takeProfitReasoning),
		};
	}

	/**
	 * Get recent picks for display
	 */
	public getPreviousPicks(): Array<{
		timestamp: number;
		token: string;
		reason: string;
	}> {
		return [...this.previousPicks];
	}

	/**
	 * Clear the picks history
	 */
	public clearPicks(): void {
		this.previousPicks = [];
	}
}
