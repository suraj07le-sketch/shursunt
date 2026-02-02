"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowUpRight, User } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { cn } from "@/lib/utils";
import { BlogPost } from "@/lib/mock/blogItems";

interface BlogCardProps {
    post: BlogPost;
    index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            <Link href={`/blog/${post.slug}`} className="block h-full">
                <TiltCard className="h-full group cursor-pointer" tiltStrength={5}>
                    <div className="flex flex-col h-full overflow-hidden rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-colors duration-500">
                        {/* Image Container */}
                        <div className="relative aspect-video overflow-hidden">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md border",
                                    post.category === 'Analysis' ? "bg-blue-500/20 border-blue-500/50 text-blue-400" :
                                        post.category === 'News' ? "bg-primary/20 border-primary/50 text-primary" :
                                            "bg-green-500/20 border-green-500/50 text-green-400"
                                )}>
                                    {post.category}
                                </span>
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                    <User size={14} className="text-primary/70" />
                                    <span>{post.author}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-primary/70" />
                                    <span>{post.readTime} read</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                {post.title}
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                                {post.excerpt}
                            </p>

                            {/* Mentioned Coins */}
                            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/30">
                                {post.mentionedCoins.slice(0, 3).map((coin) => (
                                    <span key={coin.symbol} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground">
                                        ${coin.symbol}
                                    </span>
                                ))}
                                {post.mentionedCoins.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground flex items-center">
                                        +{post.mentionedCoins.length - 3} more
                                    </span>
                                )}

                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowUpRight size={18} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </TiltCard>
            </Link>
        </motion.div>
    );
}
