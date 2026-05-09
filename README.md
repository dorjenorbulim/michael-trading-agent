# Michael's Crypto Trading Bot 🤖📈

An AI-powered crypto trading agent with live Binance paper trading, 14 multi-strategy management, real-time analytics dashboard, strategy auto-switching, and token safety guard.

> Standalone Node.js trading API server — no ElizaOS dependency required.

---

## 🚀 Quick Start

```bash
git clone https://github.com/dorjenorbulim/michael-trading-agent.git
cd michael-trading-agent
node trading-api.cjs
```

Server runs on **http://localhost:3002**

Then open `crew-dashboard.html` in your browser.

---

## 📊 Features

### Trading Strategies (14 total)

| Strategy | Description |
|----------|-------------|
| `momentum-breakout` | Volume + momentum + trend confirmation |
| `mean-reversion` | RSI + Bollinger Bands + support/resistance |
| `rule-based` | Configurable rules with RSI/MACD/SMA |
| `random` | Random entries with risk management |
| `momentum` | RSI + momentum + MACD combined |
| `mean-reversion-simple` | Simplified RSI + Bollinger |
| `grid` | Grid zones — buy low, sell high |
| `dca` | Dollar cost averaging |
| `trend-following` | EMA crossover (12/26/50) |
| `scalp` | Fast RSI for quick trades |
| `breakout` | Volume + price breakout detection |
| `mixed` | Combines all strategies (majority vote) |
| `llm` | Simulated AI decisions (consensus + randomness) |

### Strategy Auto-Switcher
The bot automatically evaluates all strategies every 45 cycles (~22 min) and switches to the best-performing one if it beats the current strategy by > 20%. Requires ≥ 3 trades before judging.

### Token Safety Guard
Before any trade, tokens are validated via CoinGecko:
- **Core tokens** (BTC/ETH/SOL/BNB/ADA/LINK + 17 blue chips) — always allowed
- **Blocked tokens** — 40+ meme coins, pump & dumps, honeypot clones, suspicious tokens — instant reject
- **Unknown tokens** — scored on market cap, volume, age, price stability (≥ 40/100 = allow)
- Cached 24 hours to avoid hammering CoinGecko

### Dynamic Token Universe
The bot starts tracking 6 core tokens and automatically adds any new token when a position is opened. The CoinGecko price fetch expands dynamically to cover all tracked tokens.

### Rising Star Scanner
Scans CoinGecko's top 100 by volume for emerging tokens with:
- 24h volume > $5M
- 24h price change > 5%
- Market cap > $1M
- Not blocked or already tracked

Candidates can be added via API.

### Safety Controls
- **Stop Loss:** -5% per trade
- **Take Profit:** +15% per trade
- **Trading Fee:** 0.1% per trade (Binance equivalent)
- **Starting Balance:** $500 (paper trading)
- **Daily trade cap:** 30 trades

---

## 🛠️ API Endpoints

### GET /api/status
Full system status — portfolio, positions, trades, activities, signals, prices, strategy performance.

### GET /api/strategies
List all available strategies with descriptions.

### POST /api/auto/start
```json
{"strategy": "trend-following"}
```
Start auto-trading with a specific strategy.

### POST /api/auto/stop
Stop auto-trading.

### POST /api/buy
```json
{"token": "BTC", "percent": 15, "source": "manual"}
```
Manual buy (percentage of balance). Token safety check runs automatically.

### POST /api/sell
```json
{"token": "BTC", "percent": 100, "source": "manual"}
```
Manual sell (percentage of position).

### GET /api/rising-stars
Scans for emerging tokens. Returns top candidates with price, change24h, market cap, volume.

### POST /api/rising-stars/add
```json
{"coinId": "sahara-ai", "symbol": "SAHARA"}
```
Add a rising star candidate to the tracked token universe.

### POST /api/reset
Reset portfolio to $500 starting balance.

---

## 📁 Project Structure

```
michael-trading-agent/
├── trading-api.cjs          # Standalone trading API server
├── crew-dashboard.html      # Real-time trading dashboard
├── token-safety.cjs         # Token trust validation
├── crew-coordinator.cjs      # Crew orchestration agent
├── notification-agent.cjs   # Telegram notification agent
├── SPEC.md                  # System specification
├── trading-state.json       # Persistent state (git-ignored)
└── README.md
```

---

## 🔧 Configuration

Edit `trading-api.cjs` top section:

```javascript
const PORT = 3002;
const STARTING_BALANCE = 500;
const TRADING_FEE = 0.001;        // 0.1%
const AUTO_TRADE_INTERVAL = 30000; // 30 seconds
const STOP_LOSS_PERCENT = 0.05;    // 5%
const TAKE_PROFIT_PERCENT = 0.15;  // 15%
const MAX_TRADES_PER_DAY = 30;
```

---

## 📈 Dashboard

The `crew-dashboard.html` shows:
- **Portfolio value** + total return %
- **Open positions** with entry price, current price, PnL
- **Strategy performance** — all 14 strategies with trades, win rate, net PnL
- **Activity feed** — BUY/SELL/HOLD decisions with source badge (auto-trading, manual, etc.)
- **Rising star candidates** — emerging tokens with momentum signals
- **All signals** — what each strategy recommends per token
- **Dynamic token list** — base 6 + any tokens added from trading

---

## 🧪 Testing

```bash
# Test token safety
node token-safety.cjs validate BTC     # should PASS
node token-safety.cjs validate PEPE    # should BLOCK
node token-safety.cjs validate DOGE    # should BLOCK

# Test CoinGecko integration
curl http://localhost:3002/api/rising-stars

# Trigger a manual trade
curl -X POST http://localhost:3002/api/buy -H "Content-Type: application/json" -d '{"token":"BTC","percent":10,"source":"manual"}'
```

---

## ⚠️ Disclaimer

- Paper trading only — no real funds
- Price data from CoinGecko (with fallback simulation)
- State persists in `trading-state.json`
- Always review blocked token list and safety thresholds before live trading

---

## 🍴 Fork & Contribute

Ideas, improvements, and better versions are welcome! If you build something interesting, feel free to open an issue or PR.

**Discussion thread:** https://github.com/dorjenorbulim/michael-trading-agent/issues/1

### Ideas worth exploring:
- Add more strategies (Elliott Wave, Ichimoku, etc.)
- Connect to real Binance API for live trading
- Multi-agent coordination (one scanner, one executor, one risk manager)
- Backtesting module
- Performance analytics with charts

---

Built with 🪷 by Subhuti for Michael's trading adventures.