"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimilarCoin {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
}

interface SimilarCoinsCarouselProps {
    coins: SimilarCoin[];
    locale: string;
}

export function SimilarCoinsCarousel({ coins, locale }: SimilarCoinsCarouselProps) {
    return (
        <div className="w-full py-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Similar Assets to Watch</h4>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {coins.map((coin, index) => {
                    const isPositive = coin.price_change_percentage_24h >= 0;

                    return (
                        <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="min-w-[200px] snap-start"
                        >
                            <Link href={`/${locale}/price-prediction/${coin.id}`}>
                                <div className="p-4 rounded-2xl bg-card/30 backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-xs font-bold group-hover:text-primary transition-colors">{coin.symbol.toUpperCase()}</p>
                                            <p className="text-[10px] text-muted-foreground truncate w-24">{coin.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-black font-mono">${coin.current_price.toLocaleString()}</p>
                                        <div className={cn(
                                            "flex items-center text-[10px] font-bold",
                                            isPositive ? "text-green-400" : "text-red-400"
                                        )}>
                                            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
