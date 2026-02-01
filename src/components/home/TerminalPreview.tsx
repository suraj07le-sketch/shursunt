"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Activity, BarChart2, Zap, Lock, Globe } from "lucide-react";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";
import { cn } from "@/lib/utils";

export const TerminalPreview = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <Zap size={14} />
                        <span>Pro Interface</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
                    >
                        Experience the Future
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground"
                    >
                        A terminal interface designed for speed, precision, and complete market dominance.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative mx-auto max-w-6xl"
                >


                    {/* Main Terminal Window */}
                    <SpotlightCard
                        className="w-full aspect-video md:aspect-[21/9] bg-black/80 border-white/10 p-2 md:p-4 rounded-xl shadow-2xl"
                        spotlightColor="rgba(255, 159, 28, 0.15)"
                        fillColor="rgba(0, 0, 0, 0.5)"
                    >
                        {/* Window Controls */}
                        <div className="h-8 flex items-center gap-2 px-2 border-b border-white/5 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            <div className="ml-4 text-xs text-muted-foreground font-mono">shursunt_terminal_v2.0.exe</div>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-12 grid-rows-6 gap-2 h-[calc(100%-2.5rem)]">
                            {/* Chart Area */}
                            <div className="col-span-12 md:col-span-9 row-span-4 rounded-lg bg-white/5 border border-white/5 p-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex gap-4">
                                        <span className="font-bold text-primary">BTC/USD</span>
                                        <span className="text-green-500 font-mono">$64,230.50</span>
                                    </div>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 rounded bg-white/10">1H</span>
                                        <span className="px-2 py-0.5 rounded bg-white/10 text-foreground">4H</span>
                                        <span className="px-2 py-0.5 rounded bg-white/10">1D</span>
                                    </div>
                                </div>
                                {/* Simulated Chart Lines */}
                                <div className="w-full h-[70%] flex items-end gap-1">
                                    {[...Array(40)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: "0%" }}
                                            whileInView={{ height: `${20 + (i * 13 % 60)}%` }}
                                            transition={{ duration: 0.5, delay: i * 0.02 }}
                                            className={cn(
                                                "flex-1 rounded-t-sm opacity-80",
                                                i % 2 === 0 ? "bg-green-500/30" : "bg-red-500/30"
                                            )}
                                            style={{ height: `${20 + (i * 13 % 60)}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Order Book */}
                            <div className="col-span-12 md:col-span-3 row-span-4 rounded-lg bg-white/5 border border-white/5 p-3 font-mono text-xs hidden md:block">
                                <div className="text-muted-foreground mb-2 flex justify-between">
                                    <span>Price</span>
                                    <span>Amt</span>
                                </div>
                                <div className="space-y-1">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={`sell-${i}`} className="flex justify-between text-red-400/80">
                                            <span>{(64300 + i * 10).toFixed(2)}</span>
                                            <span>{((i * 0.5) + 0.1234).toFixed(4)}</span>
                                        </div>
                                    ))}
                                    <div className="py-1 border-y border-white/5 my-1 text-center text-lg text-foreground font-bold">
                                        64,230.50
                                    </div>
                                    {[...Array(8)].map((_, i) => (
                                        <div key={`buy-${i}`} className="flex justify-between text-green-400/80">
                                            <span>{(64200 - i * 10).toFixed(2)}</span>
                                            <span>{((i * 0.3) + 0.5678).toFixed(4)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bot Activity / Log */}
                            <div className="col-span-12 row-span-2 rounded-lg bg-white/5 border border-white/5 p-4 font-mono text-xs overflow-hidden">
                                <div className="text-muted-foreground mb-2 flex gap-2 items-center">
                                    <Terminal size={12} />
                                    <span>System Logs</span>
                                </div>
                                <div className="space-y-1.5 opacity-80">
                                    {[
                                        { time: "10:23:05", msg: "[SYSTEM] Connected to Frankfurt Node (12ms)" },
                                        { time: "10:23:08", msg: "[AI_CORE]Analyzing volatility patterns for BTC/USD..." },
                                        { time: "10:23:12", msg: "[AI_CORE] Signal Detected: BUY CONFIRMATION at 64,150" },
                                        { time: "10:23:13", msg: "[EXECUTOR] Order Filled: 0.5 BTC @ 64,150" },
                                        { time: "10:23:15", msg: "[SYSTEM] Syncing portfolio state..." },
                                    ].map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.1 }}
                                            className="text-primary/80"
                                        >
                                            <span className="text-muted-foreground">{log.time}</span> {log.msg}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </section>
    );
};
