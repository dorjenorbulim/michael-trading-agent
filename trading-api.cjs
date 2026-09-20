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

// HTTP helper for CoinGecko calls
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.get(urlObj, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); resolve(null); });
  });
}

const fs = require('fs');
const { spawn } = require('child_process');

const STATE_FILE = './trading-state.json';
const PORT = 3002;
const STARTING_BALANCE = 500;
const TRADING_FEE = 0.001;
const AUTO_TRADE_INTERVAL = 30000;
const STOP_LOSS_PERCENT = 0.05;
const TAKE_PROFIT_PERCENT = 0.15;
// 8 trades/day cap: at small capital, more trades means fees eat the balance
const MAX_TRADES_PER_DAY = 8;

// Strategies the auto-switcher must never select (broken, unreliable, or
// dependent on volume indicators that were unreliable at small capital)
const DISABLED_STRATEGIES = new Set(['random', 'llm', 'scalp', 'breakout', 'momentum-breakout']);

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
      portfolio, autoTradingEnabled, activeStrategy, tradesToday, lastTradeTime, lastTradeDate, savedAt: new Date().toISOString()
    }, null, 2));
  } catch (e) {}
}

const savedState = loadState();
let lastTradeDate = savedState?.lastTradeDate || '';
let portfolio = savedState?.portfolio || { balance: STARTING_BALANCE, positions: {}, trades: [], totalTrades: 0, winningTrades: 0 };
let activities = savedState?.activities || [];  // all decisions incl. HOLDs
let autoTradingEnabled = savedState?.autoTradingEnabled || false;
let activeStrategy = savedState?.activeStrategy || 'momentum';
if (DISABLED_STRATEGIES.has(activeStrategy)) activeStrategy = 'momentum'; // never resume into a disabled strategy
let tradesToday = savedState?.tradesToday || 0;
let lastTradeTime = savedState?.lastTradeTime || { BTC: 0, ETH: 0, SOL: 0, BNB: 0, ADA: 0, LINK: 0 };
let autoTradeTimer = null;
let activeSource = 'unknown'; // 'auto-trading', 'manual', or sender label

// ── Strategy Auto-Switcher ──────────────────────────────────────────
const STRATEGY_SWITCH_INTERVAL = 45; // evaluate every N cycles
const MIN_TRADES_TO_JUDGE = 3;      // need at least this many trades before switching
const STRATEGY_COOLDOWN = 600000;   // don't switch same strategy within 10 min
let lastStrategySwitch = 0;
let strategySwitchCounter = 0;

let currentBestStrategy = null;

function getStrategyPerformance() {
  const sp = {};
  Object.keys(strategies).forEach(name => {
    if (name === 'mixed' || name === 'llm') return;
    sp[name] = { name, trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0, net: 0 };
  });
  portfolio.trades.forEach(t => {
    const s = t.strategy || 'unknown';
    if (!sp[s]) sp[s] = { name: s, trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0, net: 0 };
    sp[s].trades++;
    sp[s].pnl += t.pnl || 0;
    sp[s].fees += t.fee || 0;
    if ((t.pnl || 0) > 0) sp[s].wins++;
    else if ((t.pnl || 0) < 0) sp[s].losses++;
  });
  return Object.entries(sp).map(([name, d]) => ({
    name, label: strategies[name]?.name || name,
    trades: d.trades, pnl: d.pnl, net: d.pnl - d.fees,
    wins: d.wins, losses: d.losses,
    winRate: d.trades > 0 ? (d.wins / d.trades) : 0
  })).sort((a, b) => b.net - a.net);
}

function findBestStrategy() {
  const perf = getStrategyPerformance();
  if (perf.length === 0) return null;
  
  // Filter strategies with enough trades (never select a disabled strategy)
  const eligible = perf.filter(s => !DISABLED_STRATEGIES.has(s.name) && s.trades >= MIN_TRADES_TO_JUDGE && s.net > 0);
  if (eligible.length === 0) {
    // No profitable strategy yet — use momentum or trend-following as default
    return perf.find(s => s.name === 'momentum') || perf.find(s => s.name === 'trend-following') || perf.find(s => !DISABLED_STRATEGIES.has(s.name)) || null;
  }
  
  // Pick best by net P&L
  return eligible[0];
}

