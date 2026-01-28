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

import { Menu, X, Palette, User } from "lucide-react";

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
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed inset-x-0 mx-auto border border-black/5 dark:border-white/10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg z-[5000] px-6 py-2 items-center justify-center pointer-events-auto",
                    className
                )}
            >
                {/* Links Only */}
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="relative px-5 py-2.5 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/20 transition-all duration-200">
                        Home
                    </Link>
                    <Link href="/dashboard/market" className="relative px-5 py-2.5 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/20 transition-all duration-200">
                        Market
                    </Link>
                    <Link href="/dashboard/predictions" className="relative px-5 py-2.5 rounded-full text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/20 transition-all duration-200">
                        AI Signals
                    </Link>
                </div>
            </motion.div>

            {/* Mobile Theme Dropdown Only */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="fixed top-24 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 min-w-[200px] bg-white dark:bg-black/90 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-2xl p-4 z-[4999] shadow-2xl flex flex-col gap-3 items-center"
                    >
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Select Theme</div>
                        <ThemeSwitcher />
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
};
