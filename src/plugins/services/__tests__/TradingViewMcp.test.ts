import { afterAll, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { TradingViewMcpService } from "../TradingViewMcp.ts";

/**
 * A fake MCP server speaking the minimal JSON-RPC surface: initialize,
 * tools/list, tools/call — canned screener output, no network.
 */
const fakeServer = `
import json, sys
def send(o): print(json.dumps(o), flush=True)
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        req = json.loads(line)
    except Exception:
        continue
    mid = req.get("id"); m = req.get("method")
    if m == "initialize":
        send({"jsonrpc":"2.0","id":mid,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"FakeTV","version":"0.1"}}})
    elif m == "tools/list":
        send({"jsonrpc":"2.0","id":mid,"result":{"tools":[{"name":"top_gainers","description":"Top gainers for an exchange"}]}})
    elif m == "tools/call":
        send({"jsonrpc":"2.0","id":mid,"result":{"content":[{"type":"text","text":"BTC +6.1% | SOL +4.2% | PEPE +3.9%"}]}})
`;

const crashingServer = `
import sys
sys.exit(1)
`;

function buildService(script: string): TradingViewMcpService {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tvmcp-test-"));
  const serverPath = path.join(dir, "server.py");
  fs.writeFileSync(serverPath, script, { mode: 0o755 });
  const svc = new TradingViewMcpService();
  (svc as unknown as { settings: Record<string, unknown> }).settings = {
    enabled: true,
    cmd: `python3 ${serverPath}`,
    initTimeoutMs: 10_000,
    callTimeoutMs: 10_000,
  };
  return svc;
}

describe("TradingViewMcp", () => {
  const created: TradingViewMcpService[] = [];

  it("handshakes, lists tools, and calls tools over stdio", async () => {
    const svc = buildService(fakeServer);
    created.push(svc);
    const res = await svc.topMovers("BINANCE"); // triggers start + handshake + call
    expect(res.text).toContain("+6.1%");
    const tools = await svc.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("top_gainers");
    expect(svc.isUsable()).toBe(true);
  });

  it("fails fast when the server crashes during startup", async () => {
    const svc = buildService(crashingServer);
    created.push(svc);
    await expect(svc.topMovers("BINANCE")).rejects.toThrow(
      /exited unexpectedly/,
    );
  });

  afterAll(() => {
    // Persistent child processes keep bun's event loop alive — stop them.
    for (const svc of created) svc.stop();
  });
});