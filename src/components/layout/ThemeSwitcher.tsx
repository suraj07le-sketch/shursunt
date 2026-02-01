"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Zap, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
    { name: "light", icon: Sun, color: "text-yellow-500" },
    { name: "dark", icon: Moon, color: "text-blue-400" },
    { name: "neon", icon: Zap, color: "text-pink-500" },
    { name: "cyber", icon: Cpu, color: "text-green-500" },
];

export function ThemeSwitcher({ className }: { className?: string }) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className={cn("flex items-center space-x-1", className)}>
            {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.name;
                return (
                    <button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={cn(
                            "p-1.5 rounded-full transition-all duration-300 relative",
                            isActive 
                                ? "bg-primary/20 text-primary shadow-sm border border-primary/20" 
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                        title={`Switch to ${t.name} theme`}
                    >
                        <Icon size={16} strokeWidth={2} />
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 rounded-full border border-white/20"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

