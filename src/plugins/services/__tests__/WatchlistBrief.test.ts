import { describe, expect, it } from "vitest";
import { WatchlistBrief, type MarketRow } from "../WatchlistBrief.ts";

describe("WatchlistBrief", () => {
  const svc = new WatchlistBrief();

  it("compiles a deterministic brief with moved symbols flagged", () => {
    const rows: MarketRow[] = [
      { symbol: "BTC", priceUsd: 118234.12, change24h: 2.45 },
      { symbol: "SOL", priceUsd: 231.08, change24h: -3.2 },
    ];
    const brief = svc.compileBrief(
      rows,
      { BTC: 0.42 },
      ["PEPE"],
      new Date("2026-10-05T07:12:00Z"),
    );
    expect(brief).toContain("Watchlist Brief");
    expect(brief).toContain("🟢 BTC");
    expect(brief).toContain("+2.5% 24h");
    expect(brief).toContain("🔴 SOL:");
    expect(brief).toContain("-3.2% 24h");
    expect(brief).toContain("sentiment +0.42");
    expect(brief).toContain("🔥 Trending: PEPE");
  });

  it("handles an empty market gracefully", () => {
    const brief = svc.compileBrief(
      [],
      {},
      [],
      new Date("2026-10-05T07:12:00Z"),
    );
    expect(brief).toContain("Market data unavailable");
  });

  it("polls CoinGecko and delivers the brief through notifications", async () => {
    let briefText = "";
    const fakeRuntime = {
      getService: (type: string) => {
        if (type === "notification") {
          return {
            send: async (ev: { message: string }) => {
              briefText = ev.message;
            },
          };
        }
        return null;
      },
    };
    (svc as unknown as { runtime: unknown }).runtime = fakeRuntime;
    // No sentiment service in the fake runtime — the brief continues without it.
    const fakeFetch = (async (url: unknown) => {
      const u = String(url);
      if (u.includes("simple/price")) {
        return {
          ok: true,
          json: async () => ({
            bitcoin: { usd: 118000, usd_24h_change: 1.5 },
          }),
        } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    }) as typeof fetch;

    // Default symbols include BTC, ETH, SOL — ETH/SOL ids miss on the fake,
    // BTC returns, so the brief has one row.
    const brief = await svc.runBriefCycle(fakeFetch, new Date("2026-10-05T07:12:00Z"));
    expect(brief).toContain("BTC");
    expect(briefText).toContain("Watchlist Brief");
  });
});