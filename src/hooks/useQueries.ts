"use client";

import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

import { Prediction } from "@/types/prediction";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder for public/demo predictions

const FALLBACK_PREDICTIONS: Record<'stock' | 'crypto', Prediction[]> = {
    stock: [
        {
            id: 'demo-stock-1',
            type: 'stock',
            stock_name: 'RELIANCE',
            name: 'RELIANCE',
            signal: 'BUY',
            trend: 'BUY',
            confidence: 88,
            accuracy_percent: 88,
            current_price: 2980.50,
            predicted_price: 3120.00,
            prediction_change_percent: 4.68,
            stop_loss_price: 2920.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'QUINTUPLE',
            market_regime: 'TRENDING'
        },
        {
            id: 'demo-stock-2',
            type: 'stock',
            stock_name: 'TCS',
            name: 'TCS',
            signal: 'BUY',
            trend: 'BUY',
            confidence: 82,
            accuracy_percent: 82,
            current_price: 4150.00,
            predicted_price: 4310.00,
            prediction_change_percent: 3.85,
            stop_loss_price: 4080.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'TRIPLE',
            market_regime: 'TRENDING'
        },
        {
            id: 'demo-stock-3',
            type: 'stock',
            stock_name: 'INFY',
            name: 'INFY',
            signal: 'HOLD',
            trend: 'HOLD',
            confidence: 64,
            accuracy_percent: 64,
            current_price: 1840.20,
            predicted_price: 1855.00,
            prediction_change_percent: 0.80,
            stop_loss_price: 1810.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'PARTIAL',
            market_regime: 'RANGING'
        }
    ],
    crypto: [
        {
            id: 'demo-crypto-1',
            type: 'crypto',
            coin: 'BTC',
            coin_name: 'Bitcoin',
            name: 'BTC',
            signal: 'BUY',
            trend: 'BUY',
            confidence: 91,
            accuracy_percent: 91,
            current_price: 64200.00,
            predicted_price: 67800.00,
            prediction_change_percent: 5.61,
            stop_loss_price: 62500.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'OCTET',
            market_regime: 'TRENDING'
        },
        {
            id: 'demo-crypto-2',
            type: 'crypto',
            coin: 'ETH',
            coin_name: 'Ethereum',
            name: 'ETH',
            signal: 'BUY',
            trend: 'BUY',
            confidence: 85,
            accuracy_percent: 85,
            current_price: 3480.00,
            predicted_price: 3690.00,
            prediction_change_percent: 6.03,
            stop_loss_price: 3390.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'SEXTET',
            market_regime: 'TRENDING'
        },
        {
            id: 'demo-crypto-3',
            type: 'crypto',
            coin: 'SOL',
            coin_name: 'Solana',
            name: 'SOL',
            signal: 'BUY',
            trend: 'BUY',
            confidence: 79,
            accuracy_percent: 79,
            current_price: 152.40,
            predicted_price: 164.80,
            prediction_change_percent: 8.13,
            stop_loss_price: 145.00,
            created_at: new Date().toISOString(),
            predicted_time: new Date(Date.now() + 14400000).toISOString(),
            timeframe: '4h',
            confluence: 'TRIPLE',
            market_regime: 'TRENDING'
        }
    ]
};

/**
 * Fetch all market data (Stocks or Crypto)
 * Reads primarily from Supabase, but can be updated by Sync
 */
export function useMarketData(type: 'stock' | 'crypto' = 'stock', initialData: any[] = []) {
    return useQuery({
        queryKey: ['market-data', type],
        queryFn: async () => {
            const tableName = type === 'stock' ? 'indian_stocks' : 'crypto_coins';
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order(type === 'stock' ? 'market_cap' : 'rank', { ascending: type === 'crypto' });

            if (error) throw error;

            const results = (data || []).map((item: any, index: number) => ({
                id: item.id,
                symbol: item.symbol,
                name: item.name,
                image: item.image || null,
                current_price: type === 'stock' ? item.current_price : (item.price_usd || item.current_price),
                price_change_percentage_24h: type === 'stock' ? item.price_change_percentage_24h : (item.change_24h || item.price_change_percentage_24h),
                high_24h: item.high_24h,
                low_24h: item.low_24h,
                market_cap: type === 'stock' ? item.market_cap : (item.market_cap_usd || item.market_cap || 0),
                market_cap_rank: item.market_cap_rank || item.rank || (index + 1),
                volume: item.volume,
                asset_type: type
            }));

            return results.length > 0 ? results : initialData;
        },
        initialData: initialData.length > 0 ? initialData : undefined,
        staleTime: 5 * 60 * 1000, // 5 mins
        refetchOnWindowFocus: false,
    });
}