function shouldAutoSwitch() {
  const now = Date.now();
  
  // Don't switch too frequently
  if (now - lastStrategySwitch < STRATEGY_COOLDOWN) return false;
  
  // Increment counter
  strategySwitchCounter++;
  if (strategySwitchCounter < STRATEGY_SWITCH_INTERVAL) return false;
  
  strategySwitchCounter = 0;
  
  const best = findBestStrategy();
  if (!best) return false;
  
  // Switch if current isn't the best
  if (activeStrategy !== best.name && best.net > 0) {
    const perf = getStrategyPerformance();
    const currentPerf = perf.find(s => s.name === activeStrategy);
    const currentNet = currentPerf?.net || 0;
    
    // Only switch if best is meaningfully better (> 20% better)
    if (best.net > currentNet * 1.2 || currentNet < 0) {
      console.log(`[STRATEGY SWITCH] ${activeStrategy} (net: $${currentNet.toFixed(2)}) → ${best.name} (net: $${best.net.toFixed(2)})`);
      activeStrategy = best.name;
      lastStrategySwitch = now;
      saveState();
      return true;
    }
  }
  return false;
} // 'auto-trading', 'manual', or sender label

// Dynamic token universe — starts with core 6, grows as we discover traded tokens
const BASE_TOKENS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'LINK'];
const TRACKED_TOKENS = new Set(BASE_TOKENS); // grows dynamically

let prices = { BTC: 95000, ETH: 3450, SOL: 142, BNB: 580, ADA: 0.58, LINK: 18 };
let priceHistory = { BTC: [], ETH: [], SOL: [], BNB: [], ADA: [], LINK: [] };
let lastPriceFetch = 0;
let candleData = { BTC: [], ETH: [], SOL: [], BNB: [], ADA: [], LINK: [] }; // OHLCV-style data

// Token safety cache — stores validation results
// Key: token symbol, Value: { trust: bool, score: number, grade: string, cachedAt: timestamp }
const tokenSafetyCache = new Map();
const SAFETY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Core trusted tokens — always allow without check
const CORE_TOKENS = ['BTC','ETH','SOL','BNB','ADA','LINK','XRP','DOT','AVAX','MATIC','UNI','LTC','ATOM','XLM','ALGO','VET','FIL','ICP','NEAR','APT','ARB','OP','SUI'];

// Blocked tokens — always reject
// ── Blocked Tokens — rug pull / pump & dump / suspicious ──────────────────────
// Meme coins (highly volatile, no utility, first to rug)
const BLOCKED_TOKENS = [
  // Meme coins
  'PEPE', 'SHIB', 'BONK', 'FLOKI', 'WIF', 'DOGE', 'ELON', 'FARTCOIN', 'TRUMP', 'BODEN',
  'MAGA', 'RUG', 'MOG', 'BOME', 'SLERF', 'POPCAT', 'DEGEN', 'AERO', 'FWOG', 'ACT',
  'PNUT', 'GOAT', 'AI16Z', 'FAI16Z', 'ZEREBRO', 'VADER', 'RETARD', 'SCOCK', 'CHEYENNE',
  // Suspicious / clone tokens
  'SAFE', 'SAFE2', 'USDT2', 'USDC2', 'USDT3', 'PAYPAL', 'SOLANA2', 'ETHEREUM2',
  // Likely honeypots / honeypot patterns
  'HONEYPOT', 'HPT', 'RUGPULL', 'HAMSTER', 'KOALA', 'PIG', 'CICD', 'TIGER', 'FROG',
  // Social engineered clones
  'TRUMP2', 'MELANIA', 'BIDEN', 'KAMALA', 'OBAMA', 'BURNS', 'MSTR', 'PLTR2',
  // Airdrop claim scams
  'ARB2', 'OP2', 'ZK2', 'STRK2', 'EIGEN2', 'TIA2', 'ZORA2',
  // "AI agent" memecoins (extreme volatility, no fundamentals)
  'AIAGENT', 'AICODER', 'VIRTUAL', 'ACT2', 'GRASS', 'ZWJ', 'VVAII',
  // Suspicious new tokens with generic names
  'PEPE2', 'PEPE3', 'NEWPEPE', 'NEW', 'FREE', 'GIVEAWAY', 'CLAIM', 'AIRDROP2',
  '1000x', '1000X', 'MOON', '5000X', '10000X',
];

