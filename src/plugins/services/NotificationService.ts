/**
 * Notification Service
 *
 * Sends alerts via Telegram, Discord, and webhooks for trading events.
 */

import { logger, type IAgentRuntime, Service } from "@elizaos/core";

export type NotificationChannel = "telegram" | "discord" | "webhook" | "console";

export interface NotificationConfig {
	channels: NotificationChannel[];
	telegram?: {
		botToken: string;
		chatId: string;
	};
	discord?: {
		webhookUrl: string;
	};
	webhook?: {
		url: string;
		headers?: Record<string, string>;
	};
}

export interface NotificationEvent {
	id: string;
	type: "trade_executed" | "trade_closed" | "alert_triggered" | "risk_warning" | "market_change" | "daily_summary";
	priority: "low" | "medium" | "high" | "critical";
	title: string;
	message: string;
	data?: Record<string, unknown>;
	timestamp: number;
}

export class NotificationService extends Service {
	static serviceType = "notification";
	capabilityDescription = "Sends notifications via multiple channels";

	private runtime: IAgentRuntime;
	private config: NotificationConfig;
	private messageHistory: NotificationEvent[] = [];

	constructor(runtime: IAgentRuntime) {
		super(runtime);
		this.runtime = runtime;
		this.config = { channels: ["console"] };
	}

	static async start(runtime: IAgentRuntime): Promise<NotificationService> {
		logger.info("*** Starting Notification Service ***");
		return new NotificationService(runtime);
	}

	static async stop(runtime: IAgentRuntime): Promise<void> {
		logger.info("*** Stopping Notification Service ***");
	}

	async stop(): Promise<void> {}

	/**
	 * Configure notification channels
	 */
	configure(config: Partial<NotificationConfig>): void {
		this.config = { ...this.config, ...config };
		logger.info({ channels: this.config.channels }, "Notification channels configured");
	}

	/**
	 * Send a notification
	 */
	async send(event: Omit<NotificationEvent, "id" | "timestamp">): Promise<void> {
		const notification: NotificationEvent = {
			id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			...event,
		};

		this.messageHistory.push(notification);

		// Send to all configured channels
		for (const channel of this.config.channels) {
			try {
				switch (channel) {
					case "telegram":
						await this.sendToTelegram(notification);
						break;
					case "discord":
						await this.sendToDiscord(notification);
						break;
					case "webhook":
						await this.sendToWebhook(notification);
						break;
					case "console":
					default:
						this.sendToConsole(notification);
				}
			} catch (error) {
				logger.error({ channel, error }, `Failed to send notification to ${channel}`);
			}
		}

		// Keep only last 1000 messages
		if (this.messageHistory.length > 1000) {
			this.messageHistory = this.messageHistory.slice(-1000);
		}
	}

	/**
	 * Send to Telegram
	 */
	private async sendToTelegram(event: NotificationEvent): Promise<void> {
		if (!this.config.telegram) return;

		const emoji = this.getPriorityEmoji(event.priority);
		const text = `${emoji} *${event.title}*\n\n${event.message}`;

		// Mock sending (in production, use Telegram Bot API)
		logger.info({ chatId: this.config.telegram.chatId }, `Telegram: ${event.title}`);
	}

	/**
	 * Send to Discord
	 */
	private async sendToDiscord(event: NotificationEvent): Promise<void> {
		if (!this.config.discord) return;

		const color = this.getPriorityColor(event.priority);

		// Mock sending (in production, use Discord webhook)
		logger.info({ color }, `Discord: ${event.title}`);
	}

	/**
	 * Send to custom webhook
	 */
	private async sendToWebhook(event: NotificationEvent): Promise<void> {
		if (!this.config.webhook) return;

		// Mock sending
		logger.info({ url: this.config.webhook.url }, `Webhook: ${event.title}`);
	}

	/**
	 * Send to console
	 */
	private sendToConsole(event: NotificationEvent): void {
		const emoji = this.getPriorityEmoji(event.priority);
		logger.info(`\n${emoji} [${event.type.toUpperCase()}] ${event.title}\n${event.message}\n`);
	}

	/**
	 * Get emoji for priority
	 */
	private getPriorityEmoji(priority: NotificationEvent["priority"]): string {
		switch (priority) {
			case "critical":
				return "🚨";
			case "high":
				return "⚠️";
			case "medium":
				return "📢";
			case "low":
			default:
				return "ℹ️";
		}
	}

	/**
	 * Get color for priority
	 */
	private getPriorityColor(priority: NotificationEvent["priority"]): number {
		switch (priority) {
			case "critical":
				return 0xff0000;
			case "high":
				return 0xffa500;
			case "medium":
				return 0xffff00;
			case "low":
			default:
				return 0x00ff00;
		}
	}

	/**
	 * Send trade execution notification
	 */
	async notifyTradeExecuted(params: {
		symbol: string;
		side: string;
		amount: number;
		price: number;
		strategy: string;
	}): Promise<void> {
		await this.send({
			type: "trade_executed",
			priority: "medium",
			title: `Trade Executed: ${params.side} ${params.symbol}`,
			message: `${params.side} ${params.amount} ${params.symbol} @ $${params.price.toFixed(6)}\nStrategy: ${params.strategy}`,
			data: params,
		});
	}

	/**
	 * Send trade closed notification
	 */
	async notifyTradeClosed(params: {
		symbol: string;
		pnl: number;
		pnlPercent: number;
		exitReason: string;
	}): Promise<void> {
		const isProfit = params.pnl >= 0;
		await this.send({
			type: "trade_closed",
			priority: isProfit ? "medium" : "high",
			title: `Trade ${isProfit ? "Profit" : "Loss"}: ${params.symbol}`,
			message: `${isProfit ? "🟢" : "🔴"} PnL: $${params.pnl.toFixed(2)} (${params.pnlPercent.toFixed(2)}%)\nReason: ${params.exitReason}`,
			data: params,
		});
	}

	/**
	 * Send risk alert
	 */
	async notifyRiskAlert(params: {
		alertType: string;
		message: string;
		value: number;
		threshold: number;
	}): Promise<void> {
		await this.send({
			type: "risk_warning",
			priority: "high",
			title: `Risk Alert: ${params.alertType}`,
			message: params.message,
			data: params,
		});
	}

	/**
	 * Send daily summary
	 */
	async notifyDailySummary(params: {
		dailyPnL: number;
		dailyPnLPercent: number;
		totalTrades: number;
		winRate: number;
	}): Promise<void> {
		const isProfit = params.dailyPnL >= 0;
		await this.send({
			type: "daily_summary",
			priority: "low",
			title: "Daily Trading Summary",
			message: `${isProfit ? "🟢" : "🔴"} Daily PnL: $${params.dailyPnL.toFixed(2)} (${params.dailyPnLPercent.toFixed(2)}%)\nTrades: ${params.totalTrades} | Win Rate: ${(params.winRate * 100).toFixed(1)}%`,
			data: params,
		});
	}

	/**
	 * Get message history
	 */
	getHistory(limit: number = 50): NotificationEvent[] {
		return this.messageHistory.slice(-limit).reverse();
	}
}