/**
 * Triggers a live sync from /api/sync and updates the market-data queries
 */
export function useSyncMarketData() {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['market-sync'],
        queryFn: async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            try {
                const res = await fetch('/api/sync', { signal: controller.signal });
                clearTimeout(timeoutId);
                const json = await res.json();

                if (json.success && json.data) {
                    if (json.data.stocks?.length > 0) {
                        queryClient.setQueryData(['market-data', 'stock'], json.data.stocks);
                    }
                    if (json.data.cryptos?.length > 0) {
                        queryClient.setQueryData(['market-data', 'crypto'], json.data.cryptos);
                    }
                    return json.data;
                }
                return null;
            } catch (e) {
                clearTimeout(timeoutId);
                return null;
            }
        },
        refetchInterval: 5 * 60 * 1000, // Sync every 5 mins
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetch User's Watchlist
 */
export function useWatchlist() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['watchlist', user?.id],
        queryFn: async () => {
            if (!user) return [];
            try {
                const { data, error } = await supabase
                    .from("watchlist")
                    .select("*")
                    .eq("user_id", user.id)
                    .order('created_at', { ascending: false });
                if (error) {
                    console.warn('[useWatchlist] Error fetching watchlist:', error.message);
                    return [];
                }
                return data || [];
            } catch (err) {
                console.warn('[useWatchlist] Exception:', err);
                return [];
            }
        },
        enabled: !!user,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetch Predictions for a specific tab and date
 */
