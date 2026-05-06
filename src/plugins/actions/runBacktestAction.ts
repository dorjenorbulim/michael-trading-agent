/**
 * Run Backtest Action
 *
 * Provides backtesting information. Note: Full backtesting requires
 * additional infrastructure (historical data service, simulation engine).
 * This action provides guidance on strategy testing.
 */

import type {
	Action,
	HandlerCallback,
	HandlerOptions,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import type { AutoTradingManager } from "../services/AutoTradingManager.ts";

export const runBacktestAction: Action = {
	name: "RUN_BACKTEST",
	similes: ["BACKTEST", "TEST_STRATEGY", "SIMULATE_TRADING"],
	description: "Get information about backtesting strategies",

				validate: async (runtime: any, message: any, state?: any, options?: any): Promise<boolean> => {
			const __avTextRaw = typeof message?.content?.text === 'string' ? message.content.text : '';
			const __avText = __avTextRaw.toLowerCase();
			const __avKeywords = ['run', 'backtest'];
			const __avKeywordOk =
				__avKeywords.length > 0 &&
				__avKeywords.some((kw) => kw.length > 0 && __avText.includes(kw));
			const __avRegex = new RegExp('\\b(?:run|backtest)\\b', 'i');
			const __avRegexOk = __avRegex.test(__avText);
			const __avSource = String(message?.content?.source ?? message?.source ?? '');
			const __avExpectedSource = '';
			const __avSourceOk = __avExpectedSource
				? __avSource === __avExpectedSource
				: Boolean(__avSource || state || runtime?.agentId || runtime?.getService);
			const __avOptions = options && typeof options === 'object' ? options : {};
			const __avInputOk =
				__avText.trim().length > 0 ||
				Object.keys(__avOptions as Record<string, unknown>).length > 0 ||
				Boolean(message?.content && typeof message.content === 'object');

			if (!(__avKeywordOk && __avRegexOk && __avSourceOk && __avInputOk)) {
				return false;
			}

			const __avLegacyValidate = async (_runtime: IAgentRuntime, message: Memory) => {
		const text = message.content.text?.toLowerCase() || "";
		return ["backtest", "simulation", "test strategy", "simulate"].some((kw) =>
			text.includes(kw),
		);
	};
			try {
				return Boolean(await (__avLegacyValidate as any)(runtime, message, state, options));
			} catch {
				return false;
			}
		},

	handler: async (
		runtime: IAgentRuntime,
		_message: Memory,
		_state?: State,
		_options?: HandlerOptions,
		callback?: HandlerCallback,
	) => {
		const tradingManager = runtime.getService("AutoTradingManager") as
			| AutoTradingManager
			| undefined;
		const strategies = tradingManager?.getStrategies() || [];

		const strategyList = strategies
			.map((s) => `• **${s.name}** (${s.id})`)
			.join("\n");

		const response = `📊 **Backtesting Information**

**Available Strategies:**
${strategyList || "• No strategies loaded"}

**How to Test Strategies:**

1. **Paper Trading Mode** (Recommended)
   Start with paper trading to test strategies without real funds:
   \`\`\`
   "Start paper trading with LLM strategy"
   \`\`\`

2. **Monitor Performance**
   Track your paper trades over time:
   \`\`\`
   "Check portfolio" or "Show performance"
   \`\`\`

3. **Compare Results**
   Run different strategies and compare performance metrics.

**Settings:**
• Set \`TRADING_MODE=paper\` for simulated trading
• Use \`BIRDEYE_API_KEY\` for real market data
• Adjust \`STOP_LOSS_PERCENT\` and \`TAKE_PROFIT_PERCENT\`

**Note:** For production backtesting with historical data, consider using dedicated backtesting tools or running paper trading over extended periods.

Would you like to start paper trading with a specific strategy?`;

		callback?.({ text: response });
		return undefined;
	},

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "Can you run a backtest for the LLM strategy?" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Here is information about testing strategies..." },
			},
		],
	],
};
