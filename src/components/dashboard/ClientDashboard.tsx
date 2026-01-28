"use client";

import { useEffect, useState, useRef } from "react";
import { Coin } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown, Layers, Activity, ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image"; // Assuming you have image configured or use fallback
import { SolarisIcon } from "@/components/ui/SolarisIcon";

// --- 3D Tilt Card Component ---
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set(clientX - left - width / 2);
        y.set(clientY - top - height / 2);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-300, 300], [15, -15]); // Inverted for natural feel
    const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

    return (
        <motion.div
            style={{ perspective: 1000, rotateX, rotateY }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={`relative group transform-gpu transition-all duration-200 ease-out ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none mix-blend-overlay z-10" />
            {children}
        </motion.div>
    );
}



function DashboardSkeleton() {
    return (
        <div className="space-y-10 pb-10">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 solaris-skeleton" />
                    <div className="h-12 w-64 solaris-skeleton" />
                </div>
                <div className="h-6 w-96 solaris-skeleton opacity-70" />
            </div>

            {/* Stats Cards Skeleton - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} role="status" className="solaris-card p-4 animate-pulse w-full h-[200px] flex flex-col justify-between">
                        <div>
                            <div className="h-2.5 bg-white/10 rounded-full w-32 mb-2.5"></div>
                            <div className="w-48 h-2 mb-10 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="flex items-end mt-4 h-full pb-2">
                            <div className="w-full bg-white/10 rounded-t-2xl h-[40%]"></div>
                            <div className="w-full h-[80%] ms-4 bg-white/10 rounded-t-2xl"></div>
                            <div className="w-full bg-white/10 rounded-t-2xl h-[50%] ms-4"></div>
                            <div className="w-full h-[70%] ms-4 bg-white/10 rounded-t-2xl"></div>
                            <div className="w-full bg-white/10 rounded-t-2xl h-[85%] ms-4"></div>
                            <div className="w-full bg-white/10 rounded-t-2xl h-[60%] ms-4"></div>
                            <div className="w-full bg-white/10 rounded-t-2xl h-[75%] ms-4"></div>
                        </div>
                        <span className="sr-only">Loading...</span>
                    </div>
                ))}
            </div>

            {/* Lists Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2].map(col => (
                    <div key={col} className="space-y-5">
                        <div className="flex justify-between items-center">
                            <div className="h-8 w-48 solaris-skeleton" />
                            <div className="h-8 w-20 solaris-skeleton" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(row => (
                                <div key={row} className="h-24 solaris-skeleton" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Dashboard Component ---
export default function ClientDashboard({ initialData }: { initialData: Coin[] }) {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ stockCount: 0, cryptoCount: 0, totalStocks: 0, totalCrypto: 0 });
    const [todaysPredictions, setTodaysPredictions] = useState<any[]>([]);
    const [topWatchlist, setTopWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;

        // If not logged in, stop loading (Skeleton will disappear, maybe redirect or show empty)
        if (!user) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Everything in Parallel
                const today = new Date().toISOString().split('T')[0];
                const startDate = `${today}T00:00:00`;
                const endDate = `${today}T23:59:59`;

                const [watchlistRes, stockPredsRes, cryptoPredsRes, totalStocksRes, totalCryptoRes] = await Promise.all([
                    supabase.from("watchlist").select("*").eq("user_id", user.id).abortSignal(controller.signal),
                    supabase.from("stock_predictions").select("*").eq("user_id", user.id).gte("created_at", startDate).lte("created_at", endDate).abortSignal(controller.signal),
                    supabase.from("crypto_predictions").select("*").eq("user_id", user.id).gte("created_at", startDate).lte("created_at", endDate).abortSignal(controller.signal),
                    supabase.from("indian_stocks").select("*", { count: 'exact', head: true }).abortSignal(controller.signal),
                    supabase.from("crypto_coins").select("*", { count: 'exact', head: true }).abortSignal(controller.signal)
                ]);

                if (controller.signal.aborted) return;

                // Process Watchlist
                if (watchlistRes.data) {
                    const list = watchlistRes.data as any[];
                    setStats({
                        stockCount: list.filter(i => i.asset_type === 'stock').length,
                        cryptoCount: list.filter(i => (i.asset_type === 'crypto' || !i.asset_type)).length,
                        totalStocks: totalStocksRes.count || 0,
                        totalCrypto: totalCryptoRes.count || 0
                    });
                    setTopWatchlist(list.slice(0, 5));
                }

                // Process Predictions
                const combined = [
                    ...(stockPredsRes.data as any[] || []).map(p => ({ ...p, type: 'stock', name: p.stock_name, confidence: p.accuracy_percent })),
                    ...(cryptoPredsRes.data as any[] || []).map(p => ({ ...p, type: 'crypto', name: p.coin, confidence: p.confidence }))
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setTodaysPredictions(combined);

            } catch (error: any) {
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return;
                }
                console.error("Error fetching dashboard data", error);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Realtime Subscriptions
        const channel = supabase
            .channel('dashboard-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'stock_predictions', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    const newPred = { ...payload.new, type: 'stock', name: payload.new.stock_name };
                    setTodaysPredictions(prev => [newPred, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'crypto_predictions', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    const newPred = { ...payload.new, type: 'crypto', name: payload.new.coin };
                    setTodaysPredictions(prev => [newPred, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'watchlist', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const newItem = payload.new;
                        // Determine type based on explicit field or guess (fallback logic matches fetch)
                        const isStock = newItem.asset_type === 'stock';

                        setStats(prev => ({
                            ...prev,
                            stockCount: isStock ? prev.stockCount + 1 : prev.stockCount,
                            cryptoCount: !isStock ? prev.cryptoCount + 1 : prev.cryptoCount
                        }));

                        // Try to hydrate with initialData for Top Watchlist
                        const coinData = initialData.find(c => c.id === newItem.coin_id);
                        if (coinData) {
                            setTopWatchlist(prev => [{ ...newItem, coin_data: coinData }, ...prev].slice(0, 5));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const oldItem = payload.old;
                        // We might not know type from DELETE payload (Supabase only sends ID usually), 
                        // so we might need to rely on state or just decrement safely?
                        // Actually, filtering the list is safer.
                        setTopWatchlist(prev => prev.filter(i => i.id !== oldItem.id));
                        // Stats update is tricky without knowing type of deleted item if not in memory.
                        // We will just re-fetch stats to be accurate or accept slight drift until refresh.
                        // Simple approach: Check if it was in our top list to guess type, or just ignore count drift for now.
                    }
                }
            )
            .subscribe();

        return () => {
            controller.abort();
            supabase.removeChannel(channel);
        };
    }, [user, authLoading, initialData]);

    if (loading) return <DashboardSkeleton />;

    // Helper to find market data for a watchlist item
    const getPriceData = (coinId: string, symbol: string) => {
        const found = initialData.find(c => c.id === coinId || c.symbol.toLowerCase() === symbol.toLowerCase());
        return found || null;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-10 pb-10"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <SolarisIcon className="w-12 h-12 text-orange-500" />
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground drop-shadow-[0_0_15px_rgba(var(--foreground),0.2)]">
                            Overview<span className="text-secondary">.</span>
                        </h1>
                    </div>
                </div>

                {/* Pill Navigation (Visual Only for now, acts as filter/status) */}
                <div className="pill-nav">
                    <div className="pill-tab active">Overview</div>
                    <div className="pill-tab">Live Market</div>
                </div>
            </motion.div>

            {/* 1. Portfolio Stats Cards - Solaris Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Crypto All */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 flex flex-col justify-between group relative overflow-hidden hover:border-orange-500/50">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-[50px] group-hover:bg-orange-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-0">
                                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-orange-500/70 uppercase tracking-widest">ALL CRYPTO</div>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                                {stats.totalCrypto.toLocaleString()}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">Available Assets</div>
                        </div>
                        <Link href="/dashboard/crypto" className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-foreground transition-colors">
                            View Market <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* 2. Crypto Watchlist */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 flex flex-col justify-between group relative overflow-hidden hover:border-orange-500/50">
                        {/* Different accent or style */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-[50px] group-hover:bg-pink-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-0">
                                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-pink-500/70 uppercase tracking-widest">MY CRYPTO</div>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                                {stats.cryptoCount}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">In Watchlist</div>
                        </div>
                        <Link href="/dashboard/watchlist" className="mt-4 flex items-center gap-2 text-xs font-bold text-pink-500 hover:text-foreground transition-colors">
                            View Watchlist <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* 3. Stock All */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 flex flex-col justify-between group hover:border-amber-500/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[50px] group-hover:bg-amber-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-0">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">ALL STOCKS</div>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                                {stats.totalStocks.toLocaleString()}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">Available Assets</div>
                        </div>
                        <Link href="/dashboard/stocks" className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-foreground transition-colors">
                            View Market <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* 4. Stock Watchlist */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 flex flex-col justify-between group hover:border-yellow-500/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-[50px] group-hover:bg-yellow-500/20 transition-all" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-0">
                                <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-widest">MY STOCKS</div>
                            </div>
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                                {stats.stockCount}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">In Watchlist</div>
                        </div>
                        <Link href="/dashboard/watchlist" className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-500 hover:text-foreground transition-colors">
                            View Watchlist <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Today's Predictions */}
                <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
                            <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            AI PREDICTIONS
                        </h2>
                        <Link href="/dashboard/predictions" className="text-xs font-bold px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-center">
                            VIEW ALL
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 solaris-skeleton" />)
                        ) : todaysPredictions.length > 0 ? (
                            todaysPredictions.map((pred, i) => {
                                const isBullish = pred.trend?.toUpperCase() === 'UP';
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center justify-between p-4 solaris-card border-none hover:bg-white/5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBullish ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {isBullish ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg leading-none text-foreground tracking-tight">{pred.name || pred.coin_name || "Unknown"}</div>
                                                <div className="text-xs font-medium text-muted-foreground mt-1.5 flex gap-2 items-center">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{pred.timeframe}</span>
                                                    <span className="text-primary">Conf: {pred.confidence}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Target</div>
                                            <div className={`font-mono text-xl font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                                                {pred.predictedPrice || pred.predicted_price}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center solaris-card border-dashed">
                                <p className="text-muted-foreground mb-4">No AI predictions generated yet today.</p>
                                <Link href="/dashboard/watchlist" className="inline-flex items-center justify-center px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
                                    Start Predicting
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 3. Top Watchlist Items */}
                <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
                            <Layers className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                            TOP WATCHLIST
                        </h2>
                        <Link href="/dashboard/watchlist" className="text-xs font-bold px-4 py-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-background transition-all text-center">
                            VIEW ALL
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-20 solaris-skeleton" />)
                        ) : topWatchlist.length > 0 ? (
                            topWatchlist.map((item) => {
                                const marketData = getPriceData(item.coin_id, item.coin_data?.symbol);
                                const price = marketData?.current_price || item.coin_data?.current_price;
                                const change = marketData?.price_change_percentage_24h || item.coin_data?.price_change_percentage_24h || 0;
                                const isPositive = change > 0;
                                const symbol = item.coin_data?.symbol?.toUpperCase() || "UNK";

                                return (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ x: 5 }}
                                        className="flex items-center justify-between p-4 solaris-card border-none hover:bg-white/5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs border border-border text-foreground">
                                                {symbol[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground tracking-tight">{item.coin_data?.name || "Unknown"}</div>
                                                <div className="text-xs font-bold text-muted-foreground uppercase mt-0.5 tracking-wider">{item.asset_type || "Crypto"}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-foreground">
                                                {item.asset_type === 'stock' ? '₹' : '$'}{Number(price || 0).toLocaleString()}
                                            </div>
                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {isPositive ? '+' : ''}{change.toFixed(2)}%
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center solaris-card border-dashed">
                                Your watchlist is waiting for its first star.
                                <Link href="/dashboard/market" className="block text-secondary font-bold hover:underline mt-2">
                                    Explore Markets
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
