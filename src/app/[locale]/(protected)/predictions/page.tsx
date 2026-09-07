"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePredictions } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { BrainCircuit, RefreshCw, Calendar, ChevronLeft, ChevronRight, Search, Zap, ArrowRight, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Prediction } from "@/types/prediction";

export default function PredictionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Deterministic IST Today Date (YYYY-MM-DD)
    const todayDate = useMemo(() => {
        const now = new Date();
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);
    }, []);

    const [selectedDate, setSelectedDate] = useState(todayDate);
    const [activeTab, setActiveTab] = useState<'stock' | 'crypto'>('stock');
    const [searchQuery, setSearchQuery] = useState("");
    const [generatingSymbol, setGeneratingSymbol] = useState<string | null>(null);

    // TanStack Query is the single source of truth
    const { data: rawPredictions = [], isLoading, isFetching, refetch } = usePredictions(activeTab, selectedDate);
    const predictions: Prediction[] = (rawPredictions as Prediction[]) || [];

    // Format date display in IST
    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(`${dateStr}T00:00:00Z`);
        return new Intl.DateTimeFormat('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            timeZone: 'UTC'
        }).format(date);
    };

    // Handle deep links (e.g. /predictions?predict=BTC&type=crypto)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const predictSymbol = params.get('predict');
        const assetType = params.get('type') as 'stock' | 'crypto' | null;
        const timeframe = params.get('timeframe') || '4h';

        if (assetType && (assetType === 'stock' || assetType === 'crypto')) {
            setActiveTab(assetType);
        }

        if (predictSymbol && assetType) {
            generatePrediction(predictSymbol, assetType, timeframe);
        }

        // Clean query params without reload
        if (predictSymbol || assetType) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const generatePrediction = async (symbol: string, type: 'stock' | 'crypto', timeframe: string = '4h') => {
        if (!user) {
            toast.error("Please sign in to generate neural predictions.");
            return;
        }

        setGeneratingSymbol(symbol);

        try {
            const res = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coinId: symbol,
                    coinName: symbol,
                    symbol,
                    timeframe,
                    type
                })
            });

            const data = await res.json();
            if (data.success && data.prediction) {
                toast.success(`Confluence signal generated for ${symbol}`);

                const predObj = data.prediction;
                const formattedSymbol = symbol.toUpperCase();
                const nowIso = new Date().toISOString();

                const newPrediction: Prediction = {
                    id: predObj.id || `pred-${Date.now()}`,
                    type,
                    name: formattedSymbol,
                    stock_name: type === 'stock' ? formattedSymbol : undefined,
                    coin: type === 'crypto' ? formattedSymbol : undefined,
                    coin_name: type === 'crypto' ? formattedSymbol : undefined,
                    current_price: Number(predObj.current_price || 0),
                    predicted_price: Number(predObj.predicted_price || 0),
                    prediction_change_percent: Number(predObj.prediction_change_percent || 0),
                    confidence: Math.round(predObj.confidence || 85),
                    accuracy_percent: Math.round(predObj.confidence || 85),
                    trend: predObj.signal || 'BUY',
                    signal: predObj.signal || 'BUY',
                    stop_loss_price: Number(predObj.stop_loss || 0),
                    timeframe: predObj.timeframe || timeframe || '4h',
                    created_at: predObj.prediction_time || nowIso,
                    predicted_time: predObj.predicted_time || nowIso,
                    confluence: predObj.confluence || 'TRIPLE',
                    market_regime: predObj.market_regime || 'TRENDING'
                };

                // Optimistically insert into TanStack Query cache so the card appears immediately
                queryClient.setQueriesData<Prediction[]>({ queryKey: ['predictions', type] }, (old) => {
                    const currentList = Array.isArray(old) ? old : [];
                    const filtered = currentList.filter(
                        (p) => (p.stock_name || p.coin || p.name || '').toUpperCase() !== formattedSymbol
                    );
                    return [newPrediction, ...filtered];
                });

                if (selectedDate !== todayDate) {
                    setSelectedDate(todayDate);
                }

                queryClient.invalidateQueries({ queryKey: ['predictions'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            } else {
                toast.error(data.error || "Signal generation failed");
            }
        } catch {
            toast.error("Network error while connecting to neural prediction engine.");
        } finally {
            setGeneratingSymbol(null);
        }
    };

    // Filter by search query
    const filteredPredictions = predictions.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const sym = (p.stock_name || p.coin || p.name || "").toLowerCase();
        return sym.includes(q);
    });

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Neural Signal Matrix
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                                ML CONFLUENCE
                            </span>
                            {isFetching && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    SYNCING
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Multi-factor probabilistic trade setups with calibrated R:R and dynamic ATR stops
                        </p>
                    </div>
                </div>

                {/* Date Navigator & Tab Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Picker */}
                    <div className="flex items-center rounded-lg border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() => {
                                const d = new Date(`${selectedDate}T00:00:00Z`);
                                d.setUTCDate(d.getUTCDate() - 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Previous Day"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5 px-2 font-mono text-xs font-semibold text-foreground relative">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{formatDateDisplay(selectedDate)}</span>
                            <input
                                type="date"
                                value={selectedDate}
                                max={todayDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const d = new Date(`${selectedDate}T00:00:00Z`);
                                d.setUTCDate(d.getUTCDate() + 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                            disabled={selectedDate === todayDate}
                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Next Day"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Segment Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
                        <button
                            type="button"
                            onClick={() => setActiveTab('stock')}
                            className={cn(
                                "px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer",
                                activeTab === 'stock'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Equities (NSE/BSE)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('crypto')}
                            className={cn(
                                "px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition-all cursor-pointer",
                                activeTab === 'crypto'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Digital Assets
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Quick Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Filter by symbol (e.g. RELIANCE, BTC)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-xs font-mono focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs font-mono">
                    <button
                        type="button"
                        onClick={() => generatePrediction(activeTab === 'stock' ? 'RELIANCE' : 'BTC', activeTab, '4h')}
                        disabled={generatingSymbol !== null}
                        className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{generatingSymbol ? "Synthesizing Signal..." : `Run AI on ${activeTab === 'stock' ? 'RELIANCE' : 'BTC'}`}</span>
                    </button>
                </div>
            </div>

            {/* Generating Progress Banner */}
            {generatingSymbol && (
                <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing multi-factor confluence model for {generatingSymbol}...</span>
                    </div>
                    <span className="text-muted-foreground">Est. time: ~2s</span>
                </div>
            )}

            {/* Main Content Grid */}
            {isLoading && predictions.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-4 animate-pulse">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                            <Skeleton className="h-2 w-full rounded" />
                            <div className="grid grid-cols-3 gap-2">
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPredictions.length === 0 ? (
                <div className="p-12 rounded-xl border border-dashed border-border bg-card/40 text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground font-display">
                            No Signals Recorded for {formatDateDisplay(selectedDate)}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                            The AI engine has no logged setups for this date in {activeTab === 'stock' ? 'Indian Equities' : 'Digital Assets'}. Run an instant analysis or explore the screener.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => generatePrediction(activeTab === 'stock' ? 'RELIANCE' : 'BTC', activeTab, '4h')}
                            disabled={generatingSymbol !== null}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Analyze {activeTab === 'stock' ? 'RELIANCE' : 'BTC'} Now</span>
                        </button>

                        <Link
                            href="/market"
                            className="px-4 py-2 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-mono font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                            <span>Browse Screener</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPredictions.map((pred) => {
                        const sym = pred.stock_name || pred.coin || pred.name || "ASSET";
                        return (
                            <PredictionCard
                                key={pred.id}
                                pred={pred}
                                isStock={activeTab === 'stock'}
                                isGenerating={generatingSymbol === sym}
                                onRepredict={() => generatePrediction(sym, activeTab, pred.timeframe || '4h')}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
