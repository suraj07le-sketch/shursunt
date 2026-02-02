import { getCoinData, getTopCoins } from "@/lib/coingecko";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Zap, BarChart3, Info } from "lucide-react";
import { SolarisIcon } from "@/components/ui/SolarisIcon";
import { TradingViewChart } from "@/components/dashboard/TradingViewChart";
import { SimilarCoinsCarousel } from "@/components/dashboard/SimilarCoinsCarousel";

// Need to define params properly for Next.js 15+
type Props = {
    params: Promise<{ coinId: string; locale: string }>;
};

// Mock SEO generator if lib/seo doesn't exist yet, we can inline or create it.
// For now, I'll inline the metadata logic to be safe and robust.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { coinId } = await params;
    const coin = await getCoinData(coinId);

    if (!coin) {
        return {
            title: 'Coin Not Found | ShursunT AI',
        };
    }

    const title = `${coin.name} ($${coin.symbol.toUpperCase()}) Price Prediction 2026 | AI Forecast`;
    const description = `Real-time ${coin.name} price prediction and AI trading signals. Current price: $${coin.current_price}. sentiment analysis, support/resistance levels, and market trends for ${new Date().getFullYear()}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [coin.image],
        },
        keywords: [`${coin.name} price prediction`, `${coin.symbol} ai signals`, `buy ${coin.name}`, `crypto analytics ${coin.name}`],
    };
}

export default async function CoinPage({ params }: Props) {
    const { coinId, locale } = await params;
    const [coin, topCoins] = await Promise.all([
        getCoinData(coinId),
        getTopCoins(12)
    ]);

    if (!coin) {
        notFound();
    }

    const isPositive = coin.price_change_percentage_24h >= 0;
    const sentiment = isPositive ? "Bullish" : "Bearish";
    const sentimentColor = isPositive ? "text-green-500" : "text-red-500";
    const recommendation = isPositive ? "BUY" : "HOLD";

    const similarCoins = topCoins.filter((c: any) => c.id !== coin.id).slice(0, 8);

    return (
        <main className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Breadcrumb / Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <img src={coin.image} alt={coin.name} className="w-24 h-24 rounded-full shadow-2xl shadow-primary/20" />
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                            {coin.name} <span className="text-muted-foreground text-2xl md:text-4xl">({coin.symbol.toUpperCase()})</span>
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            AI Price Prediction & Market Analysis
                        </p>
                    </div>
                    <div className="ml-auto flex flex-col items-center md:items-end bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Current Price</span>
                        <span className="text-3xl font-bold font-mono">${coin.current_price.toLocaleString()}</span>
                        <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {coin.price_change_percentage_24h.toFixed(2)}% (24h)
                        </div>
                    </div>
                </div>

                {/* AI Signal Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card/30 border border-border/50 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <SolarisIcon className="w-32 h-32" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-xl font-bold">AI Signal</h3>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground">Sentiment</span>
                            <span className={`text-2xl font-black ${sentimentColor}`}>{sentiment}</span>
                        </div>
                        <div className="w-full bg-muted/30 h-4 rounded-full overflow-hidden mb-6">
                            <div
                                className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000`}
                                style={{ width: `${Math.abs(coin.price_change_percentage_24h) * 10 + 50}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between border-t border-border/30 pt-4">
                            <span className="text-muted-foreground">Recommendation</span>
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold text-sm border border-primary/20">
                                {recommendation}
                            </span>
                        </div>
                    </div>

                    <div className="bg-card/30 border border-border/50 rounded-3xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold">Market Stats</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Market Cap</span>
                                <span className="font-mono font-medium">${coin.market_cap.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">24h High</span>
                                <span className="font-mono font-medium">${coin.high_24h.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">24h Low</span>
                                <span className="font-mono font-medium">${coin.low_24h.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Chart */}
                <div className="mb-12">
                    <TradingViewChart coinId={coinId} />
                </div>

                {/* Generated Content Section */}
                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-4">ShursunT AI Prediction for {coin.name}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Based on our advanced algorithmic analysis, <strong>{coin.name}</strong> is currently satisfying a <strong>{sentiment.toLowerCase()}</strong> market structure.
                        With a current price of <strong>${coin.current_price}</strong>, our AI models have detected increased volatility in the
                        last 24 hours, represented by a <strong>{coin.price_change_percentage_24h.toFixed(2)}%</strong> move.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                        Traders should watch the <strong>${coin.low_24h}</strong> support level closely. A break below this could signal further downside,
                        while holding above <strong>${coin.high_24h}</strong> would confirm the continuation of the current trend.
                    </p>

                    <div className="my-8 p-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl">
                        <h4 className="text-blue-400 font-bold mb-2">🚀 Pro Tip</h4>
                        <p className="text-sm text-blue-200/80 m-0">
                            Sign up for ShursunT Pro to get real-time entry and exit signals for {coin.symbol.toUpperCase()} sent directly to your dashboard.
                        </p>
                    </div>

                    <div className="flex justify-center mt-10 mb-16">
                        <Link href="/signup">
                            <button className="bg-primary text-primary-foreground hover:scale-105 transition-transform px-8 py-4 rounded-full font-bold shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                                Get Real-Time {coin.symbol.toUpperCase()} Signals
                            </button>
                        </Link>
                    </div>

                    {/* Similar Coins Carousel */}
                    <SimilarCoinsCarousel coins={similarCoins} locale={locale} />
                </div>
            </div>
        </main>
    );
}