// Register a new token for tracking (called when trading a new token)
function addTrackedToken(token) {
  const t = token.toUpperCase();
  if (TRACKED_TOKENS.has(t)) return;
  TRACKED_TOKENS.add(t);
  if (!prices[t]) prices[t] = 0;
  if (!priceHistory[t]) priceHistory[t] = [];
  if (!candleData[t]) candleData[t] = [];
  if (!lastTradeTime[t]) lastTradeTime[t] = 0;
  console.log(`[TOKEN] Now tracking ${t}`);
}

// ── Rising Star Scanner ──────────────────────────────────────────────
// Scans CoinGecko for emerging tokens with momentum
async function scanRisingStars(limit = 20) {
  try {
    // Get top gainers (sorted by price change 24h)
    const data = await httpGet(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h,7d`
    );
    if (!data || !Array.isArray(data)) return [];
    
    const candidates = [];
    for (const coin of data) {
      const sym = (coin.symbol || '').toUpperCase();
      if (BLOCKED_TOKENS.includes(sym)) continue;
      if (CORE_TOKENS.includes(sym)) continue;
      if (TRACKED_TOKENS.has(sym)) continue;
      
      const mc = coin.market_cap || 0;
      const vol = coin.total_volume || 0;
      const change24h = coin.price_change_percentage_24h || 0;
      const age = coin.price_change_percentage_7d !== null ? 7 : 0; // if has 7d data, at least 7 days old
      
      // Rising star criteria: 24h volume > $5M, 24h price change > 5%, market cap > $1M
      if (vol > 5_000_000 && change24h > 5 && mc > 1_000_000) {
        candidates.push({
          symbol: sym,
          name: coin.name,
          price: coin.current_price,
          change24h,
          marketCap: mc,
          volume24h: vol,
          rank: coin.market_cap_rank,
          coinId: coin.id
        });
      }
    }
    
    // Sort by change24h descending, take top candidates
    candidates.sort((a, b) => b.change24h - a.change24h);
    return candidates.slice(0, limit);
  } catch (e) {
    console.log('[RISING STAR] Scan failed:', e.message);
    return [];
  }
}

// Add to tracked universe if safe
async function addRisingStarCandidate(coinId, symbol) {
  const sym = symbol.toUpperCase();
  if (TRACKED_TOKENS.has(sym)) return { added: false, reason: 'already tracked' };
  if (BLOCKED_TOKENS.includes(sym)) return { added: false, reason: 'blocked' };
  if (CORE_TOKENS.includes(sym)) return { added: false, reason: 'core token' };
  
  // Quick safety check via CoinGecko data
  try {
    const data = await httpGet(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`);
    if (!data) return { added: false, reason: 'api failed' };
    
    const md = data.market_data || {};
    const mc = md.market_cap?.usd || 0;
    const vol = md.total_volume?.usd || 0;
    
    // Minimum bar: $500K market cap, $50K 24h volume
    if (mc < 500_000 || vol < 50_000) {
      return { added: false, reason: `below minimums (MC:$${(mc/1e6).toFixed(1)}M, Vol:$${(vol/1e3).toFixed(0)}K)` };
    }
    
    addTrackedToken(sym);
    console.log(`[RISING STAR] Added ${sym} (${data.name}) | MC: $${(mc/1e6).toFixed(1)}M | Vol: $${(vol/1e6).toFixed(1)}M | 24h: ${md.price_change_percentage_24h?.toFixed(1)}%`);
    
    // Fetch price immediately
    const priceData = await httpGet(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    if (priceData && priceData[coinId]?.usd) {
      prices[sym] = priceData[coinId].usd;
    }
    
    return { added: true, symbol: sym, name: data.name, marketCap: mc, volume: vol };
  } catch (e) {
    return { added: false, reason: e.message };
  }
}

function isTokenSafe(token) {
  const t = String(token || '').toUpperCase().trim();
  const now = Date.now();
  
  // Strict symbol validation before any exec — token names come from external
  // APIs and user input, so they must never reach a shell
  if (!/^[A-Z0-9]{1,16}$/.test(t)) {
    return { trust: false, score: 0, grade: 'F', reason: 'invalid-symbol-format' };
  }
  
  // Core tokens — always safe
  if (CORE_TOKENS.includes(t)) return { trust: true, score: 100, grade: 'A+', reason: 'core-token' };
  
  // Blocked tokens — always reject
  if (BLOCKED_TOKENS.includes(t)) return { trust: false, score: 0, grade: 'F', reason: 'blocked-token' };
  
  // Check cache
  const cached = tokenSafetyCache.get(t);
  if (cached && (now - cached.cachedAt) < SAFETY_CACHE_TTL) {
    return cached;
  }
  
  // Run token-safety.cjs to check (args passed without a shell — no injection)
  try {
    const { execFileSync } = require('child_process');
    const result = execFileSync('node', [`${__dirname}/token-safety.cjs`, 'can-trade', t], { timeout: 5000 });
    const isAllowed = result.toString().trim() === 'ALLOW';
    const cacheEntry = { trust: isAllowed, score: isAllowed ? 50 : 0, grade: isAllowed ? 'B' : 'F', reason: 'coin-gecko-check', cachedAt: now };
    tokenSafetyCache.set(t, cacheEntry);
    return cacheEntry;
  } catch (e) {
    // If check fails, default to blocked for safety
    return { trust: false, score: 0, grade: 'F', reason: 'check-failed-default-block' };
  }
}

// ============ PRICE FETCHING ============
// CoinGecko coin list for ID→Symbol mapping
let coinListCache = null;
async function getCoinList() {
  if (coinListCache) return coinListCache;
  try {
    const data = await httpGet('https://api.coingecko.com/api/v3/coins/list');
    if (Array.isArray(data)) { coinListCache = data; return data; }
  } catch {}
  return [];
}

// Map symbol → CoinGecko ID
const SYMBOL_TO_ID = {
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin',
  'ADA': 'cardano', 'LINK': 'chainlink', 'XRP': 'ripple', 'DOT': 'polkadot',
  'AVAX': 'avalanche-2', 'MATIC': 'matic-network', 'UNI': 'uniswap', 'LTC': 'litecoin',
  'ATOM': 'cosmos', 'XLM': 'stellar', 'ALGO': 'algorand', 'VET': 'vechain',
  'FIL': 'filecoin', 'ICP': 'internet-computer', 'NEAR': 'near', 'APT': 'aptos',
  'ARB': 'arbitrum', 'OP': 'optimism', 'SUI': 'sui', 'DOGE': 'dogecoin',
  'TRX': 'tron', 'TON': 'the-open-network', 'CRO': 'cronos', 'VIRTUAL': 'virtual-protocol',
};

function symbolToId(sym) {
  return SYMBOL_TO_ID[sym.toUpperCase()] || sym.toLowerCase();
}

async function fetchPrices() {
  const now = Date.now();
  if (now - lastPriceFetch < 60000) return;
  
  // Always include base tokens + any that have been traded
  const allTokens = [...TRACKED_TOKENS];
  const ids = [...new Set(allTokens.map(symbolToId))].join(',');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.coingecko.com',
      path: `/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24h_change=true&include_24h_vol=true&include_sparkline=true`,
      headers: { 'User-Agent': 'Mozilla/5.0 TradingBot/1.0', 'Accept': 'application/json' }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status?.error_code === 429 || res.statusCode === 403 || parsed.error) {
            console.log('[PRICE] CoinGecko rate limited or error');
            resolve(false); return;
          }
          let updated = 0;
          for (const [id, priceData] of Object.entries(parsed)) {
            if (priceData?.usd) {
              // Find symbol from our ID map (reverse lookup)
              const entry = Object.entries(SYMBOL_TO_ID).find(([sym, i]) => i === id);
              const sym = entry ? entry[0] : id.toUpperCase();
              prices[sym] = priceData.usd;
              if (!priceHistory[sym]) priceHistory[sym] = [];
              if (!candleData[sym]) candleData[sym] = [];
              // Always populate volume: per-minute estimate of 24h volume, carrying
              // forward the last known value when the API omits it (prevents NaN poisoning)
              const prev = priceHistory[sym][priceHistory[sym].length - 1];
              const lastKnownVolume = Number.isFinite(prev?.volume) && prev.volume > 0 ? prev.volume : 10000000;
              const volume = Number.isFinite(priceData.usd_24h_vol) && priceData.usd_24h_vol > 0
                ? priceData.usd_24h_vol / 1440 // 24h volume → per-minute estimate
                : lastKnownVolume;
              priceHistory[sym].push({ price: priceData.usd, change24h: priceData.usd_24h_change || 0, time: now, volume });
              if (priceHistory[sym].length > 288) priceHistory[sym].shift(); // keep ~24h of minutely data
              updated++;
            }
          }
          lastPriceFetch = now;
          if (updated > 0) console.log(`[PRICE] Updated ${updated} tokens`);
          resolve(true);
        } catch (e) { console.log('[PRICE] Fetch failed:', e.message); resolve(false); }
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
    // Carry forward the last known volume instead of propagating NaN into candles
    const lastVolume = Number.isFinite(last.volume) && last.volume > 0 ? last.volume : 10000000;
    const volume = lastVolume * (0.8 + Math.random() * 0.4);
    
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

