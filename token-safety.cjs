/**
 * Token Safety Guard v2 — CommonJS
 * Validates tokens before trading — filters out rug pull candidates.
 * 
 * Run: node token-safety.cjs validate <SYMBOL>
 */

const https = require('https');
const http = require('http');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// ── Trusted Core Tokens ───────────────────────────────────
const CORE_TOKENS = {
  BTC: true, ETH: true, SOL: true, BNB: true, ADA: true, LINK: true,
  XRP: true, DOT: true, AVAX: true, MATIC: true, UNI: true, LTC: true,
  ATOM: true, XLM: true, ALGO: true, VET: true, FIL: true, ICP: true,
  NEAR: true, APT: true, ARB: true, OP: true, SUI: true, MATIC: true
};

// ── Blocked ──────────────────────────────────────────────
// ── Blocked Tokens — rug pull / pump & dump / suspicious ──────────────────────
// Meme coins (highly volatile, no utility, first to rug)
const BLOCKED = [
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

// ── HTTP Helper ───────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const proto = urlObj.protocol === 'https:' ? https : http;
    const req = proto.get(urlObj, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
  });
}

// ── CoinGecko ID Resolver ─────────────────────────────────
const ID_CACHE = {};
const SYMBOL_MAP = {
  'DOGE': 'dogecoin', 'DOT': 'polkadot', 'SHIB': 'shiba-inu', 'PEPE': 'pepe',
  'WIF': 'dogwifcoin', 'BONK': 'bonk', 'FLOKI': 'floki', 'MATIC': 'matic-network',
  'AR': 'arweave', 'STX': 'blockstack', 'SUI': 'sui', 'APT': 'aptos',
  'OP': 'optimism', 'ARB': 'arbitrum', 'TIA': 'celestia', 'SEI': 'sei-network',
  'INJ': 'injective-protocol', 'JUP': 'jupiter-exchange-solana'
};

async function findCoinGeckoId(symbol) {
  const sym = symbol.toLowerCase();
  if (ID_CACHE[sym]) return ID_CACHE[sym];
  if (SYMBOL_MAP[symbol.toUpperCase()]) { ID_CACHE[sym] = SYMBOL_MAP[symbol.toUpperCase()]; return ID_CACHE[sym]; }
  try {
    const search = await httpGet(`${COINGECKO_API}/search?query=${encodeURIComponent(symbol)}`);
    if (search?.coins?.length > 0) {
      const exact = search.coins.find(c => c.symbol?.toLowerCase() === sym) || search.coins[0];
      if (exact?.id) { ID_CACHE[sym] = exact.id; return exact.id; }
    }
  } catch {}
  // Fallback: try /coins/list
  try {
    const list = await httpGet(`${COINGECKO_API}/coins/list`);
    if (Array.isArray(list)) {
      const match = list.find(c => c.symbol === sym);
      if (match?.id) { ID_CACHE[sym] = match.id; return match.id; }
    }
  } catch {}
  return null;
}

// ── Core Token Check ─────────────────────────────────────
function isCoreToken(symbol) {
  return !!CORE_TOKENS[symbol.toUpperCase()];
}

function isBlocked(symbol) {
  return BLOCKED.includes(symbol.toUpperCase());
}

// ── Red Flags ─────────────────────────────────────────────
function checkRedFlags(md, marketCap, volume24h) {
  const flags = [];
  if ((marketCap || 0) < 1000) flags.push('Market cap too low');
  if (volume24h > 0 && marketCap / volume24h > 50) flags.push('Illiquid (MC/Vol > 50)');
  if ((volume24h || 0) < 500 && (marketCap || 0) > 10000) flags.push('No real trading volume');
  return flags;
}

// ── Trust Score ───────────────────────────────────────────
function scoreToken(mc, vol24h, ageDays, change30d) {
  let score = 0;
  const reasons = [];

  // Market cap (30)
  if (mc >= 100_000_000) { score += 30; reasons.push(`MC $${(mc/1e6).toFixed(0)}M ✅`); }
  else if (mc >= 10_000_000) { score += 15; reasons.push(`MC $${(mc/1e6).toFixed(0)}M ⚠️`); }
  else { reasons.push(`MC $${(mc/1e6).toFixed(0)}M ❌`); }

  // Volume (25)
  if (vol24h >= 1_000_000) { score += 25; reasons.push(`Vol $${(vol24h/1e6).toFixed(1)}M ✅`); }
  else if (vol24h >= 100_000) { score += 12; reasons.push(`Vol $${(vol24h/1e3).toFixed(0)}K ⚠️`); }
  else { reasons.push(`Vol $${(vol24h/1e3).toFixed(0)}K ❌`); }

  // Age (25)
  if (ageDays >= 180) { score += 25; reasons.push(`${ageDays}d ✅`); }
  else if (ageDays >= 30) { score += 12; reasons.push(`${ageDays}d ⚠️`); }
  else { reasons.push(`${ageDays}d ❌ Too new`); }

  // Stability (20) - abs 30d change
  const abs30 = Math.abs(change30d || 0);
  if (abs30 <= 30) { score += 20; reasons.push(`30d Δ ${abs30.toFixed(0)}% ✅`); }
  else if (abs30 <= 100) { score += 10; reasons.push(`30d Δ ${abs30.toFixed(0)}% ⚠️`); }
  else { reasons.push(`30d Δ ${abs30.toFixed(0)}% ❌ Volatile`); }

  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';
  return { score, grade, reasons };
}

