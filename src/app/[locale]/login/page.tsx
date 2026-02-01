"use client";

import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { Hexagon, Cpu, Shield, Zap, Activity, Globe } from "lucide-react";

function ThemeAdaptiveBackground() {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();
    const [currentTheme, setCurrentTheme] = useState("dark");

    useEffect(() => {
        if (mounted) {
            setCurrentTheme(resolvedTheme || "dark");
        }
    }, [mounted, resolvedTheme]);

    const getThemeColors = () => {
        switch (currentTheme) {
            case "light":
                return {
                    bg: "bg-slate-50",
                    accent: "text-blue-600",
                    glow: "bg-blue-400/20",
                    textMuted: "text-slate-500",
                    cardBg: "bg-white/80",
                };
            case "neon":
                return {
                    bg: "bg-black",
                    accent: "text-pink-500",
                    glow: "bg-pink-500/20",
                    textMuted: "text-pink-300/60",
                    cardBg: "bg-purple-950/50",
                };
            case "cyber":
                return {
                    bg: "bg-slate-950",
                    accent: "text-cyan-400",
                    glow: "bg-cyan-400/20",
                    textMuted: "text-cyan-300/50",
                    cardBg: "bg-slate-900/60",
                };
            default:
                return {
                    bg: "bg-[#030305]",
                    accent: "text-amber-500",
                    glow: "bg-amber-500/20",
                    textMuted: "text-amber-300/50",
                    cardBg: "bg-slate-900/60",
                };
        }
    };

    const colors = getThemeColors();
    const isLight = currentTheme === "light";

    return (
        <div className={cn("absolute inset-0 overflow-hidden transition-colors duration-500", colors.bg)}>
            {/* Ambient glow orbs - responsive sizes */}
            <motion.div
                className={cn("absolute rounded-full blur-[100px] md:blur-[120px]", colors.glow)}
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ left: "5%", top: "15%", width: "min(300px, 60vw)", height: "min(300px, 60vw)" }}
            />
            <motion.div
                className={cn("absolute rounded-full blur-[80px] md:blur-[100px]", colors.glow.replace("/20", "/15"))}
                animate={{
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                style={{ right: "5%", bottom: "15%", width: "min(250px, 50vw)", height: "min(250px, 50vw)" }}
            />

            {/* Grid pattern */}
            <div
                className={cn(
                    "absolute inset-0 opacity-[0.03] transition-opacity duration-500",
                    isLight
                        ? "bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)]"
                        : "bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]"
                )}
                style={{ backgroundSize: "min(60px, 10vw) min(60px, 10vw)", maskImage: "radial-gradient(ellipse_at_center,black_40%,transparent_80%)" }}
            />

            {/* Floating accent elements - responsive */}
            <div className="hidden sm:flex absolute inset-0">
                {[
                    { Icon: Hexagon, x: 8, y: 20, delay: 0 },
                    { Icon: Cpu, x: 88, y: 25, delay: 0.3 },
                    { Icon: Shield, x: 12, y: 70, delay: 0.6 },
                    { Icon: Zap, x: 85, y: 75, delay: 0.9 },
                    { Icon: Globe, x: 50, y: 12, delay: 1.2 },
                    { Icon: Activity, x: 90, y: 50, delay: 1.5 },
                ].map((item, i) => {
                    const Icon = item.Icon;
                    return (
                        <motion.div
                            key={i}
                            className={cn("absolute opacity-20", colors.accent)}
                            style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: item.delay, duration: 0.5 }}
                        >
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: item.delay,
                                }}
                            >
                                <Icon size={isLight ? 16 : 20} className="md:w-5 md:h-5" />
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const mounted = useMounted();

    if (!mounted) return null;

    const themes = [
        { value: "light", label: "Light", icon: "☀️" },
        { value: "dark", label: "Dark", icon: "🌙" },
        { value: "neon", label: "Neon", icon: "✨" },
        { value: "cyber", label: "Cyber", icon: "⚡" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-1 sm:gap-2 px-2 py-1.5"
        >
            <div className={cn(
                "flex items-center gap-1 px-1.5 py-1 rounded-full border backdrop-blur-sm transition-colors duration-300",
                resolvedTheme === "light"
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-800/50 border-white/10"
            )}>
                {themes.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                            "p-1.5 rounded-full transition-all duration-200 text-xs sm:text-sm",
                            theme === t.value
                                ? cn(
                                    resolvedTheme === "light"
                                        ? "bg-blue-500 text-white"
                                        : resolvedTheme === "neon"
                                            ? "bg-pink-500 text-white"
                                            : resolvedTheme === "cyber"
                                                ? "bg-cyan-500 text-black"
                                                : "bg-amber-500 text-black"
                                )
                                : cn(
                                    resolvedTheme === "light"
                                        ? "text-slate-500 hover:text-slate-700"
                                        : "text-slate-400 hover:text-white"
                                )
                        )}
                        title={t.label}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

import { useTranslations } from "next-intl";

export default function LoginPage() {
    const mounted = useMounted();
    const { resolvedTheme } = useTheme();
    const t = useTranslations('Auth.decorations');

    if (!mounted) {
        return (
            <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030305]">
                <div className="animate-pulse text-muted-foreground text-sm sm:text-base">Loading...</div>
            </div>
        );
    }

    const isLight = resolvedTheme === "light";

    return (
        <div className={cn(
            "relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-500 p-4",
            isLight ? "bg-slate-50" : "bg-[#030305]"
        )}>
            <ThemeAdaptiveBackground />
            <ThemeToggle />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-sm sm:max-w-md"
            >
                <AuthForm mode="login" />
            </motion.div>

            {/* Decorative elements - responsive */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={cn(
                    "absolute bottom-4 left-2 sm:bottom-8 sm:left-8 text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] [writing-mode:vertical-lr] transition-colors duration-300 hidden xs:block",
                    isLight ? "text-slate-400" : "text-slate-500"
                )}
            >
                {t('npu')}
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={cn(
                    "absolute top-4 right-2 sm:top-8 sm:right-8 text-[8px] sm:text-[10px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] items-end flex transition-colors duration-300",
                    isLight ? "text-slate-400" : "text-slate-500"
                )}
            >
                {t('stream')}
            </motion.div>
        </div>
    );
}
