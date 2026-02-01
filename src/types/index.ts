export interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string | null;
    current_price: number;
    price_change_percentage_24h: number;
    high_24h: number;
    low_24h: number;
    market_cap?: number;
    market_cap_rank?: number;
    volume?: number;
    asset_type?: 'stock' | 'crypto';
}

export type Stock = Coin; // Alias for semantic clarity during migration

export interface Prediction {
    id: string;
    user_id: string;
    coin_id: string;
    coin_name: string;
    predicted_price: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
    timeframe: string;
    asset_type?: 'stock' | 'crypto';
}

export interface WatchlistItem {
    id: string;
    user_id: string;
    coin_id: string;
    coin_data: Coin;
    asset_type?: 'stock' | 'crypto';
    created_at?: string;
}
