/**
 * Notification Agent
 * Sends alerts to Telegram and Discord for trading events.
 * Run: node notification-agent.cjs <event> <payload-json>
 * 
 * Events:
 *   trade-executed  {token, side, amount, price, strategy, pnl}
 *   trade-closed   {token, pnl, pnlPercent, exitReason}
 *   daily-summary  {dailyPnL, dailyPnLPercent, totalTrades, winRate}
 *   risk-alert     {alertType, message, value, threshold}
 *   auto-started   {strategy}
 *   auto-stopped   
 *   error          {error, context}
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const STATE_DIR = path.join(process.argv[1]?.replace(/notification-agent\.cjs$/, '') || '.', 'state');
const CONFIG_PATH = path.join(STATE_DIR, 'config.json');
const NOTIF_LOG_PATH = path.join(STATE_DIR, 'notifications.json');
const API_BASE = 'http://localhost:3002';

// ── Config ───────────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return { notifications: { telegram: { enabled: false }, discord: { enabled: false } } };
  }
}

function saveNotification(notif) {
  try {
    let logs = [];
    if (fs.existsSync(NOTIF_LOG_PATH)) {
      logs = JSON.parse(fs.readFileSync(NOTIF_LOG_PATH, 'utf8'));
    }
    logs.unshift(notif);
    if (logs.length > 100) logs = logs.slice(0, 100);
    fs.writeFileSync(NOTIF_LOG_PATH, JSON.stringify({ notifications: logs, lastUpdated: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.error('[NOTIF-AGENT] Failed to save notification log:', e.message);
  }
}

// ── HTTP Helpers ─────────────────────────────────────────
function httpPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const postData = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
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

// ── Telegram ─────────────────────────────────────────────
async function sendTelegram(config, text) {
  if (!config?.botToken || !config?.chatId) return;
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const res = await httpPost(url, {
      chat_id: config.chatId,
      text,
      parse_mode: 'Markdown'
    });
    if (res.status === 200) {
      console.log('[NOTIF-AGENT] Telegram sent ✅');
    } else {
      console.error('[NOTIF-AGENT] Telegram error:', res.body);
    }
  } catch (e) {
    console.error('[NOTIF-AGENT] Telegram failed:', e.message);
  }
}

// ── Discord ──────────────────────────────────────────────
async function sendDiscord(config, embed) {
  if (!config?.webhookUrl) return;
  try {
    const res = await httpPost(config.webhookUrl, { embeds: [embed] });
    if (res.status === 200 || res.status === 204) {
      console.log('[NOTIF-AGENT] Discord sent ✅');
    } else {
      console.error('[NOTIF-AGENT] Discord error:', res.body);
    }
  } catch (e) {
    console.error('[NOTIF-AGENT] Discord failed:', e.message);
  }
}

// ── Priority Helpers ──────────────────────────────────────
function getEmoji(priority) {
  return { critical: '🚨', high: '⚠️', medium: '📢', low: 'ℹ️' }[priority] || 'ℹ️';
}

function getColor(priority) {
  return { critical: 0xff0000, high: 0xff8c00, medium: 0xffd700, low: 0x00b050 }[priority] || 0x00b050;
}

function getDiscordColor(priority) {
  return { critical: 15548905, high: 15105570, medium: 16747287, low: 3447003 }[priority] || 3447003;
}

// ── Message Builders ──────────────────────────────────────
function buildTradeExecutedMsg(params) {
  const emoji = '📊';
  const side = params.side === 'BUY' ? '🟢 BUY' : '🔴 SELL';
  return [
    `${emoji} *Trade Executed*`,
    ``,
    `*${side}* \`${params.token}\``,
    `Amount: \`${params.amount}\``,
    `Price: \`$${params.price.toFixed(6)}\``,
    `Value: \`$${params.value?.toFixed(2) || '?'}\``,
    `Strategy: \`${params.strategy}\``,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildTradeClosedMsg(params) {
  const isProfit = params.pnl >= 0;
  const emoji = isProfit ? '🟢' : '🔴';
  const sign = isProfit ? '+' : '';
  return [
    `${emoji} *Trade Closed*`,
    ``,
    `*${isProfit ? 'PROFIT' : 'LOSS'}* \`${params.token}\``,
    `PnL: \`${sign}$${params.pnl.toFixed(2)} (${params.pnlPercent.toFixed(2)}%)\``,
    `Exit: \`${params.exitReason}\``,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildDailySummaryMsg(params) {
  const isProfit = params.dailyPnL >= 0;
  const emoji = isProfit ? '🟢' : '🔴';
  const sign = isProfit ? '+' : '';
  return [
    `📈 *Daily Summary*`,
    ``,
    `PnL: \`${sign}$${params.dailyPnL.toFixed(2)} (${params.dailyPnLPercent.toFixed(2)}%)\``,
    `Trades: \`${params.totalTrades}\``,
    `Win Rate: \`${(params.winRate * 100).toFixed(1)}%\``,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildRiskAlertMsg(params) {
  return [
    `🚨 *Risk Alert*`,
    ``,
    `\`${params.alertType}\``,
    `${params.message}`,
    `Value: \`$${params.value.toFixed(2)}\` | Threshold: \`$${params.threshold.toFixed(2)}\``,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildAutoStartedMsg(params) {
  return [
    `▶️ *Auto-Trading Started*`,
    ``,
    `Strategy: \`${params.strategy}\``,
    `Mode: Paper Trading`,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildAutoStoppedMsg() {
  return [
    `⏹️ *Auto-Trading Stopped*`,
    ``,
    `Mode: Manual`,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

function buildErrorMsg(params) {
  return [
    `❌ *Error*`,
    ``,
    `\`${params.error}\``,
    `Context: \`${params.context || 'unknown'}\``,
    ``,
    `🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })} SG`
  ].join('\n');
}

// ── Build Discord Embed ───────────────────────────────────
function buildDiscordEmbed(type, params, priority, title, description, color) {
  const footer = `Michael's Trading Crew • ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Singapore' })}`;
  const embed = {
    title,
    description,
    color: getDiscordColor(priority),
    footer: { text: footer },
    fields: []
  };

  if (type === 'trade-executed') {
    embed.fields = [
      { name: 'Token', value: params.token, inline: true },
      { name: 'Side', value: params.side, inline: true },
      { name: 'Strategy', value: params.strategy, inline: true },
      { name: 'Price', value: `$${params.price.toFixed(6)}`, inline: true },
      { name: 'Value', value: `$${params.value?.toFixed(2) || '?'}`, inline: true }
    ];
  } else if (type === 'trade-closed') {
    embed.fields = [
      { name: 'Token', value: params.token, inline: true },
      { name: 'PnL', value: `$${params.pnl.toFixed(2)} (${params.pnlPercent.toFixed(2)}%)`, inline: true },
      { name: 'Exit Reason', value: params.exitReason, inline: true }
    ];
  } else if (type === 'daily-summary') {
    embed.fields = [
      { name: 'Daily PnL', value: `$${params.dailyPnL.toFixed(2)} (${params.dailyPnLPercent.toFixed(2)}%)`, inline: true },
      { name: 'Total Trades', value: String(params.totalTrades), inline: true },
      { name: 'Win Rate', value: `${(params.winRate * 100).toFixed(1)}%`, inline: true }
    ];
  } else if (type === 'risk-alert') {
    embed.fields = [
      { name: 'Alert Type', value: params.alertType, inline: true },
      { name: 'Value', value: `$${params.value.toFixed(2)}`, inline: true },
      { name: 'Threshold', value: `$${params.threshold.toFixed(2)}`, inline: false },
      { name: 'Message', value: params.message, inline: false }
    ];
  }

  return embed;
}

// ── Main Dispatcher ───────────────────────────────────────
async function send(event, params = {}) {
  const config = loadConfig();
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    event,
    params,
    timestamp: new Date().toISOString(),
    channels: []
  };

  let priority, title, message, color;

  switch (event) {
    case 'trade-executed':
      priority = 'medium';
      title = `Trade Executed: ${params.side} ${params.token}`;
      message = buildTradeExecutedMsg(params);
      break;
    case 'trade-closed':
      priority = params.pnl < 0 ? 'high' : 'medium';
      title = `Trade Closed: ${params.token}`;
      message = buildTradeClosedMsg(params);
      break;
    case 'daily-summary':
      priority = 'low';
      title = 'Daily Summary';
      message = buildDailySummaryMsg(params);
      break;
    case 'risk-alert':
      priority = 'critical';
      title = `Risk Alert: ${params.alertType}`;
      message = buildRiskAlertMsg(params);
      break;
    case 'auto-started':
      priority = 'low';
      title = 'Auto-Trading Started';
      message = buildAutoStartedMsg(params);
      break;
    case 'auto-stopped':
      priority = 'low';
      title = 'Auto-Trading Stopped';
      message = buildAutoStoppedMsg();
      break;
    case 'error':
      priority = 'high';
      title = 'Trading Error';
      message = buildErrorMsg(params);
      break;
    default:
      priority = 'low';
      title = event;
      message = JSON.stringify(params);
  }

  // Dashboard log (always)
  notif.channels.push('dashboard');
  console.log(`[NOTIF-AGENT] ${title}`);
  console.log(message);

  // Telegram
  if (config.notifications?.telegram?.enabled) {
    notif.channels.push('telegram');
    await sendTelegram(config.notifications.telegram, message);
  }

  // Discord
  if (config.notifications?.discord?.enabled) {
    notif.channels.push('discord');
    const embed = buildDiscordEmbed(event, params, priority, title, message, color);
    await sendDiscord(config.notifications.discord, embed);
  }

  // Save to log
  saveNotification(notif);

  return notif;
}

// ── CLI Entry Point ───────────────────────────────────────
const event = process.argv[2];
const params = process.argv[3] ? JSON.parse(process.argv[3]) : {};

if (!event) {
  console.error('Usage: node notification-agent.cjs <event> [params-json]');
  console.error('Events: trade-executed, trade-closed, daily-summary, risk-alert, auto-started, auto-stopped, error');
  process.exit(1);
}

send(event, params)
  .then(notif => {
    console.log('[NOTIF-AGENT] Done — channels:', notif.channels.join(', '));
    process.exit(0);
  })
  .catch(err => {
    console.error('[NOTIF-AGENT] Error:', err.message);
    process.exit(1);
  });