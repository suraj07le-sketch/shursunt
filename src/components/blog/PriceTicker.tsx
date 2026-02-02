"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTickerProps {
    symbol: string;
    coinId: string;
}

export function PriceTicker({ symbol, coinId }: PriceTickerProps) {
    // Mock live data for the demo
    const isPositive = Math.random() > 0.4;
    const change = (Math.random() * 5).toFixed(2);
    const price = (Math.random() * 60000 + 1000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
        >
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{symbol}</span>
                <span className="text-sm font-black text-foreground">${price}</span>
            </div>

            <div className={cn(
                "flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-lg",
                isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            )}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? "+" : "-"}{change}%
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                <ArrowUpRight size={14} />
            </div>
        </motion.div>
    );
}
