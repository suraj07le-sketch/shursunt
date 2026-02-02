"use client";

import { useState, useEffect } from "react";
import { IPOCard } from "./IPOCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IPOListProps {
    data: any[];
}

export function IPOList({ data }: IPOListProps) {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const filtered = data.filter(ipo => {
        const matchesFilter = filter === "all" || ipo.status === filter;
        const matchesSearch = ipo.company_name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Reset page on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    const filters = [
        { id: "all", label: "All IPOs" },
        { id: "open", label: "Open Now" },
        { id: "upcoming", label: "Upcoming" },
        { id: "listed", label: "Listed" },
        { id: "closed", label: "Closed" },
    ];

    const sections = filter === "all" ? [
        { id: "open", label: "Open Now", data: filtered.filter(i => i.status === "open") },
        { id: "upcoming", label: "Upcoming IPOs", data: filtered.filter(i => i.status === "upcoming") },
        { id: "listed", label: "Recently Listed", data: filtered.filter(i => i.status === "listed") },
        { id: "closed", label: "Closed", data: filtered.filter(i => i.status === "closed") },
    ].filter(s => s.data.length > 0) : [];

    return (
        <div className="space-y-8">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search Company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === f.id
                                ? "bg-primary text-black border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid or Grouped Sections */}
            {filter === "all" && currentPage === 1 ? (
                <div className="space-y-16">
                    {sections.map((section) => (
                        <div key={section.id} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">{section.label}</h2>
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded uppercase">{section.data.length} IPOs</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.data.map((ipo) => (
                                    <IPOCard key={ipo.company_name} ipo={ipo} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {paginatedItems.map((ipo, idx) => (
                            <motion.div
                                key={ipo.company_name}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                                <IPOCard ipo={ipo} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-muted-foreground font-medium">No IPOs found matching your criteria.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 bg-white/5 p-4 rounded-3xl border border-white/10 w-fit mx-auto">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "w-10 h-10 rounded-xl text-xs font-black transition-all border",
                                    currentPage === page
                                        ? "bg-primary text-black border-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
