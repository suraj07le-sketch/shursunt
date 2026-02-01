"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DashboardData {
    stats: { stockCount: number; cryptoCount: number; totalStocks: number; totalCrypto: number };
    todaysPredictions: any[];
    topWatchlist: any[];
    lastFetched: number | null;
}

interface DashboardContextType {
    data: DashboardData;
    isLoading: boolean;
    isInitialized: boolean;
    fetchDashboard: () => Promise<void>;
    invalidateCache: () => void;
}

const defaultData: DashboardData = {
    stats: { stockCount: 0, cryptoCount: 0, totalStocks: 0, totalCrypto: 0 },
    todaysPredictions: [],
    topWatchlist: [],
    lastFetched: null,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const CACHE_DURATION = 60 * 1000; // 1 minute cache

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>(defaultData);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const fetchDashboard = useCallback(async () => {
        if (!user) return;

        // Skip if recently fetched
        if (data.lastFetched && Date.now() - data.lastFetched < CACHE_DURATION) {
            return;
        }

        // Only show loading on first fetch
        if (!isInitialized) {
            setIsLoading(true);
        }

        // Cancel previous request
        if (abortRef.current) {
            abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        try {
            const today = new Date().toISOString().split('T')[0];
            const startDate = `${today}T00:00:00`;
            const endDate = `${today}T23:59:59`;

            const [watchlistRes, stockPredsRes, cryptoPredsRes, totalStocksRes, totalCryptoRes] = await Promise.all([
                supabase.from("watchlist").select("*").eq("user_id", user.id),
                supabase.from("stock_predictions").select("*").eq("user_id", user.id).gte("created_at", startDate).lte("created_at", endDate),
                supabase.from("crypto_predictions").select("*").eq("user_id", user.id).gte("created_at", startDate).lte("created_at", endDate),
                supabase.from("indian_stocks").select("*", { count: 'exact', head: true }),
                supabase.from("crypto_coins").select("*", { count: 'exact', head: true })
            ]);

            const list = watchlistRes.data || [];
            const stats = {
                stockCount: list.filter((i: any) => i.asset_type === 'stock').length,
                cryptoCount: list.filter((i: any) => (i.asset_type === 'crypto' || !i.asset_type)).length,
                totalStocks: totalStocksRes.count || 0,
                totalCrypto: totalCryptoRes.count || 0
            };

            const combined = [
                ...(stockPredsRes.data || []).map((p: any) => ({ ...p, type: 'stock', name: p.stock_name, confidence: p.accuracy_percent })),
                ...(cryptoPredsRes.data || []).map((p: any) => ({ ...p, type: 'crypto', name: p.coin, confidence: p.confidence }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setData({
                stats,
                todaysPredictions: combined,
                topWatchlist: list.slice(0, 5),
                lastFetched: Date.now(),
            });
            setIsInitialized(true);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Dashboard fetch error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, data.lastFetched, isInitialized]);

    const invalidateCache = useCallback(() => {
        setData(prev => ({ ...prev, lastFetched: null }));
    }, []);

    return (
        <DashboardContext.Provider value={{ data, isLoading, isInitialized, fetchDashboard, invalidateCache }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
