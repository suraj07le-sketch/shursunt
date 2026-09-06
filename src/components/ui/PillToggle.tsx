"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

interface PillToggleProps {
    options: Option[];
    value: string;
    onChange: (id: string) => void;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function PillToggle({
    options,
    value,
    onChange,
    className,
    size = "md",
}: PillToggleProps) {
    const sizeClasses = {
        sm: "px-2.5 py-1 text-xs gap-1.5",
        md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2",
        lg: "px-4 py-2 text-sm gap-2.5",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center p-1 rounded-full bg-[#111114] border border-[#26262b] backdrop-blur-md shadow-inner",
                className
            )}
        >
            {options.map((option) => {
                const isActive = value === option.id;
                return (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "relative flex items-center font-bold tracking-tight rounded-full transition-colors duration-200 cursor-pointer select-none",
                            sizeClasses[size],
                            isActive
                                ? "text-white"
                                : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activePill"
                                className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-amber-500/90 rounded-full shadow-md shadow-orange-500/20"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {option.icon}
                            <span>{option.label}</span>
                            {option.badge !== undefined && (
                                <span
                                    className={cn(
                                        "px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold leading-none",
                                        isActive
                                            ? "bg-black/30 text-white"
                                            : "bg-[#26262b] text-[#a1a1aa]"
                                    )}
                                >
                                    {option.badge}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
