/**
 * Market Insights Service
 * Centralized fetching for Advanced Indian Market Data
 * Routes through /api/proxy to avoid CORS issues
 */

import { indianApiLimiter } from "./rateLimiter";

export interface StockInsight {
    symbol: string;
    stock_name: string;
    current_price: number;
    change_percent: number;
    status?: "UP" | "DOWN";
}

// Helper to build proxy URL - ensuring we use the 'url' parameter which is more robust
const buildProxyUrl = (endpoint: string, params?: Record<string, string>) => {
    const baseUrl = "https://stock.indianapi.in";
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const targetUrl = `${baseUrl}/${endpoint}${queryString ? `?${queryString}` : ""}`;
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
};

export const fetchTrendingStocks = async () => {
    const CACHE_KEY = "trending_stocks_cache";
    const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

    try {
        // 1. Check Cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) return data;
        }

        const res = await indianApiLimiter.add(() => fetch(buildProxyUrl("trending_stocks")));
        
        if (res.status === 429) throw new Error("429");
        if (!res.ok) throw new Error("API Offline");
        
        const data = await res.json();
        
        // 2. Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        return data;
    } catch (err: any) {
        if (err.message === "429") {
            console.warn("[MarketInsights] Rate Limit (429) hit for Trending. Backing off...");
            const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
            if (cached) {
                try {
                    return JSON.parse(cached).data || [];
                } catch {
                    // Ignore parse error
                }
            }
        } else {
            console.warn("[MarketInsights] Trending fetch failed", err);
        }
        return [];
    }
};

export const fetchNSEMostActive = async (): Promise<StockInsight[]> => {
    const CACHE_KEY = "nse_active_cache";
    const CACHE_TIME = 15 * 60 * 1000; // 15 minutes

    try {
        // 1. Check Cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) return data;
        }

        const res = await indianApiLimiter.add(() => fetch(buildProxyUrl("NSE_most_active")));
        
        if (res.status === 429) throw new Error("429");
        if (!res.ok) throw new Error("API Path Error");
        
        const data = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = Array.isArray(data) ? data : ((data as any).data || []);
        if (!Array.isArray(list)) return [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: StockInsight[] = list.map((item: any) => ({
            symbol: item.ticker ? item.ticker.replace('.NS', '') : item.symbol,
            stock_name: item.company || item.stock_name || item.name,
            current_price: item.price || item.current_price || item.currentPrice?.NSE || 0,
            change_percent: item.percent_change || item.change_percent || item.pChange || 0,
            status: ((item.percent_change || item.change_percent || item.pChange || 0) >= 0 ? "UP" : "DOWN") as "UP" | "DOWN"
        }));

        // 2. Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: results, timestamp: Date.now() }));
        return results;
    } catch (err: any) {
        if (err.message === "429") {
            console.warn("[MarketInsights] Rate Limit (429) hit for NSE Most Active. Cooling down...");
        } else {
            console.warn("[MarketInsights] NSE Most Active fetch failed", err);
        }
        return [];
    }
};

export const fetch52WeekHighLow = async () => {
    try {
        // Common pattern for this API
        const res = await indianApiLimiter.add(() => fetch(buildProxyUrl("52_week_high_low")));
        if (!res.ok) throw new Error("API Path Error");
        return await res.json();
    } catch {
        console.warn("[MarketInsights] 52 Week High/Low fetch failed");
        return { high: [], low: [] };
    }
};

export const searchMutualFunds = async (query: string) => {
    try {
        const res = await fetch(buildProxyUrl("mutual_fund_search", { query }));
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
};

export const getMutualFundDetails = async (fundId: string) => {
    try {
        const res = await fetch(buildProxyUrl("mutual_funds_details", { id: fundId }));
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
};