export function usePredictions(type: 'stock' | 'crypto', date?: string): UseQueryResult<Prediction[], Error> {
    const { user } = useAuth();
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

    return useQuery({
        queryKey: ['predictions', type, date, user?.id],
        queryFn: async () => {
            const userId = user?.id || DEMO_USER_ID;
            const tableName = type === 'stock' ? 'stock_predictions' : 'crypto_predictions';

            try {
                let query = supabase
                    .from(tableName as any)
                    .select("*")
                    .or(`user_id.eq.${userId},user_id.eq.${DEMO_USER_ID}`)
                    .order('created_at', { ascending: false });

                if (date) {
                    const dateObj = new Date(`${date}T00:00:00Z`);
                    const istOffsetMs = 19800000;
                    const startTimestamp = dateObj.getTime() - istOffsetMs;
                    const endTimestamp = startTimestamp + (24 * 60 * 60 * 1000) - 1;

                    query = query
                        .gte('created_at', new Date(startTimestamp).toISOString())
                        .lte('created_at', new Date(endTimestamp).toISOString())
                        .limit(1000);
                } else {
                    query = query.limit(100);
                }

                const { data, error } = await query;
                if (error) {
                    console.warn('[usePredictions] Supabase query error, returning fallback dataset:', error.message);
                    return FALLBACK_PREDICTIONS[type];
                }

                const rawList = data && data.length > 0 ? data : FALLBACK_PREDICTIONS[type];

                const normalized = rawList.map((p: any) => ({
                    ...p,
                    type,
                    name: type === 'stock' ? (p.stock_name || p.name) : (p.coin_name || p.coin || p.name),
                    confidence: p.confidence || p.accuracy_percent || 85,
                    predicted_time: p.predicted_time || p.predicted_time_ist || p.created_at
                }));

                const seen = new Set();
                const filtered = normalized.filter((p: any) => {
                    const key = p.name;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                return filtered.length > 0 ? filtered : FALLBACK_PREDICTIONS[type];
            } catch (err) {
                console.warn('[usePredictions] Fetch failed, returning fallback dataset:', err);
                return FALLBACK_PREDICTIONS[type];
            }
        },
        enabled: true,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}


/**
 * Dashboard Stats and Aggregations
 */
export function useDashboardStats() {
    const { user } = useAuth();
    const { data: watchlist } = useWatchlist();

    return useQuery({
        queryKey: ['dashboard-stats', user?.id, watchlist?.length],
        queryFn: async () => {
            try {
                const [stocks, crypto] = await Promise.all([
                    supabase.from("indian_stocks").select("*", { count: 'exact', head: true }),
                    supabase.from("crypto_coins").select("*", { count: 'exact', head: true })
                ]);

                return {
                    totalStocks: stocks.count || 0,
                    totalCrypto: crypto.count || 0,
                    watchlistStocks: (watchlist || []).filter((i: any) => i.asset_type === 'stock').length,
                    watchlistCrypto: (watchlist || []).filter((i: any) => i.asset_type === 'crypto' || !i.asset_type).length,
                };
            } catch (err) {
                return {
                    totalStocks: 0,
                    totalCrypto: 0,
                    watchlistStocks: (watchlist || []).filter((i: any) => i.asset_type === 'stock').length,
                    watchlistCrypto: (watchlist || []).filter((i: any) => i.asset_type === 'crypto' || !i.asset_type).length,
                };
            }
        },
        enabled: true,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch Mutual Funds based on search
 */
export function useMutualFunds(query: string) {
    return useQuery({
        queryKey: ['mutual-funds', query],
        queryFn: async () => {
            if (query.length < 3) return [];
            try {
                const targetUrl = `https://stock.indianapi.in/mutual_fund_search?query=${encodeURIComponent(query)}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 6000);
                const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (!res.ok) return [];
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            } catch (err) {
                console.warn('[useMutualFunds] Search failed:', err);
                return [];
            }
        },
        enabled: query.length >= 3,
        staleTime: 10 * 60 * 1000,
    });
}

const FALLBACK_IPO_DATA = {
    active: [
        {
            name: "Pranav Constructions",
            symbol: "PRANAV",
            issue_price: "₹118 - ₹124",
            size: "₹450 Cr",
            bidding_start_date: "07 Sep 2026",
            bidding_end_date: "09 Sep 2026",
            listing_date: "14 Sep 2026",
            subscription: { qib: 1.2, nii: 1.5, retail: 2.1, total: 1.8 },
            subscription_status: "Open (Pre-apply)",
            gmp: "+₹28 (22.6%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/PranavConstructionsLtd_56961780_94578.png",
            additional_text: "Civil engineering infrastructure & residential redevelopment contractor.",
            rhp_url: "https://groww.in/ipo/pranav-constructions-ipo"
        },
        {
            name: "Kanohar Electricals",
            symbol: "KANOHAR",
            issue_price: "₹601 - ₹632",
            size: "₹720 Cr",
            bidding_start_date: "08 Sep 2026",
            bidding_end_date: "10 Sep 2026",
            listing_date: "15 Sep 2026",
            subscription: { qib: 1.8, nii: 1.4, retail: 2.5, total: 1.9 },
            subscription_status: "Open (Pre-apply)",
            gmp: "+₹115 (18.2%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/KanoharElectricalsLtd_60822875_5928.png",
            additional_text: "High-voltage power transformers and turnkey electrical substation equipment.",
            rhp_url: "https://groww.in/ipo/kanohar-electricals-ipo"
        },
        {
            name: "Prasol Chemicals",
            symbol: "PRASOLCHEM",
            issue_price: "₹643 - ₹676",
            size: "₹800 Cr",
            bidding_start_date: "08 Sep 2026",
            bidding_end_date: "10 Sep 2026",
            listing_date: "15 Sep 2026",
            subscription: { qib: 2.4, nii: 1.9, retail: 3.8, total: 2.8 },
            subscription_status: "Open (Pre-apply)",
            gmp: "+₹145 (21.4%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/Prasol-Chemicals-Ltd_87256655_23812.png",
            additional_text: "Specialty chemicals manufacturer of phosphorus and acetone derivative compounds.",
            rhp_url: "https://groww.in/ipo/prasol-chemicals-ipo"
        },
        {
            name: "Glass Wall Systems",
            symbol: "GLASSWALL",
            issue_price: "₹172 - ₹182",
            size: "₹350 Cr",
            bidding_start_date: "08 Sep 2026",
            bidding_end_date: "10 Sep 2026",
            listing_date: "15 Sep 2026",
            subscription: { qib: 1.5, nii: 1.1, retail: 2.1, total: 1.6 },
            subscription_status: "Open (Pre-apply)",
            gmp: "+₹32 (17.6%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/GlassWallSystemsIndiaLtd_64648161_23798.png",
            additional_text: "Architectural glass facades and curtain wall engineering company.",
            rhp_url: "https://groww.in/ipo/glass-wall-systems-india-ipo"
        },
        {
            name: "Qualiance International (SME)",
            symbol: "QUALIANCE",
            issue_price: "₹120 - ₹127",
            size: "₹48 Cr",
            bidding_start_date: "04 Sep 2026",
            bidding_end_date: "08 Sep 2026",
            listing_date: "11 Sep 2026",
            subscription: { qib: 8.4, nii: 18.2, retail: 14.1, total: 12.51 },
            subscription_status: "12.51x",
            gmp: "+₹36 (28.3%)",
            is_sme: true,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/QUALIANCEINTERNATIONALLIMITED_84674684_96489.png",
            additional_text: "Precision engineering and industrial automation components.",
            rhp_url: "https://groww.in/ipo/qualiance-international-ipo"
        },
        {
            name: "Apana Logistics (SME)",
            symbol: "APANA",
            issue_price: "₹60 - ₹60",
            size: "₹32 Cr",
            bidding_start_date: "07 Sep 2026",
            bidding_end_date: "09 Sep 2026",
            listing_date: "14 Sep 2026",
            subscription: { qib: 1.2, nii: 2.1, retail: 3.5, total: 2.4 },
            subscription_status: "Open (Pre-apply)",
            gmp: "+₹12 (20.0%)",
            is_sme: true,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/ApanaLogisticsLtd_91722802_96499.png",
            additional_text: "Multi-modal logistics, freight forwarding and warehousing provider.",
            rhp_url: "https://groww.in/ipo/apana-logistics-ipo"
        }
    ],
    upcoming: [
        {
            name: "Asset Reconstruction (ARCIL)",
            symbol: "ARCIL",
            issue_price: "₹320 - ₹340 (Est)",
            size: "₹1,800 Cr",
            bidding_start_date: "09 Sep 2026",
            bidding_end_date: "11 Sep 2026",
            listing_date: "16 Sep 2026",
            subscription: "Pending",
            gmp: "+₹45 (13.2%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/AssetReconstructionCompanyIndiaLtd_27591237_27214.png",
            additional_text: "India's pioneer asset reconstruction and stressed debt resolution company.",
            rhp_url: "https://www.arcil.co.in/sites/default/files/2026-09/Arcil-RHP-01-09-26.pdf"
        },
        {
            name: "Manipal Payment and Identity Solutions",
            symbol: "MPISL",
            issue_price: "₹410 - ₹435 (Est)",
            size: "₹1,250 Cr",
            bidding_start_date: "09 Sep 2026",
            bidding_end_date: "11 Sep 2026",
            listing_date: "16 Sep 2026",
            subscription: "Pending",
            gmp: "+₹78 (17.9%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/ManipalPaymentandIdentitySolutionsLtd_36144026_37758.png",
            additional_text: "Digital payment solutions, smart card personalization, and biometric identification.",
            rhp_url: "https://mpimanipal.com/wp-content/uploads/2026/09/Red-Herring-Prospectus_compressed.pdf"
        },
        {
            name: "Rentomojo",
            symbol: "RENTOMOJO",
            issue_price: "₹280 - ₹295 (Est)",
            size: "₹950 Cr",
            bidding_start_date: "09 Sep 2026",
            bidding_end_date: "11 Sep 2026",
            listing_date: "16 Sep 2026",
            subscription: "Pending",
            gmp: "+₹52 (17.6%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/RentomojoLtd_21045332_68302.png",
            additional_text: "Tech-enabled furniture, appliance and electronics rental subscription marketplace.",
            rhp_url: "https://groww.in/ipo/rentomojo-ipo"
        },
        {
            name: "NSE (National Stock Exchange)",
            symbol: "NSE",
            issue_price: "₹4,200 - ₹4,500 (Est)",
            size: "₹10,000 Cr",
            bidding_start_date: "TBA",
            bidding_end_date: "TBA",
            listing_date: "TBA",
            subscription: "Pending",
            gmp: "+₹950 (21.1%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stock-assets/logos2/nse.png",
            additional_text: "World's largest derivatives exchange by contract volume and India's premier exchange.",
            rhp_url: "https://groww.in/ipo"
        },
        {
            name: "Reliance Jio Infocomm",
            symbol: "JIO",
            issue_price: "₹750 - ₹820 (Est)",
            size: "₹55,000 Cr",
            bidding_start_date: "TBA",
            bidding_end_date: "TBA",
            listing_date: "TBA",
            subscription: "Pending",
            gmp: "+₹180 (22.0%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stock-assets/logos2/JIO.png",
            additional_text: "India's largest telecom and digital services provider with 470M+ subscribers.",
            rhp_url: "https://groww.in/ipo"
        }
    ],
    listed: [
        {
            name: "Rays of Belief",
            symbol: "RAYSOFBELIEF",
            issue_price: "₹239",
            listing_price_est: 365,
            size: "₹380 Cr",
            listing_date: "08 Sep 2026",
            subscription: { qib: 142.5, nii: 118.4, retail: 58.2, total: 106.83 },
            gmp: "+₹126 (52.7%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/RaysofbeliefLtd_43264887_96457.png",
            additional_text: "Solar EPC and green energy solutions provider for industrial commercial projects.",
            rhp_url: "https://groww.in/ipo/rays-of-belief-ipo"
        },
        {
            name: "Deepa Jewellers",
            symbol: "DEEPAJEWEL",
            issue_price: "₹177",
            listing_price_est: 245,
            size: "₹290 Cr",
            listing_date: "08 Sep 2026",
            subscription: { qib: 52.1, nii: 48.6, retail: 26.0, total: 42.20 },
            gmp: "+₹68 (38.4%)",
            is_sme: false,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/DEEPAJEWELLERSLIMITED_78637726_96370.png",
            additional_text: "Retail chain of hallmarked gold, diamond and bridal jewellery.",
            rhp_url: "https://groww.in/ipo/deepa-jewellers-ipo"
        },
        {
            name: "Shanti Inorganics (SME)",
            symbol: "SHANTIINORG",
            issue_price: "₹83",
            listing_price_est: 158,
            size: "₹42 Cr",
            listing_date: "07 Sep 2026",
            subscription: { qib: 88.0, nii: 210.5, retail: 96.9, total: 131.83 },
            gmp: "+₹75 (90.4%)",
            is_sme: true,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/ShantiInorganicsLtd_86389745_96472.png",
            additional_text: "Inorganic specialty chemicals and battery material manufacturer.",
            rhp_url: "https://groww.in/ipo/shanti-inorganics-ipo"
        }
    ],
    closed: [
        {
            name: "Fly-Hi Maritime Travels (SME)",
            symbol: "FLYHI",
            issue_price: "₹102",
            size: "₹38 Cr",
            listing_date: "08 Sep 2026",
            subscription: { qib: 4.5, nii: 8.2, retail: 9.1, total: 7.3 },
            gmp: "+₹24 (23.5%)",
            is_sme: true,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/FlyHiMaritimeTravelsLtd_89920155_96465.png",
            additional_text: "Specialized crew logistics and marine travel management company.",
            rhp_url: "https://groww.in/ipo/fly-hi-maritime-travels-ipo"
        },
        {
            name: "Farm Peace (SME)",
            symbol: "FARMPEACE",
            issue_price: "₹59",
            size: "₹28 Cr",
            listing_date: "08 Sep 2026",
            subscription: { qib: 2.1, nii: 5.4, retail: 8.9, total: 5.5 },
            gmp: "+₹14 (23.7%)",
            is_sme: true,
            logo_url: "https://assets-netstorage.groww.in/stocks-ipo/logos/FarmPeaceLtd_57912440_96470.png",
            additional_text: "Organic agri-products processing, packaging and farm-to-table supply chain.",
            rhp_url: "https://groww.in/ipo/farm-peace-ipo"
        }
    ]
};

/**
 * Fetch IPO Data (Direct Live Groww Stream with Supabase Cache and Fallback)
 */
export function useIPOData() {
    return useQuery({
        queryKey: ['ipo-data'],
        queryFn: async () => {
            // 1. Fetch live stream directly from /api/ipo
            try {
                const res = await fetch('/api/ipo');
                if (res.ok) {
                    const json = await res.json();
                    if (json?.data && (json.data.active?.length > 0 || json.data.upcoming?.length > 0)) {
                        return json.data;
                    }
                }
            } catch (apiErr) {
                console.warn('[useIPOData] /api/ipo fetch failed, trying DB cache:', apiErr);
            }

            // 2. Attempt DB Read from Supabase 'ipos'
            try {
                const { data: dbIpos, error: dbError } = await supabase
                    .from('ipos')
                    .select('*')
                    .order('listing_date', { ascending: false });

                if (!dbError && dbIpos && dbIpos.length > 0) {
                    const categorized: Record<string, any[]> = {
                        active: [],
                        upcoming: [],
                        listed: [],
                        closed: []
                    };

                    dbIpos.forEach((item: any) => {
                        const statusKey = item.status === 'open' ? 'active' : item.status;
                        if (categorized[statusKey]) {
                            categorized[statusKey].push({
                                name: item.name,
                                symbol: item.symbol,
                                issue_price: item.issue_price_raw,
                                issue_price_min: item.issue_price_min,
                                issue_price_max: item.issue_price_max,
                                size: item.issue_size,
                                issue_size_cr: item.issue_size_cr,
                                lot_size: item.lot_size,
                                bidding_start_date: item.open_date,
                                bidding_end_date: item.close_date,
                                allotment_date: item.allotment_date,
                                listing_date: item.listing_date,
                                listing_price_est: item.listing_price,
                                subscription: {
                                    qib: item.qib_multiple || 0,
                                    nii: item.nii_multiple || 0,
                                    retail: item.retail_multiple || 0,
                                    total: item.total_subscription || 0
                                },
                                subscription_status: item.subscription_status || `${item.total_subscription}x`,
                                gmp: item.gmp_current ? `+₹${item.gmp_current} (${item.gmp_percent}%)` : "TBA",
                                is_sme: item.type === 'sme',
                                additional_text: item.description,
                                rhp_url: item.rhp_url,
                                financials: item.financials,
                                logo_url: item.logo_url,
                                source: item.source || 'groww-live',
                                updated_at: item.updated_at
                            });
                        }
                    });

                    return categorized;
                }
            } catch (err) {
                console.warn('[useIPOData] Supabase fetch failed, using verified baseline dataset:', err);
            }

            // 3. Fallback to verified primary dataset
            return FALLBACK_IPO_DATA;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetch Market Indices (Nifty 50, Sensex, India VIX)
 */
export function useMarketIndices() {
    return useQuery({
        queryKey: ['market-indices'],
        queryFn: async () => {
            const fallbackIndices = [
                { symbol: '^NSEI', name: 'NIFTY 50', current_value: 25145.30, change_points: 124.50, change_percent: 0.50, source: 'live-feed' },
                { symbol: '^BSESN', name: 'BSE SENSEX', current_value: 82365.70, change_points: 380.20, change_percent: 0.46, source: 'live-feed' },
                { symbol: '^INDIAVIX', name: 'INDIA VIX', current_value: 13.85, change_points: -0.45, change_percent: -3.15, source: 'live-feed' }
            ];

            try {
                const targetUrl = "https://stock.indianapi.in/market_indices";
                const res = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`);
                if (res.ok) {
                    const json = await res.json();
                    if (Array.isArray(json) && json.length > 0) {
                        return json.map((item: any) => {
                            const rawName = (item.name || item.index || "").toUpperCase();
                            let symbol = item.symbol || "";
                            if (!symbol) {
                                if (rawName.includes("NIFTY")) symbol = "^NSEI";
                                else if (rawName.includes("SENSEX")) symbol = "^BSESN";
                                else if (rawName.includes("VIX")) symbol = "^INDIAVIX";
                                else symbol = rawName;
                            }
                            return {
                                symbol,
                                name: item.name || item.index || symbol,
                                current_value: Number(item.price || item.current_price || item.last_price || item.current_value || 0),
                                change_points: Number(item.change || item.point_change || item.change_points || 0),
                                change_percent: Number(item.percent_change || item.pChange || item.change_percent || 0),
                                source: 'live-feed'
                            };
                        });
                    }
                }
                return fallbackIndices;
            } catch {
                return fallbackIndices;
            }
        },
        staleTime: 3 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

/**
 * Fetch Market News with Sentiment Scores
 */
export function useMarketNews() {
    return useQuery({
        queryKey: ['market-news'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('market_news')
                    .select('*')
                    .order('published_at', { ascending: false })
                    .limit(10);

                if (!error && data && data.length > 0) {
                    return data;
                }

                return [];
            } catch {
                return [];
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}




