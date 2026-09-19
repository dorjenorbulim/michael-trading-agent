import type { IAgentRuntime } from "@elizaos/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	AgentState,
	PortfolioSnapshot,
	StrategyContextMarketData,
} from "../../types.ts";
import { TradeType } from "../../types.ts";
import { LLMStrategy } from "../LLMStrategy.ts";

/**
 * Tests for the LLM strategy's "brain contract":
 *  - the model answers in strict JSON; any schema violation rejects the decision
 *  - every failure path (exception, timeout, parse failure, empty response)
 *    resolves to SKIP instead of throwing or trading
 *  - position size is capped in code after the model answers
 *  - the model-reported price is cross-checked against market data
 */

interface MockRuntimeOptions {
	decideTimeoutMs?: number;
	birdeyeOk?: boolean;
}

const createMockRuntime = (options: MockRuntimeOptions = {}) => {
	const useModel = vi.fn();
	const mock = {
		_settings: new Map<string, string>([
			["BIRDEYE_API_KEY", "test-birdeye-key"],
		]),
		getSetting: vi.fn((key: string) => mock._settings.get(key)),
		getService: vi.fn(() => undefined),
		useModel,
		logger: {
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			info: vi.fn(),
		},
	} as unknown as IAgentRuntime & {
		_settings: Map<string, string>;
		useModel: ReturnType<typeof vi.fn>;
		logger: Record<"warn" | "error" | "debug" | "info", ReturnType<typeof vi.fn>>;
	};
	void options;
	return mock;
};

const BIRDEYE_TOKEN = {
	address: "AddrTest1111111111111111111111111111111111",
	symbol: "TEST",
	name: "Test Token",
	price: 1.0,
	priceChange24hPercent: 5,
	v24hUSD: 500000,
	liquidity: 200000,
	mc: 10000000,
	logoURI: "",
};

const birdeyeResponse = (ok: boolean) => ({
	ok,
	json: async () =>
		ok
			? { success: true, data: { tokens: [BIRDEYE_TOKEN] } }
			: { success: false },
});

const VALID_DECISION = {
	marketAssessment: "Mixed market with one strong candidate",
	pickedNothing: false,
	recommendBuyIndex: 1,
	reason: "strong momentum and healthy liquidity",
	opportunityScore: 80,
	riskScore: 30,
	buyAmountPercent: 10,
	tokenStrengths: "high volume",
	tokenWeaknesses: "volatile",
	exitConditions: "liquidity drain",
	exitLiquidityThreshold: 50000,
	exitVolumeThreshold: 100000,
	currentPrice: 1.0,
	stopLossPrice: 0.95,
	takeProfitPrice: 1.2,
	stopLossReasoning: "below support",
	takeProfitReasoning: "at resistance",
};

const PORTFOLIO_VALUE = 50000;