// EMA over a plain numeric series, seeded with an SMA (same convention as getEMA)
function emaOfSeries(values, period) {
  if (values.length < period) return values.length > 0 ? values[values.length - 1] : 0;
  const multiplier = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  return ema;
}

function getEMA(candles, period) {
  return emaOfSeries(candles.map(c => c.close), period);
}

function getMACD(candles) {
  const closes = candles.map(c => c.close);
  if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  // MACD line series: EMA(12) - EMA(26), tracked per candle
  const mult12 = 2 / 13;
  const mult26 = 2 / 27;
  let ema12 = closes.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  let ema26 = closes.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
  const macdSeries = [];
  for (let i = 0; i < closes.length; i++) {
    if (i >= 12) ema12 = (closes[i] - ema12) * mult12 + ema12;
    if (i >= 26) ema26 = (closes[i] - ema26) * mult26 + ema26;
    if (i >= 25) macdSeries.push(ema12 - ema26);
  }

  // Signal line: EMA(9) of the MACD line series (not of a constant)
  const macd = macdSeries[macdSeries.length - 1];
  const signal = emaOfSeries(macdSeries, 9);
  return { macd, signal, histogram: macd - signal };
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
  if (period <= 3) return 0; // need at least one candle outside the recent 3-candle window
  const recent = candles.slice(-3).reduce((a, b) => a + b.close, 0) / 3;
  const earlier = candles.slice(-period, -3).reduce((a, b) => a + b.close, 0) / (period - 3);
  if (!earlier) return 0; // guard against divide-by-zero
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
    const momentum = getMomentum(candles, 5); // period 3 was degenerate: empty lookback → 0/0
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
  
  // Reset tradesToday if it's a new day (SG timezone)
  const sgDate = new Date(now + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (sgDate !== lastTradeDate) {
    tradesToday = 0;
    lastTradeDate = sgDate;
    console.log('[TRADE CAP] New day reset — trades cleared');
  }
  
  // Check daily trade cap
  if (tradesToday >= MAX_TRADES_PER_DAY) {
    console.log(`[TRADE CAP] Daily limit reached (${MAX_TRADES_PER_DAY}) — skipping`);
    return false;
  }
  
  // 60-second cooldown per token
  if (now - lastTradeTime[token] < 60000) return false;
  return true;
}

async function runAutoTrade() {
  if (!autoTradingEnabled) return;
  activeSource = 'auto-trading';
  
  await fetchPrices();
  simulatePriceMovement();
  
  // ── Strategy Auto-Switch ──────────────────────────
  const switched = shouldAutoSwitch();
  if (switched) console.log(`[AUTO] Now using strategy: ${activeStrategy}`);
  
  // Scan ALL tracked tokens — not just the base 6
  const tokens = [...TRACKED_TOKENS];
  
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
        logActivity('BUY', token, currentPrice, signal, 'buy-signal', activeSource);
      }
    }
    else if (signal === 'SELL' && position) {
      console.log(`[${activeStrategy}] SELL ${token} @ $${currentPrice.toFixed(2)}`);
      executeSell(token, 100);
      logActivity('SELL', token, currentPrice, signal, 'sell-signal', activeSource);
    }
    else {
      logActivity('HOLD', token, currentPrice, signal, 'no-signal', activeSource);
    }
  }
}

