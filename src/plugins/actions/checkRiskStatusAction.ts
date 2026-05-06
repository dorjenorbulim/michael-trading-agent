/**
 * Check Risk Status Action
 *
 * View real-time risk metrics, alerts, and circuit breaker status.
 */

import type {
	Action,
	ActionResult,
	Content,
	HandlerCallback,
	IAgentRuntime,
	Memory,
	State,
} from "@elizaos/core";
import { RiskDashboard } from "../services/RiskDashboard.ts";

export const checkRiskStatusAction: Action = {
	name: "CHECK_RISK_STATUS",
	similes: [
		"RISK_DASHBOARD",
		"VIEW_RISK",
		"RISK_METRICS",
		"PORTFOLIO_RISK",
		"RISK_LEVEL",
	],
	description: "View real-time risk metrics, alerts, and circuit breaker status",

	validate: async function(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
		const text = message.content.text?.toLowerCase() || "";
		return [
			"risk status",
			"risk dashboard",
			"check risk",
			"view risk",
			"risk metrics",
			"portfolio risk",
			"risk level",
			"any alerts",
		].some((kw) => text.includes(kw));
	},

	handler: async function(
		runtime: IAgentRuntime,
		_message: Memory,
		_state?: State,
		_options?: any,
		callback?: HandlerCallback
	): Promise<ActionResult> {
		try {
			const dashboard = runtime.getService("risk-dashboard") as RiskDashboard | undefined;

			if (!dashboard) {
				callback?.({
					text: "⚠️ Risk Dashboard not initialized. Start trading first to activate risk monitoring.",
				});
				return {
					text: "Risk dashboard not available",
					success: false,
				};
			}

			const status = dashboard.formatStatus();

			callback?.({
				text: status,
				actions: ["CHECK_RISK_STATUS"],
			});

			return {
				text: "Risk status displayed",
				success: true,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			callback?.({
				text: `❌ Error checking risk status: ${errorMessage}`,
			});

			return {
				text: "Failed to check risk status",
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	},

	examples: [
		[
			{
				name: "{{user1}}",
				content: { text: "Check risk status" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Current risk metrics..." },
			},
		],
		[
			{
				name: "{{user1}}",
				content: { text: "View risk dashboard" },
			},
			{
				name: "{{agentName}}",
				content: { text: "Risk dashboard status..." },
			},
		],
	],
};
