"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Profile = {
    id: string;
    email: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
};

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isNetworkBlocked: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    isNetworkBlocked: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNetworkBlocked, setIsNetworkBlocked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const setData = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    // Detect Supabase connection timeouts/DNS hijacking
                    if (error.message?.includes('Failed to fetch') || error.status === 0) {
                        setIsNetworkBlocked(true);
                    }
                    throw error;
                }

                setIsNetworkBlocked(false);
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (mounted) setProfile(data);
                }
            } catch (error: any) {
                if (mounted) {
                    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
                        setIsNetworkBlocked(true);
                    }
                    if (error.name !== 'AbortError') {
                        console.error("Auth initialization error:", error);
                    }
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    if (mounted) setProfile(data);
                } catch (consoleError) {
                    // silent fail or log
                }
            } else {
                setProfile(null);
            }

            if (mounted) setLoading(false);
        });

        setData();

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Sign out error:", error);
        } finally {
            setUser(null);
            setSession(null);
            setProfile(null);
            // Use window.location for full page reload to ensure clean state
            window.location.href = "/login";
        }
    };

    // Auto-logout on inactivity (30 minutes)
    useEffect(() => {
        if (!user) return;

        const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Determine if we need to show a toast (only if page is visible)
                if (document.visibilityState === 'visible') {
                    // toast.error("Session timed out due to inactivity");
                }
                signOut();
            }, TIMEOUT_MS);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer(); // Start timer

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [user]); // Removed signOut dependency loop, functions are stable

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, isNetworkBlocked }}>
            {isNetworkBlocked && (
                <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white p-2 text-center text-sm font-medium">
                    ⚠️ Network Error: Connection to Supabase timed out. Your ISP (Jio) might be blocking the connection.
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-4 underline hover:no-underline"
                    >
                        Retry Connection
                    </button>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
