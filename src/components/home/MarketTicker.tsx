"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatUtils";

// Mock data to ensure it always looks good without API rate limits
const INITIAL_COINS = [
    { symbol: "BTC", price: 64230.50, change: 2.4 },
    { symbol: "ETH", price: 3450.12, change: 1.8 },
    { symbol: "SOL", price: 145.60, change: 5.2 },
    { symbol: "BNB", price: 590.20, change: -0.5 },
    { symbol: "XRP", price: 0.62, change: 1.1 },
    { symbol: "ADA", price: 0.45, change: -1.2 },
    { symbol: "AVAX", price: 47.80, change: 3.5 },
    { symbol: "DOGE", price: 0.16, change: 8.4 },
    { symbol: "DOT", price: 7.20, change: -2.1 },
    { symbol: "LINK", price: 18.90, change: 4.2 },
];

export const MarketTicker = () => {
    const [coins, setCoins] = useState(INITIAL_COINS);

    // Simulate live price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCoins(prev => prev.map(coin => ({
                ...coin,
                price: coin.price * (1 + (Math.random() * 0.002 - 0.001)), // Random +/- 0.1% move
                change: coin.change + (Math.random() * 0.1 - 0.05)
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black/40 border-y border-white/5 backdrop-blur-md overflow-hidden flex items-center h-12 relative z-40">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex select-none">
                <motion.div
                    animate={{ x: [0, -1000] }} // Adjust based on width
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-8 items-center pr-8"
                >
                    {/* Duplicate list for seamless loop */}
                    {[...coins, ...coins, ...coins].map((coin, i) => (
                        <div key={`${coin.symbol}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
                            <span className="font-bold text-sm text-muted-foreground">{coin.symbol}</span>
                            <span className="font-mono text-sm font-medium text-foreground">
                                {formatCurrency(coin.price, false)}
                            </span>
                            <span className={cn(
                                "flex items-center text-xs font-bold",
                                coin.change >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                                {coin.change >= 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                {Math.abs(coin.change).toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </motion.div>
                {/* Second ticker for filling space if needed, efficiently handled by repeating data in one motion div above */}
            </div>
        </div>
    );
};
