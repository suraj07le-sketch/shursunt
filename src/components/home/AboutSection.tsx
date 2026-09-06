"use client";

import React from "react";
import { motion } from "framer-motion";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { Shield, Cpu, ArrowRight, Terminal, Activity } from "lucide-react";
import Link from "next/link";

const architectureSpecs = [
    {
        id: "ARCH-01",
        title: "Multi-Venue Market Ingestion",
        category: "DATA PIPELINE",
        desc: "Low-latency ingestion connecting NSE/BSE equity feeds with global crypto order books, normalized into unified tick and OHLCV streams.",
        metrics: [
            { label: "Markets", value: "NSE · BSE · Crypto" },
            { label: "Update Freq", value: "Sub-second" },
            { label: "Depth", value: "L2 Order Book" },
        ],
        icon: Terminal,
    },
    {
        id: "ARCH-02",
        title: "Neural Confluence Engine",
        category: "SIGNAL MATRIX",
        desc: "Synthesizes multi-timeframe EMA trends, VWAP deviation, institutional volume spikes, and statistical sentiment into probabilistic trade setups.",
        metrics: [
            { label: "Confidence", value: "Calibrated 0-100%" },
            { label: "Stop Loss", value: "Dynamic ATR" },
            { label: "Regime Filter", value: "Bull / Bear / Chop" },
        ],
        icon: Cpu,
    },
    {
        id: "ARCH-03",
        title: "Deterministic Risk Architecture",
        category: "SECURITY & EXECUTION",
        desc: "Enforces non-negotiable risk parameters: strict R:R thresholds, maximum capital drawdowns, and cryptographic session isolation.",
        metrics: [
            { label: "Auth Guard", value: "Row-Level Security" },
            { label: "Sync Engine", value: "Cross-Device Cloud" },
            { label: "Validation", value: "Real-time Verification" },
        ],
        icon: Shield,
    },
];

export const AboutSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-background border-t border-border">
            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: System Concept & Live Telemetry (5 cols) */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
                                <SolarisIcon className="w-3.5 h-3.5" />
                                <span>SYSTEM ARCHITECTURE</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-display leading-tight">
                                Engineered for Precision, Not Speculation
                            </h2>

                            <p className="text-base text-muted-foreground leading-relaxed">
                                Most retail platforms rely on lagging indicators and emotional news feeds. ShursunT delivers institutional-grade market mechanics, combining real-time order-flow confluence with programmatic risk boundaries.
                            </p>
                        </div>

                        {/* Telemetry Box */}
                        <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4 font-mono text-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-border text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                    ENGINE TELEMETRY
                                </span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    OPERATIONAL
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-foreground">
                                    <span className="text-muted-foreground">Exchange Connectivity:</span>
                                    <span className="font-semibold tabular-nums">Active (NSE, BSE, Binance)</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground">
                                    <span className="text-muted-foreground">Signal Processing:</span>
                                    <span className="font-semibold tabular-nums">&lt; 45ms Latency</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground">
                                    <span className="text-muted-foreground">Model Calibration:</span>
                                    <span className="font-semibold tabular-nums">Daily EOD + Intraday</span>
                                </div>
                                <div className="flex justify-between items-center text-foreground">
                                    <span className="text-muted-foreground">Data Storage:</span>
                                    <span className="font-semibold">Encrypted Supabase RLS</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/market"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                            >
                                <span>Launch Market Workspace</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Architectural Pillar Cards (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        {architectureSpecs.map((spec, i) => {
                            const Icon = spec.icon;
                            return (
                                <motion.div
                                    key={spec.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-muted text-foreground border border-border">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-mono font-medium text-primary tracking-wider uppercase">
                                                    {spec.category}
                                                </span>
                                                <h3 className="text-lg font-bold text-foreground font-display">
                                                    {spec.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                                            {spec.id}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                                        {spec.desc}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/70 font-mono text-xs">
                                        {spec.metrics.map((m, idx) => (
                                            <div key={idx} className="bg-background/80 rounded-md p-2.5 border border-border/50">
                                                <div className="text-[10px] text-muted-foreground uppercase">{m.label}</div>
                                                <div className="text-foreground font-semibold mt-0.5 tabular-nums">{m.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
