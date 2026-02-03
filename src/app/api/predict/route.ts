import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from "next/headers";

// Webhook URLs
const STOCK_WEBHOOK_URL = "https://studio.pucho.ai/api/v1/webhooks/riBtCb2IsVK15GnLlwLUa";
const CRYPTO_WEBHOOK_URL = "https://studio.pucho.ai/api/v1/webhooks/gWOr6DCFfy2q0lrbM4Bz8";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                error: "Configuration error: Missing Supabase credentials"
            }, { status: 500 });
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        // 1. Verify User (Security)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.log("[API] Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { coinId, coinName, timeframe, type } = body;

        if (!coinId) {
            return NextResponse.json({ error: "Missing required field: coinId" }, { status: 400 });
        }

        // 2. Rate Limiting (Max 5 requests per minute)
        const predictionsTable = type === 'crypto' ? 'crypto_predictions' : 'stock_predictions';

        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
            const { count } = await supabase
                .from(predictionsTable)
                .select("*", { count: 'exact', head: true })
                .eq("user_id", user.id)
                .gt("created_at", oneMinuteAgo);

            if (count && count >= 5) {
                return NextResponse.json({
                    error: "Rate limit exceeded. Please wait a moment before generating more predictions."
                }, { status: 429 });
            }
        } catch (rateError) {
            console.warn("Rate limiting check failed, continuing:", rateError);
        }

        // 3. Determine webhook URL and prepare payload
        const isCrypto = type === 'crypto' ||
            ["bitcoin", "ethereum", "solana", "dogecoin", "ripple", "btc", "eth", "sol", "doge", "xrp"].includes(coinId?.toLowerCase());

        const webhookUrl = isCrypto ? CRYPTO_WEBHOOK_URL : STOCK_WEBHOOK_URL;
        const assetName = isCrypto ? coinId : (coinName || coinId);

        console.log(`[API] Calling ${isCrypto ? 'CRYPTO' : 'STOCK'} webhook for ${assetName} (User: ${user.id})`);

        // 4. Call webhook
        try {
            const webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asset: assetName,
                    timeframe: timeframe || '4h',
                    userId: user.id,
                    type: isCrypto ? 'crypto' : 'stock'
                }),
            });

            if (!webhookResponse.ok) {
                throw new Error(`Webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`);
            }

            const webhookData = await webhookResponse.json();

            // Add current IST timestamp to the prediction
            const istNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const enhancedPrediction = {
                ...webhookData,
                predicted_time: istNow.toISOString(),
                predicted_time_ist: istNow.toISOString(),
                prediction_time_ist: istNow.toISOString(),
                created_at: istNow.toISOString(),
            };

            console.log(`[API] Webhook successful for ${assetName}`);
            return NextResponse.json({
                success: true,
                prediction: enhancedPrediction
            });

        } catch (webhookError: any) {
            console.error("[API] Webhook error:", webhookError);
            return NextResponse.json({
                error: `Prediction service unavailable: ${webhookError.message}`
            }, { status: 500 });
        }

    } catch (err: any) {
        console.error("[API] Unexpected error:", err);
        return NextResponse.json({
            error: err.message || "An unexpected error occurred"
        }, { status: 500 });
    }
}
