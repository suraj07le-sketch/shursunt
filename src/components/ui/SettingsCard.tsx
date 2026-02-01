"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
    children: ReactNode;
    className?: string;
    gradient?: "pink" | "cyan" | "default";
}

export function SettingsCard({
    children,
    className,
    gradient = "default",
}: SettingsCardProps) {
    const gradientColors = {
        pink: "from-pink-500/05 via-purple-500/05 to-transparent",
        cyan: "from-cyan-500/05 via-blue-500/05 to-transparent",
        default: "from-primary/05 via-secondary/05 to-transparent",
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "relative overflow-hidden rounded-3xl border transition-all duration-500",
                // Theme Aware: Card background with border
                "bg-card/40 border-border/50 shadow-sm",
                "backdrop-blur-xl",
                "hover:shadow-2xl hover:shadow-primary/5",
                "hover:border-border",
                "group",
                className
            )}
        >
            {/* Dynamic Gradient based on prop */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    gradientColors[gradient]
                )}
            />

            {/* Holographic Scanline */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent skew-x-12 opacity-0 transition-all duration-1000 group-hover:animate-shimmer" />

            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-20 h-20 opacity-50 pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-primary/20 rounded-full" />
                <svg className="absolute top-4 left-7 w-4 h-4 text-primary/20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M0 0 L10 0" strokeLinecap="round" />
                </svg>
                <svg className="absolute top-7 left-4 w-4 h-4 text-primary/20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M0 0 L0 10" strokeLinecap="round" />
                </svg>
            </div>

            <div className="absolute bottom-0 right-0 w-20 h-20 opacity-50 pointer-events-none">
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-primary/20 rounded-full" />
                <svg className="absolute bottom-4 right-7 w-4 h-4 text-primary/20 rotate-180" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M0 0 L10 0" strokeLinecap="round" />
                </svg>
                <svg className="absolute bottom-7 right-4 w-4 h-4 text-primary/20 rotate-180" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M0 0 L0 10" strokeLinecap="round" />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 h-full">
                {children}
            </div>
        </motion.div>
    );
}
