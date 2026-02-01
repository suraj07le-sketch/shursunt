"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuroraBackground } from "@/components/aceternity/AuroraBackground";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/settings?reset=true`,
            });

            if (error) throw error;

            setSuccess(true);
            toast.success("Password reset email sent!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuroraBackground className="dark">
            <div className="relative z-10 w-full max-w-md p-4">
                <div className="flex flex-col items-center justify-center text-center mb-8">
                    <SolarisIcon className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full p-10 rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl bg-black/5"
                >
                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                            <p className="text-white/70">
                                We've sent a password reset link to <br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                            <Link href="/login">
                                <button className="w-full py-3.5 font-bold text-black bg-white rounded-lg hover:bg-white/90 transition-all mt-4">
                                    Back to Login
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-center text-white mb-2 drop-shadow-sm">
                                Reset Password
                            </h2>
                            <p className="text-center text-white/60 mb-8 text-sm">
                                Enter your email to receive reset instructions
                            </p>

                            <form onSubmit={handleReset} className="space-y-6">
                                <div className="relative group space-y-1">
                                    <label htmlFor="email" className="text-sm font-medium text-white/80 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-8 py-2 text-white bg-transparent border-b border-white/40 focus:border-white outline-none transition-all placeholder-transparent"
                                            required
                                            placeholder="Email"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 font-bold text-black bg-white rounded-lg hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] mt-2"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>

                            <div className="text-center mt-8">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AuroraBackground>
    );
}
