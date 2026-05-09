/**
 * Trading Crew Coordinator
 * 
 * Orchestrates the trading crew by:
 * - Polling trading-api.cjs every minute for new trades → triggers Notification Agent
 * - Fetching market data every 5 min → updates crew state
 * - Running scheduled jobs (daily summary)
 * 
 * Run: node crew-coordinator.cjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const STATE_DIR = path.join('.', 'state');
const CONFIG_PATH = path.join(STATE_DIR, 'config.json');
const NOTIF_LOG_PATH = path.join(STATE_DIR, 'notifications.json');
const CREW_STATE_PATH = path.join(STATE_DIR, 'crew-state.json');
const API = 'http://localhost:3002';

// ── Config ────────────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function loadCrewState() {
  try {
    return JSON.parse(fs.readFileSync(CREW_STATE_PATH, 'utf8'));
  } catch {
    return { lastTradeCount: 0, lastNotificationId: null, startTime: Date.now() };
  }
}

function saveCrewState(state) {
  fs.writeFileSync(CREW_STATE_PATH, JSON.stringify(state, null, 2));
}

// ── HTTP Helper ────────────────────────────────────────────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET'
    };
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const postData = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── Notification Logging ──────────────────────────────────
function logNotification(event, params, channels) {
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    event,
    params,
    timestamp: new Date().toISOString(),
    channels
  };
  try {
    let logs = [];
    if (fs.existsSync(NOTIF_LOG_PATH)) {
      logs = JSON.parse(fs.readFileSync(NOTIF_LOG_PATH, 'utf8')).notifications || [];
    }
    logs.unshift(notif);
    if (logs.length > 100) logs = logs.slice(0, 100);
    fs.writeFileSync(NOTIF_LOG_PATH, JSON.stringify({ notifications: logs, lastUpdated: new Date().toISOString() }, null, 2));
  } catch (e) {}
  return notif;
}

// ── Notification Sending ───────────────────────────────────
async function sendTelegram(text, config) {
  if (!config?.botToken || !config?.chatId) return;
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    await httpPost(url, { chat_id: config.chatId, text, parse_mode: 'Markdown' });
  } catch (e) {
    console.error('[COORD] Telegram error:', e.message);
  }
}

async function sendDiscord(embed, config) {
  if (!config?.webhookUrl) return;
  try {
    await httpPost(config.webhookUrl, { embeds: [embed] });
  } catch (e) {
    console.error('[COORD] Discord error:', e.message);
  }
}

// ── Build Messages ─────────────────────────────────────────
function buildTradeMsg(side, token, amount, price, value, strategy, pnl) {
  const emoji = side === 'BUY' ? '🟢' : '🔴';
  return [
    `${emoji} *Trade ${side}*\`,
    ``,
    `*${token}* Amount: \`${amount}\``,
    `Price: \`$${price.toFixed(6)}\` Value: \`$${value?.toFixed(2) || '?'}\``,
    `Strategy: \`${strategy}\``,
    pnl !== undefined ? `PnL: \`${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}\`` : '',
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].filter(Boolean).join('\n');
}

function buildDiscordEmbed(title, description, fields, priority) {
  const colors = { critical: 15548905, high: 15105570, medium: 16747287, low: 3447003 };
  return {
    title,
    description,
    color: colors[priority] || 3447003,
    footer: { text: `Michael's Trading Crew • ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}` },
    fields
  };
}

// ── Main Loop ─────────────────────────────────────────────
let lastTradeCount = 0;
let lastTrades = [];

async function pollAndNotify() {
  const config = loadConfig();
  const crewState = loadCrewState();

  try {
    const data = await httpGet(API + '/api/status');
    const trades = data.portfolio?.trades || [];
    const tradesToday = data.tradesToday || 0;

    // Detect new trades
    const newTrades = trades.filter(t => {
      const tradeTime = new Date(t.date || t.timestamp).getTime();
      return tradeTime > (crewState.lastTradeTime || 0);
    });

    if (newTrades.length > 0) {
      console.log(`[COORD] ${newTrades.length} new trade(s) detected`);

      for (const trade of newTrades) {
        // Trade executed notification
        const msg = buildTradeMsg(
          trade.type,
          trade.token || trade.symbol || '?',
          trade.quantity || trade.amount || '?',
          trade.price || 0,
          trade.value,
          trade.strategy || 'unknown',
          trade.pnl
        );

        const channels = [];
        const embeds = [];

        // Always log to dashboard
        channels.push('dashboard');

        // Telegram
        if (config.notifications?.telegram?.enabled) {
          await sendTelegram(msg, config.notifications.telegram);
          channels.push('telegram');
        }

        // Discord
        if (config.notifications?.discord?.enabled) {
          const embed = buildDiscordEmbed(
            `Trade ${trade.type}: ${trade.token || trade.symbol}`,
            msg,
            [
              { name: 'Token', value: trade.token || trade.symbol, inline: true },
              { name: 'Side', value: trade.type, inline: true },
              { name: 'Strategy', value: trade.strategy || 'unknown', inline: true },
              { name: 'Price', value: `$${(trade.price || 0).toFixed(6)}`, inline: true },
              { name: 'Value', value: `$${trade.value?.toFixed(2) || '?'}`, inline: true }
            ],
            'medium'
          );
          await sendDiscord(embed, config.notifications.discord);
          channels.push('discord');
        }

        logNotification('trade-executed', trade, channels);
      }

      // Update crew state
      crewState.lastTradeTime = Date.now();
      saveCrewState(crewState);
    }

    // Check for trade count changes (new trades executing)
    if (tradesToday !== lastTradeCount) {
      console.log(`[COORD] Trades today: ${tradesToday}`);
      lastTradeCount = tradesToday;
    }

    lastTrades = trades.slice(-5);

  } catch (e) {
    if (e.code === 'ECONNREFUSED') {
      console.log('[COORD] API not running — skipping poll');
    } else {
      console.error('[COORD] Poll error:', e.message);
    }
  }
}

// ── Daily Summary ──────────────────────────────────────────
async function sendDailySummary() {
  const config = loadConfig();
  try {
    const data = await httpGet(API + '/api/status');
    const trades = data.portfolio?.trades || [];
    const startBalance = 500;
    const currentBalance = data.portfolio?.balance || startBalance;
    const positionsValue = Object.values(data.portfolio?.positions || {}).reduce((s, p) => s + (p.value || 0), 0);
    const totalValue = currentBalance + positionsValue;
    const dailyPnL = totalValue - startBalance;
    const dailyPct = (dailyPnL / startBalance) * 100;
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? wins / totalTrades : 0;

    const isProfit = dailyPnL >= 0;
    const emoji = isProfit ? '🟢' : '🔴';
    const msg = [
      `📈 *Daily Trading Summary*`,
      ``,
      `Total Value: \`$${totalValue.toFixed(2)}\``,
      `Daily PnL: \`${isProfit ? '+' : ''}$${dailyPnL.toFixed(2)} (${dailyPct.toFixed(2)}%)\``,
      `Trades Today: \`${data.tradesToday || 0} / 30\``,
      `Total Trades: \`${totalTrades}\` | Win Rate: \`${(winRate * 100).toFixed(1)}%\``,
      ``,
      `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
    ].join('\n');

    const channels = ['dashboard'];

    if (config.notifications?.telegram?.enabled) {
      await sendTelegram(msg, config.notifications.telegram);
      channels.push('telegram');
    }

    if (config.notifications?.discord?.enabled) {
      const embed = buildDiscordEmbed(
        'Daily Trading Summary',
        msg,
        [
          { name: 'Total Value', value: `$${totalValue.toFixed(2)}`, inline: true },
          { name: 'Daily PnL', value: `${isProfit ? '+' : ''}$${dailyPnL.toFixed(2)} (${dailyPct.toFixed(2)}%)`, inline: true },
          { name: 'Trades', value: String(data.tradesToday || 0), inline: true },
          { name: 'Win Rate', value: `${(winRate * 100).toFixed(1)}%`, inline: true }
        ],
        'low'
      );
      await sendDiscord(embed, config.notifications.discord);
      channels.push('discord');
    }

    logNotification('daily-summary', { dailyPnL, dailyPct, totalTrades, winRate, tradesToday: data.tradesToday }, channels);
    console.log('[COORD] Daily summary sent ✅');

  } catch (e) {
    console.error('[COORD] Daily summary failed:', e.message);
  }
}

// ── CLI ────────────────────────────────────────────────────
const command = process.argv[2];

if (command === 'daily-summary') {
  sendDailySummary().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else if (command === 'poll') {
  pollAndNotify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else {
  // Interactive / continuous mode
  console.log('🚀 Trading Crew Coordinator');
  console.log('Usage:');
  console.log('  node crew-coordinator.cjs poll          — run once');
  console.log('  node crew-coordinator.cjs daily-summary — send daily summary');
  console.log('  node crew-coordinator.cjs start          — continuous mode (default)');
  console.log('');
  console.log('Set CRON_TICK=60000 for 1-minute intervals, CRON_TICK=300000 for 5-min');
  
  const tick = parseInt(process.env.CRON_TICK || '60000');
  console.log(`\nStarting continuous mode with ${tick/1000}s interval...`);
  console.log('[COORD] Crew active. Press Ctrl+C to stop.\n');

  // Initial poll
  pollAndNotify();

  // Continuous loop
  setInterval(pollAndNotify, tick);
}