// ── Main Validator ───────────────────────────────────────
async function validateToken(symbol) {
  const sym = symbol.toUpperCase();

  if (isCoreToken(sym)) {
    return { symbol: sym, trust: true, grade: 'A+', score: 100, reasons: ['Core trusted token'], category: 'core' };
  }
  if (isBlocked(sym)) {
    return { symbol: sym, trust: false, grade: 'F', score: 0, reasons: ['Blocked token — high rug risk'], category: 'blocked' };
  }

  const coinId = await findCoinGeckoId(sym);
  if (!coinId) {
    return { symbol: sym, trust: false, grade: 'F', score: 0, reasons: ['Token not found on CoinGecko'], category: 'unknown' };
  }

  try {
    const data = await httpGet(`${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`);
    if (!data) return { symbol: sym, trust: false, grade: 'F', score: 0, reasons: ['API failed'], category: 'api_error' };

    const md = data.market_data || {};
    const mc = md.market_cap?.usd || 0;
    const vol = md.total_volume?.usd || 0;
    const price = md.current_price?.usd;
    const change30 = md.price_change_percentage_30d || 0;
    const rank = data.market_cap_rank;
    const name = data.name;
    const symbolStr = data.symbol;

    let ageDays = 0;
    if (data.genesis_date) {
      ageDays = Math.floor((Date.now() - new Date(data.genesis_date).getTime()) / 86400000);
    } else if (data.listing_date) {
      ageDays = Math.floor((Date.now() - new Date(data.listing_date).getTime()) / 86400000);
    }

    const redFlags = checkRedFlags(md, mc, vol);
    if (redFlags.length > 0) {
      return { symbol: sym, trust: false, grade: 'F', score: 0, reasons: redFlags, category: 'red_flag', coinId };
    }

    const trust = scoreToken(mc, vol, ageDays, change30);
    return {
      symbol: sym, trust: trust.score >= 40, grade: trust.grade, score: trust.score,
      reasons: trust.reasons, category: trust.score >= 80 ? 'safe' : trust.score >= 40 ? 'caution' : 'risky',
      coinId, name, symbolStr, price, marketCap: mc, volume24h: vol,
      ageDays, change30d: change30, rank
    };
  } catch (e) {
    return { symbol: sym, trust: false, grade: 'F', score: 0, reasons: [e.message], category: 'error' };
  }
}

// ── Quick Check ────────────────────────────────────────────
async function canTrade(symbol) {
  const result = await validateToken(symbol);
  return result;
}

// ── CLI ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === 'validate' && args[1]) {
  validateToken(args[1]).then(r => {
    console.log(`\nToken Safety Report: ${r.symbol}`);
    console.log(`Trust: ${r.trust ? '✅ PASS' : '❌ FAIL'} | Grade: ${r.grade} | Score: ${r.score}/100`);
    console.log(`Category: ${r.category}`);
    console.log('Reasons:');
    r.reasons.forEach(re => console.log('  -', re));
    if (r.marketCap) {
      console.log(`\nMarket Cap: $${(r.marketCap/1e6).toFixed(1)}M | Vol: $${(r.volume24h/1e6).toFixed(1)}M | Age: ${r.ageDays}d | 30d Δ: ${r.change30d?.toFixed(1)}%`);
      console.log(`Rank: #${r.rank || 'N/A'} | Price: $${r.price?.toFixed(6) || 'N/A'}`);
    }
    process.exit(r.trust ? 0 : 1);
  });
} else if (cmd === 'can-trade') {
  canTrade(args[1]).then(r => {
    console.log(r.trust ? 'ALLOW' : 'BLOCK');
    process.exit(r.trust ? 0 : 2);
  });
} else if (cmd === 'batch' && args[1]) {
  Promise.all(args.slice(1).map(s => validateToken(s))).then(results => {
    results.forEach(r => {
      console.log(`${r.trust ? '✅' : '❌'} ${r.symbol} | ${r.grade} | ${r.score}/100 | ${r.reasons[0]}`);
    });
    process.exit(0);
  });
} else {
  console.log('Usage: node token-safety.cjs validate <SYMBOL>   — Check single token');
  console.log('       node token-safety.cjs can-trade <SYMBOL> — Return 0=allow, 2=block');
  console.log('       node token-safety.cjs batch <SYMBOLS...>   — Check multiple');
  console.log('\nExamples:');
  console.log('  node token-safety.cjs validate BTC');
  console.log('  node token-safety.cjs can-trade ETH');
  console.log('  node token-safety.cjs batch BTC ETH SOL PEPE DOGE');
}

module.exports = { validateToken, canTrade };
