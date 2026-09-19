#!/usr/bin/env python3
"""Scrapling bridge for the trading bot's sentiment service.

Usage: python3 scrapling_bridge.py <url>
Prints JSON: {"ok": true, "url": "...", "title": "...", "text": "..."}
On failure prints {"ok": false, "error": "..."} and exits 0 - the caller
degrades gracefully instead of crashing the trading loop.

Requires: pip install scrapling
"""
import json
import re
import sys


def extract(page) -> tuple[str, str]:
	title = ""
	try:
		node = page.css_first("title::text")
		title = (node or "").strip() if isinstance(node, str) else ""
	except Exception:
		title = ""

	text = ""
	try:
		text = re.sub(r"\s+", " ", page.get_all_text() or "").strip()
	except Exception:
		pass
	if not text:
		try:
			raw = page.body
			if isinstance(raw, bytes):
				raw = raw.decode("utf-8", "ignore")
			text = re.sub(r"<[^>]+>", " ", str(raw))
			text = re.sub(r"\s+", " ", text).strip()
		except Exception:
			text = ""
	return title[:300], text[:20000]


def main() -> int:
	if len(sys.argv) < 2:
		print(json.dumps({"ok": False, "error": "usage: scrapling_bridge.py <url>"}))
		return 0
	url = sys.argv[1]
	try:
		from scrapling.fetchers import Fetcher

		page = Fetcher.get(url)
		title, text = extract(page)
		print(json.dumps({"ok": True, "url": url, "title": title, "text": text}))
	except ImportError as err:
		print(json.dumps({"ok": False, "error": f"scrapling not installed: {err}"}))
	except Exception as err:  # noqa: BLE001 - the bridge must never crash the caller
		print(json.dumps({"ok": False, "error": str(err)[:500]}))
	return 0


if __name__ == "__main__":
	sys.exit(main())