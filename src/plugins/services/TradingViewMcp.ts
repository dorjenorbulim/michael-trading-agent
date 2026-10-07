/**
 * TradingViewMcpService — minimal MCP stdio client bridging the bot to the
 * TradingView Multi-Market Screener server (atilaahmettaner/tradingview-mcp,
 * Apache-2.0): 37 tools — screeners, indicators, multi-timeframe reads,
 * sentiment, backtesting, futures/options/equities.
 *
 * Default OFF; enable with TRADINGVIEW_MCP_ENABLED=true + TRADINGVIEW_MCP_CMD
 * (default: "uvx tradingview-mcp-server" — needs uv; or a pip-installed
 * binary path like ~/.venvs/tvmcp/bin/tradingview-mcp).
 *
 * Discipline mirrors LayaGate: spawn-once, JSON-RPC 2.0 over stdio,
 * FIFO request/response matching, timeouts, disable-on-failure. Uses public
 * market data only — no TradingView account involved, ever.
 */

import { spawn } from "node:child_process";
import * as readline from "node:readline";
import { logger, type IAgentRuntime, Service } from "@elizaos/core";

export interface TradingViewMcpSettings {
	enabled: boolean;
	/** e.g. "uvx tradingview-mcp-server" or the pip-installed binary path */
	cmd: string;
	initTimeoutMs: number;
	callTimeoutMs: number;
}

interface McpRpc {
	jsonrpc: string;
	id?: number | string;
	method?: string;
	params?: Record<string, unknown>;
	result?: unknown;
	error?: { code: number; message: string };
}

export interface McpToolResult {
	text: string;
}

export class TradingViewMcpService extends Service {
	static serviceType = "tradingview-mcp";
	capabilityDescription =
		"Market screeners, technical analysis, and backtesting via MCP";

	private settings: TradingViewMcpSettings;
	private proc: ReturnType<typeof spawn> | null = null;
	private stdin: NodeJS.WritableStream | null = null;
	private ready = false;
	private disabled = false;
	private nextId = 0;
	private pending: Array<{
		id: number;
		resolve: (line: string) => void;
		reject: (err: Error) => void;
	}> = [];

	constructor(runtime?: IAgentRuntime) {
		super(runtime);
		this.settings = {
			enabled: false,
			cmd: "uvx tradingview-mcp-server",
			initTimeoutMs: 180_000,
			callTimeoutMs: 45_000,
		};
	}

	static async start(runtime?: IAgentRuntime): Promise<TradingViewMcpService> {
		logger.info("*** Starting TradingView MCP Service ***");
		const svc = new TradingViewMcpService(runtime);
		if (runtime) await svc.initialize(runtime);
		return svc;
	}

	static async stop(): Promise<void> {
		logger.info("*** Stopping TradingView MCP Service ***");
	}

	async stop(): Promise<void> {
		this.kill();
	}

