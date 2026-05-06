# Quick Start Paper Trading

## Required API Keys

Add these to your `.env` file:

```bash
# Required for LLM strategy
OPENAI_API_KEY=sk-your-openai-key-here

# Optional but recommended
BIRDEYE_API_KEY=your-birdeye-key  # For token data

# Paper trading mode (safe!)
TRADING_MODE=paper
```

## Start Paper Trading

```bash
# 1. Navigate to project
cd /Users/subhuti/.openclaw/workspace/michael-trading-agent

# 2. Start the agent
elizaos start

# 3. In the chat interface, type:
"Start multi-strategy trading with balanced profile"

# 4. Watch it trade! Monitor with:
"Check risk status"
"View trade journal"
"Show open trades"
```

## What You'll See

The bot will:
1. Analyze trending tokens from Birdeye
2. Run LLM analysis on opportunities
3. Validate tokens (RugCheck)
4. Execute paper trades
5. Track P&L, set stop-losses
6. Log everything to journal

## Demo Commands

| Command | What Happens |
|---------|--------------|
| "Start multi-strategy with conservative" | Launches 60% mean reversion + 30% rule + 10% LLM |
| "Run backtest comparison for 7 days" | Simulates all strategies historically |
| "Check risk status" | Shows daily P&L, exposure, alerts |
| "View trade journal" | Shows all trades with reasoning |

## Expected Output

After starting, you should see:
```
🚀 Multi-Strategy Trading Started: Balanced Multi-Strategy
Profile: balanced
Strategy Allocations:
• 📈 momentum-breakout-v1: 40%
• ↔️ mean-reversion: 40%
• 🤖 llm: 20%
Status: 3 strategies active ✅
```

Then trades will start appearing!
