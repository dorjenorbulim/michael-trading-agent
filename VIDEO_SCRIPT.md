# ElizaOS Trading Agent - Video Script

## **Title:** "Building an AI Trading Bot with ElizaOS: From Zero to Live Trading"

**Duration:** 8-10 minutes  
**Target Audience:** DeFi traders, developers, AI enthusiasts  
**Format:** Screen recording + voiceover

---

## **Scene 1: Introduction (0:00-1:00)**

**[Visual: Terminal window, clean desktop]**

**Voiceover:**
"What if you could have an AI trading assistant that analyzes market sentiment, runs multiple strategies simultaneously, and manages risk automatically? Today I'm building exactly that with ElizaOS."

**[Type on screen]:**
```bash
elizaos create michael-trading-agent
cd michael-trading-agent
```

**Voiceover:**
"ElizaOS is a multi-agent AI framework with 18,000 GitHub stars. It comes with built-in trading capabilities, risk management, and even social sentiment analysis."

---

## **Scene 2: The Architecture (1:00-2:30)**

**[Visual: Architecture diagram showing components]**

**[Screen shows file structure]:**
```
services/
├── AutoTradingManager.ts      # Main orchestration
├── MultiStrategyManager.ts    # Strategy allocation
├── MarketConditionDetector.ts # Bull/bear detection
├── RiskDashboard.ts          # Circuit breakers
├── TradeJournal.ts           # Complete logging
├── SentimentAnalyzer.ts      # Twitter/Reddit analysis
└── CopyTrading.ts           # Follow whale wallets

strategies/
├── LLMStrategy.ts           # AI-powered trading
├── MomentumBreakoutStrategy.ts
├── MeanReversionStrategy.ts
└── RuleBasedStrategy.ts
```

**Voiceover:**
"The power comes from the architecture. We have 12 services working together—from risk management with circuit breakers to sentiment analysis pulling social data. The star is the LLM strategy—it uses GPT-4 to analyze trending tokens and make trading decisions."

---

## **Scene 3: Configuration (2:30-3:30)**

**[Visual: Editing .env file]**

**[Type on screen]:**
```bash
nano .env
```

**[Show file content]:**
```bash
OPENAI_API_KEY=sk-***
BIRDEYE_API_KEY=***
TRADING_MODE=paper
STOP_LOSS_PERCENT=5
TAKE_PROFIT_PERCENT=15
MAX_DAILY_LOSS_USD=500
```

**Voiceover:**
"Configuration is straightforward. I'm using paper trading mode—fake money, real market data—so we can test safely. I've set risk limits: 5% stop loss, 15% take profit, and a circuit breaker at $500 daily loss."

---

## **Scene 4: Starting the Agent (3:30-4:30)**

**[Visual: Terminal, run command]**

**[Type on screen]:**
```bash
elizaos start
```

**[Terminal output streams]:**
```
🚀 Development servers are running:
  Backend Server: http://localhost:3000
  API Endpoint:   http://localhost:3000/api
  Client UI:    http://localhost:3000

[Info] Character loaded: Eliza
[Info] AutoTradingManager initialized (PAPER MODE)
[Info] Multi-Strategy Manager started
[Info] Risk Dashboard initialized
[Info] Trade Journal ready
[Info] Sentiment Analyzer started
[Info] Server listening on port 3000
```

**Voiceover:**
"The agent is live. Notice it loaded 12 services including the risk dashboard and sentiment analyzer. Paper trading mode is active—safe to experiment."

---

## **Scene 5: First Trade - LLM Strategy (4:30-6:00)**

**[Visual: Split screen - terminal on left, browser showing dashboard on right]**

**[In terminal chat]:**
```
User: Start multi-strategy trading with balanced profile

Agent: 🚀 Multi-Strategy Trading Started

Profile: balanced
Strategy Allocations:
• 📈 momentum-breakout-v1: 40%
• ↔️ mean-reversion: 40%
• 🤖 llm: 20%

Status: 3 strategies active ✅
```