// ============ PORTFOLIO ============
function executeBuy(token, percent, source) {
  // ── Token Safety Check ──────────────────────────────
  const safety = isTokenSafe(token);
  if (!safety.trust) {
    console.log(`[SAFETY] Blocked BUY ${token} — ${safety.reason} (grade: ${safety.grade})`);
    return { success: false, error: `Token ${token} failed safety check (${safety.grade})` };
  }
  
  const currentPrice = prices[token];
  if (!currentPrice) return { success: false, error: 'No price data' };
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
  
  portfolio.trades.push({ type: 'BUY', token, quantity, price: currentPrice, value: spendAmount, fee, strategy: activeStrategy, date: new Date().toISOString(), source: activeSource || 'manual' });
  logActivity('BUY', token, currentPrice, activeStrategy, 'buy-executed', activeSource || 'manual');
  portfolio.totalTrades++;
  tradesToday++;
  lastTradeTime[token] = Date.now();
  saveState();
  
  return { success: true };
}


// Log any trading decision as activity (incl. HOLD)
function logActivity(type, token, price, signal, reason, source) {
  activities.unshift({
    id: Date.now() + Math.random(),
    type,       // 'BUY' | 'SELL' | 'HOLD'
    token,
    price,
    signal,     // the signal that triggered this
    reason,     // stop-loss, take-profit, bull-signal, etc.
    source,
    timestamp: new Date().toISOString()
  });
  // Keep only last 100 activities
  if (activities.length > 100) activities = activities.slice(0, 100);
}

