"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import AdvancedDateSelector from "@/components/dashboard/AdvancedDateSelector";
import { PredictionsLoader } from "@/components/ui/PredictionsLoader";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { BrainCircuit, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Prediction Skeleton Component
function PredictionSkeleton() {
    return (
        <div className="flex flex-col p-6 rounded-3xl overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-px bg-border/20 rounded-2xl overflow-hidden">
                <div className="bg-muted/30 p-4 space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="bg-muted/30 p-4 space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>

            {/* Target Date */}
            <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

// Robust fetcher function with correct column handling and normalization
const fetcher = async ([userId, date, tab]: [string, string, 'stock' | 'crypto']) => {
    if (!userId) {
        console.log("[Fetcher] No user ID provided, returning empty array");
        return [];
    }

    const tableName = tab === 'stock' ? 'stock_predictions' : 'crypto_predictions';
    console.log(`[Fetcher] Fetching ${tableName} for user ${userId} on date ${date}`);

    try {
        // Fetch with explicit user_id filter (RLS will enforce this)
        const { data, error } = await supabase
            .from(tableName as "stock_predictions" | "crypto_predictions")
            .select("*")
            .eq("user_id", userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error("[Fetcher] Supabase Error:", error);
            throw error;
        }

        console.log(`[Fetcher] Raw data count from DB: ${data?.length || 0}`);
        if (data && data.length > 0) {
            console.log("[Fetcher] Sample data:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("[Fetcher] No data found - checking if table exists and has data");
        }

        // Normalize fields
        const normalized = (data || []).map((item: any) => ({
            ...item,
            coin_name: item.coin_name || item.coin,
            coin_id: item.coin_id || item.coin,
            predicted_time: item.predicted_time || item.predicted_time_ist || item.prediction_time || item.prediction_time_ist || item.created_at,
            created_at: item.created_at
        }));

        // Filter by date (or show all if no date match)
        const filtered = normalized.filter((item: any) => {
            const targetDateStr = item.predicted_time || item.created_at;
            const createdDateStr = item.created_at;

            const matchesDate = (dStr: string) => {
                if (!dStr) return false;
                try {
                    const d = new Date(dStr);
                    if (!isNaN(d.getTime())) {
                        const itemDate = d.toISOString().split('T')[0];
                        if (itemDate === date) return true;
                    }
                    const datePart = dStr.includes(',') ? dStr.split(',')[0] : dStr.split(' ')[0];
                    if (datePart.includes('/') || datePart.includes('-')) {
                        const separator = datePart.includes('/') ? '/' : '-';
                        const parts = datePart.split(separator);
                        if (parts.length === 3) {
                            let year, month, day;
                            if (parts[0].length === 4) {
                                year = parts[0]; month = parts[1]; day = parts[2];
                            } else {
                                day = parts[0]; month = parts[1]; year = parts[2];
                            }
                            const reconstructed = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                            if (reconstructed === date) return true;
                        }
                    }
                } catch (e) { return false; }
                return false;
            };
            return matchesDate(targetDateStr) || matchesDate(createdDateStr);
        });

        // Return only filtered results
        const result = filtered;
        console.log(`[Fetcher] Final data count: ${result.length}`);
        return result;
    } catch (err: any) {
        console.error("[Fetcher] Unexpected error:", err);
        return [];
    }
};

export default function PredictionsPage() {
    const { user } = useAuth();
    // Force refresh log
    useEffect(() => { console.log("PredictionsPage Loaded v2"); }, []);

    // Default to today's date in local time
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    });

    const [activeTab, setActiveTab] = useState<'stock' | 'crypto'>('stock');
    const [isPolling, setIsPolling] = useState(false);
    const [pollProgress, setPollProgress] = useState(0);
    const [lastPredictionTime, setLastPredictionTime] = useState<number>(Date.now());

    // Read tab from URL on mount
    const searchParams = useSearchParams();
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'stock' || tabParam === 'crypto') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // SWR Hook for data fetching
    const { data: predictions, isLoading, mutate } = useSWR(
        user ? [user.id, selectedDate, activeTab] : null,
        fetcher,
        {
            revalidateOnFocus: true, // Refresh when window gains focus
            revalidateOnMount: true, // Always refresh on component mount
            dedupingInterval: 0, // Allow frequent polling
            refreshInterval: isPolling ? 2000 : 0, // Poll every 2 seconds when active
            suspense: false
        }
    );

    // Auto-stop polling when new data arrives
    useEffect(() => {
        if (isPolling && predictions && predictions.length > 0) {
            const hasNew = predictions.some((p: any) => {
                const pTime = new Date(p.created_at).getTime();
                // Allow a small buffer (e.g., created recently) or strictly after start
                return pTime > lastPredictionTime;
            });

            if (hasNew) {
                setIsPolling(false);
                toast.success("New prediction received!");
            }
        }
    }, [predictions, isPolling, lastPredictionTime]);

    // Polling timer: poll for 1 minute (60 seconds) after trigger
    useEffect(() => {
        if (!isPolling) {
            setPollProgress(0);
            return;
        }

        const totalDuration = 60000; // 1 minute
        const interval = 100; // Update progress every 100ms
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / totalDuration) * 100, 100);
            setPollProgress(progress);

            if (elapsed >= totalDuration) {
                setIsPolling(false);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [isPolling]);

    // Function to trigger polling from outside
    const triggerPolling = useCallback(() => {
        setLastPredictionTime(Date.now());
        setIsPolling(true);
    }, []);

    // Expose polling trigger via window (for cross-component communication)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).triggerPredictionPolling = triggerPolling;
        }
    }, [triggerPolling]);

    // Setup Realtime Subscription to update SWR cache
    // We use a useEffect to manage the subscription lifecycle
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('predictions-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'stock_predictions', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    // Check if it belongs to current view
                    const predDate = new Date(payload.new.prediction_time_ist || payload.new.predicted_time || payload.new.created_at).toISOString().split('T')[0];
                    if (predDate === selectedDate && activeTab === 'stock') {
                        mutate((currentData: any) => [payload.new, ...(currentData || [])], false);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'crypto_predictions', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    const predDate = new Date(payload.new.prediction_time_ist || payload.new.predicted_time || payload.new.created_at).toISOString().split('T')[0];
                    if (predDate === selectedDate && activeTab === 'crypto') {
                        mutate((currentData: any) => [payload.new, ...(currentData || [])], false);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedDate, activeTab, mutate]);



    return (
        <div className="relative min-h-screen w-full font-sans">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridBackground />
            </div>

            <div className="relative z-10 space-y-6 p-1 md:p-8 pb-20 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground flex items-center gap-3">
                            AI Analysis Log
                            {isPolling && (
                                <span className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full text-sm font-medium text-primary">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Scanning...
                                </span>
                            )}
                        </h1>

                        {/* Polling Progress Bar */}
                        {isPolling && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>Checking for new predictions ({(60 - (pollProgress / 100 * 60)).toFixed(0)}s remaining)</span>
                                </div>
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pollProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card/40 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-sm">
                        {/* Asset Type Tabs */}
                        {/* Asset Type Tabs Segmented Control */}
                        <div className="flex gap-1 bg-black/5 dark:bg-black/20 p-1 rounded-xl border border-black/5 dark:border-white/5">
                            <button
                                onClick={() => setActiveTab('stock')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-300",
                                    activeTab === 'stock'
                                        ? "bg-white dark:bg-white/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                Stocks
                            </button>
                            <button
                                onClick={() => setActiveTab('crypto')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-300",
                                    activeTab === 'crypto'
                                        ? "bg-white dark:bg-white/10 text-yellow-500 shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                            >
                                Crypto
                            </button>
                        </div>

                        {/* Date Filter */}
                        <AdvancedDateSelector
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <PredictionSkeleton key={i} />
                        ))}
                    </div>
                ) : predictions?.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {predictions.map((pred: any) => (
                            <PredictionCard key={pred.id} pred={pred} isStock={activeTab === 'stock'} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-muted/30 p-4 rounded-full mb-4">
                            <BrainCircuit className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold text-muted-foreground">No Signals Detected</h3>
                        <p className="text-muted-foreground/50 mt-2 max-w-sm">
                            AI has not generated any {activeTab} predictions for {selectedDate}.
                        </p>

                    </div>
                )}
            </div>
        </div>
    );
}
