#!/usr/bin/env python3
"""Kronos forecast bridge for the michael-trading-agent.

Persistent JSON-lines bridge to the Kronos K-line foundation model
(shiyu-coder/Kronos, AAAI 2026, MIT): the model loads ONCE, then every
forecast is seconds on Apple Silicon (MPS).

Startup: {"event": "ready", "device": "mps"}
Request:  {"id": "1", "candles": [{"ts": ms, "open","high","low","close","volume"}], "pred_len": 24}
Response: {"id": "1", "ok": true,
           "forecast": [{"ts","open","high","low","close","volume"}],
           "summary": {"lastClose","predClose","pctChange","bandLow","bandHigh","direction"}}
          {"id": "1", "ok": false, "error": "..."}

Env: KRONOS_HOME (the Kronos repo checkout — provides `model`),
     KRONOS_MODEL (default NeoQuasar/Kronos-small),
     KRONOS_TOKENIZER (default NeoQuasar/Kronos-Tokenizer-base)
"""
import json
import os
import sys

import pandas as pd

MODEL = os.environ.get("KRONOS_MODEL", "NeoQuasar/Kronos-small")
TOKENIZER = os.environ.get("KRONOS_TOKENIZER", "NeoQuasar/Kronos-Tokenizer-base")
KRONOS_HOME = os.environ.get(
    "KRONOS_HOME", os.path.expanduser("~/OPENCLAW-WORKSPACE/tools/Kronos")
)
MAX_CONTEXT = 512


def main() -> int:
    try:
        import torch  # noqa: F401 - availability check
    except ImportError as err:
        print(json.dumps({"event": "fatal", "error": f"torch missing: {err}"}), flush=True)
        return 1
    if not os.path.isdir(KRONOS_HOME):
        print(json.dumps({"event": "fatal", "error": f"KRONOS_HOME missing: {KRONOS_HOME}"}), flush=True)
        return 1
    sys.path.insert(0, KRONOS_HOME)
    try:
        from model import Kronos, KronosPredictor, KronosTokenizer  # type: ignore
    except Exception as err:  # noqa: BLE001
        print(json.dumps({"event": "fatal", "error": f"model import failed: {str(err)[:200]}"}), flush=True)
        return 1

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    try:
        tokenizer = KronosTokenizer.from_pretrained(TOKENIZER)
        model = Kronos.from_pretrained(MODEL)
        predictor = KronosPredictor(model, tokenizer=tokenizer, device=device, max_context=MAX_CONTEXT)
    except Exception as err:  # noqa: BLE001
        print(json.dumps({"event": "fatal", "error": str(err)[:300]}), flush=True)
        return 1
    print(json.dumps({"event": "ready", "device": device, "model": MODEL}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        req_id = None
        try:
            req = json.loads(line)
            req_id = req.get("id")
            candles = req.get("candles") or []
            pred_len = int(req.get("pred_len") or 24)
            if len(candles) < 30:
                raise ValueError(f"need at least 30 candles, got {len(candles)}")
            hist = candles[-400:]

            df = pd.DataFrame(
                [
                    {
                        "open": float(c.get("open") or 0),
                        "high": float(c.get("high") or 0),
                        "low": float(c.get("low") or 0),
                        "close": float(c.get("close") or 0),
                        "volume": float(c.get("volume") or 0),
                        "amount": round(float(c.get("close") or 0) * float(c.get("volume") or 0), 2),
                    }
                    for c in hist
                ]
            )
            x_ts = pd.to_datetime([int(c["ts"]) for c in hist], unit="ms", utc=True)
            step = (x_ts[-1] - x_ts[-2]) if len(x_ts) >= 2 else pd.Timedelta(hours=1)
            y_ts = pd.DatetimeIndex([x_ts[-1] + step * (i + 1) for i in range(pred_len)])

            pred = predictor.predict(
                df=df,
                x_timestamp=pd.Series(x_ts),
                y_timestamp=pd.Series(y_ts),
                pred_len=pred_len,
                T=1.0,
                top_p=0.9,
                sample_count=1,
            )

            closes = pred["close"].astype(float).tolist()
            highs = pred["high"].astype(float).tolist()
            lows = pred["low"].astype(float).tolist()
            vols = pred["volume"].astype(float).fillna(0).tolist()
            last_close = float(df["close"].iloc[-1])
            pred_close = closes[-1]
            pct = (pred_close - last_close) / last_close * 100.0

            summary = {
                "lastClose": round(last_close, 6),
                "predClose": round(pred_close, 6),
                "pctChange": round(pct, 3),
                "bandLow": round(min(lows), 6),
                "bandHigh": round(max(highs), 6),
                "direction": "up" if pct >= 0 else "down",
            }
            forecast = [
                {
                    "ts": int(t.timestamp() * 1000),
                    "open": round(float(o), 6),
                    "high": round(float(h), 6),
                    "low": round(float(l), 6),
                    "close": round(float(c), 6),
                    "volume": round(float(v), 2),
                }
                for t, o, h, l, c, v in zip(
                    y_ts, pred["open"].astype(float), highs, lows, closes, vols
                )
            ]
            print(json.dumps({"id": req_id, "ok": True, "forecast": forecast, "summary": summary}), flush=True)
        except Exception as err:  # noqa: BLE001 - never die mid-session
            print(json.dumps({"id": req_id, "ok": False, "error": str(err)[:300]}), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())