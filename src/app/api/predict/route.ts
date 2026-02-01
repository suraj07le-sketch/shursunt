import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { coinId, coinName, timeframe } = body;

    if (!coinId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 2. Rate Limiting (C5: Max 5 requests per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
        .from("predictions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .gt("created_at", oneMinuteAgo);

    if (count && count >= 5) {
        return NextResponse.json({
            error: "Rate limit exceeded. Please wait a moment before generating more predictions."
        }, { status: 429 });
    }

    // Simulate ML Processing Delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock Result
    const randomTrend = Math.random() > 0.5 ? 1 : -1;
    const randomPercent = Math.random() * 5;
    const predictedPrice = 100 * (1 + (randomTrend * randomPercent) / 100); // Placeholder logic

    // Store in Supabase using authenticated user.id
    const { data, error } = await supabase.from("predictions").insert({
        user_id: user.id, // Secure User ID
        coin_id: coinId,
        coin_name: coinName,
        timeframe,
        predicted_price: predictedPrice,
        status: "completed",
    });

    if (error) {
        console.error("Supabase Error:", error); // Debug server side
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, prediction: predictedPrice });
}
