"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PillToggle } from "@/components/ui/PillToggle";

export function PricingTeaser() {
    const [billingCycle, setBillingCycle] = useState("yearly");

    return (
        <section className="py-24 bg-[#09090b] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111114] border border-[#26262b] text-orange-400 text-xs font-mono font-bold uppercase tracking-widest">
                        <Zap className="w-3.5 h-3.5" />
                        <span>TRANSPARENT PRICING</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
                        Simple, Predictable Plans
                    </h2>

                    <p className="text-base sm:text-lg text-zinc-400">
                        Choose the speed and intelligence level required for your trading strategy.
                    </p>

                    <div className="pt-4">
                        <PillToggle
                            options={[
                                { id: "monthly", label: "Monthly Billing" },
                                { id: "yearly", label: "Yearly Billing", badge: "SAVE 20%" },
                            ]}
                            value={billingCycle}
                            onChange={setBillingCycle}
                        />
                    </div>
                </div>

                {/* 2 Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Standard Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="p-8 rounded-2xl bg-[#111114] border border-[#26262b] flex flex-col justify-between"
                    >
                        <div>
                            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">STARTER</div>
                            <h3 className="text-2xl font-bold text-white font-display mb-4">Standard Console</h3>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black font-mono text-white">
                                    {billingCycle === "yearly" ? "$19" : "$25"}
                                </span>
                                <span className="text-sm font-mono text-zinc-400">/ month</span>
                            </div>

                            <ul className="space-y-3 text-sm text-zinc-300 mb-8">
                                {[
                                    "Access to 500 NSE/BSE Equities",
                                    "1000+ Crypto Market Tickers",
                                    "Real-time Supabase Watchlist",
                                    "Standard Technical Indicators",
                                    "Community Signal Feed",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link href="/login">
                            <button className="w-full py-3.5 rounded-full bg-[#18181c] hover:bg-[#222228] border border-[#38383f] text-white font-bold text-sm transition-all cursor-pointer">
                                Get Started Standard
                            </button>
                        </Link>
                    </motion.div>

                    {/* Pro Neural Plan (Recommended) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="p-8 rounded-2xl bg-gradient-to-b from-[#16141d] to-[#111114] border-2 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.15)] flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-wider rounded-bl-xl shadow-md">
                            RECOMMENDED
                        </div>

                        <div>
                            <div className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>PRO NEURAL LINK</span>
                            </div>

                            <h3 className="text-2xl font-bold text-white font-display mb-4">Neural Trader Pro</h3>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black font-mono text-white">
                                    {billingCycle === "yearly" ? "$49" : "$59"}
                                </span>
                                <span className="text-sm font-mono text-zinc-400">/ month</span>
                            </div>

                            <ul className="space-y-3 text-sm text-zinc-200 mb-8">
                                {[
                                    "Everything in Standard",
                                    "AI Directional Signal Engine (90%+ Acc)",
                                    "IPO Grey Market Premium (GMP) Analytics",
                                    "Mutual Fund AI Probability Gauges",
                                    "Priority Order Execution Signal Routing",
                                    "Unlimited Custom Price Alerts",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-orange-400 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link href="/login">
                            <button className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-bold text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2">
                                <span>Unlock Pro Signals</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
