# Michael's Trading Crew — SPEC.md

## Overview

OpenClaw-native trading crew. Paper trading on Binance, real money ready. Built inside Michael's ecosystem, no external frameworks.

**Owner:** Michael K C Lim  
**Crew:** OpenClaw agents  
**Execution:** `trading-api.cjs` (port 3002) — existing engine  
**Frontend:** `dashboard-live.html` → `crew-dashboard.html` (rebuild)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                        │
│         (this session — coordinates, schedules, persists)   │
└────────────┬─────────────┬─────────────┬────────────────────┘
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  Market   │ │   Trade   │ │ Notification │
        │   Agent   │ │   Agent   │ │   Agent     │
        │           │ │           │ │             │
        │ Polls     │→│ Calls     │→│ Pushes      │
        │ Binance   │ │ trading-  │ │ Telegram/   │
        │ Prices    │ │ api.cjs   │ │ Discord     │
        └───────────┘ └───────────┘ └─────────────┘
                                          │
                                    ┌─────▼─────┐
                                    │ Dashboard │
                                    │ crew-     │
                                    │ dashboard.html │
                                    └───────────┘
```

---

## Agents

### 1. Orchestrator (this session)
- Coordinates all sub-agents
- Schedules via cron (market check every 5min, trade check every 1min)
- Persists crew state to `memory/trading-crew-state.json`
- Makes final trading decisions

### 2. Market Agent
- Polls Binance API for prices (all 6 tokens)
- Computes indicators: RSI, MACD, EMA
- Generates BUY/SELL/HOLD signals per token per strategy
- Reports to orchestrator

### 3. Trade Agent
- Reads signals from orchestrator
- Calls `trading-api.cjs` (port 3002) to execute
- Handles trade confirmation/error
- Updates position state

### 4. Notification Agent
- Pushes to Telegram and/or Discord webhook
- Events: trade executed, trade closed, daily summary, risk alert
- Also writes to dashboard notification log
- Configurable channels

---

## Trading Engine (trading-api.cjs)

**Location:** `/Users/subhuti/.openclaw/workspace/michael-trading-agent/trading-api.cjs`  
**Port:** 3002  
**Mode:** Paper trading (Binance testnet) now, real Binance later

### Endpoints (existing)
```
GET  /api/status       — full status, signals, portfolio, trades
POST /api/auto/start   — start auto-trading
POST /api/auto/stop    — stop auto-trading
POST /api/trade        — manual trade {token, side, amount}
POST /api/reset        — reset portfolio
```

### State
```json
{
  "portfolio": { "balance": 500, "positions": {}, "trades": [] },
  "tradesToday": 0,
  "autoTradingEnabled": false,
  "activeStrategy": "mixed"
}
```

---

## Dashboard (crew-dashboard.html)

**Location:** `michael-trading-agent/crew-dashboard.html` (new)  
**Replaces:** `dashboard-live.html`

### Sections

1. **Portfolio Summary** — balance, total value, open positions
2. **Live Prices** — all 6 tokens with price, 24h change
3. **Signals Grid** — strategy × token matrix, color coded
4. **Open Positions** — entry price, current price, PnL
5. **Trade History** — last 20 trades
6. **Strategy Performance** — per-strategy win rate, PnL
7. **Notification Log** — last 20 notifications sent (📡 Sender)
8. **Controls** — Start/Stop auto-trade, Reset, Strategy select

### Notification Display
- Each notification shows: timestamp, channel (📱Telegram/💬Discord), type, message
- Color coded by priority: 🚨 critical, ⚠️ high, 📢 medium, ℹ️ low
- Auto-scrolls, stores last 50

---

## Notification Agent

### Channels
- **Telegram** — via Bot API (botToken + chatId)
- **Discord** — via webhook URL
- **Dashboard** — writes to notification log (always active)
- **Console** — logs to terminal

### Events
| Event | Priority | Channels |
|-------|----------|----------|
| Trade Executed | medium | Telegram, Discord, Dashboard |
| Trade Closed (profit) | medium | Telegram, Discord, Dashboard |
| Trade Closed (loss) | high | Telegram, Discord, Dashboard |
| Daily Summary | low | Telegram, Discord, Dashboard |
| Risk Alert | critical | All channels |
| Auto-trade Started | low | Dashboard |
| Auto-trade Stopped | low | Dashboard |

### Message Format
```
🚨 [CRITICAL] Risk Alert: High Drawdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portfolio: -8.2%
Daily PnL: -$42.50
Strategy: momentum-breakout
Time: 14:32 SG
```

---

## State Files

Stored in `michael-trading-agent/state/`

```
state/
├── crew-state.json       — orchestrator state, schedules
├── portfolio.json         — balance, positions (mirrors API state)
├── trades.json           — all trades
├── notifications.json    — last 100 notifications
└── config.json           — API keys, channels, strategies
```

---

## Cron Jobs

| Job | Schedule | Agent | Action |
|-----|----------|-------|--------|
| Market Poll | Every 5 min | Market Agent | Fetch prices, compute signals |
| Trade Check | Every 1 min | Trade Agent | Check signals, execute if due |
| Daily Summary | 9PM SG | Notification Agent | Send daily summary |
| Portfolio Sync | Every 5 min | Orchestrator | Sync state from API |

---

## Configuration (config.json)

```json
{
  "binance": {
    "apiKey": "",
    "secretKey": "",
    "testnet": true
  },
  "trading": {
    "tokens": ["BTC", "ETH", "SOL", "BNB", "ADA", "LINK"],
    "maxTradesPerDay": 30,
    "startingBalance": 500
  },
  "notifications": {
    "telegram": {
      "enabled": false,
      "botToken": "",
      "chatId": ""
    },
    "discord": {
      "enabled": false,
      "webhookUrl": ""
    }
  },
  "strategies": ["momentum-breakout", "mean-reversion", "trend-following", "mixed"]
}
```

---

## Build Order

1. ✅ `trading-api.cjs` — already exists, works
2. 🔲 `crew-dashboard.html` — rebuild with notification display
3. 🔲 `state/config.json` — configuration file
4. 🔲 Notification Agent — Telegram/Discord push service
5. 🔲 Market Agent — price polling + signal generation
6. 🔲 Trade Agent — execute via API
7. 🔲 Cron jobs — scheduling

---

## Constraints

- No ElizaOS, no external frameworks
- All state in workspace files
- Binance paper mode for now (testnet)
- Real money mode activated only when Michael explicitly enables it
- 30 trades/day cap enforced by `trading-api.cjs`