import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { TRADING_TOKENS } from "../config/multiStrategy.ts";

const PROVIDER_KEYWORDS = [
	"market",
	"data",
	"marketdataprovider",
	"plugin",
	"auto",
	"trader",
	"status",
	"state",
	"context",
	"info",
	"details",
	"chat",
	"conversation",
	"agent",
];

function getMessageText(message: unknown): string {
	if (!message || typeof message !== "object") return "";
	const content = (message as { content?: unknown }).content;
	if (!content || typeof content !== "object") return "";
	const text = (content as { text?: unknown }).text;
	return typeof text === "string" ? text : "";
}

function isRelevant(message: Memory, state?: State): boolean {
	void message;
	void state;
	return true;
}

interface CoinPrice {
	symbol: string;
	price: number;
	change24h: number;
	volume24h: number;
	marketCap: number;
}

// Fetch prices for BTC, ETH, SOL from CoinGecko
async function fetchCryptoPrices(): Promise<Map<string, CoinPrice>> {
	const prices = new Map<string, CoinPrice>();
	const ids = "bitcoin,ethereum,solana";
	const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true&include_24hr_change=true`;

	try {
		const response = await fetch(url, {
			headers: { "Accept": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`CoinGecko API error: ${response.status}`);
		}

		const data = (await response.json()) as {
			bitcoin?: { usd: number; usd_24h_vol: number; usd_market_cap: number; usd_24h_change: number };
			ethereum?: { usd: number; usd_24h_vol: number; usd_market_cap: number; usd_24h_change: number };
			solana?: { usd: number; usd_24h_vol: number; usd_market_cap: number; usd_24h_change: number };
		};

		if (data.bitcoin) {
			prices.set("BTC", {
				symbol: "BTC",
				price: data.bitcoin.usd,
				change24h: data.bitcoin.usd_24h_change || 0,
				volume24h: data.bitcoin.usd_24h_vol || 0,
				marketCap: data.bitcoin.usd_market_cap || 0,
			});
		}

		if (data.ethereum) {
			prices.set("ETH", {
				symbol: "ETH",
				price: data.ethereum.usd,
				change24h: data.ethereum.usd_24h_change || 0,
				volume24h: data.ethereum.usd_24h_vol || 0,
				marketCap: data.ethereum.usd_market_cap || 0,
			});
		}

		if (data.solana) {
			prices.set("SOL", {
				symbol: "SOL",
				price: data.solana.usd,
				change24h: data.solana.usd_24h_change || 0,
				volume24h: data.solana.usd_24h_vol || 0,
				marketCap: data.solana.usd_market_cap || 0,
			});
		}
	} catch (error) {
		console.error("[MarketDataProvider] Failed to fetch prices:", error);
	}

	return prices;
}

// Fetch social/market sentiment data
async function fetchSocialMetrics(): Promise<{
	fearGreedIndex: number;
	marketSentiment: string;
}> {
	// Use CoinGecko fear & greed index approximation
	// In production, you'd use a dedicated fear & greed API
	const fearGreedIndex = 55; // Default neutral
	const marketSentiment = "Mixed"; // Default

	return { fearGreedIndex, marketSentiment };
}

export const marketDataProvider: Provider = {
	name: "MARKET_DATA",
	dynamic: true,
	get: async (_runtime: IAgentRuntime, message: Memory, state?: State) => {
		if (!isRelevant(message, state)) return { text: "" };

		try {
			// Fetch real prices for BTC, ETH, SOL
			const prices = await fetchCryptoPrices();

			if (prices.size === 0) {
				// Fallback to mock data if API fails
				return {
					text: `📊 **Market Overview**

🔥 **Trading Tokens:**
• BTC: $45,234.11 (+0.9% 24h) - Vol: $15.2B
• ETH: $2,985.67 (+1.8% 24h) - Vol: $8.4B
• SOL: $102.45 (+2.3% 24h) - Vol: $2.1B

📈 **Market Sentiment:** Mixed
🏛️ **Fear & Greed Index:** 55 (Neutral)
💎 **Portfolio Mode:** $500 starting balance

⚡ **Trading Bot Configuration:**
• Mode: Paper Trading
• Allowed Tokens: BTC, ETH, SOL
• Max Positions: 3 concurrent`,
				};
			}

			// Format prices with real data
			const btc = prices.get("BTC");
			const eth = prices.get("ETH");
			const sol = prices.get("SOL");

			const formatVolume = (v: number) => {
				if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
				if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
				return `$${(v / 1e3).toFixed(1)}K`;
			};

			const formatMarketCap = (v: number) => {
				if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
				if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
				return `$${(v / 1e6).toFixed(1)}M`;
			};

			const btcInfo = btc
				? `• BTC: $${btc.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${btc.change24h >= 0 ? "+" : ""}${btc.change24h.toFixed(2)}% 24h) - Vol: ${formatVolume(btc.volume24h)}`
				: "• BTC: unavailable";

			const ethInfo = eth
				? `• ETH: $${eth.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${eth.change24h >= 0 ? "+" : ""}${eth.change24h.toFixed(2)}% 24h) - Vol: ${formatVolume(eth.volume24h)}`
				: "• ETH: unavailable";

			const solInfo = sol
				? `• SOL: $${sol.price.toFixed(2)} (${sol.change24h >= 0 ? "+" : ""}${sol.change24h.toFixed(2)}% 24h) - Vol: ${formatVolume(sol.volume24h)}`
				: "• SOL: unavailable";

			// Determine overall sentiment
			const avgChange = btc && eth && sol
				? (btc.change24h + eth.change24h + sol.change24h) / 3
				: 0;
			const marketSentiment = avgChange > 2 ? "Strong Bullish" :
				avgChange > 0.5 ? "Bullish" :
				avgChange > -0.5 ? "Mixed" :
				avgChange > -2 ? "Bearish" : "Strong Bearish";

			const fearGreedIndex = Math.round(50 + avgChange * 10);
			const fearGreedEmoji = fearGreedIndex > 65 ? "🤑" :
				fearGreedIndex > 55 ? "🙂" :
				fearGreedIndex > 45 ? "😐" :
				fearGreedIndex > 35 ? "😰" : "😱";

			const totalMarketCap = btc && eth && sol
				? btc.marketCap + eth.marketCap + sol.marketCap
				: 0;

			const marketText = `📊 **Market Overview** (BTC, ETH, SOL)

🔥 **Trading Prices:**
${btcInfo}
${ethInfo}
${solInfo}

📈 **Market Sentiment:** ${marketSentiment}
${fearGreedEmoji} **Fear & Greed Index:** ${fearGreedIndex}
💎 **Combined Market Cap:** ${formatMarketCap(totalMarketCap)}

⚡ **Trading Bot Configuration:**
• Mode: Paper Trading ($${500} starting)
• Allowed Tokens: BTC, ETH, SOL
• Max Positions: 3 concurrent
• Stop Loss: 5% | Take Profit: 15%

💡 Say "start trading" to begin automated trading.`;

			return { text: marketText };
		} catch (error) {
			console.error("[MarketDataProvider] Error:", error);
			return { text: "Market data is currently unavailable." };
		}
	},
};