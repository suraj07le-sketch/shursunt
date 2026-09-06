/**
 * Sentiment Analysis Service
 * Fetches news sentiment for crypto (CryptoPanic) and stocks (NewsAPI)
 * Used as the 7th signal in the prediction confidence engine.
 */

export interface SentimentResult {
    score: number;        // -1 (very bearish) to +1 (very bullish)
    confidence: number;  // 0-100
    label: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'VERY_BEARISH';
    source: string;
    articleCount: number;
}

// Cache sentiment to avoid hammering free APIs
const sentimentCache = new Map<string, { result: SentimentResult; timestamp: number }>();
const CACHE_MS = 15 * 60 * 1000; // 15 minutes

// Simple keyword-based NLP scorer
function scoreText(text: string): number {
    const bullish = [
        'surge', 'rally', 'breakout', 'all-time high', 'ath', 'bullish', 'buy', 'gain',
        'rise', 'rising', 'growth', 'adoption', 'partnership', 'upgrade', 'record',
        'positive', 'profit', 'beat', 'outperform', 'strong', 'recovery', 'boom'
    ];
    const bearish = [
        'crash', 'plunge', 'dump', 'bearish', 'sell', 'drop', 'fall', 'falling', 'decline',
        'loss', 'hack', 'ban', 'regulation', 'warning', 'weak', 'fear', 'panic',
        'correction', 'recession', 'liquidation', 'bankrupt', 'investigation', 'fraud'
    ];

    const lower = text.toLowerCase();
    let score = 0;
    bullish.forEach(w => { if (lower.includes(w)) score += 1; });
    bearish.forEach(w => { if (lower.includes(w)) score -= 1; });
    return Math.max(-1, Math.min(1, score / 3)); // Normalize
}

function labelFromScore(score: number): SentimentResult['label'] {
    if (score > 0.5)  return 'VERY_BULLISH';
    if (score > 0.15) return 'BULLISH';
    if (score < -0.5) return 'VERY_BEARISH';
    if (score < -0.15) return 'BEARISH';
    return 'NEUTRAL';
}

/** Fetch CryptoPanic sentiment (free, no key needed for public feed) */
async function fetchCryptoPanicSentiment(symbol: string): Promise<SentimentResult | null> {
    try {
        const cleanSymbol = symbol.replace(/USDT$/i, '').toUpperCase();
        const url = `https://cryptopanic.com/api/free/v1/posts/?auth_token=pub_6d8c1c7e5d4a3b2f1e0d9c8b7a654321&currencies=${cleanSymbol}&filter=important&kind=news&public=true`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return null;

        const data = await res.json();
        const posts: any[] = data.results || [];
        if (posts.length === 0) return null;

        // Each post has votes: {positive, negative, important, liked, disliked}
        let totalScore = 0;
        let count = 0;
        for (const post of posts.slice(0, 20)) {
            const titleScore = scoreText(post.title || '');
            const voteScore = post.votes
                ? (post.votes.positive - post.votes.negative) / Math.max(1, post.votes.positive + post.votes.negative + 1)
                : 0;
            totalScore += titleScore * 0.6 + voteScore * 0.4;
            count++;
        }

        const finalScore = count > 0 ? totalScore / count : 0;
        const confidence = Math.min(90, 40 + count * 2.5);

        return {
            score: Math.max(-1, Math.min(1, finalScore)),
            confidence,
            label: labelFromScore(finalScore),
            source: 'CryptoPanic',
            articleCount: count
        };
    } catch {
        return null;
    }
}

/** Fetch NewsAPI sentiment for stocks (free tier: 100 req/day) */
async function fetchNewsAPISentiment(symbol: string, assetType: 'stock' | 'crypto'): Promise<SentimentResult | null> {
    const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
    if (!NEWSAPI_KEY) return null;

    try {
        const query = assetType === 'stock'
            ? `${symbol} stock India NSE`
            : `${symbol} cryptocurrency`;

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${NEWSAPI_KEY}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return null;

        const data = await res.json();
        const articles: any[] = data.articles || [];
        if (articles.length === 0) return null;

        let totalScore = 0;
        let count = 0;
        for (const article of articles.slice(0, 20)) {
            const text = `${article.title || ''} ${article.description || ''}`;
            totalScore += scoreText(text);
            count++;
        }

        const finalScore = count > 0 ? totalScore / count : 0;
        const confidence = Math.min(85, 35 + count * 2);

        return {
            score: Math.max(-1, Math.min(1, finalScore)),
            confidence,
            label: labelFromScore(finalScore),
            source: 'NewsAPI',
            articleCount: count
        };
    } catch {
        return null;
    }
}

/** Main sentiment fetcher with cache and fallback */
export async function fetchSentiment(symbol: string, assetType: 'stock' | 'crypto'): Promise<SentimentResult> {
    const cacheKey = `${assetType}_${symbol}`;
    const cached = sentimentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_MS) {
        return cached.result;
    }

    let result: SentimentResult | null = null;

    if (assetType === 'crypto') {
        result = await fetchCryptoPanicSentiment(symbol);
    }

    if (!result) {
        result = await fetchNewsAPISentiment(symbol, assetType);
    }

    // Fallback: neutral
    if (!result) {
        result = { score: 0, confidence: 30, label: 'NEUTRAL', source: 'fallback', articleCount: 0 };
    }

    sentimentCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
}
