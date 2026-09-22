import { afterAll, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { LayaGate } from "../LayaGate.ts";

/**
 * Tests for the LayaGate JSON-lines protocol using a fake bridge — no MLX,
 * no model download. The real bridge script is exercised manually.
 */

// The fake bridge logs "start" once and "req" per request to LAYA_LOG, so
// the reuse test can prove the process persists across calls.
const fakeBridge = `
import json, sys, os
log = os.environ.get("LAYA_LOG")
if log:
    with open(log, "a") as f:
        f.write("start\\n")
print(json.dumps({"event": "ready"}), flush=True)
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    req = json.loads(line)
    if log:
        with open(log, "a") as f:
            f.write("req\\n")
    print(json.dumps({"id": req["id"], "ok": True,
        "answers": {"regime": {"type": "choice", "confidence": 0.87,
        "choice": "trending", "probabilities": {"trending": 0.87}}}}), flush=True)
`;

const crashingBridge = `
print("crash", flush=True)
import sys
sys.exit(1)
`;

function writeBridge(script: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "laya-test-"));
  const bridgePath = path.join(dir, "bridge.py");
  fs.writeFileSync(bridgePath, script, { mode: 0o755 });
  return bridgePath;
}

describe("LayaGate", () => {
  const gates: LayaGate[] = [];

  it("classifies a regime over the bridge protocol", async () => {
    const gate = new LayaGate({
      pythonPath: "python3",
      bridgePath: writeBridge(fakeBridge),
      model: "test-model",
    });
    gates.push(gate);
    const regime = await gate.classifyRegime({ price: 118000 });
    expect(regime).not.toBeNull();
    expect(regime?.choice).toBe("trending");
    expect(regime?.confidence).toBeGreaterThan(0.5);
    expect(gate.isUsable()).toBe(true);
  });

  it("reuses the same bridge process across calls", async () => {
    const logPath = path.join(os.tmpdir(), `laya-log-${Date.now()}.txt`);
    process.env.LAYA_LOG = logPath;
    const gate = new LayaGate({
      pythonPath: "python3",
      bridgePath: writeBridge(fakeBridge),
      model: "test-model",
    });
    gates.push(gate);
    try {
      await gate.classifyRegime({ a: 1 });
      await gate.classifyRegime({ b: 2 });
      const log = fs.readFileSync(logPath, "utf8");
      expect(log.split("start").length - 1).toBe(1); // one spawn, model stays loaded
      expect(log.split("req").length - 1).toBe(2); // two requests through it
    } finally {
      delete process.env.LAYA_LOG;
    }
  });

  it("disables after a crashing bridge", async () => {
    const gate = new LayaGate({
      pythonPath: "python3",
      bridgePath: writeBridge(crashingBridge),
      model: "test-model",
    });
    gates.push(gate);
    await expect(gate.classifyRegime({ x: 1 })).rejects.toThrow();
    await expect(gate.classifyRegime({ x: 2 })).rejects.toThrow(/disabled/);
    expect(gate.isUsable()).toBe(false);
  });

  afterAll(() => {
    // Persistent bridges keep the event loop alive — stop them so bun exits.
    for (const gate of gates) {
      gate.stop();
    }
  });
});