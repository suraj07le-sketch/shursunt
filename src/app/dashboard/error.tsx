'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full p-8 rounded-2xl glass-card border border-red-500/20 bg-red-500/5 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background element */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-[50px]" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-6 border border-red-500/20">
                        <AlertTriangle className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>

                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                        We encountered an unexpected error while loading this dashboard component. The system has logged this issue.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={reset}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/25"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border hover:bg-muted text-foreground rounded-xl font-bold transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 w-full text-left bg-black/50 p-4 rounded-lg overflow-auto max-h-40 border border-white/10">
                            <p className="text-xs font-mono text-red-400 break-words">{error.message}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
