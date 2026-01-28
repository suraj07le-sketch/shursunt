"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Coins, Star, Activity, LogOut, TrendingUp, Store, X, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";
import { SolarisIcon } from "@/components/ui/SolarisIcon";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Market Place", href: "/dashboard/market", icon: Store },
    { name: "Stocks", href: "/dashboard/stocks", icon: TrendingUp },
    { name: "Crypto", href: "/dashboard/crypto", icon: Coins },
    { name: "Watchlist", href: "/dashboard/watchlist", icon: Star },
    { name: "Predictions", href: "/dashboard/predictions", icon: Activity },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { signOut, user } = useAuth();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-background/95 backdrop-blur-xl border-r border-border flex flex-col justify-between p-8 transition-transform duration-300 shadow-2xl",
                    // Mobile: toggleable
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: always open
                    "md:translate-x-0"
                )}
            >

                {/* Logo & Brand */}
                <div className="flex flex-col gap-3 mb-16 pr-12 transition-all">
                    <div className="flex items-center gap-3">
                        <SolarisIcon className="w-10 h-10 text-primary animate-pulse flex-shrink-0" />
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
                            SOLARIS
                        </h1>
                    </div>
                    <div className="pl-1">
                        <p className="text-[10px] text-muted-foreground tracking-[0.4em] font-black uppercase opacity-60 leading-tight">
                            Indian Stock<br />Ecosystem
                        </p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-red-500/10 rounded-full border border-white/10 hover:border-red-500/50 transition-all duration-300 md:hidden group z-50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
                    title="Close Sidebar"
                >
                    <X size={20} className="text-neutral-400 group-hover:text-red-500 transition-colors" />
                </button>

                {/* Nav */}
                <nav className="flex-1 space-y-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose?.();
                                }}
                            >
                                <div className="relative px-4 py-3 group cursor-pointer">
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-primary/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className="relative flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        />
                                        <span
                                            className={`font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Settings / User Menu */}
                {/* Settings / User Menu */}
                <div className="pt-10 border-t border-border space-y-2">
                    {user && (
                        <Link
                            href="/dashboard/settings"
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose?.();
                            }}
                        >
                            <div className="relative px-4 py-3 group cursor-pointer">
                                {pathname === "/dashboard/settings" && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="relative flex items-center gap-3">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-primary/20">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img
                                                src={user.user_metadata.avatar_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-[10px] font-black text-primary">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span
                                        className={`font-medium transition-colors ${pathname === "/dashboard/settings" ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            }`}
                                    >
                                        Settings
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {!user && (
                        <div className="px-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-3 px-4 py-3 w-full text-primary bg-primary/5 hover:bg-primary hover:text-black rounded-xl transition-all shadow-lg shadow-primary/5 group"
                            >
                                <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                <span className="text-sm font-black uppercase tracking-tight">Login</span>
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
