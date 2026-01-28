"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Prediction } from "@/types";
import { format } from "date-fns";
import { BrainCircuit, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import AdvancedDateSelector from "@/components/dashboard/AdvancedDateSelector";

// Helper to safely parse specific date formats
const safeFormatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";

    try {
        // Try parsing standard ISO first (YYYY-MM-DD or standard Date string)
        let date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return format(date, "MMM d, HH:mm");
        }

        // Try parsing "d/M/yyyy, h:mm:ss a" format (e.g. "21/1/2026, 5:23:31 am")
        // We manually parse if Date constructor failed to avoid browser inconsistencies
        const parts = dateString.split(', ');
        if (parts.length === 2) {
            const [datePart, timePart] = parts;
            const [day, month, year] = datePart.split('/').map(Number);
            const [time, period] = timePart.split(' ');
            let [hours, minutes, seconds] = time.split(':').map(Number);

            if (period?.toLowerCase() === 'pm' && hours < 12) hours += 12;
            if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;

            date = new Date(year, month - 1, day, hours, minutes, seconds);
            if (!isNaN(date.getTime())) {
                return format(date, "MMM d, HH:mm");
            }
        }
    } catch (e) {
        console.error("Date parsing error", e);
    }

    return "Invalid Date";
};

// Helper to clean up messy coin symbols (e.g. TRXUSDTUSD -> TRX)
const cleanSymbol = (symbol: string | null | undefined) => {
    if (!symbol) return "N/A";

    // Remove redundant suffixes
    return symbol
        .replace(/USDTUSD$/i, '')
        .replace(/USDT$/i, '')
        .replace(/USD$/i, '')
        .toUpperCase();
};

export default function PredictionsPage() {
    const { user, loading: authLoading } = useAuth();
    // Default to today's date in YYYY-MM-DD
    // Default to today's date in Local Time (handling timezone offsets correctly)
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    });
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'stock' | 'crypto'>('stock');

    const filteredPredictions = predictions.filter(p => (p.asset_type || activeTab) === activeTab);

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        const controller = new AbortController();

        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // Create timestamp range for selected date
            const startDate = `${selectedDate}T00:00:00`;
            const endDate = `${selectedDate}T23:59:59`;
            const tableName = activeTab === 'stock' ? 'stock_predictions' : 'crypto_predictions';
            // Stock table uses 'prediction_time_ist', Crypto table uses 'predicted_time'
            const dateColumn = activeTab === 'stock' ? 'prediction_time_ist' : 'predicted_time';

            try {
                // Fetch recent history and filter client-side to handle mixed date formats/timezones reliably
                const query = supabase
                    .from(tableName as "stock_predictions" | "crypto_predictions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order('created_at', { ascending: false })
                    .limit(100);

                query.abortSignal(controller.signal);

                let result;
                try {
                    result = await query;
                } catch (err: any) {
                    if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                        return;
                    }
                    throw err;
                }

                if (controller.signal.aborted) return;

                const { data, error } = result;

                if (error) {
                    // Ignore abort errors returned by Supabase
                    if (error.message?.includes('aborted') || error.code === '20') {
                        return;
                    }
                    console.error("Supabase Error:", error);
                    setPredictions([]);
                } else {
                    // Let's redo the filter logic simpler:
                    // Just match the YYYY-MM-DD string part if possible.
                    const targetDate = selectedDate;

                    const dateFiltered = (data || []).filter((item: any) => {
                        const dateStr = activeTab === 'stock' ? item.prediction_time_ist : item.predicted_time;
                        // Reuse safeFormatDate logic's core or just compare formatted strings?
                        // The safest is to normalize to YYYY-MM-DD.

                        // Quick helper inside:
                        const getDateString = (str: string) => {
                            try {
                                const d = new Date(str);
                                if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

                                if (str.includes('/')) {
                                    // 23/1/2026
                                    const parts = str.split(',')[0].split('/');
                                    if (parts.length === 3) {
                                        const day = parts[0].padStart(2, '0');
                                        const month = parts[1].padStart(2, '0');
                                        const year = parts[2];
                                        return `${year}-${month}-${day}`;
                                    }
                                }
                                return '';
                            } catch (e) { return ''; }
                        };

                        return getDateString(dateStr) === targetDate;
                    });

                    setPredictions(dateFiltered);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Fetch Exception:", err);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchHistory();

        // Realtime Subscription
        const channel = supabase
            .channel('predictions-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'stock_predictions', filter: `user_id=eq.${user?.id}` },
                (payload: any) => {
                    // Only add if prediction_time_ist matches selectedDate (ignoring time)
                    const createdDate = new Date(payload.new.prediction_time_ist || payload.new.created_at).toISOString().split('T')[0];
                    if (createdDate === selectedDate) {
                        setPredictions(prev => [payload.new, ...prev]);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'crypto_predictions', filter: `user_id=eq.${user?.id}` },
                (payload: any) => {
                    const createdDate = new Date(payload.new.prediction_time_ist || payload.new.created_at).toISOString().split('T')[0];
                    if (createdDate === selectedDate) {
                        setPredictions(prev => [payload.new, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            controller.abort();
            supabase.removeChannel(channel);
        };
    }, [user, authLoading, selectedDate, activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    AI Analysis Log
                </h1>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* Asset Type Tabs */}
                    <div className="flex items-center p-1 bg-card border border-border rounded-xl">
                        {(['stock', 'crypto'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute inset-0 bg-primary rounded-lg shadow-sm" />
                                )}
                                <span className="relative z-10 capitalize">{tab === 'stock' ? 'Stocks' : 'Crypto'}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date Filter */}
                    <AdvancedDateSelector
                        selectedDate={selectedDate}
                        onChange={setSelectedDate}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-muted-foreground animate-pulse">
                    Loading predictions...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPredictions.map((pred) => {
                        const isBullish = pred.trend?.toUpperCase() === "UP";

                        return (
                            <div
                                key={pred.id}
                                className="flex flex-col p-6 bg-card/60 rounded-2xl border border-border hover:border-purple-500/50 transition-colors group relative overflow-hidden shadow-lg hover:shadow-xl"
                            >
                                <div className="absolute bottom-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <BrainCircuit className="w-24 h-24 text-purple-500/10 group-hover:text-purple-500/20 rotate-[-12deg] translate-x-4 translate-y-4" />
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-start mb-6 z-10 relative">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-2xl text-foreground">{cleanSymbol(pred.stock_name || pred.stockname || pred.coin || pred.coin_name)}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${isBullish ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {pred.trend || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="px-2 py-0.5 rounded-full bg-muted uppercase">
                                                {pred.timeframe || "4H"}
                                            </span>
                                            <span>• Confidence: <span className="text-foreground font-bold">{pred.confidence || "0%"}</span></span>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full ${pred.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {pred.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Prices */}
                                <div className="mt-auto z-10 relative space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-xl border border-border/50">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                                            <div className="font-mono text-sm text-foreground">
                                                {activeTab === 'stock' ? '₹' : '$'}{Number(pred.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-muted-foreground mb-1">Target Date</div>
                                            <div className="font-mono text-sm text-foreground/80">
                                                {safeFormatDate(pred.predicted_time || pred.prediction_valid_till_ist)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border">
                                        <div className="text-sm text-muted-foreground mb-1">Predicted Target</div>
                                        <div className={`text-3xl font-mono font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                                            {activeTab === 'stock' ? '₹' : '$'}{Number(pred.predicted_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredPredictions.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-card/60 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground">No {activeTab} predictions found for {selectedDate}.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
