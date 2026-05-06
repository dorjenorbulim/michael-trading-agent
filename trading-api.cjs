/**
 * Trading API Server with Full Strategy Suite
 * 
 * All strategies from the original ElizaOS plugin:
 * - MomentumBreakoutStrategy: Volume + momentum + trend confirmation
 * - MeanReversionStrategy: RSI + Bollinger Bands + support/resistance
 * - RuleBasedStrategy: Configurable rules with technical indicators
 * - RandomStrategy: Random entries with risk management
 * - LLMStrategy: AI-powered decisions (simulated)
 * 
 * Technical Indicators: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, Volume analysis
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const STATE_FILE = './trading-state.json';
const PORT = 3002;
const STARTING_BALANCE = 500;
const TRADING_FEE = 0.001;
const AUTO_TRADE_INTERVAL = 30000;
const STOP_LOSS_PERCENT = 0.05;
const TAKE_PROFIT_PERCENT = 0.15;

// ============ STATE ============
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      console.log('[STATE] Loaded from', STATE_FILE);
      return JSON.parse(data);
    }
  } catch (e) {}
  return null;
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      portfolio, autoTradingEnabled, activeStrategy, tradesToday, lastTradeTime, savedAt: new Date().toISOString()
    }, null, 2));
  } catch (e) {}
}

const savedState = loadState();
let portfolio = savedState?.portfolio || { balance: STARTING_BALANCE, positions: {}, trades: [], totalTrades: 0, winningTrades: 0 };
let autoTradingEnabled = savedState?.autoTradingEnabled || false;
let activeStrategy = savedState?.activeStrategy || 'momentum';
let tradesToday = savedState?.tradesToday || 0;
let lastTradeTime = savedState?.lastTradeTime || { BTC: 0, ETH: 0, SOL: 0, BNB: 0, ADA: 0, LINK: 0 };
let autoTradeTimer = null;

let prices = { BTC: 95000, ETH: 3450, SOL: 142, BNB: 580, ADA: 0.58, LINK: 18 };
let priceHistory = { BTC: [], ETH: [], SOL: [], BNB: [], ADA: [], LINK: [] };
let lastPriceFetch = 0;
let candleData = { BTC: [], ETH: [], SOL: [], BNB: [], ADA: [], LINK: [] }; // OHLCV-style data

// ============ PRICE FETCHING ============
async function fetchPrices() {
  const now = Date.now();
  if (now - lastPriceFetch < 120000) return;
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.coingecko.com',
      path: '/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,cardano,chainlink&vs_currencies=usd&include_24h_change=true',
      headers: { 'User-Agent': 'Mozilla/5.0 TradingBot/1.0', 'Accept': 'application/json' }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status?.error_code === 429 || res.statusCode === 403) {
            resolve(false); return;
          }
          if (parsed.bitcoin) {
            prices.BTC = parsed.bitcoin.usd;
            prices.ETH = parsed.ethereum.usd;
            prices.SOL = parsed.solana.usd;
            lastPriceFetch = now;
          }
          resolve(true);
        } catch (e) { resolve(false); }
      });
    }).on('error', () => resolve(false));
  });
}

function simulatePriceMovement() {
  ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'LINK'].forEach(token => {
    const history = priceHistory[token];
    const candles = candleData[token];
    const last = history.length > 0 ? history[history.length - 1] : { price: prices[token], volume: 10000000 };
    
    const volatility = token === 'BTC' ? 0.003 : token === 'ETH' ? 0.004 : 0.005;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const newPrice = last.price * (1 + change);
    const volume = last.volume * (0.8 + Math.random() * 0.4);
    
    history.push({ time: Date.now(), price: newPrice, change: change * 100, volume });
    
    // Build candle data for strategies that need OHLCV
    candles.push({
      open: last.price,
      high: Math.max(last.price, newPrice) * (1 + Math.random() * 0.001),
      low: Math.min(last.price, newPrice) * (1 - Math.random() * 0.001),
      close: newPrice,
      volume: volume
    });
    
    if (history.length > 200) history.shift();
    if (candles.length > 200) candles.shift();
  });
}

// ============ TECHNICAL INDICATORS ============
function getRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i].close - prices[i-1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function getSMA(candles, period) {
  if (candles.length < period) return candles[candles.length - 1]?.close || 0;
  return candles.slice(-period).reduce((a, b) => a + b.close, 0) / period;
}

function getEMA(candles, period) {
  if (candles.length < period) return candles[candles.length - 1]?.close || 0;
  const multiplier = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((a, b) => a + b.close, 0) / period;
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
  }
  return ema;
}

function getMACD(candles) {
  const ema12 = getEMA(candles, 12);
  const ema26 = getEMA(candles, 26);
  const macdLine = ema12 - ema26;
  const signalLine = getEMA(candles.map((c, i) => ({ close: macdLine })).slice(-9), 9);
  return { macd: macdLine, signal: signalLine, histogram: macdLine - signalLine };
}

function getBollingerBands(candles, period = 20, stdDev = 2) {
  if (candles.length < period) return { upper: 0, middle: 0, lower: 0 };
  const slice = candles.slice(-period);
  const ma = slice.reduce((a, b) => a + b.close, 0) / period;
  const variance = slice.reduce((sum, b) => sum + Math.pow(b.close - ma, 2), 0) / period;
  const std = Math.sqrt(variance);
  return { upper: ma + stdDev * std, middle: ma, lower: ma - stdDev * std };
}

function getATR(candles, period = 14) {
  if (candles.length < period + 1) return 0;
  let trSum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i-1].close),
      Math.abs(candles[i].low - candles[i-1].close)
    );
    trSum += tr;
  }
  return trSum / period;
}

function getVolumeRatio(candles) {
  if (candles.length < 20) return 1;
  const recent = candles.slice(-5).reduce((a, b) => a + b.volume, 0) / 5;
  const avg = candles.slice(-20).reduce((a, b) => a + b.volume, 0) / 20;
  return recent / avg;
}

function getHighLow(candles, period = 20) {
  if (candles.length < period) return { high: candles[candles.length-1]?.close || 0, low: candles[candles.length-1]?.close || 0 };
  const slice = candles.slice(-period);
  return { high: Math.max(...slice.map(c => c.high)), low: Math.min(...slice.map(c => c.low)) };
}

function getMomentum(candles, period = 10) {
  if (candles.length < period) return 0;
  const recent = candles.slice(-3).reduce((a, b) => a + b.close, 0) / 3;
  const earlier = candles.slice(-period, -3).reduce((a, b) => a + b.close, 0) / (period - 3);
  return (recent - earlier) / earlier;
}

// ============ STRATEGIES ============
const strategies = {
  // Momentum Breakout (original ElizaOS strategy)
  'momentum-breakout': (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const rsi = getRSI(candles);
    const momentum = getMomentum(candles);
    const macd = getMACD(candles);
    const ema9 = getEMA(candles, 9);
    const ema21 = getEMA(candles, 21);
    const current = candles[candles.length - 1].close;
    const { high, low } = getHighLow(candles, 20);
    const atr = getATR(candles);
    const volumeRatio = getVolumeRatio(candles);
    
    // Entry conditions
    const hasMomentum = momentum > 0.002;
    const hasVolume = volumeRatio > 1.1;
    const trendAligned = ema9 > ema21;
    const nearSupport = current > low * 1.02;
    const goodEntry = rsi < 65 && rsi > 35;
    
    if (hasMomentum && hasVolume && trendAligned && nearSupport && goodEntry) return 'BUY';
    
    // Exit conditions
    const trendBroken = ema9 < ema21;
    const nearResistance = current > high * 0.98;
    const overbought = rsi > 75;
    
    if ((trendBroken || nearResistance || overbought) && momentum < 0) return 'SELL';
    
    return 'HOLD';
  },
  
  // Mean Reversion (original ElizaOS strategy)
  'mean-reversion': (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const rsi = getRSI(candles);
    const bb = getBollingerBands(candles);
    const current = candles[candles.length - 1].close;
    const { high, low } = getHighLow(candles, 20);
    
    // Buy when oversold or near lower band
    if (rsi < 35 || current < bb.lower * 1.01) return 'BUY';
    
    // Sell when overbought or near upper band
    if (rsi > 65 || current > bb.upper * 0.99) return 'SELL';
    
    // Also sell if at resistance
    if (current > high * 0.95) return 'SELL';
    
    return 'HOLD';
  },
  
  // Rule-Based (original ElizaOS strategy with configurable rules)
  'rule-based': (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const rsi = getRSI(candles);
    const macd = getMACD(candles);
    const smaShort = getSMA(candles, 10);
    const smaLong = getSMA(candles, 20);
    const current = candles[candles.length - 1].close;
    
    // Default buy conditions: RSI below 30, MACD above 0
    if (rsi < 30 && macd.histogram > 0) return 'BUY';
    
    // Default sell conditions: RSI above 70, MACD below 0
    if (rsi > 70 && macd.histogram < 0) return 'SELL';
    
    // SMA crossover
    if (smaShort > smaLong && current > smaShort) return 'BUY';
    if (smaShort < smaLong && current < smaShort) return 'SELL';
    
    return 'HOLD';
  },
  
  // Random Strategy (original ElizaOS)
  'random': (token) => {
    const candles = candleData[token];
    if (candles.length < 10) return 'HOLD';
    
    const random = Math.random();
    const position = candleData[token].positions?.[token];
    
    if (!position) {
      // Enter on random basis with probability
      if (random > 0.7) return 'BUY';
    } else {
      // Exit with probability
      if (random > 0.6) return 'SELL';
    }
    return 'HOLD';
  },
  
  // Simple Momentum
  momentum: (token) => {
    const candles = candleData[token];
    if (candles.length < 14) return 'HOLD';
    
    const rsi = getRSI(candles);
    const momentum = getMomentum(candles);
    const macd = getMACD(candles);
    
    if (momentum > 0.003 && rsi < 70 && macd.histogram > 0) return 'BUY';
    if (momentum < -0.003 || rsi > 80 || macd.histogram < -0.5) return 'SELL';
    return 'HOLD';
  },
  
  // Mean Reversion (simplified)
  'mean-reversion-simple': (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const rsi = getRSI(candles);
    const bb = getBollingerBands(candles);
    const current = candles[candles.length - 1].close;
    
    if (rsi < 35 || current < bb.lower * 1.01) return 'BUY';
    if (rsi > 65 || current > bb.upper * 0.99) return 'SELL';
    return 'HOLD';
  },
  
  // Grid Trading
  grid: (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const { high, low } = getHighLow(candles, 50);
    const current = candles[candles.length - 1].close;
    const range = high - low;
    const position = (current - low) / range;
    
    if (position < 0.25) return 'BUY';
    if (position > 0.75) return 'SELL';
    return 'HOLD';
  },
  
  // DCA
  dca: (token) => {
    const candles = candleData[token];
    if (candles.length < 10) return 'HOLD';
    
    const avg = candles.reduce((a, b) => a + b.close, 0) / candles.length;
    const current = candles[candles.length - 1].close;
    const pctFromAvg = (avg - current) / avg;
    
    if (pctFromAvg > 0.015) return 'BUY';
    if (pctFromAvg < -0.02) return 'SELL';
    return 'HOLD';
  },
  
  // Trend Following
  'trend-following': (token) => {
    const candles = candleData[token];
    if (candles.length < 50) return 'HOLD';
    
    const ema12 = getEMA(candles, 12);
    const ema26 = getEMA(candles, 26);
    const ema50 = getEMA(candles, 50);
    const current = candles[candles.length - 1].close;
    
    if (ema12 > ema26 && ema26 > ema50 && current > ema12) return 'BUY';
    if (ema12 < ema26 && current < ema12) return 'SELL';
    return 'HOLD';
  },
  
  // Scalping
  scalp: (token) => {
    const candles = candleData[token];
    if (candles.length < 5) return 'HOLD';
    
    const rsi = getRSI(candles, 5);
    const momentum = getMomentum(candles, 3);
    const macd = getMACD(candles);
    
    if (rsi < 35 && momentum > 0 && macd.histogram > 0) return 'BUY';
    if (rsi > 65 && momentum < 0 && macd.histogram < 0) return 'SELL';
    return 'HOLD';
  },
  
  // Breakout
  breakout: (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const { high, low } = getHighLow(candles, 20);
    const current = candles[candles.length - 1].close;
    const atr = getATR(candles);
    const volRatio = getVolumeRatio(candles);
    
    if (current > high + atr * 0.5 && volRatio > 1.2) return 'BUY';
    if (current < low - atr * 0.5 && volRatio > 1.2) return 'SELL';
    return 'HOLD';
  },
  
  // Mixed (combination)
  mixed: (token) => {
    const signals = [
      strategies.momentum(token),
      strategies['mean-reversion-simple'](token),
      strategies['trend-following'](token),
    ];
    const buys = signals.filter(s => s === 'BUY').length;
    const sells = signals.filter(s => s === 'SELL').length;
    if (buys >= 2) return 'BUY';
    if (sells >= 2) return 'SELL';
    return 'HOLD';
  },
  
  // LLM Simulated (uses all signals + random factor for variety)
  llm: (token) => {
    const candles = candleData[token];
    if (candles.length < 20) return 'HOLD';
    
    const allStrategySignals = [
      strategies.momentum(token),
      strategies['mean-reversion-simple'](token),
      strategies['trend-following'](token),
      strategies.breakout(token),
      strategies.grid(token),
    ];
    
    // Count signal weights
    const buys = allStrategySignals.filter(s => s === 'BUY').length;
    const sells = allStrategySignals.filter(s => s === 'SELL').length;
    
    // LLM-like decision: mostly follow consensus but add randomness
    if (buys > sells && Math.random() > 0.3) return 'BUY';
    if (sells > buys && Math.random() > 0.3) return 'SELL';
    
    // Small random trade chance
    if (Math.random() > 0.9) return Math.random() > 0.5 ? 'BUY' : 'SELL';
    
    return 'HOLD';
  }
};

// Aliases for backward compatibility
strategies['momentum'] = strategies.momentum;
strategies['mean_reversion'] = strategies['mean-reversion-simple'];
strategies['grid'] = strategies.grid;
strategies['dca'] = strategies.dca;
strategies['trend'] = strategies['trend-following'];
strategies['scalp'] = strategies.scalp;
strategies['breakout'] = strategies.breakout;
strategies['llm'] = strategies.llm;
strategies['rule'] = strategies['rule-based'];
strategies['random'] = strategies.random;

function generateSignal(token) {
  const strategy = strategies[activeStrategy] || strategies.mixed;
  return strategy(token);
}

// ============ TRADING LOGIC ============
function shouldTrade(token) {
  const now = Date.now();
  if (now - lastTradeTime[token] < 60000) return false;
  // No trade cap - unlimited trading
  return true;
}

async function runAutoTrade() {
  if (!autoTradingEnabled) return;
  
  await fetchPrices();
  simulatePriceMovement();
  
  const tokens = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'LINK'];
  
  for (const token of tokens) {
    if (!shouldTrade(token)) continue;
    
    const signal = generateSignal(token);
    const position = portfolio.positions[token];
    const currentPrice = prices[token];
    
    if (position) {
      const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
      if (pnlPercent <= -STOP_LOSS_PERCENT) {
        console.log(`[${activeStrategy}] Stop loss ${token}: ${(pnlPercent * 100).toFixed(1)}%`);
        executeSell(token, 100);
        continue;
      }
      if (pnlPercent >= TAKE_PROFIT_PERCENT) {
        console.log(`[${activeStrategy}] Take profit ${token}: ${(pnlPercent * 100).toFixed(1)}%`);
        executeSell(token, 100);
        continue;
      }
    }
    
    if (signal === 'BUY' && !position && portfolio.balance > 50) {
      const size = Math.min(portfolio.balance * 0.15, portfolio.balance * 0.35);
      if (size > 10) {
        console.log(`[${activeStrategy}] BUY ${token} @ $${currentPrice.toFixed(2)}`);
        executeBuy(token, size / portfolio.balance * 100);
      }
    }
    else if (signal === 'SELL' && position) {
      console.log(`[${activeStrategy}] SELL ${token} @ $${currentPrice.toFixed(2)}`);
      executeSell(token, 100);
    }
  }
}

// ============ PORTFOLIO ============
function executeBuy(token, percent) {
  const currentPrice = prices[token];
  const spendAmount = portfolio.balance * (percent / 100);
  const fee = spendAmount * TRADING_FEE;
  const quantity = (spendAmount - fee) / currentPrice;
  
  if (quantity < 0.000001 || spendAmount > portfolio.balance) return { success: false };
  
  portfolio.balance -= spendAmount;
  
  if (portfolio.positions[token]) {
    const existing = portfolio.positions[token];
    const newAmount = existing.amount + quantity;
    existing.entryPrice = (existing.entryPrice * existing.amount + currentPrice * quantity) / newAmount;
    existing.amount = newAmount;
  } else {
    portfolio.positions[token] = { amount: quantity, entryPrice: currentPrice, date: new Date().toISOString() };
  }
  
  portfolio.trades.push({ type: 'BUY', token, quantity, price: currentPrice, value: spendAmount, fee, strategy: activeStrategy, date: new Date().toISOString() });
  portfolio.totalTrades++;
  tradesToday++;
  lastTradeTime[token] = Date.now();
  saveState();
  
  return { success: true };
}

function executeSell(token, percent = 100) {
  if (!portfolio.positions[token]) return { success: false };
  
  const pos = portfolio.positions[token];
  const sellAmount = pos.amount * (percent / 100);
  const currentPrice = prices[token];
  const grossValue = sellAmount * currentPrice;
  const fee = grossValue * TRADING_FEE;
  const netValue = grossValue - fee;
  const pnl = (currentPrice - pos.entryPrice) * sellAmount;
  
  if (pnl > 0) portfolio.winningTrades++;
  
  portfolio.balance += netValue;
  pos.amount -= sellAmount;
  if (pos.amount < 0.000001) delete portfolio.positions[token];
  
  portfolio.trades.push({ type: 'SELL', token, quantity: sellAmount, price: currentPrice, value: grossValue, fee, pnl, strategy: activeStrategy, date: new Date().toISOString() });
  portfolio.totalTrades++;
  tradesToday++;
  lastTradeTime[token] = Date.now();
  saveState();
  
  return { success: true, pnl: pnl.toFixed(2) };
}

function calculatePortfolioValue() {
  let value = portfolio.balance;
  for (const [token, pos] of Object.entries(portfolio.positions)) {
    value += pos.amount * (prices[token] || 0);
  }
  return value;
}

function getOpenPositions() {
  const positions = [];
  for (const [token, pos] of Object.entries(portfolio.positions)) {
    const currentPrice = prices[token] || 0;
    const pnl = (currentPrice - pos.entryPrice) * pos.amount;
    const pnlPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
    positions.push({ token, amount: pos.amount, entryPrice: pos.entryPrice, currentPrice, pnl: pnl.toFixed(2), pnlPercent: pnlPercent.toFixed(2) });
  }
  return positions;
}

function resetPortfolio() {
  portfolio = { balance: STARTING_BALANCE, positions: {}, trades: [], totalTrades: 0, winningTrades: 0 };
  tradesToday = 0;
  lastTradeTime = { BTC: 0, ETH: 0, SOL: 0, BNB: 0, ADA: 0, LINK: 0 };
  saveState();
}

// ============ HTTP SERVER ============
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  
  const url = req.url.split('?')[0];
  
  try {
    await fetchPrices();
    
    if (url === '/api/status' && req.method === 'GET') {
      const value = calculatePortfolioValue();
      const winRate = portfolio.totalTrades > 0 ? ((portfolio.winningTrades / portfolio.totalTrades) * 100).toFixed(1) : '0.0';
      
      // Get signals from all strategies for each token
      const allSignals = {};
      ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'LINK'].forEach(token => {
        allSignals[token] = {};
        Object.keys(strategies).forEach(name => {
          if (name !== 'mixed' && name !== 'llm') { // Skip compound strategies for clean display
            try { allSignals[token][name] = strategies[name](token); } catch (e) {}
          }
        });
        allSignals[token].overall = generateSignal(token);
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        autoTrading: { enabled: autoTradingEnabled, strategy: activeStrategy, tradesToday },
        portfolio: {
          balance: portfolio.balance.toFixed(2),
          totalValue: value.toFixed(2),
          unrealizedPnL: (value - STARTING_BALANCE).toFixed(2),
          startingBalance: STARTING_BALANCE,
          totalReturn: (((value - STARTING_BALANCE) / STARTING_BALANCE) * 100).toFixed(2),
        },
        positions: getOpenPositions(),
        trades: portfolio.trades.slice(-50).reverse(),
        stats: { totalTrades: portfolio.totalTrades, winningTrades: portfolio.winningTrades, winRate: winRate + '%' },
        extendedStats: (() => {
          let largestWin = 0, largestLoss = 0, maxConsecWins = 0, curConsec = 0;
          portfolio.trades.forEach(t => {
            const p = t.pnl || 0;
            if (p > largestWin) largestWin = p;
            if (p < largestLoss) largestLoss = p;
            if (p > 0) { curConsec++; if (curConsec > maxConsecWins) maxConsecWins = curConsec; } else curConsec = 0;
          });
          return { largestWin: +largestWin.toFixed(4), largestLoss: +largestLoss.toFixed(4), maxConsecWins };
        })(),
        strategyPerformance: (() => {
          const sp = {};
          portfolio.trades.forEach(t => {
            const s = t.strategy || 'unknown';
            if (!sp[s]) sp[s] = { trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0 };
            sp[s].trades++;
            sp[s].pnl += t.pnl || 0;
            sp[s].fees += t.fee || 0;
            if ((t.pnl || 0) > 0) sp[s].wins++;
            else if ((t.pnl || 0) < 0) sp[s].losses++;
          });
          return Object.entries(sp)
            .map(([name, d]) => ({
              name,
              trades: d.trades,
              pnl: +d.pnl.toFixed(4),
              fees: +d.fees.toFixed(4),
              net: +(d.pnl - d.fees).toFixed(4),
              wins: d.wins,
              losses: d.losses,
              winRate: d.trades > 0 ? +((d.wins / d.trades) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.net - a.net);
        })(),
        prices,
        signals: allSignals,
        priceHistory,
        availableStrategies: Object.keys(strategies),
        sentiment: {
          BTC: { score: 0.35, fearGreedIndex: 58, momentum: 'stable', volume: 45000 },
          ETH: { score: 0.28, fearGreedIndex: 54, momentum: 'increasing', volume: 32000 },
          SOL: { score: 0.42, fearGreedIndex: 61, momentum: 'increasing', volume: 18000 },
          BNB: { score: 0.31, fearGreedIndex: 56, momentum: 'stable', volume: 22000 },
          ADA: { score: 0.25, fearGreedIndex: 52, momentum: 'stable', volume: 15000 },
          LINK: { score: 0.38, fearGreedIndex: 60, momentum: 'increasing', volume: 18000 }
        }
      }));
    }
    else if (url === '/api/buy' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { token, percent = 10 } = JSON.parse(body || '{}');
        if (!['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'LINK'].includes(token)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid token' }));
          return;
        }
        const result = executeBuy(token.toUpperCase(), percent);
        res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    }
    else if (url === '/api/sell' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { token, percent = 100 } = JSON.parse(body || '{}');
        const result = executeSell(token.toUpperCase(), percent);
        res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    }
    else if (url === '/api/reset' && req.method === 'POST') {
      resetPortfolio();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    else if (url === '/api/auto/start' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { strategy = 'mixed' } = JSON.parse(body || '{}');
        if (!Object.keys(strategies).includes(strategy)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unknown strategy. Use: ' + Object.keys(strategies).join(', ') }));
          return;
        }
        activeStrategy = strategy;
        autoTradingEnabled = true;
        if (autoTradeTimer) clearInterval(autoTradeTimer);
        autoTradeTimer = setInterval(runAutoTrade, AUTO_TRADE_INTERVAL);
        saveState();
        console.log(`[AUTO] Started: ${strategy}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
    }
    else if (url === '/api/auto/stop' && req.method === 'POST') {
      autoTradingEnabled = false;
      if (autoTradeTimer) { clearInterval(autoTradeTimer); autoTradeTimer = null; }
      saveState();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    else if (url === '/api/strategies' && req.method === 'GET') {
      const stratInfo = {
        'momentum-breakout': { name: 'Momentum Breakout', description: 'Volume + momentum + trend (original ElizaOS)' },
        'mean-reversion': { name: 'Mean Reversion', description: 'RSI + Bollinger Bands (original ElizaOS)' },
        'rule-based': { name: 'Rule-Based', description: 'Configurable rules with RSI/MACD/SMA (original ElizaOS)' },
        'random': { name: 'Random', description: 'Random entries with risk management (original ElizaOS)' },
        'llm': { name: 'LLM Simulated', description: 'AI-style decision making (simulated)' },
        'momentum': { name: 'Momentum', description: 'RSI + momentum + MACD' },
        'mean-reversion-simple': { name: 'Mean Reversion Simple', description: 'RSI + Bollinger Bands' },
        'grid': { name: 'Grid Trading', description: 'Buy low zone, sell high zone' },
        'dca': { name: 'DCA', description: 'Dollar cost averaging' },
        'trend-following': { name: 'Trend Following', description: 'EMA crossover' },
        'scalp': { name: 'Scalping', description: 'Fast RSI for quick trades' },
        'breakout': { name: 'Breakout', description: 'Volume + price breakout' },
        'mixed': { name: 'Mixed', description: 'Combines all strategies' }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stratInfo));
    }
    else if (url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', autoTradingEnabled }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal error' }));
  }
});

server.listen(PORT, () => {
  const stratList = Object.keys(strategies);
  console.log(`\n🚀 Trading API v3 - ${stratList.length} strategies loaded`);
  console.log(`💰 Balance: $${portfolio.balance.toFixed(2)} | Auto: ${autoTradingEnabled ? 'ON' : 'OFF'}`);
  console.log(`\n📊 Strategies (from original ElizaOS + additions):`);
  stratList.forEach(s => console.log(`   - ${s}`));
  console.log(`\n📍 Endpoints:`);
  console.log(`   GET  /api/status        - Full status with all signals`);
  console.log(`   GET  /api/strategies    - Strategy descriptions`);
  console.log(`   POST /api/auto/start    - {strategy:"momentum-breakout"}`);
  
  if (autoTradingEnabled) {
    console.log(`\n🔄 Resuming auto-trading (${activeStrategy})...`);
    autoTradeTimer = setInterval(runAutoTrade, AUTO_TRADE_INTERVAL);
  }
  
  fetchPrices().then(() => {
    console.log(`\n📈 Prices: BTC $${prices.BTC} | ETH $${prices.ETH} | SOL $${prices.SOL}\n`);
  });
});