**[Dashboard updates - show strategy cards activating]**

**Voiceover:**
"I launched three strategies simultaneously. The balanced profile allocates 40% to momentum, 40% to mean reversion, and 20% to the LLM strategy."

**[Terminal shows live activity]:**
```
[23:12:45] INFO: LLMStrategy - Analyzing trending tokens...
[23:12:47] INFO: Fetched 25 trending tokens from Birdeye
[23:12:48] INFO: Pre-filtered: 18 tokens passed liquidity check
[23:12:50] INFO: Sending to LLM for analysis...
```

**Voiceover:**
"The LLM strategy is working. It fetched trending tokens, filtered for liquidity, and is now asking GPT-4 to analyze opportunities."

**[Terminal shows LLM response]:**
```
[23:12:55] INFO: LLM Decision:
  Token: SOL (So1111...)
  Market Assessment: "Strong bullish momentum on 
  Solana ecosystem, TVL growing, whale accumulation"
  Opportunity Score: 72/100
  Risk Score: 45/100
  Buy Amount: 8% of portfolio
  Stop Loss: $138.50 (-2.7%)
  Take Profit: $155.00 (+8.9%)
```

**Voiceover:**
"The LLM returned a decision. It's analyzing market conditions, calculating risk scores, and even setting stop-losses based on volatility."

**[Terminal shows trade execution]:**
```
[23:13:00] TRADE EXECUTED:
  Symbol: SOL
  Side: BUY
  Amount: 7.05 SOL
  Price: $142.30
  Total: $1,003.45
  Strategy: LLM
  
[23:13:01] INFO: Trade logged to journal: trade-1714667580123
```

**[Dashboard updates - new position appears]**

**Voiceover:**
"Trade executed. The position is tracked in the journal with full reasoning—why we bought, what the LLM saw, where stop-loss and take-profit are set."

---

## **Scene 6: Risk Management in Action (6:00-7:00)**

**[Visual: Dashboard showing risk metrics]**

**[User types command]:**
```
User: Check risk status
```

**[Agent response]:**
```
🟢 Risk Dashboard

Current Metrics:
• Daily PnL: +$124.46 (+0.99%)
• Max Drawdown: 0.8%
• Current Exposure: 12.5%
• Open Positions: 3
• Win Rate: 100%

Risk Level: LOW

Circuit Breaker: Inactive ✅
No active alerts.
```

**[Show risk metric bars updating]**

**Voiceover:**
"Risk is actively monitored. The dashboard tracks daily PnL, exposure, and win rate. The circuit breaker is ready to halt trading if we hit our $500 daily loss limit."

---

## **Scene 7: Multiple Strategies Working (7:00-8:00)**

**[Visual: Split screen - three terminal windows or dashboard tabs]**

**[Show concurrent activity]:**

**Window 1 - Momentum Strategy:**
```
[23:18:32] INFO: Breakout detected on BONK!
[23:18:36] TRADE: BUY 2,500,000 BONK @ $0.0000234
```

**Window 2 - Mean Reversion:**
```
[23:32:15] INFO: WIF oversold - RSI: 28
[23:32:20] TRADE: BUY 125 WIF @ $2.15
```

**Window 3 - Trade Journal:**
```
📊 Strategy Performance:
🟢 LLM Strategy: +$45.20 (1 trade)
🟢 Momentum: +$6.50 (1 trade, closed)
🔴 Mean Reversion: -$2.30 (2 trades)
```

**Voiceover:**
"All three strategies are running simultaneously. Momentum caught a breakout, mean reversion found an oversold bounce, and the LLM strategy made a calculated entry. They each manage their own positions with different risk profiles."

---

## **Scene 8: Closing a Profitable Trade (8:00-9:00)**

**[Visual: Terminal alert, then dashboard update]**

