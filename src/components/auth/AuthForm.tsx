"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowRight,
    AlertCircle,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Shield
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const passwordRequirements = [
    { regex: /.{8,}/, label: "At least 8 characters" },
    { regex: /[A-Z]/, label: "One uppercase letter" },
    { regex: /[a-z]/, label: "One lowercase letter" },
    { regex: /[0-9]/, label: "One number" },
    { regex: /[^A-Za-z0-9]/, label: "One special character" },
];

export default function AuthForm({ mode = "login" }: { mode?: "login" | "signup" }) {
    const t = useTranslations('Auth');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // OTP verification state: 'form' | 'otp'
    const [step, setStep] = useState<"form" | "otp">("form");
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [passwordStrength, setPasswordStrength] = useState(0);
    const router = useRouter();
    const isLogin = mode === "login";

    // Requirement: Always check getSession() BEFORE getUser()
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        router.push("/dashboard");
                        return;
                    }
                }
            } catch {
                // Ignore session missing errors
            }
            setStep("form");
            setOtpDigits(["", "", "", "", "", ""]);
        };
        checkSession();
    }, [router]);

    // Resend cooldown countdown
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        router.prefetch("/dashboard");
    }, [router]);

    const calculatePasswordStrength = useCallback((pwd: string) => {
        let strength = 0;
        passwordRequirements.forEach((req) => {
            if (req.regex.test(pwd)) strength++;
        });
        setPasswordStrength(strength);
    }, []);

    useEffect(() => {
        if (!isLogin) {
            calculatePasswordStrength(password);
        }
    }, [password, isLogin, calculatePasswordStrength]);

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
                toast.success("Welcome back to ShursunT!");
                router.push("/dashboard");
            } else {
                if (passwordStrength < passwordRequirements.length) {
                    toast.error("Please ensure your password meets all requirements");
                    setLoading(false);
                    return;
                }

                const res = await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, fullName: username }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to send verification code.");
                }

                toast.success("Verification code sent to your email.");
                setStep("otp");
                setResendCooldown(60);
                setTimeout(() => {
                    otpInputRefs.current[0]?.focus();
                }, 100);
            }
        } catch (err: any) {
            const msg = err.message || "An error occurred during authentication.";
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        if (value.length > 1) {
            const pasted = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || "";
            }
            setOtpDigits(newDigits);
            otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
        } else {
            newDigits[index] = value;
            setOtpDigits(newDigits);
            if (value && index < 5) {
                otpInputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otpDigits.join("");
        if (code.length !== 6) {
            toast.error("Please enter the complete 6-digit verification code.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    code,
                    password,
                    fullName: username,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Verification failed.");
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            toast.success("Account verified & authorized.");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Failed to verify OTP.");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, fullName: username }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("A new verification code has been dispatched.");
            setResendCooldown(60);
            setOtpDigits(["", "", "", "", "", ""]);
            otpInputRefs.current[0]?.focus();
        } catch (err: any) {
            toast.error(err.message || "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    // Screen: OTP Verification
    if (step === "otp") {
        return (
            <div className="w-full space-y-6">
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>RETURN TO FORM</span>
                    </button>

                    <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                        Verify Email Address
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Enter the 6-digit verification code dispatched to <span className="text-foreground font-mono font-semibold">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} autoComplete="off" className="space-y-6">
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
                        {otpDigits.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => {
                                    otpInputRefs.current[idx] = el;
                                }}
                                id={`otp-input-${idx}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                autoComplete="off"
                                className="h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold tabular-nums rounded-lg bg-muted/40 border border-border text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otpDigits.join("").length !== 6}
                        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>VERIFY & ACCESS</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center space-y-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Didn't receive the token?
                    </p>
                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendCooldown > 0 || loading}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 disabled:opacity-40 cursor-pointer font-semibold"
                    >
                        {resendCooldown > 0 ? (
                            <span>Resend available in {resendCooldown}s</span>
                        ) : (
                            <span>Resend verification code</span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Screen: Login / Signup Main Form
    return (
        <div className="w-full space-y-6">
            <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                    {isLogin ? "Sign in to Terminal" : "Create Trader Account"}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                    {isLogin
                        ? "Enter your credentials to access live feeds and signals"
                        : "Institutional intelligence, deterministic risk controls"}
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleAuth} noValidate className="space-y-4">
                {!isLogin && (
                    <div className="space-y-1.5">
                        <label htmlFor="username" className="text-xs font-mono text-muted-foreground font-medium flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>FULL NAME / HANDLE</span>
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. S. Sharma"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-foreground font-mono text-xs focus:ring-2 focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-mono text-muted-foreground font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>WORK OR PERSONAL EMAIL</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-foreground font-mono text-xs focus:ring-2 focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-xs font-mono text-muted-foreground font-medium flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>PASSWORD</span>
                        </label>
                        {isLogin && (
                            <Link href="/forgot-password" className="text-[11px] font-mono text-primary hover:underline">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border text-foreground font-mono text-xs focus:ring-2 focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary outline-none transition-all placeholder:text-muted-foreground/60 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Password strength checklist for signup */}
                {!isLogin && password.length > 0 && (
                    <div className="p-3 rounded-lg bg-background border border-border space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-muted-foreground">Entropy / Complexity:</span>
                            <span className={cn("font-bold", passwordStrength === 5 ? "text-emerald-400" : "text-amber-400")}>
                                {passwordStrength === 5 ? "SECURE" : `${passwordStrength}/5 CHECKS`}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {passwordRequirements.map((req, i) => {
                                const passed = req.regex.test(password);
                                return (
                                    <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                                        <CheckCircle2 className={cn("w-3 h-3 shrink-0", passed ? "text-emerald-400" : "text-muted-foreground/40")} />
                                        <span className={passed ? "text-foreground" : "text-muted-foreground"}>{req.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer uppercase mt-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <span>{isLogin ? "Authenticate Session" : "Proceed to Verification"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </form>

            <div className="pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground font-mono">
                    {isLogin ? "Don't have an institutional seat? " : "Already hold an authorized seat? "}
                    <Link
                        href={isLogin ? "/signup" : "/login"}
                        className="text-primary font-bold hover:underline"
                    >
                        {isLogin ? "Register Now" : "Sign In"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
