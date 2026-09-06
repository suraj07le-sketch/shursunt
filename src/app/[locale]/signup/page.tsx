"use client";

import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function SignupPage() {
    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-foreground p-4 sm:p-6 relative selection:bg-primary/30">
            {/* Subtle terminal coordinate grid */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Back link */}
            <div className="absolute top-6 left-6 z-20">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>RETURN TO INDEX</span>
                </Link>
            </div>

            {/* Main Auth Container */}
            <div className="w-full max-w-md relative z-10 space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                        <SolarisIcon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <span className="font-display font-bold text-lg text-foreground tracking-tight block">
                            ShursunT Terminal
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                            TRADER ENROLLMENT GATEWAY
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
                    <AuthForm mode="signup" />
                </div>

                <div className="flex items-center justify-between px-2 text-[11px] font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PRE-AUTH OTP VERIFIED</span>
                    </div>
                    <span>SHURSUNT-AUTH v3.2</span>
                </div>
            </div>
        </main>
    );
}
