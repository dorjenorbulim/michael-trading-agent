import type {
	Action,
	HandlerCallback,
	HandlerOptions,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import type { AutoTradingManager } from "../services/AutoTradingManager.ts";

export const stopTradingAction: Action = {
	name: "STOP_TRADING",
	description: "Stop automated trading",

	examples: [
		[
			{
				name: "{{user1}}",
				content: {
					text: "Stop trading",
				},
			},
			{
				name: "{{agentName}}",
				content: {
					text: "Stopping automated trading. All positions remain open. You can check your portfolio status anytime.",
				},
			},
		],
		[
			{
				name: "{{user1}}",
				content: {
					text: "Pause auto-trader",
				},
			},
			{
				name: "{{agentName}}",
				content: {
					text: "Auto-trading has been paused. Your open positions will not be affected. You can restart trading whenever you're ready.",
				},
			},
		],
	],

				validate: async (runtime: any, message: any, state?: any, options?: any): Promise<boolean> => {
			const __avTextRaw = typeof message?.content?.text === 'string' ? message.content.text : '';
			const __avText = __avTextRaw.toLowerCase();
			const __avKeywords = ['stop', 'trading'];
			const __avKeywordOk =
				__avKeywords.length > 0 &&
				__avKeywords.some((kw) => kw.length > 0 && __avText.includes(kw));
			const __avRegex = new RegExp('\\b(?:stop|trading)\\b', 'i');
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
		const text = (message.content.text || "").toLowerCase();
		return (
			text.includes("stop") || text.includes("pause") || text.includes("halt")
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
		try {
			const autoTradingManager = runtime.getService(
				"AutoTradingManager",
			) as AutoTradingManager;
			if (!autoTradingManager) {
				throw new Error("AutoTradingManager not found");
			}

			const status = autoTradingManager.getStatus();
			const wasTrading = status.isTrading;
			await autoTradingManager.stopTrading();

			let response = "";
			if (wasTrading) {
				const positions = status.positions;
				const dailyPnL = status.performance.dailyPnL;

				response = `🛑 Auto-trading stopped.

📊 Current Status:
• Open positions: ${positions.length}
• Today's P&L: ${dailyPnL >= 0 ? "+" : ""}$${dailyPnL.toFixed(2)}

Your open positions will remain active. You can:
- Check portfolio status anytime
- Restart trading when ready
- Manually manage positions if needed`;
			} else {
				response = "Auto-trading is not currently active.";
			}

			if (callback) {
				callback({
					text: response,
					action: "STOP_TRADING",
				});
			}

			return undefined;
		} catch (error) {
			logger.error(
				"Error stopping trading:",
				error instanceof Error ? error.message : String(error),
			);

			if (callback) {
				callback({
					text: `Failed to stop trading: ${error instanceof Error ? error.message : "Unknown error"}`,
					action: "STOP_TRADING",
				});
			}

			return undefined;
		}
	},
};
