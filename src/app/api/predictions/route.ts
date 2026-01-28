import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { coin, timeframe, userId } = body;

        // Hardcoded Webhook URL (Moved from Client Side)
        // In a real env, this should be process.env.PUCHO_WEBHOOK_URL
        const WEBHOOK_URL = process.env.PUCHO_WEBHOOK_URL;

        if (!WEBHOOK_URL) {
            console.error("Missing PUCHO_WEBHOOK_URL in environment variables");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                coin,
                timeframe,
                userId
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to trigger prediction service" }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Prediction Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
