"use client";
import React, { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

import { Menu, X, Palette, User, Home, TrendingUp, Sparkles, LogIn } from "lucide-react";

export const FloatingNavbar = ({
    className,
}: {
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();
    const [visible, setVisible] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            let direction = current! - scrollYProgress.getPrevious()!;

            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    return (
        <>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 0,
                }}
                animate={{
                    y: 0,
                    opacity: 1,
                }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                }}
                style={{
                    backdropFilter: "blur(16px) saturate(180%)",
                    backgroundColor: "rgba(17, 25, 40, 0.75)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.125)",
                }}
                className={cn(
                    "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-2 items-center justify-center space-x-4",
                    className
                )}
            >
                {/* Desktop Links - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-2">
                    <Link href="/dashboard" className="relative px-4 py-2 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-50 hover:text-neutral-800 dark:hover:text-white transition-all duration-200 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                    <Link href="/market" className="relative px-4 py-2 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-50 hover:text-neutral-800 dark:hover:text-white transition-all duration-200 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Market</span>
                    </Link>
                    <Link href="/predictions" className="relative px-4 py-2 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-50 hover:text-neutral-800 dark:hover:text-white transition-all duration-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Signals</span>
                    </Link>
                    <Link href="/login" className="relative px-4 py-2 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-50 hover:text-neutral-800 dark:hover:text-white transition-all duration-200 flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                    </Link>
                </div>

                {/* Mobile Header: Logo/Icon + Brand + Menu Button */}
                <div className="flex md:hidden items-center justify-between w-full px-2">
                    <div className="flex items-center gap-3">
                        <SolarisIcon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(255,159,28,0.4)]" />
                        <span className="font-bold text-sm tracking-wider text-foreground">SHURSUNT</span>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
                    </button>
                </div>

                {/* Theme Toggle Button (Desktop: Always visible) */}
                <div className="hidden md:block pl-2 border-l border-neutral-200 dark:border-neutral-700">
                    <ThemeSwitcher />
                </div>
            </motion.div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="fixed top-24 right-4 left-4 md:hidden bg-white dark:bg-black/90 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl p-4 z-[4999] shadow-2xl flex flex-col gap-2"
                    >
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-foreground">
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                        </Link>
                        <Link href="/market" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span>Market</span>
                        </Link>
                        <Link href="/predictions" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-foreground">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Signals</span>
                        </Link>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-foreground">
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </Link>

                        <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />

                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Theme</span>
                            <ThemeSwitcher />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


