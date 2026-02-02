"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Newspaper, GraduationCap, BarChart3, Clock, X } from "lucide-react";
import { blogPosts, BlogPost } from "@/lib/mock/blogItems";
import { BlogCard } from "@/components/blog/BlogCard";
import { FloatingNavbar } from "@/components/aceternity/FloatingNavbar";
import { SolarisButton } from "@/components/ui/SolarisButton";
import { cn } from "@/lib/utils";

type Category = "All" | "News" | "Analysis" | "Education";

export default function BlogPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category>("All");

    const categories: { label: Category; icon: any }[] = [
        { label: "All", icon: Filter },
        { label: "News", icon: Newspaper },
        { label: "Analysis", icon: BarChart3 },
        { label: "Education", icon: GraduationCap },
    ];

    const filteredPosts = useMemo(() => {
        return blogPosts.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    return (
        <main className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden selection:bg-primary/30">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <FloatingNavbar className="top-4" />

            <div className="relative z-10 container mx-auto px-6 pt-32 pb-24">
                {/* Header Section */}
                <div className="max-w-3xl mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <Clock size={14} />
                        <span>Latest Intelligence</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
                    >
                        Insights & Analysis
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground"
                    >
                        Stay ahead of the market with expert analysis, breaking news, and educational resources tailored for the modern trader.
                    </motion.p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between p-4 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/50 sticky top-24 z-20">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 transition-all text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {categories.map(({ label, icon: Icon }) => (
                            <SolarisButton
                                key={label}
                                variant="small"
                                active={activeCategory === label}
                                onClick={() => setActiveCategory(label)}
                                className="whitespace-nowrap"
                            >
                                <Icon size={14} className="mr-1.5" />
                                {label}
                            </SolarisButton>
                        ))}
                    </div>
                </div>

                {/* Results Info */}
                <div className="mb-8">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="text-primary font-bold">{filteredPosts.length}</span> articles
                        {activeCategory !== "All" && <span> in <span className="text-foreground capitalize">{activeCategory}</span></span>}
                    </p>
                </div>

                {/* Blog Grid - Masonry style (using columns) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.map((post, index) => (
                            <div key={post.id} className="break-inside-avoid">
                                <BlogCard post={post} index={index} />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Search size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No articles found</h3>
                        <p className="text-muted-foreground max-w-md">
                            We couldn't find any articles matching your search or filters. Try adjusting your criteria.
                        </p>
                        <SolarisButton
                            className="mt-8"
                            onClick={() => {
                                setSearchQuery("");
                                setActiveCategory("All");
                            }}
                        >
                            Clear all filters
                        </SolarisButton>
                    </motion.div>
                )}
            </div>

            {/* Footer (Simplified for Blog) */}
            <footer className="py-24 border-t border-border bg-card/20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">SHURSUNT INSIGHTS</h2>
                    <p className="text-muted-foreground text-sm">© 2026 ShursunT AI. All market intelligence systems operational.</p>
                </div>
            </footer>
        </main>
    );
}
