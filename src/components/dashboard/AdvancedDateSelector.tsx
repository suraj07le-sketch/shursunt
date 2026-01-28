"use client";

import {
    format,
    addDays,
    subDays,
    isToday,
    isYesterday,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdvancedDateSelectorProps {
    selectedDate: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    className?: string;
}

export default function AdvancedDateSelector({ selectedDate, onChange, className }: AdvancedDateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedDateObj = new Date(selectedDate);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrevDay = () => onChange(format(subDays(selectedDateObj, 1), "yyyy-MM-dd"));
    const handleNextDay = () => onChange(format(addDays(selectedDateObj, 1), "yyyy-MM-dd"));

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(subMonths(viewDate, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(addMonths(viewDate, 1));
    };

    const handleDateSelect = (day: Date) => {
        onChange(format(day, "yyyy-MM-dd"));
        setIsOpen(false);
    };

    const getDisplayLabel = () => {
        if (isToday(selectedDateObj)) return "Today";
        if (isYesterday(selectedDateObj)) return "Yesterday";
        return format(selectedDateObj, "EEEE");
    };

    // Calendar generation logic
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className={cn("relative z-50", className)} ref={containerRef}>
            <div className="flex items-center gap-1 bg-card/60 border border-border p-1 rounded-xl shadow-2xl backdrop-blur-md">
                <button
                    onClick={handlePrevDay}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
                >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setViewDate(new Date(selectedDate));
                    }}
                    className="flex flex-col items-center px-4 py-0.5 cursor-pointer hover:bg-muted rounded-lg transition-colors group"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00cc88] group-hover:text-primary transition-colors">
                            {getDisplayLabel()}
                        </span>
                        <CalendarIcon size={10} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-foreground tabular-nums">
                        {format(selectedDateObj, "MMM d, yyyy")}
                    </div>
                </div>

                <button
                    onClick={handleNextDay}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
                >
                    <ChevronRight size={18} strokeWidth={2.5} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 overflow-hidden"
                    >
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-black text-sm uppercase tracking-tighter text-foreground">
                                {format(viewDate, "MMMM yyyy")}
                            </h4>
                            <div className="flex gap-1">
                                <button onClick={handlePrevMonth} className="p-1 hover:bg-muted rounded-md transition-colors text-foreground">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={handleNextMonth} className="p-1 hover:bg-muted rounded-md transition-colors text-foreground">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                                <div key={d} className="text-[10px] font-bold text-muted-foreground text-center uppercase py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                const isSelected = isSameDay(day, selectedDateObj);
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDay = isToday(day);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(day)}
                                        className={cn(
                                            "h-8 w-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center relative",
                                            !isCurrentMonth ? "text-muted-foreground/30" : "text-foreground/80 hover:bg-muted",
                                            isSelected && "bg-primary text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20",
                                            isTodayDay && !isSelected && "border border-primary/30 text-primary"
                                        )}
                                    >
                                        {format(day, "d")}
                                        {isTodayDay && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center px-1">
                            <button
                                onClick={() => handleDateSelect(new Date())}
                                className="text-[10px] font-black uppercase text-primary hover:opacity-80 transition-opacity"
                            >
                                Jump to Today
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
