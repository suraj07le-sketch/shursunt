"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import {
    ArrowLeft,
    Clock,
    User,
    Share2,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Brain,
    ChevronRight,
    Bookmark
} from "lucide-react";
import { blogPosts } from "@/lib/mock/blogItems";
import { PriceTicker } from "@/components/blog/PriceTicker";
import { FloatingNavbar } from "@/components/aceternity/FloatingNavbar";
import { SolarisButton } from "@/components/ui/SolarisButton";
import { cn } from "@/lib/utils";

export default function ArticlePage() {
    const { slug } = useParams();
    const router = useRouter();
    const [activeHash, setActiveHash] = useState("");

    const post = useMemo(() => {
        return blogPosts.find((p) => p.slug === slug);
    }, [slug]);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Extract headings for TOC (mocked from content string)
    const tocItems = useMemo(() => {
        if (!post) return [];
        const headings = post.content.match(/^##\s+.+$/gm) || [];
        return headings.map(h => {
            const text = h.replace(/^##\s+/, "");
            return {
                text,
                id: text.toLowerCase().replace(/\s+/g, "-"),
            };
        });
    }, [post]);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                    <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
                    <SolarisButton onClick={() => router.push('/blog')}>
                        Back to Blog
                    </SolarisButton>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary/30">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
                style={{ scaleX }}
            />

            <FloatingNavbar className="top-4" />

            <div className="relative z-10 pt-32 pb-24">
                {/* Post Header */}
                <div className="container mx-auto px-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Insights
                    </Link>

                    <div className="max-w-4xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border",
                                post.category === 'Analysis' ? "bg-blue-500/20 border-blue-500/50 text-blue-400" :
                                    post.category === 'News' ? "bg-primary/20 border-primary/50 text-primary" :
                                        "bg-green-500/20 border-green-500/50 text-green-400"
                            )}>
                                {post.category}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                <Clock size={14} />
                                <span>{post.readTime} Reading Time</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-between py-6 border-y border-border/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 ring-2 ring-primary/20">
                                    <User className="w-full h-full p-2 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{post.author}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <SolarisButton variant="icon" className="bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                                    <Share2 size={18} />
                                </SolarisButton>
                                <SolarisButton variant="icon" className="bg-white/5 border-white/10 text-muted-foreground hover:text-foreground">
                                    <Bookmark size={18} />
                                </SolarisButton>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative w-full aspect-[21/9] mb-16 overflow-hidden">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>

                {/* Content Layout */}
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Table of Contents (Sticky) */}
                        <aside className="lg:col-span-3 hidden lg:block">
                            <div className="sticky top-32 space-y-8">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Contents</h4>
                                    <ul className="space-y-4 border-l border-border/50">
                                        {tocItems.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className={cn(
                                                        "pl-4 py-1 block text-sm transition-all duration-300 border-l-2 -ml-[1px]",
                                                        activeHash === item.id
                                                            ? "text-primary border-primary font-bold"
                                                            : "text-muted-foreground border-transparent hover:text-foreground"
                                                    )}
                                                    onClick={() => setActiveHash(item.id)}
                                                >
                                                    {item.text}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 overflow-hidden relative group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Share2 size={16} className="text-primary" />
                                        Share Insights
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <Twitter size={16} />
                                        </button>
                                        <button className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <Linkedin size={16} />
                                        </button>
                                        <button className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <LinkIcon size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <article className="lg:col-span-6 space-y-12">
                            {/* AI Summary Block */}
                            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Brain size={48} className="text-primary" />
                                </div>
                                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-4">
                                    <Brain size={16} />
                                    <span>AI Executive Summary</span>
                                </div>
                                <p className="text-lg font-medium leading-relaxed italic text-foreground/90">
                                    "{post.aiSummary}"
                                </p>
                            </div>

                            {/* Mentioned Coins Price Tickers */}
                            <div className="flex flex-wrap gap-4 py-6 border-y border-border/30">
                                {post.mentionedCoins.map((coin) => (
                                    <PriceTicker key={coin.symbol} symbol={coin.symbol} coinId={coin.id} />
                                ))}
                            </div>

                            {/* Article Content */}
                            <div className="prose prose-invert prose-primary max-w-none prose-h2:text-2xl prose-h2:font-black prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground">
                                {post.content.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        const text = line.replace('## ', '');
                                        const id = text.toLowerCase().replace(/\s+/g, '-');
                                        return (
                                            <h2 key={i} id={id} className="text-foreground pt-8">
                                                {text}
                                            </h2>
                                        );
                                    }
                                    if (line.startsWith('### ')) {
                                        return <h3 key={i} className="text-foreground mt-6 text-xl font-bold">{line.replace('### ', '')}</h3>;
                                    }
                                    if (line.trim() === '') return <br key={i} />;
                                    return <p key={i}>{line}</p>;
                                })}
                            </div>

                            {/* Author Bio (Mobile only/Simplified) */}
                            <div className="lg:hidden p-8 rounded-3xl bg-card/40 border border-border/50">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                                        <User className="w-full h-full p-2 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Written By</span>
                                        <h4 className="text-lg font-bold">{post.author}</h4>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Expert analyst specializing in quantum systems and decentralized architecture.
                                </p>
                            </div>
                        </article>

                        {/* Sidebar (Related Info/CTAs) */}
                        <aside className="lg:col-span-3 space-y-8">
                            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-grid-white/[0.02] -z-1" />
                                <h4 className="text-xl font-black mb-4">Predict & Win</h4>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Think you know where {post.mentionedCoins[0]?.symbol || "BTC"} is heading? Place your prediction and join the leaderboard.
                                </p>
                                <SolarisButton className="w-full">
                                    Start Analysis
                                </SolarisButton>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Social Buzz</h4>
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20" />
                                                <span className="font-bold">@shursunt_bot</span>
                                            </div>
                                            <p className="text-muted-foreground">
                                                Sentiment for ${post.mentionedCoins[0]?.symbol || "BTC"} is surging +12% after this breakthrough analysis.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}
