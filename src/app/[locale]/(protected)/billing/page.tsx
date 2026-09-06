"use client";

import { useState } from "react";
import { Check, CreditCard, Shield, Zap, ArrowRight, HelpCircle, Terminal, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SolarisIcon } from "@/components/ui/SolarisIcon";

const TIERS = [
    {
        id: "community",
        name: "COMMUNITY SEAT",
        badge: "STANDARD",
        priceMonthly: "₹0",
        priceYearly: "₹0",
        period: "Lifetime",
        description: "Essential market telemetry for retail traders and exploratory analysis.",
        current: true,
        features: [
            "Delayed NSE/BSE tick feeds (15m)",
            "Top 100 Crypto token tracking",
            "Up to 10 Watchlist instruments",
            "EOD Market indices snapshot",
            "Community Discord support"
        ],
        cta: "ACTIVE TIER",
        ctaDisabled: true,
    },
    {
        id: "pro",
        name: "PROFESSIONAL TRADER",
        badge: "RECOMMENDED",
        priceMonthly: "₹2,499",
        priceYearly: "₹24,990",
        period: "per month",
        description: "Full confluence engine access with sub-second live feeds and automated risk parameters.",
        popular: true,
        features: [
            "Sub-second real-time tick streaming",
            "8-Factor Neural Confluence Signals",
            "Dynamic ATR Stop-Loss & R:R metrics",
            "Unlimited Multi-Asset Watchlists",
            "IPO Grey Market Premium (GMP) radar",
            "Mutual Fund stability scoring",
            "Priority quantitative support"
        ],
        cta: "UPGRADE SEAT",
        ctaDisabled: false,
    },
    {
        id: "institutional",
        name: "INSTITUTIONAL DESK",
        badge: "ENTERPRISE",
        priceMonthly: "Custom",
        priceYearly: "Custom",
        period: "annual licensing",
        description: "Direct market gateway access, bespoke neural network fine-tuning, and multi-seat terminal controls.",
        features: [
            "Everything in Professional tier",
            "Raw WebSocket tick stream API",
            "Bespoke model weighting & backtesting",
            "Multi-seat team workspace management",
            "Row-Level Security enclave isolation",
            "Dedicated quantitative desk manager",
            "99.99% SLA guarantee"
        ],
        cta: "CONTACT DESK",
        ctaDisabled: false,
    }
];

const MATRIX_FEATURES = [
    { name: "NSE / BSE Equity Feeds", community: "15-min Cached", pro: "Sub-Second Live", institutional: "Raw L2/L3 Tick Feed" },
    { name: "Global Crypto Pairs", community: "Top 100", pro: "1,000+ Normalized", institutional: "Full Global Depth" },
    { name: "AI Signal Confluence Engine", community: "EOD Summary Only", pro: "Real-Time 8-Factor", institutional: "Custom Neural Weights" },
    { name: "Watchlist Capacity", community: "10 Assets", pro: "Unlimited", institutional: "Unlimited Shared" },
    { name: "Dynamic ATR Stop-Loss", community: "No", pro: "Automated", institutional: "Automated + Trailing API" },
    { name: "Primary Market (IPO & GMP)", community: "Basic List", pro: "Neural Gain Forecast", institutional: "Institutional Allocation Depth" },
    { name: "TradingView Canvas", community: "Standard", pro: "Advanced Indicators", institutional: "Multi-Chart Sync" },
    { name: "Direct API Access", community: "No", pro: "Rate-limited REST", institutional: "Dedicated WebSockets" },
    { name: "Support Level", community: "Community", pro: "Priority Queue", institutional: "24/7 Dedicated Quant" },
];

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

    const handleUpgrade = (tierId: string) => {
        if (tierId === "institutional") {
            window.location.href = "mailto:desk@shursunt.com?subject=Institutional%20Desk%20Inquiry";
            return;
        }

        toast.info("Stripe Payment Gateway integration in progress. Your account is currently granted full Pro trial telemetry!");
    };

    return (
        <div className="space-y-10 pb-16 max-w-7xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Subscription & Seat Licensing
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                SEAT PROVISIONED
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Transparent institutional pricing for algorithmic market intelligence and real-time execution telemetry
                        </p>
                    </div>
                </div>

                {/* Billing Cycle Switcher */}
                <div className="flex items-center gap-2 p-1 rounded-lg border border-border bg-card font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                            "px-3 py-1.5 rounded font-semibold transition-all cursor-pointer",
                            billingCycle === "monthly"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Monthly Billing
                    </button>
                    <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={cn(
                            "px-3 py-1.5 rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                            billingCycle === "yearly"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span>Annual Billing</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">SAVE 17%</span>
                    </button>
                </div>
            </div>

            {/* Pricing Tier Bento Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {TIERS.map((tier) => {
                    const price = billingCycle === "yearly" ? tier.priceYearly : tier.priceMonthly;
                    const period = tier.priceMonthly === "₹0" || tier.priceMonthly === "Custom"
                        ? tier.period
                        : billingCycle === "yearly" ? "/year" : "/month";

                    return (
                        <div
                            key={tier.id}
                            className={cn(
                                "rounded-xl border bg-card p-6 flex flex-col justify-between transition-colors relative",
                                tier.popular
                                    ? "border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                                    : "border-border"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider">
                                    {tier.badge}
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                                    <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wide">
                                        {tier.name}
                                    </span>
                                    {!tier.popular && (
                                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                            {tier.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 mb-3 flex items-baseline gap-1.5 font-mono">
                                    <span className="text-4xl font-black text-foreground tracking-tight tabular-nums">
                                        {price}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {period}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
                                    {tier.description}
                                </p>

                                <div className="space-y-2.5 pt-4 border-t border-border/60">
                                    <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                                        INCLUDED CAPABILITIES
                                    </span>
                                    {tier.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-2.5 text-xs font-mono text-foreground">
                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-border/60">
                                <button
                                    type="button"
                                    onClick={() => handleUpgrade(tier.id)}
                                    disabled={tier.ctaDisabled}
                                    className={cn(
                                        "w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm",
                                        tier.current
                                            ? "bg-muted text-muted-foreground border border-border cursor-default"
                                            : tier.popular
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                                    )}
                                >
                                    <span>{tier.cta}</span>
                                    {!tier.ctaDisabled && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Institutional Feature Comparison Matrix Table */}
            <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-bold font-display text-foreground">
                        Institutional Capability Matrix
                    </h2>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-[11px] uppercase">
                                <tr>
                                    <th className="p-3.5 pl-5 font-semibold">Capability</th>
                                    <th className="p-3.5 font-semibold">Community</th>
                                    <th className="p-3.5 font-semibold text-primary">Professional</th>
                                    <th className="p-3.5 pr-5 font-semibold">Institutional Desk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {MATRIX_FEATURES.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-3.5 pl-5 font-bold text-foreground font-sans text-xs">{row.name}</td>
                                        <td className="p-3.5 text-muted-foreground">{row.community}</td>
                                        <td className="p-3.5 font-bold text-foreground">{row.pro}</td>
                                        <td className="p-3.5 pr-5 text-muted-foreground">{row.institutional}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Security & Regulatory Notes */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Row-Level Security & AES-256 session encryption enforced across all tiers</span>
                </div>
                <span>Need custom invoicing or GSTIN? Contact desk@shursunt.com</span>
            </div>
        </div>
    );
}
