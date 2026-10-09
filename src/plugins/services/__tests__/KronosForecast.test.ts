import { afterAll, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { KronosForecastService, type KronosCandle } from "../KronosForecast.ts";

/**
 * Fake bridge: startup ready event + canned forecast responses — no MLX,
 * no torch, no model download. The real bridge is exercised manually.
 */
const fakeBridge = `
import json, sys
print(json.dumps({"event": "ready", "device": "cpu"}), flush=True)
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    req = json.loads(line)
    candles = req.get("candles") or [{"close": 100}]
    last = candles[-1].get("close", 100)
    pred_len = req.get("pred_len") or 24
    forecast = [{"ts": 0, "open": last, "high": last * 1.02, "low": last * 0.99,
                 "close": last * 1.01, "volume": 1} for _ in range(pred_len)]
    print(json.dumps({"id": req["id"], "ok": True, "forecast": forecast,
        "summary": {"lastClose": last, "predClose": last * 1.01, "pctChange": 1.0,
                    "bandLow": last * 0.99, "bandHigh": last * 1.02,
                    "direction": "up"}}), flush=True)
`;

const crashingBridge = `
import sys
sys.exit(1)
`;

function buildService(script: string): KronosForecastService {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kronos-test-"));
  const bridgePath = path.join(dir, "bridge.py");
  fs.writeFileSync(bridgePath, script, { mode: 0o755 });
  const svc = new KronosForecastService();
  (svc as unknown as { settings: Record<string, unknown> }).settings = {
    enabled: true,
    pythonPath: "python3",
    bridgePath,
    kronosHome: dir,
    initTimeoutMs: 10_000,
    callTimeoutMs: 10_000,
  };
  return svc;
}

const candles: KronosCandle[] = Array.from({ length: 60 }, (_, i) => ({
  ts: 1700000000000 + i * 3600000,
  open: 100,
  high: 101,
  low: 99,
  close: 100.5,
  volume: 10,
}));

describe("KronosForecast", () => {
  const created: KronosForecastService[] = [];

  it("handshakes and forecasts over the bridge protocol", async () => {
    const svc = buildService(fakeBridge);
    created.push(svc);
    const res = await svc.forecast("BTC", candles);
    expect(res.summary.direction).toBe("up");
    expect(res.summary.pctChange).toBeGreaterThan(0);
    expect(res.forecast).toHaveLength(24);
    expect(res.forecast[0].close).toBeCloseTo(100.5 * 1.01, 2);
  });

  it("passes pred_len overrides through", async () => {
    const svc = buildService(fakeBridge);
    created.push(svc);
    const res = await svc.forecast("BTC", candles, 5);
    expect(res.forecast).toHaveLength(5);
  });

  it("fails fast when the bridge crashes during startup", async () => {
    const svc = buildService(crashingBridge);
    created.push(svc);
    await expect(svc.forecast("BTC", candles)).rejects.toThrow();
  });

  afterAll(() => {
    // Persistent bridges keep bun's event loop alive — stop them.
    for (const svc of created) svc.stop();
  });
});