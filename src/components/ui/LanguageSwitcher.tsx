"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸", label: "EN" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", label: "HI" },
    { code: "es", name: "Spanish", flag: "🇪🇸", label: "ES" },
];

export function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "sidebar" }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleSelect = (code: string) => {
        if (code === locale) {
            setIsOpen(false);
            return;
        }
        startTransition(() => {
            router.replace(pathname, { locale: code });
        });
        setIsOpen(false);
    };

    if (!mounted) return null;

    if (variant === "sidebar") {
        return (
            <div className="w-full bg-muted/20 rounded-xl p-1 flex items-center justify-between border border-border/50 mt-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        disabled={isPending}
                        className={`
                        py-1.5 px-1 rounded-lg transition-all flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider
                        ${locale === lang.code ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                        ${isPending ? "opacity-50 cursor-wait" : ""}
                    `}
                        title={lang.name}
                    >
                        <span className="text-sm">{lang.flag}</span>
                        {lang.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-medium backdrop-blur-sm"
            >
                <Globe size={14} className="text-muted-foreground" />
                <span className="uppercase">{locale}</span>
                <ChevronDown size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-32 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                disabled={isPending}
                                className={`
                                    w-full px-3 py-2 flex items-center gap-3 text-xs font-medium transition-colors
                                    ${locale === lang.code ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}
                                    ${isPending ? "opacity-50" : ""}
                                `}
                            >
                                <span className="text-base">{lang.flag}</span>
                                {lang.name}
                                {locale === lang.code && <Check size={12} className="ml-auto" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
