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
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
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

                if (error) throw error;
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
                if (error.name !== 'AbortError' && mounted) {
                    console.error("Auth initialization error:", error);
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
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
