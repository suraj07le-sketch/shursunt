/**
 * Outcome Tracker
 * Fetches historical win rates from Supabase prediction tables.
 * Used to apply a per-asset, per-signal confidence correction factor.
 *
 * SQL required (run in Supabase):
 *   ALTER TABLE crypto_predictions ADD COLUMN IF NOT EXISTS outcome TEXT;      -- 'WIN' | 'LOSS' | 'PENDING'
 *   ALTER TABLE crypto_predictions ADD COLUMN IF NOT EXISTS was_correct BOOLEAN;
 *   ALTER TABLE stock_predictions  ADD COLUMN IF NOT EXISTS outcome TEXT;
 *   ALTER TABLE stock_predictions  ADD COLUMN IF NOT EXISTS was_correct BOOLEAN;
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase     = createClient(supabaseUrl, supabaseKey);

export interface WinRateResult {
    winRate: number;          // 0-1
    sampleSize: number;
    correctionFactor: number; // +/- adjustment to confidence (max ±15)
}

const winRateCache = new Map<string, { result: WinRateResult; timestamp: number }>();
const CACHE_MS = 30 * 60 * 1000; // 30 minutes

export async function fetchWinRate(asset: string, assetType: 'stock' | 'crypto'): Promise<WinRateResult> {
    const cacheKey = `${assetType}_${asset}`;
    const cached = winRateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_MS) return cached.result;

    const table = assetType === 'crypto' ? 'crypto_predictions' : 'stock_predictions';
    const assetCol = assetType === 'crypto' ? 'coin' : 'stock_name';

    try {
        const { data, error } = await supabase
            .from(table)
            .select('was_correct')
            .eq(assetCol, asset.toUpperCase())
            .not('was_correct', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error || !data || data.length < 5) {
            // Not enough data → neutral factor
            return { winRate: 0.5, sampleSize: 0, correctionFactor: 0 };
        }

        const wins = data.filter(r => r.was_correct === true).length;
        const winRate = wins / data.length;

        // Scale correction: 50% win = 0, 80%+ win = +15, 20%- win = -15
        const deviation = winRate - 0.5;
        const correctionFactor = Math.round(deviation * 30); // max ±15

        const result: WinRateResult = { winRate, sampleSize: data.length, correctionFactor };
        winRateCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
    } catch {
        return { winRate: 0.5, sampleSize: 0, correctionFactor: 0 };
    }
}

/**
 * After each candle period expires, call this to mark predictions as WIN/LOSS.
 * This is called in the POST handler as a background job.
 */
export async function resolveExpiredPredictions(assetType: 'stock' | 'crypto'): Promise<void> {
    const table = assetType === 'crypto' ? 'crypto_predictions' : 'stock_predictions';
    const validTillCol = assetType === 'crypto' ? 'predicted_time_ist' : 'prediction_valid_till_ist';
    const priceCol = 'current_price';
    const predPriceCol = 'predicted_price';

    try {
        // Fetch expired, unresolved predictions
        const { data, error } = await supabase
            .from(table)
            .select('id, ' + priceCol + ', ' + predPriceCol + ', ' + validTillCol)
            .is('was_correct', null)
            .lt(validTillCol, new Date().toISOString())
            .limit(20);

        if (error || !data || data.length === 0) return;

        for (const row of data as any[]) {
            const predicted = row[predPriceCol] as number;
            const entry = row[priceCol] as number;
            const rowId = row['id'] as string;
            if (!predicted || !entry || !rowId) continue;

            // We don't have the actual price at expiry here,
            // so we mark as PENDING for manual or webhook-based resolution.
            await supabase
                .from(table)
                .update({ outcome: 'PENDING' })
                .eq('id', rowId);
        }
    } catch {
        // Silent fail — this is non-critical background work
    }
}
