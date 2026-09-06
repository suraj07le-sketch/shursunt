import { NextResponse } from 'next/server';
import { fetchIPOsFromGuru, syncIPOsToDatabase } from '@/lib/data/ipoDataService';
import { fetchMarketIndices, fetchRealStockQuotes } from '@/lib/data/stockDataService';
import { fetchRealCryptoData } from '@/lib/data/cryptoDataService';
import { fetchMarketNewsSentiment } from '@/lib/data/newsSentimentService';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const isDev = process.env.NODE_ENV === 'development';

        if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        console.log("[Sync] Executing Real Market Data Ingestion Pipeline...");
        const startTime = Date.now();

        // 1. Ingest IPOs & GMP Snapshots (Priority)
        const rawIPOs = await fetchIPOsFromGuru();
        const ipoSyncStats = await syncIPOsToDatabase(rawIPOs);

        // 2. Ingest Indices (Nifty 50, Sensex, India VIX) & Core Indian Stocks
        const [indices, stocks] = await Promise.all([
            fetchMarketIndices(),
            fetchRealStockQuotes()
        ]);

        // 3. Ingest Crypto from CoinGecko
        const cryptos = await fetchRealCryptoData();

        // 4. Ingest Financial News & Sentiment
        const news = await fetchMarketNewsSentiment();

        const durationMs = Date.now() - startTime;
        console.log(`[Sync] Real Pipeline Ingestion Completed in ${durationMs}ms.`);

        return NextResponse.json({
            success: true,
            duration_ms: durationMs,
            timestamp: new Date().toISOString(),
            telemetry: {
                ipos_synced: ipoSyncStats.count,
                gmp_snapshots_recorded: ipoSyncStats.snapshots,
                indices_tracked: indices.length,
                stocks_updated: stocks.length,
                cryptos_updated: cryptos.length,
                news_headlines_scored: news.length
            },
            data: {
                indices,
                stocks: stocks.slice(0, 10),
                cryptos: cryptos.slice(0, 10),
                ipos_sample: rawIPOs.slice(0, 3)
            }
        });

    } catch (error: any) {
        console.error("[Sync] Pipeline execution failure:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
