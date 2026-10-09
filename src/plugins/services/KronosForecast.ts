/**
 * KronosForecastService — persistent bridge to the Kronos K-line foundation
 * model (shiyu-coder/Kronos, AAAI 2026, MIT): predicts future OHLCV candles
 * from history. Runs locally on Apple Silicon (MPS) — free, private, no API.
 *
 * Default OFF; enable with KRONOS_ENABLED=true + KRONOS_PYTHON pointing at a
 * python with torch installed (e.g. ~/.venvs/kronos/bin/python). The bridge
 * needs KRONOS_HOME (the Kronos repo checkout providing `model`). Weights
 * auto-download from HuggingFace on first load (~once, then cached).
 *
 * Discipline mirrors TradingViewMcp: spawn-once, JSON lines, FIFO matching,
 * generous timeouts (first load = torch import + HF download), and
 * disable-on-failure — bot loop never blocked.
 */

import { spawn } from "node:child_process";
import * as readline from "node:readline";
import { logger, type IAgentRuntime, Service } from "@elizaos/core";

export interface KronosCandle {
	ts: number; // ms epoch
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface KronosForecastSummary {
	lastClose: number;
	predClose: number;
	pctChange: number;
	bandLow: number;
	bandHigh: number;
	direction: string;
}

export interface KronosForecastResult {
	forecast: KronosCandle[];
	summary: KronosForecastSummary;
}

export interface KronosSettings {
	enabled: boolean;
	pythonPath: string;
	bridgePath: string;
	model: string;
	tokenizer: string;
	kronosHome: string;
	predLen: number;
	initTimeoutMs: number;
	callTimeoutMs: number;
}

const DEFAULTS = (): KronosSettings => ({
	enabled: false,
	pythonPath: "python3",
	bridgePath: "scripts/kronos_bridge.py",
	model: "NeoQuasar/Kronos-small",
	tokenizer: "NeoQuasar/Kronos-Tokenizer-base",
	kronosHome: path.resolve(process.cwd(), "..", "tools", "Kronos"),
	predLen: 24,
	initTimeoutMs: 300_000,
	callTimeoutMs: 120_000,
});

export class KronosForecastService extends Service {
	static serviceType = "kronos-forecast";
	capabilityDescription = "K-line foundation-model forecasts via local Kronos";

	private settings: KronosSettings;
	private proc: ReturnType<typeof spawn> | null = null;
	private stdin: NodeJS.WritableStream | null = null;
	private rl: readline.Interface | null = null;
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
		this.settings = DEFAULTS();
	}

	static async start(runtime?: IAgentRuntime): Promise<KronosForecastService> {
		logger.info("*** Starting Kronos Forecast Service ***");
		const svc = new KronosForecastService(runtime);
		if (runtime) await svc.initialize(runtime);
		return svc;
	}

	static async stop(): Promise<void> {
		logger.info("*** Stopping Kronos Forecast Service ***");
	}

	async stop(): Promise<void> {
		this.kill();
	}

