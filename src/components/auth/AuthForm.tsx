"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { MailCheck, ArrowRight } from "lucide-react"; // Add icons

export default function AuthForm({ mode = "login" }: { mode?: "login" | "signup" }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false); // Success state
    const router = useRouter();

    const isLogin = mode === "login";

    useEffect(() => {
        router.prefetch("/dashboard");
    }, [router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            } else {
                // Get the current URL origin to redirect back correctly
                const origin = window.location.origin;

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${origin}/dashboard`, // Redirect to dashboard after click
                        data: {
                            username: username,
                        }
                    }
                });
                if (error) throw error;

                // Check if we have a session (Auto-Login / Email Confirmation Disabled)
                if (data.session) {
                    toast.success("Account created! Logging you in...");
                    router.push("/dashboard");
                } else {
                    // Email Confirmation Required
                    setEmailSent(true);
                    setLoading(false);
                }
            }
        } catch (err: any) {
            // Check for existing user error
            if (err.message.includes("already registered") || err.message.includes("already exists")) {
                toast.error("User already exists! Please login instead.");
            } else {
                toast.error(err.message);
            }
            setError(err.message);
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 text-center space-y-6 rounded-2xl glass-card border border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />

                <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                    <MailCheck className="w-10 h-10 text-green-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                    <p className="text-gray-400">
                        We sent a confirmation link to <br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-gray-300">
                    Click the link in the email to activate your account and access the dashboard.
                </div>

                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-white transition-colors"
                >
                    Back to Login <ArrowRight size={16} />
                </Link>
            </motion.div>
        );
    }

    return (

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-10 rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl bg-black/5"
        >
            <h2 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-sm">
                {isLogin ? "Login" : "Register"}
            </h2>

            <form onSubmit={handleAuth} className="space-y-6">
                {!isLogin && (
                    <div className="relative group">
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-0 py-3 text-white bg-transparent border-b border-white/40 focus:border-white outline-none transition-all placeholder-white/60"
                            required
                            placeholder="Username"
                        />
                    </div>
                )}

                <div className="relative group space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-white/80 ml-1">Enter your email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-0 py-2 text-white bg-transparent border-b border-white/40 focus:border-white outline-none transition-all placeholder-transparent"
                        required
                        placeholder="Email"
                    />
                </div>

                <div className="relative group space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-white/80 ml-1">Enter your password</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-0 py-2 text-white bg-transparent border-b border-white/40 focus:border-white outline-none transition-all pr-10 placeholder-transparent"
                            required
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between text-sm text-white/80">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <input type="checkbox" className="rounded border-white/30 bg-transparent" />
                        Remember me
                    </label>
                    <Link href="/forgot-password" className="hover:text-white underline decoration-white/30 underline-offset-4">
                        Forgot password?
                    </Link>
                </div>

                {error && <p className="text-sm text-red-300 bg-red-500/20 p-2 rounded text-center border border-red-500/20">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 font-bold text-black bg-white rounded-lg hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] mt-4"
                >
                    {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
                </button>
            </form>

            <div className="text-center mt-8 text-sm text-white/60">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Link
                    href={isLogin ? "/signup" : "/login"}
                    className="text-white hover:underline decoration-white underline-offset-4 font-medium"
                >
                    {isLogin ? "Register" : "Log In"}
                </Link>
            </div>
        </motion.div>
    );

}
