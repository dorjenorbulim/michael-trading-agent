# Michael's Crypto Trading Bot 🤖📈

An AI-powered crypto trading agent with live Binance paper trading, 14 multi-strategy management, real-time analytics dashboard, and sentiment analysis.

> Built as an ElizaOS plugin → standalone Node.js trading API server.

---

## 🚀 Quick Start

### 1. Start the API Server

```bash
cd michael-trading-agent
node trading-api.cjs
```

Server runs on **http://localhost:3002**

### 2. Open the Dashboard

```bash
open dashboard-live.html
```

Or open `dashboard-FINAL-20260505.html` for the latest version.

---

## 📊 Features

### Trading Strategies (14 total)

| Strategy | Description |
|----------|-------------|
| `momentum-breakout` | Volume + momentum + trend confirmation (ElizaOS original) |
| `mean-reversion` | RSI + Bollinger Bands + support/resistance (ElizaOS original) |
| `rule-based` | Configurable rules with RSI/MACD/SMA (ElizaOS original) |
| `random` | Random entries with risk management (ElizaOS original) |
| `momentum` | RSI + momentum + MACD combined |
| `mean-reversion-simple` | Simplified RSI + Bollinger |
| `grid` | Grid zones — buy low, sell high |
| `dca` | Dollar cost averaging |
| `trend-following` | EMA crossover (12/26/50) |
| `scalp` | Fast RSI for quick trades |
| `breakout` | Volume + price breakout detection |
| `mixed` | Combines all strategies (majority vote) |
| `llm` | Simulated AI decisions (consensus + randomness) |

### Technical Indicators
- SMA, EMA (9, 21, 50, 200)
- RSI (5, 14 period)
- MACD (12/26/9)
- Bollinger Bands (20, 2 std dev)
- ATR (Average True Range)
- Volume ratio analysis
- Momentum scoring

### Safety Controls
- **Stop Loss:** -5% per trade
- **Take Profit:** +15% per trade
- **Trading Fee:** 0.1% per trade (Binance equivalent)
- **Starting Balance:** $500 (paper trading)
- **No trade cap:** unlimited trading

---

## 🛠️ API Endpoints

### GET /api/status
Full system status — portfolio, positions, trades, signals, prices.

### GET /api/strategies
List all available strategies with descriptions.

### POST /api/auto/start
```json
{"strategy": "momentum-breakout"}
```
Start auto-trading with a specific strategy.

### POST /api/auto/stop
Stop auto-trading.

### POST /api/buy
```json
{"token": "BTC", "percent": 15}
```
Manual buy (percentage of balance).

### POST /api/sell
```json
{"token": "BTC", "percent": 100}
```
Manual sell (percentage of position).

### POST /api/reset
Reset portfolio to $500 starting balance.

---

## 📁 Project Structure

```
michael-trading-agent/
├── trading-api.cjs          # Standalone trading API server (Node.js)
├── dashboard-live.html      # Live trading dashboard
├── dashboard-FINAL-20260505.html  # Latest dashboard version
├── trading-state.json       # Persistent trading state (git-ignored)
├── .env                     # Environment variables (git-ignored)
├── package.json
├── src/
│   ├── plugins/
│   │   ├── strategies/      # Trading strategy implementations
│   │   ├── services/        # Trading services (Swap, Sentiment, etc.)
│   │   └── types/           # TypeScript type definitions
│   └── frontend/
│       └── components/       # React dashboard components
├── dist/                    # Compiled output
└── scripts/                 # Build and test scripts
```

---

## 🔧 Configuration

Edit `trading-api.cjs` top section to adjust:

```javascript
const STATE_FILE = './trading-state.json';
const PORT = 3002;
const STARTING_BALANCE = 500;
const TRADING_FEE = 0.001;        // 0.1%
const AUTO_TRADE_INTERVAL = 30000; // 30 seconds
const STOP_LOSS_PERCENT = 0.05;    // 5%
const TAKE_PROFIT_PERCENT = 0.15;  // 15%
```

---

## 📈 Dashboard Overview

The dashboard shows:
- **Portfolio value** + total return %
- **Open positions** with entry price, current price, PnL
- **Strategy performance** table (trades, win rate, net PnL per strategy)
- **All signals** — what each strategy is recommending for each token
- **Fear/Greed indices** per token
- **Trade history** (last 50 trades)
- **Extended stats** — largest win, largest loss, max consecutive wins

---

## 🧪 Testing

```bash
bun run test              # Run all tests
bun run test:component    # Component tests only
bun run test:e2e          # E2E tests only
```

---

## 📝 Notes

- Paper trading only — no real funds
- Price data from CoinGecko (with fallback simulation)
- State persists in `trading-state.json`
- ElizaOS `.eliza/` database files are not committed

---

Built with 🪷 by Subhuti for Michael's trading adventures.