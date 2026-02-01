"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Zap, Hexagon, Palette } from "lucide-react";

const themes = [
    { id: "light", name: "Polaris", icon: Sun, color: "bg-blue-500" },
    { id: "dark", name: "ShursunT", icon: Moon, color: "bg-orange-500" },
    { id: "neon", name: "Nebula", icon: Zap, color: "bg-pink-500" },
    { id: "cyber", name: "Eclipse", icon: Hexagon, color: "bg-white" },
];

export function ThemeSelector({ variant = "default" }: { variant?: "default" | "sidebar" }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    if (variant === "sidebar") {
        return (
            <div className="w-full bg-muted/20 rounded-xl p-2 flex items-center justify-between border border-border/50">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`
                        p-2 rounded-lg transition-all flex-1 flex justify-center
                        ${theme === t.id ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"}
                    `}
                        title={t.name}
                    >
                        <t.icon size={16} className={theme === t.id ? "animate-pulse" : ""} />
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-16 right-0 mb-2 p-2 rounded-2xl backdrop-blur-xl bg-card/80 border border-border shadow-2xl flex flex-col gap-2 min-w-[140px]"
                    >
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                    ${theme === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"}
                `}
                            >
                                <div className={`p-1.5 rounded-full ${theme === t.id ? t.color : "bg-muted-foreground/20"}`}>
                                    <t.icon size={14} className={theme === t.id ? "text-primary-foreground" : "opacity-0"} />
                                </div>
                                <span className="text-sm font-bold">{t.name}</span>
                                {theme === t.id && (
                                    <motion.div layoutId="active-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center relative overflow-hidden"
            >
                <Palette size={20} className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
            </motion.button>
        </div>
    );
}
