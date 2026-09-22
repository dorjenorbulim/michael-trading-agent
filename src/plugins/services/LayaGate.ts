// LayaGate — fast local typed-decision layer for the trading bot via
// laya-mlx (Apple Silicon, MLX). Speaks JSON lines with a persistent Python
// bridge so the model loads once (~35s) and every classification is a
// millisecond-scale local call.
//
// Optional reflex layer: every failure degrades to null and the LLM
// strategy continues exactly as before.
import { spawn } from "node:child_process";
import * as readline from "node:readline";

export interface LayaChoiceAnswer {
  type?: string;
  choice?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
}

export interface LayaRegime {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface LayaGateSettings {
  pythonPath: string;
  bridgePath: string;
  model: string;
  spawnTimeoutMs?: number;
  requestTimeoutMs?: number;
}

interface BridgeLine {
  event?: string;
  error?: string;
  id?: string;
  ok?: boolean;
  answers?: Record<string, unknown>;
}

export const REGIME_QUESTIONS = {
  regime: {
    type: "choice",
    instructions:
      "Which market regime best describes the current market state?",
    criteria: ["trending", "mean_reverting", "high_vol", "chaotic"],
  },
};

export class LayaGate {
  private settings: Required<LayaGateSettings>;
  private proc: ReturnType<typeof spawn> | null = null;
  private ready = false;
  private disabled = false;
  private nextId = 0;
  private pending: Array<{
    id: string;
    resolve: (line: string) => void;
    reject: (err: Error) => void;
    timer: NodeJS.Timeout;
  }> = [];

  constructor(settings: LayaGateSettings) {
    this.settings = {
      spawnTimeoutMs: settings.spawnTimeoutMs ?? 120_000,
      requestTimeoutMs: settings.requestTimeoutMs ?? 15_000,
      pythonPath: settings.pythonPath,
      bridgePath: settings.bridgePath,
      model: settings.model,
    };
  }

  /** Kill the bridge process (tests, shutdown). A later call respawns it. */
  stop(): void {
    try {
      this.proc?.kill();
    } catch {
      /* already gone */
    }
    this.proc = null;
    this.ready = false;
    this.failPending(new Error("laya bridge stopped"));
  }

  /** Spawn the bridge once and wait for the model to load. */
  private async ensureStarted(): Promise<void> {
    if (this.proc) return;
    if (this.disabled) {
      throw new Error("laya bridge disabled after a previous failure");
    }
    const proc = spawn(
      this.settings.pythonPath,
      [this.settings.bridgePath, this.settings.model],
      { stdio: ["pipe", "pipe", "inherit"] },
    );
    const rl = readline.createInterface({ input: proc.stdout! });
    this.proc = proc;
    this.rl = rl;

    // Startup: wait for {"event": "ready"} within the spawn timeout. If the
    // bridge dies during load, readline emits "close" (not "line") — settle
    // the wait immediately instead of hanging until the spawn timeout.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.disabled = true;
        try {
          proc.kill();
        } catch {
          /* already gone */
        }
        reject(new Error(`laya bridge startup timed out after ${this.settings.spawnTimeoutMs}ms`));
      }, this.settings.spawnTimeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        rl.off("line", onData);
        rl.off("close", onDeath);
        proc.off("exit", onDeath);
        proc.off("error", onDeath);
      };
      const onData = (line: string) => {
        try {
          const msg = JSON.parse(line) as BridgeLine;
          if (msg.event === "ready") {
            cleanup();
            this.ready = true;
            resolve();
            return;
          }
          if (msg.event === "fatal") {
            cleanup();
            this.disabled = true;
            reject(new Error(`laya model load failed: ${msg.error}`));
          }
        } catch {
          /* non-JSON startup noise — ignore */
        }
      };
      const onDeath = () => {
        cleanup();
        this.disabled = true;
        reject(new Error("laya bridge exited during model load"));
      };
      rl.on("line", onData);
      rl.on("close", onDeath);
      proc.on("exit", onDeath);
      proc.on("error", onDeath);
    }).catch((err) => {
      this.disabled = true;
      this.proc = null;
      throw err;
    });

    // After startup, feed every subsequent line to pending requests (FIFO).
    rl.on("line", (line: string) => this.handleLine(line));
    proc.on("exit", () => {
      this.proc = null;
      this.failPending(new Error("laya bridge exited unexpectedly"));
    });
  }

  private handleLine(line: string): void {
    let parsed: BridgeLine;
    try {
      parsed = JSON.parse(line) as BridgeLine;
    } catch {
      return; // non-JSON noise
    }
    if (parsed.event) {
      return; // startup/system events have no pending request
    }
    const entry = this.pending.shift();
    if (!entry) {
      return; // stale response — drop it
    }
    clearTimeout(entry.timer);
    entry.resolve(line);
  }

  private failPending(err: Error): void {
    for (const entry of this.pending.splice(0)) {
      clearTimeout(entry.timer);
      entry.reject(err);
    }
  }

  /** Run one classify request. Caller should hold no expectations on errors. */
  async classify(
    text: string,
    questions: Record<string, unknown>,
  ): Promise<Record<string, LayaChoiceAnswer>> {
    if (this.disabled) {
      throw new Error("laya bridge disabled after a previous failure");
    }
    await this.ensureStarted();
    this.nextId += 1;
    const id = String(this.nextId);

    return new Promise<Record<string, LayaChoiceAnswer>>((resolve, reject) => {
      const timer = setTimeout(() => {
        // A timed-out request leaves the pipe desynced — kill and disable.
        this.disabled = true;
        try {
          this.proc?.kill();
        } catch {
          /* already dead */
        }
        this.proc = null;
        this.pending = this.pending.filter((e) => e.id !== id);
        reject(new Error(`laya classify timed out after ${this.settings.requestTimeoutMs}ms`));
      }, this.settings.requestTimeoutMs);

      this.pending.push({ id, resolve, reject, timer });
      this.proc?.stdin?.write(JSON.stringify({ id, text, questions }) + "\n");
    }).then((raw) => {
      const line = raw as unknown as string;
      const res = JSON.parse(line) as {
        id: string;
        ok: boolean;
        answers: Record<string, LayaChoiceAnswer>;
        error?: string;
      };
      if (res.id !== id) {
        throw new Error(`laya bridge desync: got id ${res.id} want ${id}`);
      }
      if (!res.ok) {
        throw new Error(`laya classify failed: ${res.error}`);
      }
      return res.answers;
    });
  }

  /**
   * Market-regime classification — the trading bot's decision-gate read.
   * Returns null when laya is unavailable (caller degrades silently).
   */
  async classifyRegime(
    state: Record<string, unknown>,
  ): Promise<LayaRegime | null> {
    const answers = await this.classify(
      `Market state: ${JSON.stringify(state)}. Classify the regime.`,
      REGIME_QUESTIONS,
    );
    const regime = answers?.regime;
    if (!regime || typeof regime.choice !== "string") {
      return null;
    }
    return {
      choice: regime.choice,
      confidence: Number(regime.confidence ?? 0),
      probabilities: (regime.probabilities as Record<string, number>) ?? {},
    };
  }

  /** True while the runner believes the bridge is usable. */
  isUsable(): boolean {
    return !this.disabled;
  }
}