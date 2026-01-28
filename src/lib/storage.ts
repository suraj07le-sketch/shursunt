import { WatchlistItem, Coin } from "@/types";

const STORAGE_KEY_PREFIX = 'nexus_watchlist_';

export const LocalStorage = {
    getWatchlist: (userId: string): WatchlistItem[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("LocalStorage Read Error:", error);
            return [];
        }
    },

    addToWatchlist: (userId: string, coin: Coin, assetType: 'stock' | 'crypto'): WatchlistItem | null => {
        try {
            const current = LocalStorage.getWatchlist(userId);

            // Check for duplicates
            if (current.some(item => item.coin_id === coin.id)) {
                return null; // Already exists
            }

            const newItem: WatchlistItem = {
                id: crypto.randomUUID(),
                user_id: userId,
                coin_id: coin.id,
                coin_data: coin,
                asset_type: assetType,
                // Add a local timestamp for sorting if needed
                // created_at: new Date().toISOString() 
            };

            const updated = [...current, newItem];
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
            return newItem;
        } catch (error) {
            console.error("LocalStorage Write Error:", error);
            return null;
        }
    },

    removeFromWatchlist: (userId: string, coinId: string): void => {
        try {
            const current = LocalStorage.getWatchlist(userId);
            const updated = current.filter(item => item.coin_id !== coinId && item.id !== coinId);
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
        } catch (error) {
            console.error("LocalStorage Delete Error:", error);
        }
    }
};
