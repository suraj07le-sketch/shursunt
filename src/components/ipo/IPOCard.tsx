"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info, Calendar, ExternalLink } from "lucide-react";
import { IPOSubscription, predictIPOGains } from "@/lib/ipoLogic";
import { cn } from "@/lib/utils";

interface IPOCardProps {
    ipo: {
        company_name: string;
        issue_price_raw: string;
        issue_size: string;
        listing_date: string;
        open_date: string;
        close_date: string;
        status: "open" | "upcoming" | "closed" | "listed";
        subscription?: IPOSubscription;
        gmp?: number;
        type?: "mainboard" | "sme";
        additional_text?: string;
        document_url?: string;
    };
}

export function IPOCard({ ipo }: IPOCardProps) {
    // Parse issue price for logic
    const priceNum = parseFloat(ipo.issue_price_raw.replace(/[^0-9.]/g, '')) || 500;
    const prediction = predictIPOGains({
        company_name: ipo.company_name,
        issue_price: priceNum,
        subscription: ipo.subscription,
        gmp: ipo.gmp,
        status: ipo.status
    });

    const isBullish = prediction.sentiment.startsWith('BULLISH');
    const isBearish = prediction.sentiment === 'BEARISH';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-secondary/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl"
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-20 rounded-full transition-all duration-500",
                isBullish ? "bg-green-500 group-hover:opacity-40" :
                    isBearish ? "bg-red-500 group-hover:opacity-40" :
                        "bg-primary group-hover:opacity-40"
            )} />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {ipo.company_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Issue Size: {ipo.issue_size === 'TBA' ? 'To Be Announced' : ipo.issue_size}
                    </p>
                </div>

                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    ipo.status === 'open' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        ipo.status === 'upcoming' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-gray-500/20 text-gray-400 border-gray-500/30"
                )}>
                    {ipo.status}
                </div>
                {ipo.type && (
                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-primary/10 text-primary border-primary/30">
                        {ipo.type}
                    </div>
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-colors">
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Price Band</p>
                    <p className="text-lg font-bold">
                        {ipo.issue_price_raw === 'TBA' ? '₹TBA' : (ipo.issue_price_raw.startsWith('₹') ? ipo.issue_price_raw : `₹${ipo.issue_price_raw}`)}
                    </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-colors">
                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Listing Date</p>
                    <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-primary" />
                        <p className="text-sm font-bold text-foreground/80">{ipo.listing_date || "TBA"}</p>
                    </div>
                </div>

            </div>

            {/* Prediction Engine Block */}
            <div className="relative p-4 rounded-2xl bg-black/40 border border-primary/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-black text-primary">
                        {prediction.model_version || "NEURAL_NET"}
                    </div>
                </div>

                <p className="text-[10px] text-primary/80 uppercase font-black mb-2 flex items-center gap-2">
                    {(prediction.model_version && (prediction.model_version.includes('sentiment') || prediction.model_version.includes('pending'))) ? 'Market Analysis' : 'Neural Net Forecast'}
                    <Info size={10} className="opacity-50" />
                </p>

                {ipo.additional_text && (
                    <div className="mb-4 p-2.5 bg-white/5 border border-white/5 rounded-xl">
                        <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                            "{ipo.additional_text}"
                        </p>
                    </div>
                )}



                <div className="flex items-end gap-2">
                    <span className={cn(
                        "text-3xl font-black",
                        isBullish ? "text-green-400" : isBearish ? "text-red-400" : "text-foreground"
                    )}>
                        {prediction.gain_percent > 0 ? "+" : ""}{prediction.gain_percent}%
                    </span>
                    <div className="mb-1 flex items-center gap-1">
                        {isBullish ? <TrendingUp size={16} className="text-green-400" /> : <TrendingDown size={16} className="text-red-400" />}
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                            {prediction.sentiment.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Progress bar for confidence */}
                <div className="mt-3">
                    <div className="flex justify-between text-[9px] font-black uppercase mb-1 opacity-60">
                        <span>Confidence</span>
                        <span>{prediction.confidence}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prediction.confidence}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                        />
                    </div>
                </div>
            </div>

            {/* Subscription status if open/closed */}
            {(ipo.status === 'open' || ipo.status === 'closed') && ipo.subscription && (
                <div className="mt-4 flex gap-3">
                    <div className="flex-1 text-center">
                        <p className="text-[8px] text-muted-foreground uppercase font-black">QIB</p>
                        <p className="text-xs font-bold text-white">{ipo.subscription.qib}x</p>
                    </div>
                    <div className="w-px h-8 bg-white/5 self-center" />
                    <div className="flex-1 text-center">
                        <p className="text-[8px] text-muted-foreground uppercase font-black">NII</p>
                        <p className="text-xs font-bold text-white">{ipo.subscription.nii}x</p>
                    </div>
                    <div className="w-px h-8 bg-white/5 self-center" />
                    <div className="flex-1 text-center">
                        <p className="text-[8px] text-muted-foreground uppercase font-black">Retail</p>
                        <p className="text-xs font-bold text-white">{ipo.subscription.retail}x</p>
                    </div>
                </div>
            )}

            {/* Document Link */}
            {ipo.document_url && (
                <a
                    href={ipo.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all group/link"
                >
                    View Official Prospectus
                    <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
            )}
        </motion.div>
    );
}
