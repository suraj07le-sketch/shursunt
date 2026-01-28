import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const body = await req.json();
    const { coinId, coinName, timeframe, userId } = body;

    if (!coinId || !userId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Simulate ML Processing Delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock Result
    const randomTrend = Math.random() > 0.5 ? 1 : -1;
    const randomPercent = Math.random() * 5;
    const predictedPrice = 100 * (1 + (randomTrend * randomPercent) / 100); // Placeholder logic

    // Store in Supabase
    const { data, error } = await supabase.from("predictions").insert({
        user_id: userId,
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
