'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Trash2, UserCog, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        // Protect Route
        if (!user || user.user_metadata?.role !== 'admin') {
            toast.error("Unauthorized Access");
            router.push('/dashboard');
            return;
        }

        fetchUsers();
    }, [user, authLoading, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                toast.success("User deleted successfully");
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Failed to execute delete");
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role: newRole })
            });

            if (res.ok) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(prev => prev.map(u =>
                    u.id === id ? { ...u, user_metadata: { ...u.user_metadata, role: newRole } } : u
                ));
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Failed to update role");
        }
    };

    if (loading || authLoading) return <div className="p-8 text-center animate-pulse">Loading Admin Panel...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        Admin Console
                    </h1>
                    <p className="text-muted-foreground text-sm">Manage users and permissions</p>
                </div>
            </div>

            <div className="grid gap-4">
                {users.map((u) => {
                    const isAdmin = u.user_metadata?.role === 'admin';
                    const isSelf = u.id === user?.id;

                    return (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card/50 border border-border p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isAdmin ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {u.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">{u.email}</div>
                                    <div className="text-xs text-muted-foreground font-mono">ID: {u.id}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isAdmin ? (
                                    <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase">
                                        Admin
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-bold uppercase">
                                        User
                                    </span>
                                )}

                                {!isSelf && (
                                    <>
                                        <button
                                            onClick={() => handleRoleChange(u.id, isAdmin ? 'user' : 'admin')}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                            title={isAdmin ? "Revoke Admin" : "Make Admin"}
                                        >
                                            <UserCog className="w-5 h-5" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(u.id, u.email)}
                                            className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