	public async initialize(runtime: IAgentRuntime): Promise<void> {
		const enabled = String(
			runtime.getSetting("TRADINGVIEW_MCP_ENABLED") || "",
		);
		this.settings.enabled = enabled === "true";
		const cmd = runtime.getSetting("TRADINGVIEW_MCP_CMD");
		if (cmd) this.settings.cmd = String(cmd);
		if (this.settings.enabled) {
			try {
				await this.ensureStarted();
				logger.info(
					`[tradingview-mcp] connected: ${this.settings.cmd}`,
				);
			} catch (err) {
				logger.warn(
					`[tradingview-mcp] disabled after start failure: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}
	}

	public isUsable(): boolean {
		return this.settings.enabled && !this.disabled;
	}

	/** Spawn + MCP handshake once. Caller should hold no request in flight. */
	private async ensureStarted(): Promise<void> {
		if (this.proc) return;
		if (this.disabled) {
			throw new Error("tradingview-mcp disabled after a previous failure");
		}
		const parts = this.settings.cmd.split(/\s+/).filter(Boolean);
		const proc = spawn(parts[0], parts.slice(1), {
			stdio: ["pipe", "pipe", "pipe"],
		});
		proc.stderr?.on("data", (d: Buffer) => {
			// server progress goes to stderr; surface trimmed noise only
			const s = d.toString().trim();
			if (s) logger.debug(`[tradingview-mcp stderr] ${s.slice(0, 160)}`);
		});
		this.proc = proc;
		this.stdin = proc.stdin!;

		const rl = readline.createInterface({ input: proc.stdout! });
		this.rl = rl;

		// Death handlers first: a server that crashes during startup must
		// fail the pending handshake immediately, not hang to the timeout.
		proc.on("exit", () => {
			this.proc = null;
			this.failPending(new Error("tradingview-mcp exited unexpectedly"));
		});
		proc.on("error", () => {
			this.failPending(new Error("tradingview-mcp spawn error"));
		});

		this.nextId += 1;
		const initLine = await this.awaitLine(
			this.nextId,
			(id) => ({
				jsonrpc: "2.0",
				id,
				method: "initialize",
				params: {
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: { name: "michael-trading-agent", version: "0.1.0" },
				},
			}),
			this.settings.initTimeoutMs,
		);
		// Verify the handshake actually succeeded before declaring ready.
		let init: McpRpc;
		try {
			init = JSON.parse(initLine) as McpRpc;
		} catch {
			this.disabled = true;
			throw new Error("tradingview-mcp: unparseable handshake");
		}
		if (init.error) {
			this.disabled = true;
			throw new Error(`tradingview-mcp handshake failed: ${init.error.message}`);
		}
		this.stdin.write(
			JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
				"\n",
		);
	}

	private rl: readline.Interface | null = null;

	private async awaitLine(
		id: number,
		build: (id: number) => McpRpc,
		timeoutMs: number,
	): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const timer = setTimeout(() => {
				this.removePending(id);
				reject(new Error(`tradingview-mcp timed out after ${timeoutMs}ms`));
			}, timeoutMs);
			this.pending.push({
				id,
				resolve: (line) => {
					clearTimeout(timer);
					resolve(line);
				},
				reject: (err) => {
					clearTimeout(timer);
					reject(err);
				},
			});
			// Register the FIFO pump once the first request is queued.
			if (!this.pumpInstalled && this.rl) {
				this.installPump();
			}
			this.stdin!.write(JSON.stringify(build(id)) + "\n");
		});
	}

	private pumpInstalled = false;

	private installPump(): void {
		this.pumpInstalled = true;
		this.rl?.on("line", (line: string) => {
			const entry = this.pending.shift();
			if (!entry) return; // stale/unsolicited line — drop
			entry.resolve(line);
		});
	}

	private removePending(id: number): void {
		this.pending = this.pending.filter((p) => p.id !== id);
	}

	private failPending(err: Error): void {
		this.pending.splice(0).forEach((p) => p.reject(err));
	}

	private kill(): void {
		try {
			this.proc?.kill();
		} catch {
			/* already gone */
		}
		this.proc = null;
	}

	/** Generic JSON-RPC request; resolves with the raw response line. */
	private async rpc(
		method: string,
		params?: Record<string, unknown>,
	): Promise<McpRpc> {
		await this.ensureStarted();
		this.nextId += 1;
		const line = await this.awaitLine(
			this.nextId,
			(id) => ({ jsonrpc: "2.0", id, method, params }),
			this.settings.callTimeoutMs,
		);
		let parsed: McpRpc;
		try {
			parsed = JSON.parse(line) as McpRpc;
		} catch {
			throw new Error("tradingview-mcp: unparseable response");
		}
		if (parsed.error) {
			throw new Error(
				`tradingview-mcp ${method}: ${parsed.error.message ?? "error"}`,
			);
		}
		// A timed-out/desynced stream is dangerous — verify the id matches.
		if (parsed.id !== undefined && String(parsed.id) !== String(this.nextId)) {
			throw new Error(
				`tradingview-mcp desync: got id ${JSON.stringify(parsed.id)}`,
			);
		}
		return parsed;
	}

	public async listTools(): Promise<Array<{ name: string; description?: string }>> {
		const res = await this.rpc("tools/list");
		const tools = (res.result as { tools?: Array<{ name: string; description?: string }> })?.tools;
		return Array.isArray(tools) ? tools : [];
	}

	/** Call a tool; returns its first text content block. */
	public async callTool(
		name: string,
		args: Record<string, unknown> = {},
	): Promise<McpToolResult> {
		const res = await this.rpc("tools/call", { name, arguments: args });
		const content = (res.result as { content?: Array<{ type: string; text?: string }> })?.content;
		const text =
			content?.find((c) => c.type === "text")?.text ??
			JSON.stringify(res.result);
		return { text };
	}

	// ---- Typed wrappers over the known 37-tool surface ----

	/** Top gainers/losers on an exchange, e.g. topMovers("BINANCE", "gainers") */
	public async topMovers(
		exchange: string,
		direction: "gainers" | "losers" = "gainers",
	): Promise<McpToolResult> {
		return this.callTool(direction === "gainers" ? "top_gainers" : "top_losers", {
			exchange: exchange.toUpperCase(),
			timeframe: "1d",
		});
	}

	public async coinAnalysis(exchange: string, symbol: string): Promise<McpToolResult> {
		return this.callTool("coin_analysis", {
			exchange: exchange.toUpperCase(),
			symbol: symbol.toUpperCase(),
		});
	}

	public async multiTimeframe(symbol: string): Promise<McpToolResult> {
		return this.callTool("multi_timeframe_analysis", { symbol });
	}

	public async marketSnapshot(): Promise<McpToolResult> {
		return this.callTool("market_snapshot", {});
	}

	public async bitcoinPulse(): Promise<McpToolResult> {
		return this.callTool("bitcoin_market_pulse", {});
	}

	public async backtestStrategy(plan: Record<string, unknown>): Promise<McpToolResult> {
		return this.callTool("backtest_strategy", plan);
	}
}