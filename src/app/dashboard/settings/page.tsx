"use client";

import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { LogOut, User, Settings as SettingsIcon, Shield, Mail, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // Ensure Link is imported if used, though maybe not needed for logout

export default function SettingsPage() {
    const { user, signOut } = useAuth();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
                <div className="p-4 rounded-full bg-muted/20">
                    <User size={48} className="text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Please Login</h2>
                <p className="text-muted-foreground">You need to be logged in to view settings.</p>
                <Link href="/login" className="px-6 py-2 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-all">
                    Login
                </Link>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-8 pb-10"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
                    <SettingsIcon className="w-10 h-10 text-primary" />
                    Settings<span className="text-secondary">.</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">Manage your account preferences and appearance.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Profile Card */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <div className="solaris-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-card/60 backdrop-blur-md border-border">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-muted/50 shadow-2xl group-hover:border-primary/50 transition-colors">
                                {user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-black text-muted-foreground">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-xs font-bold text-white uppercase">Edit</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black text-foreground">
                                {user?.email?.split('@')[0].toUpperCase()}
                            </h2>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-medium">
                                <Mail size={16} />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                                    Active User
                                </span>
                                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border">
                                    Free Plan
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Appearance */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 space-y-6 bg-card/60 backdrop-blur-md border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <SettingsIcon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Appearance</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                                    Interface Theme
                                </label>
                                <div className="flex justify-start">
                                    <ThemeSwitcher />
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                    Choose your preferred workspace aesthetic. Experiment with Neon and Cyber modes for a unique trading experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Account Actions */}
                <motion.div variants={itemVariants}>
                    <div className="solaris-card h-full p-6 space-y-6 bg-card/60 backdrop-blur-md border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Account</h3>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group">
                                <span className="font-medium text-foreground">Change Password</span>
                                <span className="text-muted-foreground text-xs group-hover:text-foreground">Managed via Supabase</span>
                            </button>

                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group">
                                <span className="font-medium text-foreground">Notifications</span>
                                <span className="text-muted-foreground text-xs group-hover:text-foreground">Enabled</span>
                            </button>

                            <div className="pt-6 mt-6 border-t border-border">
                                <button
                                    onClick={signOut}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-bold"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
