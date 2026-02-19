"use client";

import { useWatchlist } from "@/hooks/useQueries";
import { useTrendMonitor } from "@/hooks/useTrendMonitor";
import { memo, useEffect, useState } from "react";

// Headless component to monitor a single asset
const SingleAssetMonitor = memo(({ symbol, type, index }: { symbol: string, type: 'stock' | 'crypto', index: number }) => {
    const isScript = type === 'stock';

    // Staggered activation to avoid hitting the rate limiter all at once
    const [shouldEnable, setShouldEnable] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShouldEnable(true), index * 1000);
        return () => clearTimeout(timer);
    }, [index]);

    useTrendMonitor({
        symbol: symbol,
        isScript: isScript,
        enabled: shouldEnable
    });

    return null;
});

SingleAssetMonitor.displayName = "SingleAssetMonitor";

export function WatchlistTrendManager() {
    const { data: watchlist } = useWatchlist();

    if (!watchlist || watchlist.length === 0) return null;

    return (
        <>
            {watchlist.map((item: any, index: number) => (
                <SingleAssetMonitor
                    key={item.id}
                    symbol={item.coin_data?.symbol || item.symbol}
                    type={item.asset_type || 'crypto'}
                    index={index}
                />
            ))}
        </>
    );
}
