"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    // Success logs removed to reduce noise
                })
                .catch((error) => {
                    console.error("SW registration failed:", error);
                });
        }
    }, []);

    return null;
}
