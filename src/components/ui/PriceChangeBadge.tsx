"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceChangeBadgeProps {
    change: number;
    showIcon?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function PriceChangeBadge({
    change,
    showIcon = true,
    className,
    size = "md",
}: PriceChangeBadgeProps) {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const sizeClasses = {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    };

    const iconSizes = {
        sm: 10,
        md: 12,
        lg: 14,
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 font-mono font-bold rounded-full transition-colors border",
                sizeClasses[size],
                isPositive && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                isNegative && "bg-red-500/10 text-red-400 border-red-500/20",
                !isPositive && !isNegative && "bg-zinc-800 text-zinc-400 border-zinc-700",
                className
            )}
        >
            {showIcon && (
                <>
                    {isPositive && <TrendingUp size={iconSizes[size]} className="stroke-[2.5]" />}
                    {isNegative && <TrendingDown size={iconSizes[size]} className="stroke-[2.5]" />}
                    {!isPositive && !isNegative && <Minus size={iconSizes[size]} />}
                </>
            )}
            <span>
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
            </span>
        </span>
    );
}
