"use client";

import { Search as SearchIcon } from "lucide-react";

export function Search({ value, onChange, placeholder, className, ...props }: { value?: string, onChange: (value: string) => void, placeholder?: string, className?: string }) {
    return (
        <div className={`relative w-full ${className || ""}`}>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder={placeholder || "Search coins..."}
                onChange={(e) => onChange(e.target.value)}
                value={value}
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground/50 text-foreground"
            />
        </div>
    );
}
