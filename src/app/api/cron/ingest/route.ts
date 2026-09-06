import { NextResponse } from 'next/server';
import { fetchIPOsFromGuru, syncIPOsToDatabase } from '@/lib/data/ipoDataService';
import { fetchMarketIndices, fetchRealStockQuotes } from '@/lib/data/stockDataService';
import { fetchRealCryptoData } from '@/lib/data/cryptoDataService';
import { fetchMarketNewsSentiment } from '@/lib/data/newsSentimentService';

/**
 * Scheduled Cron Ingestion Endpoint (Vercel Cron / GitHub Actions)
 * Invoked periodically (e.g., every 15-30 minutes during market hours)
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const isDev = process.env.NODE_ENV === 'development';

        if (!isDev && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ success: false, error: 'Unauthorized cron invocation' }, { status: 401 });
        }

        console.log("[CronIngest] Running scheduled data ingestion...");
        const start = Date.now();

        // 1. Ingest IPOs and append GMP snapshots
        const ipos = await fetchIPOsFromGuru();
        const ipoStats = await syncIPOsToDatabase(ipos);

        // 2. Refresh Market Indices & Core Stocks
        const [indices, stocks] = await Promise.all([
            fetchMarketIndices(),
            fetchRealStockQuotes()
        ]);

        // 3. Refresh Crypto
        const cryptos = await fetchRealCryptoData();

        // 4. Ingest News
        const news = await fetchMarketNewsSentiment();

        return NextResponse.json({
            success: true,
            job: "market-data-ingest",
            duration_ms: Date.now() - start,
            timestamp: new Date().toISOString(),
            stats: {
                ipos: ipoStats.count,
                gmp_snapshots: ipoStats.snapshots,
                indices: indices.length,
                stocks: stocks.length,
                cryptos: cryptos.length,
                news: news.length
            }
        });
    } catch (err: any) {
        console.error("[CronIngest] Ingestion job error:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

