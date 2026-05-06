# Trading Bot Resurrection Guide

## Keywords to resurrect: "trading bot resurrection" or "michael trading bot"

---

## What We Built

A crypto paper trading bot with live dashboard running on Michael's Mac mini.

## Components to Restore

### 1. Project Location
```
/Users/subhuti/.openclaw/workspace/michael-trading-agent/
```

### 2. Files to Restore
- `trading-api.cjs` — Main trading bot (Node.js, port 3002)
- `dashboard-FINAL.html` — Final dashboard design
- `trading-state.json` — State persistence file

### 3. Quick Start Commands

```bash
# Step 1: Navigate to project
cd /Users/subhuti/.openclaw/workspace/michael-trading-agent

# Step 2: Start Trading API (port 3002)
node trading-api.cjs &

# Step 3: Start HTTP Server (port 3003) in a new terminal
python3 -m http.server 3003

# Step 4: Open dashboard
# http://localhost:3003/dashboard-FINAL.html
```

---

## Current Status (May 3, 2026)

### Test Parameters
- Starting balance: $500
- Mode: Paper trading (simulated)
- Duration: 1 week (May 3-10, 2026)
- Fee: 0.1% per trade
- Tokens: BTC, ETH, SOL, BNB, ADA, LINK

### Running Services
- Trading API: http://localhost:3002 (Node.js, port 3002)
- Dashboard: http://localhost:3003 (Python HTTP server)

### API Endpoints
- GET  /api/status   — Full status (portfolio, signals, positions, stats)
- GET  /api/strategies — Strategy list
- POST /api/auto/start — {strategy:"mixed"} — Start auto trading
- POST /api/auto/stop  — Stop auto trading

### Strategies Available
momentum-breakout, mean-reversion, rule-based, random, momentum, mean-reversion-simple, grid, dca, trend-following, scalp, breakout, mixed, llm, mean_reversion, trend, rule

---

## To Resume After Power Failure

1. Open terminal
2. Run: `cd /Users/subhuti/.openclaw/workspace/michael-trading-agent && node trading-api.cjs &`
3. In another terminal: `cd /Users/subhuti/.openclaw/workspace/michael-trading-agent && python3 -m http.server 3003`
4. Open browser: http://localhost:3003/dashboard-FINAL.html

---

## Architecture

- ElizaOS Agent: localhost:3001
- Trading API: localhost:3002 (stand-alone, not using ElizaOS plugin)
- HTTP Server: localhost:3003 (Python, for dashboard)
- Dashboard connects to Trading API at port 3002

---

## Dashboard Design (FINAL - DO NOT CHANGE)

File: dashboard-FINAL.html
Layout:
- Row 1: Token Prices (6 tokens side by side with signals)
- Row 2: Portfolio Chart + Risk Analysis
- Row 3: Trade Statistics + Strategy Performance
- Row 4: Open Positions + Activity Log
- Row 5: All Strategy Signals (11 strategies × 6 tokens grid)
- Row 6: Social Sentiment (all 6 tokens side by side)

---

## Future: Binance Integration

When ready to go live:
1. Add Binance API keys (spot trading only)
2. Replace simulated orders with real Binance orders
3. Test in paper-parallel mode first
4. Start with small capital

---