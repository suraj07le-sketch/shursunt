"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface DashboardData {
    stats: { stockCount: number; cryptoCount: number; totalStocks: number; totalCrypto: number };
    todaysPredictions: any[];
    topWatchlist: any[];
    watchlist?: any[];
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
    watchlist: [],
    lastFetched: null,
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const CACHE_DURATION = 60 * 1000; // 1 minute cache

import useSWR from 'swr';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // 1. Static Counts (Infrequent refresh)
    const { data: counts } = useSWR(
        user ? `dashboard-counts` : null,
        async () => {
            const [totalStocksRes, totalCryptoRes] = await Promise.all([
                supabase.from("indian_stocks").select("*", { count: 'exact', head: true }),
                supabase.from("crypto_coins").select("*", { count: 'exact', head: true })
            ]);
            return {
                totalStocks: totalStocksRes.count || 0,
                totalCrypto: totalCryptoRes.count || 0
            };
        },
        {
            refreshInterval: 600000, // 10 minutes
            revalidateOnFocus: false,
        }
    );

    // 2. Dynamic Dashboard Data
    const { data: rawDashboard, error, mutate } = useSWR(
        user ? `dashboard-data-${user.id}` : null,
        async () => {
            const today = new Date().toISOString().split('T')[0];
            const startDate = `${today}T00:00:00`;
            const endDate = `${today}T23:59:59`;

            const [watchlistRes, stockPredsRes, cryptoPredsRes] = await Promise.all([
                supabase.from("watchlist").select("*").eq("user_id", user!.id),
                supabase.from("stock_predictions").select("*").eq("user_id", user!.id).gte("created_at", startDate).lte("created_at", endDate),
                supabase.from("crypto_predictions").select("*").eq("user_id", user!.id).gte("created_at", startDate).lte("created_at", endDate)
            ]);

            const list = watchlistRes.data || [];
            const combined = [
                ...(stockPredsRes.data || []).map((p: any) => ({ ...p, type: 'stock', name: p.stock_name, confidence: p.accuracy_percent })),
                ...(cryptoPredsRes.data || []).map((p: any) => ({ ...p, type: 'crypto', name: p.coin, confidence: p.confidence }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return {
                watchlist: list,
                todaysPredictions: combined,
                topWatchlist: list.slice(0, 5),
                lastFetched: Date.now()
            };
        },
        {
            revalidateOnFocus: true,
            refreshInterval: 60000, // Sync every 60s
            dedupingInterval: 10000,
        }
    );

    const data = useMemo(() => {
        const d = rawDashboard || defaultData;
        const c = counts || { totalStocks: 0, totalCrypto: 0 };
        const list = d.watchlist || [];

        return {
            ...d,
            stats: {
                stockCount: list.filter((i: any) => i.asset_type === 'stock').length,
                cryptoCount: list.filter((i: any) => (i.asset_type === 'crypto' || !i.asset_type)).length,
                totalStocks: c.totalStocks,
                totalCrypto: c.totalCrypto
            }
        };
    }, [rawDashboard, counts]);

    const isLoading = !rawDashboard && !error;
    const isInitialized = !!rawDashboard;

    const fetchDashboard = useCallback(async () => {
        await mutate();
    }, [mutate]);

    const invalidateCache = useCallback(() => {
        mutate();
    }, [mutate]);

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
