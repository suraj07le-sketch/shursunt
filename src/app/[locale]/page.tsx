"use client";

import React from "react";
import { FloatingNavbar } from "@/components/aceternity/FloatingNavbar";
import { HeroSection } from "@/components/home/HeroSection";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { AboutSection } from "@/components/home/AboutSection";
import { GlowingFeatures } from "@/components/aceternity/GlowingFeatures";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import Link from "next/link";

export default function Home() {
  const t = useTranslations('Home');

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 relative">
      {/* Navigation */}
      <FloatingNavbar className="top-4 md:top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6" />

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* Technical Architecture */}
      <AboutSection />

      {/* Features Section */}
      <section id="features-preview" className="py-20 relative overflow-hidden scroll-mt-20 border-t border-border">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-3 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground">
              {t('featuresTitle')}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('featuresSubtitle')}
            </p>
          </motion.div>
          <GlowingFeatures />
        </div>
      </section>

      {/* Clean Terminal Footer */}
      <footer className="py-12 border-t border-border bg-card/40 relative overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-7xl">
          <div className="flex items-center gap-3">
            <SolarisIcon className="w-8 h-8 text-primary" />
            <div>
              <span className="font-bold font-display tracking-tight text-foreground text-base">ShursunT AI</span>
              <p className="text-xs text-muted-foreground font-mono">Institutional Market Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-muted-foreground">
            <Link href="/market" className="hover:text-foreground transition-colors">Market Screener</Link>
            <Link href="/predictions" className="hover:text-foreground transition-colors">AI Predictions</Link>
            <Link href="/ipo" className="hover:text-foreground transition-colors">IPO Tracker</Link>
            <Link href="/billing" className="hover:text-foreground transition-colors">Institutional Tiers</Link>
          </div>

          <div className="text-xs font-mono text-muted-foreground text-center md:text-right">
            <span>&copy; {new Date().getFullYear()} ShursunT Technologies Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
