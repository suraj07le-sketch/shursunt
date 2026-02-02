/**
 * Market Insights Service
 * Centralized fetching for Advanced Indian Market Data
 * Routes through /api/proxy to avoid CORS issues
 */

export interface StockInsight {
    symbol: string;
    stock_name: string;
    current_price: number;
    change_percent: number;
    status?: "UP" | "DOWN";
}

// Helper to build proxy URL
const buildProxyUrl = (endpoint: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams({ endpoint, ...params });
    return `/api/proxy?${searchParams.toString()}`;
};

export const fetchTrendingStocks = async () => {
    try {
        const res = await fetch(buildProxyUrl("trending"));
        if (!res.ok) throw new Error("API Offline");
        return await res.json();
    } catch (err) {
        // Fallback mock data when API is unavailable
        return [
            { symbol: "TATAELXSI", stock_name: "Tata Elxsi", current_price: 7850.45, change_percent: 2.34 },
            { symbol: "RELIANCE", stock_name: "Reliance Ind", current_price: 2456.20, change_percent: 1.15 },
            { symbol: "HDFCBANK", stock_name: "HDFC Bank", current_price: 1645.80, change_percent: -0.45 },
            { symbol: "ZOMATO", stock_name: "Zomato Ltd", current_price: 156.40, change_percent: 4.56 },
            { symbol: "WIPRO", stock_name: "Wipro", current_price: 489.20, change_percent: -1.20 }
        ];
    }
};

export const fetchNSEMostActive = async () => {
    try {
        const res = await fetch(buildProxyUrl("NSE_most_active"));
        if (!res.ok) return [];
        const data = await res.json();

        // Map API response to StockInsight interface
        return data.map((item: any) => ({
            symbol: item.ticker ? item.ticker.replace('.NS', '') : item.symbol,
            stock_name: item.company || item.stock_name,
            current_price: item.price || item.current_price,
            change_percent: item.percent_change || item.change_percent,
            status: (item.percent_change || item.change_percent) >= 0 ? "UP" : "DOWN"
        }));
    } catch (err) { return []; }
};

export const fetch52WeekHighLow = async () => {
    try {
        const res = await fetch(buildProxyUrl("fetch_52_week_high_low_data"));
        if (!res.ok) return { high: [], low: [] };
        return await res.json();
    } catch (err) { return { high: [], low: [] }; }
};

export const searchMutualFunds = async (query: string) => {
    try {
        const res = await fetch(buildProxyUrl("mutual_fund_search", { query }));
        if (!res.ok) return [];
        return await res.json();
    } catch (err) { return []; }
};

export const getMutualFundDetails = async (fundId: string) => {
    try {
        const res = await fetch(buildProxyUrl("mutual_funds_details", { id: fundId }));
        if (!res.ok) return null;
        return await res.json();
    } catch (err) { return null; }
};

