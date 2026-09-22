#!/usr/bin/env python3
"""Persistent laya-mlx bridge for BettiBoo.

Speaks JSON lines on stdin/stdout so the Go agent can keep one long-lived
process with the model loaded once (~35s) and classify every message in
milliseconds.

Startup: loads the model, prints {"event": "ready"}.
Request:  {"id": "1", "text": "...", "questions": {...}}
Response: {"id": "1", "ok": true, "answers": {...}}
          {"id": "1", "ok": false, "error": "..."}

Requires: pip install laya-mlx   (Python 3.11+, Apple Silicon)
"""
import json
import sys

MODEL_DEFAULT = "aac6fef/laya-mlx"


def main() -> int:
    model = sys.argv[1] if len(sys.argv) > 1 else MODEL_DEFAULT
    try:
        import laya_mlx as laya

        agent = laya.load(model)
    except Exception as err:  # noqa: BLE001 - report and exit, caller degrades
        print(json.dumps({"event": "fatal", "error": str(err)[:300]}), flush=True)
        return 1

    print(json.dumps({"event": "ready"}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        req_id = None
        try:
            req = json.loads(line)
            req_id = req.get("id")
            result = agent.predict(req.get("text", ""), req.get("questions", {}))
            print(
                json.dumps(
                    {"id": req_id, "ok": True, "answers": result.get("answers", {})}
                ),
                flush=True,
            )
        except Exception as err:  # noqa: BLE001 - bridge must never die mid-session
            print(
                json.dumps({"id": req_id, "ok": False, "error": str(err)[:300]}),
                flush=True,
            )
    return 0


if __name__ == "__main__":
    sys.exit(main())