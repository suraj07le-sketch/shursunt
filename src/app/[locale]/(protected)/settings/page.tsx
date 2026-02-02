"use client";

import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { LogOut, User, Settings as SettingsIcon, Shield, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SettingsCard } from "@/components/ui/SettingsCard";
import { GridBackground } from "@/components/ui/GridBackground";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="relative min-h-screen w-full font-sans">
            {/* Background Grid */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridBackground />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto p-2 md:p-8 space-y-8 pb-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-md">
                                <SettingsIcon className="w-8 h-8 text-primary animate-spin-slow" />
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-foreground flex items-center gap-4">
                                Settings
                                <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg max-w-lg">
                            Manage your holographic identity and neural interface preferences.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* User Profile Card - Spans full width on mobile, 2/3 on desktop */}
                    <div className="lg:col-span-3">
                        <SettingsCard className="p-0" gradient="pink">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:p-4">
                                <div className="relative group">
                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border/50 shadow-2xl">
                                        {/* Avatar Placeholder or Image */}
                                        {user?.user_metadata?.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* Edit Overlay */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-white text-xs font-bold tracking-widest uppercase">Edit</span>
                                        </div>
                                    </div>
                                    {/* Animated Ring */}
                                    <div className="absolute -inset-4 border-2 border-primary/30 rounded-full animate-pulse opacity-50" />
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-widest">
                                            {user?.email?.split('@')[0]}
                                        </h2>
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mt-1 font-mono text-xs">
                                            <Mail className="w-3 h-3" />
                                            {user?.email}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            Active Neural Link
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-foreground/60 text-xs font-bold tracking-widest uppercase">
                                            Standard Plan
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-3 rounded-xl bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 group border border-transparent"
                                    >
                                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        LOGOUT
                                    </button>
                                </div>
                            </div>
                        </SettingsCard>
                    </div>

                    {/* Appearance Settings */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <SettingsCard className="h-full" gradient="cyan">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                                    <SettingsIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Interface</h3>
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase">Visual Customization</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-4">System Theme</h4>
                                    {/* Theme Switcher Component */}
                                    <div className="p-1">
                                        <ThemeSwitcher />
                                    </div>
                                    <p className="mt-4 text-xs text-muted-foreground/60 leading-relaxed">
                                        Select your preferred visual cortex stimulation mode. Toggle between <span className="text-primary font-bold">Neon</span> and <span className="text-cyan-400 font-bold">Cyber</span> presets.
                                    </p>
                                </section>
                            </div>
                        </SettingsCard>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <SettingsCard className="h-full" gradient="default">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Security</h3>
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase">Access Control</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full p-4 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-left group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-foreground">Change Password</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-muted-foreground font-mono">SUPABASE AUTH</span>
                                    </div>
                                    <div className="h-1 w-12 bg-black/10 dark:bg-white/10 rounded-full group-hover:w-full transition-all duration-500" />
                                </button>

                                <div className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-foreground">Notifications</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] text-foreground/50 font-bold">ACTIVE</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            Market Alerts
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            System Updates
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SettingsCard>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
