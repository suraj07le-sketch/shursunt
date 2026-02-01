"use client";

import { useEffect } from "react";

export function GlobalErrorSuppressor() {
    useEffect(() => {
        const handler = (event: PromiseRejectionEvent) => {
            if (event.reason?.name === 'AbortError' || event.reason?.message?.includes('signal is aborted without reason')) {
                // Suppress Supabase locks.ts AbortError
                event.preventDefault();
            }
        };

        window.addEventListener("unhandledrejection", handler);
        return () => window.removeEventListener("unhandledrejection", handler);
    }, []);

    return null;
}
