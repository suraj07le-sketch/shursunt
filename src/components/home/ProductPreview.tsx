"use client";

import { motion } from "framer-motion";
import { Terminal, Activity, TrendingUp, Sparkles, Shield, Cpu, Play } from "lucide-react";
import { PillToggle } from "@/components/ui/PillToggle";
import { PriceChangeBadge } from "@/components/ui/PriceChangeBadge";
import { useState } from "react";

export function ProductPreview() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <section id="product-preview" className="py-24 bg-[#09090b] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111114] border border-[#26262b] text-orange-400 text-xs font-mono font-bold uppercase tracking-widest">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>LIVE SYSTEM INTERFACE</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                        Built for Professional Execution
                    </h2>

                    <p className="text-base sm:text-lg text-zinc-400">
                        Experience the raw speed of our unified market console and neural predictions engine.
                    </p>
                </div>

                {/* Device/Browser Chrome Frame */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl border border-[#26262b] bg-[#111114] shadow-2xl overflow-hidden backdrop-blur-xl"
                >
                    {/* Browser Header Bar */}
                    <div className="h-11 px-4 bg-[#18181c] border-b border-[#26262b] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            <span className="ml-3 text-xs font-mono text-zinc-400 hidden sm:inline">
                                https://shursunt.com/dashboard
                            </span>
                        </div>

                        <PillToggle
                            options={[
                                { id: "overview", label: "Overview" },
                                { id: "signals", label: "AI Signals", badge: "LIVE" },
                                { id: "market", label: "Market Grid" },
                            ]}
                            value={activeTab}
                            onChange={setActiveTab}
                            size="sm"
                        />
                    </div>

                    {/* Dashboard Workspace Mock UI */}
                    <div className="p-6 md:p-8 space-y-6">
                        {/* Top Ticker Summary Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: "NIFTY 50", price: "24,850.15", change: 0.82, icon: TrendingUp },
                                { title: "BTC/USDT", price: "$64,230.50", change: 3.45, icon: Sparkles },
                                { title: "ETH/USDT", price: "$3,480.20", change: 4.12, icon: Activity },
                                { title: "AI Signals Today", price: "18 Signals", change: 94.2, label: "Win Rate" },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-[#09090b] border border-[#26262b] flex flex-col justify-between">
                                    <div className="text-xs font-mono text-zinc-500 uppercase">{item.title}</div>
                                    <div className="text-xl font-bold font-mono text-white mt-1">{item.price}</div>
                                    <div className="mt-2">
                                        <PriceChangeBadge change={item.change} size="sm" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Main Canvas Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Chart Area */}
                            <div className="md:col-span-2 p-6 rounded-xl bg-[#09090b] border border-[#26262b] space-y-4">
                                <div className="flex items-center justify-between border-b border-[#26262b] pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-xs">
                                            BTC
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Bitcoin Real-Time Signal</div>
                                            <div className="text-xs font-mono text-zinc-500">Binance Spot • 15m Timeframe</div>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                                        BULLISH SETUP (92%)
                                    </span>
                                </div>

                                {/* Simulated Graphic Canvas */}
                                <div className="h-48 w-full bg-gradient-to-t from-orange-500/5 via-transparent to-transparent rounded-lg border border-[#26262b] p-4 flex items-end gap-1.5 overflow-hidden">
                                    {[30, 45, 38, 55, 60, 52, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((val, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-1 bg-gradient-to-t from-orange-500/40 to-amber-400 rounded-t-sm transition-all duration-300 hover:opacity-100 opacity-80"
                                            style={{ height: `${val}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Live AI Predictions Log */}
                            <div className="p-6 rounded-xl bg-[#09090b] border border-[#26262b] flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#26262b] pb-3">
                                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase">Live Signal Log</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    <div className="space-y-3 font-mono text-xs">
                                        {[
                                            { asset: "RELIANCE", signal: "BUY", target: "₹3,150", confidence: "88%" },
                                            { asset: "SOL/USDT", signal: "LONG", target: "$165", confidence: "94%" },
                                            { asset: "TATASTEEL", signal: "BUY", target: "₹185", confidence: "85%" },
                                        ].map((sig, idx) => (
                                            <div key={idx} className="p-2.5 rounded-lg bg-[#111114] border border-[#26262b] flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold text-white">{sig.asset}</div>
                                                    <div className="text-[10px] text-zinc-500">Target: {sig.target}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                                                        {sig.signal}
                                                    </span>
                                                    <div className="text-[10px] text-cyan-400 mt-1">{sig.confidence} Conf.</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#26262b] text-center">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                        Updated 3 seconds ago
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