	public async initialize(runtime: IAgentRuntime): Promise<void> {
		const env = (key: string) => runtime.getSetting(key);
		this.settings.enabled = String(env("KRONOS_ENABLED") || "") === "true";
		if (env("KRONOS_PYTHON")) this.settings.pythonPath = String(env("KRONOS_PYTHON"));
		if (env("KRONOS_BRIDGE")) this.settings.bridgePath = String(env("KRONOS_BRIDGE"));
		if (env("KRONOS_MODEL")) this.settings.model = String(env("KRONOS_MODEL"));
		if (env("KRONOS_TOKENIZER")) this.settings.tokenizer = String(env("KRONOS_TOKENIZER"));
		if (env("KRONOS_HOME")) this.settings.kronosHome = String(env("KRONOS_HOME"));
		const predLen = Number(env("KRONOS_PRED_LEN"));
		if (Number.isFinite(predLen) && predLen > 0) this.settings.predLen = predLen;
		if (this.settings.enabled) {
			try {
				await this.ensureStarted();
				logger.info(
					`[kronos-forecast] ready: ${this.settings.model} via ${this.settings.pythonPath}`,
				);
			} catch (err) {
				logger.warn(
					`[kronos-forecast] disabled after start failure: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		}
	}

	public isUsable(): boolean {
		return this.settings.enabled && !this.disabled;
	}

	private async ensureStarted(): Promise<void> {
		if (this.proc) return;
		if (this.disabled) {
			throw new Error("kronos bridge disabled after a previous failure");
		}
		const proc = spawn(this.settings.pythonPath, [this.settings.bridgePath], {
			stdio: ["pipe", "pipe", "inherit"],
			env: {
				...process.env,
				KRONOS_HOME: this.settings.kronosHome,
				KRONOS_MODEL: this.settings.model,
				KRONOS_TOKENIZER: this.settings.tokenizer,
			},
		});
		this.proc = proc;
		this.stdin = proc.stdin!;
		const rl = readline.createInterface({ input: proc.stdout! });
		this.rl = rl;

		// Death handlers BEFORE the handshake: a crashed bridge settles the
		// pending wait immediately.
		proc.on("exit", () => {
			this.proc = null;
			this.failPending(new Error("kronos bridge exited unexpectedly"));
		});
		proc.on("error", () => {
			this.failPending(new Error("kronos bridge spawn error"));
		});

		this.nextId += 1;
		// Await the bridge's startup "ready" event READ-ONLY — writing a
		// handshake request would desync the line protocol (the bridge would
		// treat it as a forecast request and answer it later).
		const readyLine = await this.awaitStartupLine(this.settings.initTimeoutMs);
		let readyMsg: { event?: string; error?: string; device?: string };
		try {
			readyMsg = JSON.parse(readyLine) as typeof readyMsg;
		} catch {
			this.disabled = true;
			this.kill();
			throw new Error("kronos bridge: unparseable startup");
		}
		if (readyMsg.event === "fatal" || readyMsg.error) {
			this.disabled = true;
			throw new Error(`kronos bridge failed: ${readyMsg.error ?? readyMsg.event}`);
		}
		if (readyMsg.event !== "ready") {
			this.disabled = true;
			this.kill();
			throw new Error("kronos bridge: unexpected startup line");
		}
		this.ready = true;
	}

	// Read-only wait: resolve the NEXT stdout line without writing anything.
	private async awaitStartupLine(timeoutMs: number): Promise<string> {
		const id = this.nextId;
		return new Promise<string>((resolve, reject) => {
			const timer = setTimeout(() => {
				this.removePending(id);
				reject(new Error(`kronos bridge startup timed out after ${timeoutMs}ms`));
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
			if (!this.pumpInstalled) this.installPump();
		});
	}

	private async awaitLine(
		id: number,
		build: (id: number) => Record<string, unknown>,
		timeoutMs: number,
	): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const timer = setTimeout(() => {
				this.removePending(id);
				reject(new Error(`kronos call timed out after ${timeoutMs}ms`));
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
			if (!this.pumpInstalled) this.installPump();
			this.stdin!.write(JSON.stringify(build(id)) + "\n");
		});
	}

	private pumpInstalled = false;

	private installPump(): void {
		this.pumpInstalled = true;
		this.rl?.on("line", (line: string) => {
			const entry = this.pending.shift();
			if (!entry) return; // unsolicited/stale — drop
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

	/**
	 * Forecast future candles from OHLCV history.
	 * @param symbol informational label
	 * @param candles history, oldest first; best with 200-400 candles
	 * @param predLen future candles to predict (defaults to settings.predLen)
	 */
	public async forecast(
		symbol: string,
		candles: KronosCandle[],
		predLen = this.settings.predLen,
	): Promise<KronosForecastResult> {
		if (!this.isUsable() && !this.settings.enabled) {
			throw new Error("kronos-forecast not enabled");
		}
		await this.ensureStarted();
		this.nextId += 1;
		const id = this.nextId;
		// Flat protocol: the bridge reads id/candles/pred_len at the top level.
		const payload = {
			id,
			method: "forecast",
			symbol,
			candles,
			pred_len: predLen,
		};
		const line = await this.awaitLine(id, () => payload, this.settings.callTimeoutMs);
		let parsed: {
			id: number;
			ok: boolean;
			forecast?: KronosCandle[];
			summary?: KronosForecastSummary;
			error?: string;
		};
		try {
			parsed = JSON.parse(line) as typeof parsed;
		} catch {
			throw new Error("kronos bridge: unparseable forecast response");
		}
		if (parsed.id !== id) {
			throw new Error(`kronos bridge desync: got ${parsed.id} want ${id}`);
		}
		if (!parsed.ok || !parsed.summary) {
			throw new Error(`kronos forecast failed: ${parsed.error ?? "unknown"}`);
		}
		return { forecast: parsed.forecast ?? [], summary: parsed.summary };
	}

	/**
	 * BTC outlook section for the Watchlist Brief: real 1h candles from the
	 * Binance public API (no key), forecast, one formatted line.
	 */
	public async briefSection(fetchFn: typeof fetch = fetch): Promise<string> {
		const candles = await this.fetchBtcCandles(fetchFn);
		if (candles.length < 30) return "";
		const res = await this.forecast("BTC", candles);
		const s = res.summary;
		const fmt = (n: number) =>
			n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toPrecision(3);
		return (
			`🔮 Kronos BTC ${this.settings.predLen}h outlook: ` +
			`${s.pctChange >= 0 ? "+" : ""}${s.pctChange.toFixed(2)}% → ` +
			`$${fmt(s.predClose)} (band $${fmt(s.bandLow)}–$${fmt(s.bandHigh)})`
		);
	}

	private async fetchBtcCandles(fetchFn: typeof fetch): Promise<KronosCandle[]> {
		const res = await fetchFn(
			"https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=200",
			{ signal: AbortSignal.timeout(10_000) },
		);
		if (!res.ok) throw new Error(`binance klines ${res.status}`);
		const raw = (await res.json()) as unknown[][];
		return raw.map((k) => ({
			ts: Number(k[0]),
			open: Number(k[1]),
			high: Number(k[2]),
			low: Number(k[3]),
			close: Number(k[4]),
			volume: Number(k[5]),
		}));
	}
}

import * as path from "node:path";