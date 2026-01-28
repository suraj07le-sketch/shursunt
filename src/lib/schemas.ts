import { z } from 'zod';

// Base prediction schema for shared fields
const BasePredictionSchema = z.object({
    id: z.number().or(z.string()), // Supabase can return either depending on setup, usually number for serial
    user_id: z.string().uuid(),
    created_at: z.string().datetime(),
    timeframe: z.string().optional().nullable(),
    current_price: z.number().nullable().optional(),
    predicted_price: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(), // Mapped from accuracy_percent for stocks
    trend: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    prediction_valid_till_ist: z.string().nullable().optional(),
    prediction_time_ist: z.string().nullable().optional(),
});

export const StockPredictionSchema = BasePredictionSchema.extend({
    stock_name: z.string().nullable().optional(),
    accuracy_percent: z.number().nullable().optional(), // Specific to stocks table
});

export const CryptoPredictionSchema = BasePredictionSchema.extend({
    coin: z.string().nullable().optional(),
});

export const WatchlistItemSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    coin_id: z.string(),
    asset_type: z.enum(['stock', 'crypto']).optional().default('crypto'), // Fallback to crypto if missing
    created_at: z.string().datetime().optional(),
    coin_data: z.any().optional(), // Ideally stricter, but coin_data is JSONB/dynamic often
});

export type SafeStockPrediction = z.infer<typeof StockPredictionSchema>;
export type SafeCryptoPrediction = z.infer<typeof CryptoPredictionSchema>;
export type SafeWatchlistItem = z.infer<typeof WatchlistItemSchema>;