function executeSell(token, percent = 100, source) {
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
  
  portfolio.trades.push({ type: 'SELL', token, quantity: sellAmount, price: currentPrice, value: grossValue, fee, pnl, strategy: activeStrategy, date: new Date().toISOString(), source: activeSource || 'manual' });
  logActivity('SELL', token, currentPrice, activeStrategy, 'sell-executed', activeSource || 'manual');
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
  activities = [];
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
        activities: activities,
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
          // Initialize all strategies with 0
          Object.keys(strategies).forEach(name => {
            if (name !== 'mixed' && name !== 'llm') {
              sp[name] = { name, trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0 };
            }
          });
          // Populate from trades
          portfolio.trades.forEach(t => {
            const s = t.strategy || 'unknown';
            if (!sp[s]) sp[s] = { name: s, trades: 0, pnl: 0, fees: 0, wins: 0, losses: 0 };
            sp[s].trades++;
            sp[s].pnl += t.pnl || 0;
            sp[s].fees += t.fee || 0;
            if ((t.pnl || 0) > 0) sp[s].wins++;
            else if ((t.pnl || 0) < 0) sp[s].losses++;
          });
          return Object.entries(sp)
            .map(([name, d]) => ({
              name,
              label: strategies[name]?.name || name,
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
        const { token, percent = 10, source = 'unknown' } = JSON.parse(body || '{}');
        if (!prices[token]) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid token — no price data' }));
          return;
        }
        activeSource = source || 'manual';
        const result = executeBuy(token.toUpperCase(), percent, source);
        res.writeHead(result.success ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    }
    else if (url === '/api/sell' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { token, percent = 100, source = 'unknown' } = JSON.parse(body || '{}');
        activeSource = source || 'manual';
        const result = executeSell(token.toUpperCase(), percent, source);
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
        if (DISABLED_STRATEGIES.has(strategy)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: `Strategy '${strategy}' is disabled (broken, unreliable, or volume-dependent). Available: ` + Object.keys(strategies).filter(s => !DISABLED_STRATEGIES.has(s)).join(', ') }));
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
    else if (url === '/api/rising-stars' && req.method === 'GET') {
      const candidates = await scanRisingStars(20);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, candidates }));
    }
    else if (url === '/api/rising-stars/add' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { coinId, symbol } = JSON.parse(body || '{}');
          if (!coinId || !symbol) throw new Error('coinId and symbol required');
          const result = await addRisingStarCandidate(coinId, symbol);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
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