"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import AdvancedDateSelector from "@/components/dashboard/AdvancedDateSelector";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { BrainCircuit, RefreshCw, Clock, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Prediction Skeleton Component
function PredictionSkeleton() {
    return (
        <div className="flex flex-col p-6 rounded-3xl overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 space-y-4">
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
            <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

// Robust fetcher function
const fetcher = async ([userId, date, tab]: [string, string, 'stock' | 'crypto']) => {
    if (!userId) return [];

    const tableName = tab === 'stock' ? 'stock_predictions' : 'crypto_predictions';

    try {
        const { data, error } = await supabase
            .from(tableName as "stock_predictions" | "crypto_predictions")
            .select("*")
            .or(`user_id.eq.${userId},user_id.eq.00000000-0000-0000-0000-000000000000`)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            // Suppress AbortError logs (happens during hot reload)
            if (error.message && !error.message.includes('AbortError')) {
                console.error("[Fetcher] Supabase Error:", error);
            }
            return [];
        }

        // Normalize fields
        const normalized = (data || []).map((item: any) => ({
            ...item,
            coin_name: item.coin_name || item.coin,
            coin_id: item.coin_id || item.coin,
            predicted_time: item.predicted_time || item.predicted_time_ist || item.prediction_time || item.prediction_time_ist || item.created_at,
            created_at: item.created_at
        }));

        // Filter by date
        const filtered = normalized.filter((item: any) => {
            const targetDateStr = item.predicted_time || item.created_at;
            if (!targetDateStr) return false;
            try {
                const targetDate = new Date(targetDateStr);
                const filterDate = new Date(date);
                const targetYMD = targetDate.toISOString().split('T')[0];
                const filterYMD = filterDate.toISOString().split('T')[0];
                if (targetYMD === filterYMD) return true;
                const diffTime = Math.abs(targetDate.getTime() - filterDate.getTime());
                const diffHours = diffTime / (1000 * 60 * 60);
                return diffHours < 24;
            } catch (e) { return false; }
        });

        // Group by stock/crypto name and keep only the most recent prediction per day
        const grouped = new Map<string, any>();
        filtered.forEach((item: any) => {
            const key = tab === 'stock' ? item.stock_name : (item.coin_name || item.coin);
            const existing = grouped.get(key);

            if (!existing) {
                grouped.set(key, item);
            } else {
                // Keep the most recent prediction
                const existingTime = new Date(existing.created_at).getTime();
                const currentTime = new Date(item.created_at).getTime();
                if (currentTime > existingTime) {
                    grouped.set(key, item);
                }
            }
        });

        return Array.from(grouped.values());
    } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'AbortError: signal is aborted without reason') {
            console.error("[Fetcher] Unexpected error:", err);
        }
        return [];
    }
};

export default function PredictionsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

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
    const [isGenerating, setIsGenerating] = useState(false);

    // Manual prediction form state
    const [predictionInput, setPredictionInput] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);

    // Handle URL params for automatic prediction
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'stock' || tabParam === 'crypto') {
            setActiveTab(tabParam);
        }

        const predictSymbol = searchParams.get('predict');
        const predictType = searchParams.get('type') || (activeTab === 'crypto' ? 'crypto' : 'stock');
        const predictTimeframe = searchParams.get('timeframe') || '4h';

        if (predictSymbol) {
            console.log("Triggering prediction for:", predictSymbol, "Type:", predictType, "Timeframe:", predictTimeframe);
            generatePrediction(predictSymbol, predictType as 'stock' | 'crypto', predictTimeframe);
        }
    }, [searchParams]);

    // SWR Hook for data fetching
    const { data: predictions, isLoading, mutate } = useSWR(
        user ? [user.id, selectedDate, activeTab] : null,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnMount: true,
            dedupingInterval: 0,
            refreshInterval: isPolling ? 2000 : 0,
            suspense: false
        }
    );

    // Auto-stop polling when new data arrives
    useEffect(() => {
        if (isPolling && predictions && predictions.length > 0) {
            const hasNew = predictions.some((p: any) => {
                const pTime = new Date(p.created_at).getTime();
                return pTime > lastPredictionTime;
            });

            if (hasNew) {
                setIsPolling(false);
                toast.success("New prediction received!");
            }
        }
    }, [predictions, isPolling, lastPredictionTime]);

    // Polling timer
    useEffect(() => {
        if (!isPolling) {
            setPollProgress(0);
            return;
        }

        const totalDuration = 60000;
        const interval = 100;
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

    // Generate prediction function
    const generatePrediction = async (symbol: string, type: 'stock' | 'crypto', timeframe: string = '4h') => {
        if (!user) {
            toast.error("Please login to generate predictions");
            return;
        }

        setIsGenerating(true);
        setIsPolling(true);
        setIsInputVisible(false);

        // Switch tab if needed
        if (type === 'crypto' && activeTab !== 'crypto') setActiveTab('crypto');
        if (type === 'stock' && activeTab !== 'stock') setActiveTab('stock');

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coinId: symbol,
                    coinName: symbol,
                    timeframe: timeframe,
                    type: type
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Prediction generated for ${symbol}!`);
                setLastPredictionTime(Date.now());
                // Refresh data
                mutate();
            } else {
                toast.error(`Prediction failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            toast.error("Failed to generate prediction");
            console.error(err);
        } finally {
            setIsGenerating(false);
            setIsPolling(false);
        }
    };

    // Handle manual prediction submission
    const handleManualPrediction = (e: React.FormEvent) => {
        e.preventDefault();
        if (predictionInput.trim()) {
            generatePrediction(predictionInput.trim(), activeTab as 'stock' | 'crypto');
            setPredictionInput('');
        }
    };

    return (
        <div className="relative min-h-screen w-full font-sans">
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
                {isLoading || isGenerating || isPolling ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <PredictionSkeleton key={i} />
                        ))}
                    </div>
                ) : (predictions?.length ?? 0) > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {(predictions ?? []).map((pred: any) => (
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
                        <button
                            onClick={() => window.location.href = '/watchlist'}
                            className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Generate Your First Prediction
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
