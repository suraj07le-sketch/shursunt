"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ShieldCheck, Zap, LineChart, Cpu, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function BentoFeatures() {
    return (
        <section className="py-24 bg-[#09090b] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111114] border border-[#26262b] text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>PLATFORM CAPABILITIES</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                        Engineered for Market Alpha
                    </h2>

                    <p className="text-base sm:text-lg text-zinc-400">
                        Everything you need to analyze, predict, and execute across equities and crypto.
                    </p>
                </div>

                {/* Asymmetric Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Hero Feature Card - Spans 2 Columns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ y: -4 }}
                        className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-[#111114] via-[#141419] to-[#181820] border border-[#26262b] hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group shadow-xl flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase">
                                    HERO FEATURE
                                </span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors font-display">
                                AI Predictive Signal Engine
                            </h3>

                            <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
                                Multi-layered neural models analyze order flow, sentiment, and volume spikes to issue directional trade setups with automated entry, target, and stop-loss levels.
                            </p>
                        </div>

                        {/* Interactive Visual Preview inside Hero Feature Card */}
                        <div className="p-4 rounded-xl bg-[#09090b]/80 border border-[#26262b] backdrop-blur-md grid grid-cols-3 gap-4 font-mono text-xs">
                            <div className="p-3 rounded-lg bg-[#111114] border border-[#26262b]">
                                <div className="text-zinc-500 text-[10px] uppercase mb-1">Target Entry</div>
                                <div className="text-white font-bold">$64,150.00</div>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="text-emerald-400 text-[10px] uppercase mb-1">Target Profit</div>
                                <div className="text-emerald-400 font-bold">$68,500.00</div>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="text-red-400 text-[10px] uppercase mb-1">Stop Loss</div>
                                <div className="text-red-400 font-bold">$62,800.00</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Indian Stock Ecosystem */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ y: -4 }}
                        className="p-8 rounded-2xl bg-[#111114] border border-[#26262b] hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between group"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                                <LineChart className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors font-display">
                                NSE & BSE Live Matrix
                            </h3>

                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Complete coverage of 500+ Indian equities with Nifty50/Sensex tickers and breakout indicators.
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#26262b] flex items-center text-xs font-mono text-orange-400 group-hover:translate-x-1 transition-transform">
                            <span>Explore Equities</span>
                            <ArrowUpRight className="w-4 h-4 ml-auto" />
                        </div>
                    </motion.div>

                    {/* Card 3: Global Crypto Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ y: -4 }}
                        className="p-8 rounded-2xl bg-[#111114] border border-[#26262b] hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                                <TrendingUp className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors font-display">
                                1000+ Crypto Assets
                            </h3>

                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Real-time price tracking, market cap rankings, and sentiment indexes for top digital assets.
                            </p>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#26262b] flex items-center text-xs font-mono text-purple-400 group-hover:translate-x-1 transition-transform">
                            <span>Browse Crypto</span>
                            <ArrowUpRight className="w-4 h-4 ml-auto" />
                        </div>
                    </motion.div>

                    {/* Card 4: Database Watchlist Sync */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ y: -4 }}
                        className="md:col-span-2 p-8 rounded-2xl bg-[#111114] border border-[#26262b] hover:border-emerald-500/40 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group"
                    >
                        <div className="space-y-3 max-w-lg">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors font-display">
                                Instant Supabase Watchlist Synchronization
                            </h3>

                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Your saved assets sync across all devices in real-time with zero latency and database persistence.
                            </p>
                        </div>

                        <Link href="/login">
                            <button className="px-6 py-3 rounded-full bg-[#18181c] hover:bg-[#222228] border border-[#38383f] text-white text-xs font-bold font-mono tracking-wider transition-all whitespace-nowrap">
                                SETUP WATCHLIST →
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
