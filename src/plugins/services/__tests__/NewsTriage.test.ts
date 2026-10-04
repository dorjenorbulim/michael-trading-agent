import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { NewsTriage } from "../NewsTriage.ts";

const SAMPLE_RSS = `<rss><channel>
<item><title><![CDATA[BTC ETF approval rumors grow]]></title><link>https://example.com/1</link><pubDate>Mon, 05 Oct 2026 00:00:00 GMT</pubDate></item>
<item><title>Bitcoin hacker exploit drains exchange wallet</title><link>https://example.com/2</link><pubDate>Mon, 05 Oct 2026 00:30:00 GMT</pubDate></item>
<item><title>Random unrelated story about weather</title><link>https://example.com/3</link><pubDate>Mon, 05 Oct 2026 01:00:00 GMT</pubDate></item>
</channel></rss>`;

const fakeRuntime = {
  getService: (type: string) => {
    if (type === "notification") {
      return {
        send: async (ev: { title: string; priority: string }) => {
          lastAlert = ev;
        },
      };
    }
    return null;
  },
};
let lastAlert: { title: string; priority: string } | null = null;

function freshService(): NewsTriage {
  const seenPath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "triage-")),
    "seen.json",
  );
  return new NewsTriage(undefined as never, seenPath);
}

const fakeFetch = (async () => ({
  ok: true,
  text: async () => SAMPLE_RSS,
})) as unknown as typeof fetch;

describe("NewsTriage", () => {
  it("parses RSS items with CDATA-safe titles", () => {
    const svc = freshService();
    const items = svc.parseFeed(SAMPLE_RSS, "test-feed");
    expect(items.length).toBe(3);
    expect(items[0].title).toBe("BTC ETF approval rumors grow");
    expect(items[0].link).toBe("https://example.com/1");
    expect(items[0].feed).toBe("test-feed");
  });

  it("triages materiality with symbol aliases", () => {
    const svc = freshService();
    const watched = ["BTC"];
    const items = svc.parseFeed(SAMPLE_RSS, "f");
    const etf = svc.scoreItem(items[0], watched); // BTC + etf → info
    expect(etf).not.toBeNull();
    expect(etf?.symbols).toContain("BTC");
    expect(etf?.severity).toBe("medium");
    const hack = svc.scoreItem(items[1], watched); // Bitcoin alias + hacker → severe
    expect(hack).not.toBeNull();
    expect(hack?.severity).toBe("high");
    expect(svc.scoreItem(items[2], watched)).toBeNull(); // unwatched
  });

  it("alerts on first cycle and dedupes the second", async () => {
    const svc = freshService();
    (svc as unknown as { runtime: unknown }).runtime = fakeRuntime;
    const first = await svc.runPollCycle(fakeFetch);
    expect(first).toBe(2); // ETF (medium) + exploit (high)
    expect(lastAlert?.priority).toBe("high");
    const second = await svc.runPollCycle(fakeFetch);
    expect(second).toBe(0); // seen-store dedupe
  });
});