**[Alert appears]:**
```
🎯 TAKE PROFIT TRIGGERED

Token: BONK
Entry: $0.0000234
Exit: $0.0000260
PnL: +$6.50 (+11.1%)
Duration: 27 minutes
Strategy: Momentum
```

**[Dashboard shows profit update]**

**Voiceover:**
"The momentum strategy hit its take profit. Automatic exit, profit locked in, journal updated. No emotion, no hesitation—pure execution based on the rules we set."

---

## **Scene 9: Dashboard Visualization (9:00-9:45)**

**[Visual: Full dashboard tour]**

**[Navigate through tabs]:**

**Overview Tab:**
- Portfolio value: $12,671.78 (+0.99%)
- Equity curve showing growth
- Asset allocation pie chart

**Strategies Tab:**
- Performance cards for each strategy
- Win rates and PnL comparison

**Risk Tab:**
- Risk limit progress bars
- Circuit breaker status
- Active alerts (none)

**Voiceover:**
"The dashboard gives you full visibility. See your equity curve, strategy performance, risk metrics—all updating in real-time as trades execute."

---

## **Scene 10: Conclusion (9:45-10:00)**

**[Visual: Clean terminal, summary on screen]**

**[Final stats]:**
```
8-Hour Paper Trading Session:
• Final Portfolio: $12,847.32 (+2.39%)
• Total Trades: 12
• Win Rate: 75%
• Profit Factor: 2.3
• Sharpe Ratio: 1.85
• Risk Events: 0
```

**Voiceover:**
"In 8 hours of paper trading, the agent executed 12 trades across 3 strategies with a 75% win rate. No risk events triggered, all safety systems worked."

**[Screen shows code repository]**

**Voiceover:**
"Everything we built is open source. Links in the description. ElizaOS gives you institutional-grade trading infrastructure with AI-powered decision making—all running locally on your machine."

**[End screen]**
```
GitHub: github.com/elizaOS/eliza
Documentation: docs.elizaos.ai
Demo Code: github.com/yourusername/trading-agent

Like and subscribe for more AI trading content!
```

---

## **Production Notes**

### **Screen Recording Setup:**
- Terminal: iTerm2 with dark theme, font size 14
- Browser: Chrome in dark mode, showing dashboard
- Recording: OBS Studio, 1080p60

### **Timing Cues:**
- Use `typing` effect for commands (not too fast)
- Pause on key outputs for 2-3 seconds
- Zoom in on important decisions (LLM response, trade execution)
- Use dashboard transitions to show real-time updates

### **Audio Notes:**
- Clean voiceover, no background music during technical sections
- Subtle ambient music during dashboard tour
- Key alerts (trade executed) have subtle sound cues

### **Callouts to Add:**
- "This is paper trading—fake money, real market data"
- "Never expose trading bots to the internet without authentication"
- "Past performance doesn't guarantee future results"

---

## **Optional Bonus Scenes:**

### **Bonus 1: Sentiment Analysis (30s)**
```
User: Analyze sentiment for SOL

Agent: 🟢 SOL Sentiment: Bullish (+0.45)
Twitter: +0.52 (5,234 mentions)
Reddit: +0.38 (1,890 mentions)
Fear/Greed Index: 68/100
Keywords: moon, breakout, accumulation
```

### **Bonus 2: Backtest Comparison (30s)**
```
User: Run backtest comparison for 7 days

Agent: 📊 Backtest Results: Balanced Profile

Winner: LLM Strategy
Returns: +18.5%
Win Rate: 68%
Max Drawdown: 5.2%
Recommendation: Use LLM-heavy allocation
```

### **Bonus 3: Copy Trading (30s)**
```
User: Follow whale wallet 0x7a8b...

Agent: 👥 Now following Smart Money Whale
Performance: +240% (90 days)
Risk Score: 35/100 (Safe)
Auto-copy: 50% of their trades
Max position: $500
```