describe("LLMStrategy brain contract", () => {
	let mockRuntime: ReturnType<typeof createMockRuntime>;
	let strategy: LLMStrategy;
	let decideArgs: {
		marketData: StrategyContextMarketData;
		agentState: AgentState;
		portfolioSnapshot: PortfolioSnapshot;
		agentRuntime: IAgentRuntime;
	};
	const realFetch = globalThis.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRuntime = createMockRuntime();
		strategy = new LLMStrategy({
			birdeyeApiKey: "test-birdeye-key",
			decisionTimeoutMs: 200,
		});
		(globalThis as unknown as { fetch: unknown }).fetch = vi
			.fn()
			.mockResolvedValue(birdeyeResponse(true));
	});

	afterEach(() => {
		(globalThis as unknown as { fetch: unknown }).fetch = realFetch;
		vi.restoreAllMocks();
	});

	const decideOnce = async () => {
		await strategy.initialize(mockRuntime);
		return strategy.decide({
			marketData: {} as StrategyContextMarketData,
			agentState: {} as AgentState,
			portfolioSnapshot: {
				timestamp: Date.now(),
				holdings: {},
				totalValue: PORTFOLIO_VALUE,
			},
			agentRuntime: mockRuntime,
		});
	};

	const llmReply = (payload: unknown) => {
		mockRuntime.useModel.mockResolvedValue(JSON.stringify(payload));
	};

	it("returns a BUY order on a valid decision", async () => {
		llmReply(VALID_DECISION);
		const order = await decideOnce();
		expect(order).not.toBeNull();
		expect(order?.action).toBe(TradeType.BUY);
		expect(order?.pair).toBe(`${BIRDEYE_TOKEN.address}/SOL`);
		expect(order?.quantity).toBeCloseTo((PORTFOLIO_VALUE * 0.1) / 1.0, 6);
	});

	it("passes temperature 0 to the LLM call", async () => {
		llmReply(VALID_DECISION);
		await decideOnce();
		expect(mockRuntime.useModel).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ temperature: 0 }),
		);
	});

	it("skips when the LLM picks nothing", async () => {
		llmReply({ ...VALID_DECISION, pickedNothing: true });
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when the LLM call throws (errors resolve to SKIP)", async () => {
		mockRuntime.useModel.mockRejectedValue(new Error("provider down"));
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when the LLM call times out", async () => {
		strategy = new LLMStrategy({
			birdeyeApiKey: "test-birdeye-key",
			decisionTimeoutMs: 25,
		});
		mockRuntime.useModel.mockImplementation(() => new Promise(() => {}));
		await strategy.initialize(mockRuntime);
		const order = await strategy.decide({
			marketData: {} as StrategyContextMarketData,
			agentState: {} as AgentState,
			portfolioSnapshot: {
				timestamp: Date.now(),
				holdings: {},
				totalValue: PORTFOLIO_VALUE,
			},
			agentRuntime: mockRuntime,
		});
		expect(order).toBeNull();
	});

	it("skips on an unparseable LLM response", async () => {
		mockRuntime.useModel.mockResolvedValue("I think we should buy!!!");
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips on an empty LLM response", async () => {
		mockRuntime.useModel.mockResolvedValue("   ");
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when recommendBuyIndex is not a positive integer", async () => {
		llmReply({ ...VALID_DECISION, recommendBuyIndex: 0 });
		expect(await decideOnce()).toBeNull();

		llmReply({ ...VALID_DECISION, recommendBuyIndex: 1.5 });
		expect(await decideOnce()).toBeNull();

		llmReply({ ...VALID_DECISION, recommendBuyIndex: "abc" });
		expect(await decideOnce()).toBeNull();
	});

	it("skips when recommendBuyIndex is out of range", async () => {
		llmReply({ ...VALID_DECISION, recommendBuyIndex: 99 });
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when reason is missing or empty", async () => {
		llmReply({ ...VALID_DECISION, reason: "" });
		expect(await decideOnce()).toBeNull();
		llmReply({ ...VALID_DECISION, reason: "   " });
		expect(await decideOnce()).toBeNull();
		llmReply({ ...VALID_DECISION, reason: undefined });
		expect(await decideOnce()).toBeNull();
	});

	it("skips when opportunity or risk scores are invalid", async () => {
		llmReply({ ...VALID_DECISION, opportunityScore: 200 });
		expect(await decideOnce()).toBeNull();

		llmReply({ ...VALID_DECISION, riskScore: "high" });
		expect(await decideOnce()).toBeNull();
	});

	it("caps buyAmountPercent at the configured maximum", async () => {
		strategy = new LLMStrategy({
			birdeyeApiKey: "test-birdeye-key",
			maxBuyAmountPercent: 15,
		});
		await strategy.initialize(mockRuntime);
		llmReply({ ...VALID_DECISION, buyAmountPercent: 100 });
		const order = await strategy.decide({
			marketData: {} as StrategyContextMarketData,
			agentState: {} as AgentState,
			portfolioSnapshot: {
				timestamp: Date.now(),
				holdings: {},
				totalValue: PORTFOLIO_VALUE,
			},
			agentRuntime: mockRuntime,
		});
		expect(order).not.toBeNull();
		expect(order?.quantity).toBeCloseTo((PORTFOLIO_VALUE * 0.15) / 1.0, 6);
	});

	it("skips when the model-reported price deviates too far from market data", async () => {
		llmReply({ ...VALID_DECISION, currentPrice: 2.0 });
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when stop loss or take profit are invalid vs the real price", async () => {
		llmReply({ ...VALID_DECISION, stopLossPrice: 1.05 });
		expect(await decideOnce()).toBeNull();

		llmReply({ ...VALID_DECISION, takeProfitPrice: 0.9 });
		expect(await decideOnce()).toBeNull();
	});

	it("skips when market data has a non-positive price", async () => {
		(globalThis as unknown as { fetch: unknown }).fetch = vi
			.fn()
			.mockResolvedValue({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						tokens: [{ ...BIRDEYE_TOKEN, price: 0 }],
					},
				}),
			});
		llmReply(VALID_DECISION);
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("skips when the Birdeye API fails", async () => {
		(globalThis as unknown as { fetch: unknown }).fetch = vi
			.fn()
			.mockResolvedValue(birdeyeResponse(false));
		llmReply(VALID_DECISION);
		const order = await decideOnce();
		expect(order).toBeNull();
	});

	it("resolves unexpected internal errors to SKIP instead of throwing", async () => {
		await strategy.initialize(mockRuntime);
		// Break settings only for the decision phase - initialize is allowed to fail loudly.
		mockRuntime.getSetting.mockImplementation(() => {
			throw new Error("settings backend exploded");
		});
		llmReply(VALID_DECISION);
		const order = await strategy.decide({
			marketData: {} as StrategyContextMarketData,
			agentState: {} as AgentState,
			portfolioSnapshot: {
				timestamp: Date.now(),
				holdings: {},
				totalValue: PORTFOLIO_VALUE,
			},
			agentRuntime: mockRuntime,
		});
		expect(order).toBeNull();
	});
});