"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
    User,
    Settings as SettingsIcon,
    Shield,
    Mail,
    LogOut,
    Bell,
    Check,
    KeyRound,
    Clock,
    Monitor,
    Sun,
    Moon,
    Laptop,
    SlidersHorizontal,
    ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SolarisIcon } from "@/components/ui/SolarisIcon";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const [chartTimeframe, setChartTimeframe] = useState("4h");
    const [defaultSegment, setDefaultSegment] = useState("stocks");
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [emailDigest, setEmailDigest] = useState(false);
    const [soundTelemetry, setSoundTelemetry] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success("Terminal session terminated successfully.");
            router.push("/login");
        } catch {
            toast.error("Failed to terminate session.");
        }
    };

    const handlePasswordReset = async () => {
        toast.info("Password reset dispatch initiated. Check your registered email.");
    };

    const userEmail = user?.email || "trader@shursunt.internal";
    const userId = user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-6)}` : "ANON_SESSION";

    return (
        <div className="space-y-8 pb-16 max-w-5xl mx-auto">
            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                                Terminal Configuration
                            </h1>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                AUTHENTICATED
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            Manage your trader credentials, interface preferences, and execution alert boundaries
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-mono font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Session</span>
                </button>
            </div>

            {/* Profile Identity Card */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-mono font-bold text-primary text-base">
                            {userEmail.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-mono font-bold text-sm text-foreground">{userEmail}</h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
                                <span>UID: {userId}</span>
                                <span className="text-border">|</span>
                                <span className="text-emerald-400 font-semibold">Seat: Professional Trial</span>
                            </div>
                        </div>
                    </div>

                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-muted text-foreground border border-border">
                        RLS PROTOCOL: ENFORCED
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-background border border-border/70">
                        <span className="text-[10px] text-muted-foreground uppercase block">Security Role</span>
                        <span className="font-bold text-foreground mt-0.5 block">Authorized Trader</span>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border/70">
                        <span className="text-[10px] text-muted-foreground uppercase block">Data Retention</span>
                        <span className="font-bold text-foreground mt-0.5 block">Encrypted Cloud Sync</span>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border/70">
                        <span className="text-[10px] text-muted-foreground uppercase block">Telemetry Stream</span>
                        <span className="font-bold text-emerald-400 mt-0.5 block">Live WebSocket</span>
                    </div>
                </div>
            </div>

            {/* Terminal Interface & Visual Styling */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground font-display">
                        Display & Workspace Defaults
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Theme Mode Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-border/60">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">Color Theme</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Select terminal contrast mode (Fintech dark recommended)
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-background">
                            {[
                                { id: "dark", label: "Fintech Dark", icon: Moon },
                                { id: "light", label: "Daylight", icon: Sun },
                                { id: "system", label: "System OS", icon: Laptop }
                            ].map((t) => {
                                const Icon = t.icon;
                                const isActive = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Default Horizon */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-border/60">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">Default Signal Horizon</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Pre-selected timeframe for AI confluence setups
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-background font-mono text-xs">
                            {["1h", "4h", "1d", "1w"].map((tf) => (
                                <button
                                    key={tf}
                                    type="button"
                                    onClick={() => setChartTimeframe(tf)}
                                    className={cn(
                                        "px-2.5 py-1 rounded uppercase font-semibold transition-all cursor-pointer",
                                        chartTimeframe === tf
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Default Asset Class */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">Primary Market Focus</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Default screener segment upon launching terminal
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-background font-mono text-xs">
                            {[
                                { id: "stocks", label: "Indian Equities (NSE)" },
                                { id: "crypto", label: "Digital Assets" }
                            ].map((seg) => (
                                <button
                                    key={seg.id}
                                    type="button"
                                    onClick={() => setDefaultSegment(seg.id)}
                                    className={cn(
                                        "px-3 py-1 rounded font-semibold transition-all cursor-pointer",
                                        defaultSegment === seg.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {seg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification & Telemetry Thresholds */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground font-display">
                        Alert Boundaries & Dispatch
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">High Conviction Signal Notifications</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Immediate browser notifications for setups with &ge; 80% confluence
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={alertsEnabled}
                            onChange={(e) => {
                                setAlertsEnabled(e.target.checked);
                                toast.info(e.target.checked ? "Signal push notifications enabled" : "Signal notifications muted");
                            }}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">Audio Orderbook Telemetry</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Subtle acoustic feedback when breakout levels are breached
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={soundTelemetry}
                            onChange={(e) => {
                                setSoundTelemetry(e.target.checked);
                                toast.info(e.target.checked ? "Audio telemetry enabled" : "Audio telemetry muted");
                            }}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <span className="text-xs font-mono font-bold text-foreground block">Daily EOD Market Briefing</span>
                            <span className="text-xs text-muted-foreground font-sans">
                                Evening email digest with NSE/BSE top movers and institutional IPO filings
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={emailDigest}
                            onChange={(e) => {
                                setEmailDigest(e.target.checked);
                                toast.info(e.target.checked ? "Daily EOD digest enabled" : "EOD digest paused");
                            }}
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Security & Access Management */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-foreground font-display">
                        Cryptographic Security & Session Credentials
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 font-mono text-xs">
                    <div>
                        <span className="font-bold text-foreground block">Password & Authentication Tokens</span>
                        <span className="text-muted-foreground font-sans">
                            Manage Supabase authenticated credentials and access keys
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors cursor-pointer"
                    >
                        Request Password Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
