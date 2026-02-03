import { NextResponse } from 'next/server';
import { runProStockPrediction } from '@/lib/stockPrediction';

// Prevent vercel from caching this route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const authHeader = req.headers.get('authorization');

        // Security check
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Default stocks if none provided
        const stockParam = searchParams.get('stock');
        const stocks = stockParam ? stockParam.split(',') : ['RELIANCE', 'TCS', "INFY", "HDFCBANK", "ICICIBANK"];

        const results = [];

        // Run sequentially to avoid rate limits or memory bursts
        for (const stock of stocks) {
            const result = await runProStockPrediction(stock, '4h', '00000000-0000-0000-0000-000000000000');
            results.push({ stock, ...result });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
