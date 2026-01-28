"use client";

import React from "react";
import Link from "next/link";
import { AuroraBackground } from "@/components/aceternity/AuroraBackground";
import { cn } from "@/lib/utils";
import { TypewriterEffect } from "@/components/aceternity/TypewriterEffect";
import { Button } from "@/components/aceternity/MovingBorderButton";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/BentoGrid";
import { MeteorCard } from "@/components/aceternity/MeteorCard";
import { FloatingNavbar } from "@/components/aceternity/FloatingNavbar";
import { BarChart2, Shield, Zap, TrendingUp, DollarSign, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { GlowingFeatures } from "@/components/aceternity/GlowingFeatures";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";





export default function Home() {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const words = [
    { text: "The", className: "text-neutral-900 dark:text-white" },
    { text: "Future", className: "text-neutral-900 dark:text-white" },
    { text: "of", className: "text-neutral-900 dark:text-white" },
    { text: "Crypto", className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-600" },
    { text: "Analytics.", className: "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-blue-600 dark:to-purple-600" },
  ];

  return (
    <div className="dark:bg-black bg-white min-h-screen w-full relative transition-colors duration-500">
      {/* 1. Header (Logo + Actions) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 pointer-events-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <SolarisIcon className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(240,171,252,0.5)]" />
          <span className="font-bold text-xl text-neutral-900 dark:text-white tracking-[0.2em]">SOLARIS</span>
        </div>

        {/* Right: Actions (Theme & Login) */}
        <div className="flex items-center gap-4">

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/20"
            >
              <Palette size={20} />
            </button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 min-w-[150px] flex justify-center"
                >
                  <ThemeSwitcher />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/login">
            <button className="px-5 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* 2. Floating Navbar (Links Only) */}
      <FloatingNavbar className="top-24" />

      {/* 2. Hero Section - STICKY PARALLAX */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden bg-transparent z-0">

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col gap-6 items-center justify-center px-4 w-full cursor-none md:cursor-auto pointer-events-none md:pointer-events-auto">
          <h1 className={cn("md:text-[8rem] text-6xl font-black text-center text-white relative tracking-normal")}>
            <TypewriterEffect words={words} className="leading-tight" cursorClassName="h-10 md:h-32 bg-blue-500" />
          </h1>
          <p className="font-medium text-lg md:text-2xl text-neutral-600 dark:text-neutral-200 py-4 max-w-3xl text-center leading-loose tracking-wide">
            Real-time predictions, advanced charting, and AI-driven insights for the modern trader. <br />
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider">Experience the future of trading.</span>
          </p>
          <Link href="/signup">
            <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:bg-slate-900 border border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.5)] hover:shadow-[0_0_35px_rgba(56,189,248,0.7)] group">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  Start Trading
                  <TrendingUp className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </span>
              </span>
            </button>
          </Link>
        </div>



      </div>


      {/* 3. Features Section - SLIDING CURTAIN */}
      <div className="relative z-10 w-full bg-neutral-950/80 backdrop-blur-xl border-t border-white/10 min-h-screen py-20 mt-10 rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(255,255,255,0.1)]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-center text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-12 pt-20">
            Features that Empower
          </h2>

          <GlowingFeatures />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 py-8 text-center text-sm text-neutral-500 bg-black border-t border-white/10">
        © 2026 Solaris AI. Built for the future.
      </footer>
    </div>
  );
}
