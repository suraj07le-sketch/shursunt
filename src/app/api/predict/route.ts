/**
 * PRO TRADING PREDICTION ENGINE v3.0
 * 8-Signal Confluence | Sentiment Analysis | Volume Profile
 * Regime Filter | Win-Rate Feedback | ATR Risk Management
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

// Import Real ML models
import { extractFeatures, type MarketData as MLMarketData, type TechnicalFeatures } from '@/lib/ml/features';
import { advancedEnsemblePrediction, trainGradientBoosting, predictGradientBoosting } from '@/lib/ml/gradient-boost';
import { sequencePrediction, multiHorizonPrediction, detectPatterns, asyncSequencePrediction } from '@/lib/ml/lstm-predictor';
import { classifyChartPattern, type PatternCNNResult } from '@/lib/ml/pattern-cnn';
import { fetchSentiment } from '@/lib/sentiment';
import { analyzeVolume } from '@/lib/volumeProfile';
import { fetchWinRate } from '@/lib/outcomeTracker';

// ============================================
// CONFIG & CACHE
// ============================================

const INDIAN_API_KEY = process.env.INDIAN_API_KEY || "";

declare global {
    var modelCache: Map<string, any>;
    var priceCache: Map<string, { data: any, timestamp: number }>;
}

if (!global.modelCache) global.modelCache = new Map<string, any>();
if (!global.priceCache) global.priceCache = new Map<string, { data: any, timestamp: number }>();

const priceCache = global.priceCache;
const CACHE_DURATION = 60 * 1000;

// ============================================
// TECHNICAL INDICATORS (used for route-level calculations)
// ============================================

function calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    if (data.length === 0) return result;
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
        result.push(ema);
    }
    return result;
}

function calculateRSI(data: number[], period: number = 14): number[] {
    const result: number[] = [];
    if (data.length <= period) return result;
    const gains: number[] = [];
    const losses: number[] = [];
    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? -change : 0);
    }
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < gains.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
    }
    return result;
}

function calculateVolatility(data: number[], period: number = 20): number[] {
    const result: number[] = [];
    if (data.length <= period) return result;
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) returns.push(Math.log(data[i] / data[i - 1]));
    for (let i = period; i < returns.length; i++) {
        const slice = returns.slice(i - period, i);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        result.push(Math.sqrt(variance) * 100);
    }
    return result;
}

function calculateATR(highData: number[], lowData: number[], closeData: number[], period: number = 14): number[] {
    const result: number[] = [];
    if (highData.length <= period) return result;
    const trueRanges: number[] = [];
    for (let i = 1; i < highData.length; i++) {
        const tr = Math.max(highData[i] - lowData[i], Math.abs(highData[i] - closeData[i - 1]), Math.abs(lowData[i] - closeData[i - 1]));
        trueRanges.push(tr);
    }
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < trueRanges.length; i++) {
        atr = (atr * (period - 1) + trueRanges[i]) / period;
        if (i >= period - 1) result.push(atr);
    }
    return result;
}

// ============================================
// PYTHON AI ENGINE (OpenCV Visual Analysis)
// ============================================

async function fetchPythonAIPrediction(symbol: string, timeframe: string): Promise<{ direction: number, confidence: number, patterns: string[] } | null> {
    try {
        const res = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pair: symbol, timeframe })
        });
        if (res.ok) {
            const data = await res.json();
            const direction = data.prediction === 'Buy' ? 1 : data.prediction === 'Sell' ? -1 : 0;
            return { direction, confidence: data.confidence * 100, patterns: data.visual_patterns || [] };
        }
    } catch (e) {
        console.warn(`[API] Python Engine unreachable for ${symbol}`);
    }
    return null;
}

// ============================================
// DATA FETCHING — 400+ Candles
// ============================================

async function fetchStockData(symbol: string, expectedPrice?: number): Promise<{ close: number[]; high: number[]; low: number[]; volume: number[]; open: number[] } | null> {
    try {
        const cacheKey = `stock_${symbol}`;
        const cached = priceCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) return cached.data as any;

        console.log(`[API] Trying Indian Stock API for symbol: ${symbol}`);
        const url = `https://stock.indianapi.in/historical_data?stock_name=${symbol.toUpperCase()}&period=1m&filter=default`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            headers: { "X-Api-Key": INDIAN_API_KEY },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const priceDataset = data.datasets?.find((d: any) => d.metric === "Price");
            if (priceDataset && priceDataset.values && priceDataset.values.length > 50) {
                const close = priceDataset.values.map((v: any) => Number(v[1]));
                const high = close.map((p: number) => p * 1.005);
                const low = close.map((p: number) => p * 0.995);
                const open = close.map((p: number, i: number) => i > 0 ? close[i - 1] : p);
                const volume = close.map(() => 100000);
                const result = { close, high, low, volume, open };
                priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
                return result;
            }
        }
    } catch (error) {
        console.error(`[API] Indian API error for ${symbol}:`, error);
    }

    const symbolsToTry = [`${symbol.toUpperCase()}.NS`, `${symbol.toUpperCase()}.BO`, symbol.toUpperCase()];
    for (const s of symbolsToTry) {
        try {
            console.log(`[API] Trying Yahoo Finance for symbol: ${s}`);
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 2);
            // Use chart() — historical() API was removed by Yahoo
            const chartData = await yf.chart(s, { period1: startDate, period2: endDate, interval: '1d' });
            const quotes = chartData?.quotes || [];
            if (quotes.length > 50) {
                const close: number[] = [], high: number[] = [], low: number[] = [], volume: number[] = [], open: number[] = [];
                for (const day of quotes) {
                    // Skip any bars with null values (Yahoo sometimes returns incomplete bars)
                    if (day.close != null && day.high != null && day.low != null && day.volume != null) {
                        close.push(day.close); high.push(day.high); low.push(day.low);
                        volume.push(day.volume); open.push(day.open ?? day.close);
                    }
                }
                if (close.length > 50) {
                    console.log(`[API] Yahoo chart() OK for ${s}: ${close.length} bars`);
                    return { close, high, low, volume, open };
                }
            }
        } catch (error) {
            console.error(`[API] Yahoo error for ${s}:`, (error as Error).message);
        }
    }
    return null;
}

async function fetchCryptoData(symbol: string, timeframe: string, expectedPrice?: number): Promise<{ close: number[]; high: number[]; low: number[]; volume: number[]; open: number[] } | null> {
    const symbolMap: Record<string, string> = { 'bitcoin': 'BTC', 'btc': 'BTC', 'ethereum': 'ETH', 'eth': 'ETH', 'solana': 'SOL', 'sol': 'SOL', 'dogecoin': 'DOGE', 'doge': 'DOGE', 'ripple': 'XRP', 'xrp': 'XRP', 'cardano': 'ADA', 'polkadot': 'DOT', 'chainlink': 'LINK', 'polygon': 'MATIC' };
    let baseSymbol = expectedPrice ? symbol : (symbolMap[symbol.toLowerCase()] || symbol.toUpperCase());
    const cleanBase = baseSymbol.replace(/USDT$/i, '').toUpperCase();

    try {
        const cacheKey = `crypto_${symbol}_${timeframe}`;
        const cached = priceCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) return cached.data as any;

        const interval = timeframe || '4h';
        const pair = `${cleanBase}USDT`;
        console.log(`[API] Fetching Binance data for ${pair} (${interval}) — 400 candles`);

        // Fetch 400 candles from Binance
        const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=400`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const close: number[] = [], high: number[] = [], low: number[] = [], volume: number[] = [], open: number[] = [];
            for (const k of data) {
                open.push(parseFloat(k[1]));
                high.push(parseFloat(k[2]));
                low.push(parseFloat(k[3]));
                close.push(parseFloat(k[4]));
                volume.push(parseFloat(k[5]));
            }
            if (close.length > 50) {
                const result = { close, high, low, volume, open };
                priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
                return result;
            }
        }
    } catch (e) {
        console.warn(`[API] Binance failed for ${cleanBase}, trying Yahoo...`);
    }

    try {
        const yahooSymbol = `${cleanBase}-USD`;
        const chartData = await yf.chart(yahooSymbol, {
            period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            period2: new Date(),
            interval: '1d'
        });
        if (chartData.quotes && chartData.quotes.length > 50) {
            const close: number[] = [], high: number[] = [], low: number[] = [], volume: number[] = [], open: number[] = [];
            for (const d of chartData.quotes) {
                if (d.close && d.high && d.low && d.volume) {
                    close.push(d.close); high.push(d.high); low.push(d.low);
                    volume.push(d.volume); open.push(d.open || d.close);
                }
            }
            return { close, high, low, volume, open };
        }
    } catch (e) {
        console.error(`[API] Yahoo Crypto error for ${cleanBase}:`, e);
    }
    return null;
}

// ============================================
// MULTI-TIMEFRAME CONFLUENCE ANALYZER
// ============================================

async function getMultiTimeframeSignal(
    asset: string,
    assetType: 'stock' | 'crypto',
    primaryTimeframe: string
): Promise<{ mtfAgreement: boolean; dailyBias: number; dailyConfidence: number } | null> {
    // Only perform multi-timeframe analysis if the primary timeframe is NOT daily
    if (primaryTimeframe === '1d' || primaryTimeframe === '1w') return null;
    if (assetType !== 'crypto') return null;

    try {
        const dailyData = await fetchCryptoData(asset, '1d');
        if (!dailyData || dailyData.close.length < 100) return null;

        const dailyFeatures = extractFeatures({
            close: dailyData.close,
            high: dailyData.high,
            low: dailyData.low,
            volume: dailyData.volume,
            open: dailyData.open
        });

        const dailyEnsemble = advancedEnsemblePrediction(dailyFeatures, '1d');

        return {
            mtfAgreement: true,
            dailyBias: dailyEnsemble.direction,
            dailyConfidence: dailyEnsemble.confidence
        };
    } catch (e) {
        console.warn('[API] MTF analysis failed:', e);
        return null;
    }
}

// ============================================
// SUPPORT / RESISTANCE LINE ANALYZER
// ============================================

/**
 * Detects dynamic support levels from price history and determines:
 * - Is price bouncing off support? (BUY signal)
 * - Is price breaking down through support? (SELL signal)
 * - How close is the price to a key level?
 * Returns a direction (-1 to +1) and confidence.
 */
function analyzeSupportLines(
    close: number[],
    high: number[],
    low: number[],
    atr: number
): { direction: number; confidence: number; srSignal: string; detail: string; supportLevel: number; resistanceLevel: number } {
    if (close.length < 30) return { direction: 0, confidence: 0, srSignal: 'NEUTRAL', detail: 'Not enough data', supportLevel: 0, resistanceLevel: 0 };

    const current = close[close.length - 1];
    const lookback = Math.min(close.length, 100);
    const recentClose = close.slice(-lookback);
    const recentHigh = high.slice(-lookback);
    const recentLow = low.slice(-lookback);

    // --- 1. Find key support levels (local minima clusters) ---
    const swingLows: number[] = [];
    for (let i = 2; i < recentLow.length - 2; i++) {
        if (
            recentLow[i] < recentLow[i - 1] &&
            recentLow[i] < recentLow[i - 2] &&
            recentLow[i] < recentLow[i + 1] &&
            recentLow[i] < recentLow[i + 2]
        ) {
            swingLows.push(recentLow[i]);
        }
    }

    // --- 2. Find key resistance levels (local maxima clusters) ---
    const swingHighs: number[] = [];
    for (let i = 2; i < recentHigh.length - 2; i++) {
        if (
            recentHigh[i] > recentHigh[i - 1] &&
            recentHigh[i] > recentHigh[i - 2] &&
            recentHigh[i] > recentHigh[i + 1] &&
            recentHigh[i] > recentHigh[i + 2]
        ) {
            swingHighs.push(recentHigh[i]);
        }
    }

    // --- 3. Cluster levels within 1 ATR ---
    const cluster = (levels: number[], tolerance: number): number[] => {
        if (levels.length === 0) return [];
        const sorted = [...levels].sort((a, b) => a - b);
        const clusters: number[] = [];
        let group = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] < tolerance) {
                group.push(sorted[i]);
            } else {
                clusters.push(group.reduce((a, b) => a + b) / group.length);
                group = [sorted[i]];
            }
        }
        clusters.push(group.reduce((a, b) => a + b) / group.length);
        return clusters;
    };

    const tolerance = atr * 1.0;
    const supportLevels = cluster(swingLows, tolerance).filter(l => l < current);
    const resistanceLevels = cluster(swingHighs, tolerance).filter(l => l > current);

    // Nearest support and resistance
    const nearestSupport = supportLevels.length > 0 ? Math.max(...supportLevels) : current * 0.97;
    const nearestResistance = resistanceLevels.length > 0 ? Math.min(...resistanceLevels) : current * 1.03;

    const distToSupport = current - nearestSupport;
    const distToResistance = nearestResistance - current;
    const totalRange = distToSupport + distToResistance;
    const srPosition = totalRange > 0 ? distToSupport / totalRange : 0.5; // 0 = at support, 1 = at resistance

    // --- 4. Detect bounce (last 3 candles low tested support and reversed up) ---
    const last3Lows = low.slice(-3);
    const bounceThreshold = atr * 0.5;
    const isBouncing = last3Lows.some(l => Math.abs(l - nearestSupport) < bounceThreshold) && close[close.length - 1] > close[close.length - 2];

    // --- 5. Detect breakdown (price closed below support) ---
    const prevClose = close[close.length - 2] || current;
    const isBreaking = prevClose > nearestSupport && current < nearestSupport;

    // --- 6. Compute direction and confidence ---
    let direction = 0;
    let confidence = 50;
    let srSignal = 'NEUTRAL';
    let detail = '';

    if (isBreaking) {
        direction = -1;
        confidence = 80;
        srSignal = 'BREAKDOWN';
        detail = `Broke below support ₹${nearestSupport.toFixed(2)}`;
    } else if (isBouncing && distToSupport < atr * 1.5) {
        direction = 1;
        confidence = 78;
        srSignal = 'BOUNCE';
        detail = `Bouncing off support ₹${nearestSupport.toFixed(2)}`;
    } else if (srPosition < 0.25) {
        // Near support — bullish bias
        direction = 0.6;
        confidence = 62;
        srSignal = 'NEAR_SUPPORT';
        detail = `Near support ₹${nearestSupport.toFixed(2)} (${((distToSupport / current) * 100).toFixed(1)}% away)`;
    } else if (srPosition > 0.75) {
        // Near resistance — bearish bias
        direction = -0.5;
        confidence = 58;
        srSignal = 'NEAR_RESISTANCE';
        detail = `Near resistance ₹${nearestResistance.toFixed(2)} (${((distToResistance / current) * 100).toFixed(1)}% away)`;
    } else {
        // Mid-range — neutral
        direction = 0;
        confidence = 45;
        srSignal = 'MID_RANGE';
        detail = `Between S:₹${nearestSupport.toFixed(2)} R:₹${nearestResistance.toFixed(2)}`;
    }

    return { direction, confidence, srSignal, detail, supportLevel: nearestSupport, resistanceLevel: nearestResistance };
}

// ============================================
// RISK-REWARD CALCULATOR
// ============================================

function calculateRiskReward(
    currentPrice: number,
    signal: string,
    features: TechnicalFeatures,
    atr: number
): { stopLoss: number; takeProfit: number; riskRewardRatio: number } {
    // Use ATR-based stops with S/R levels
    const atrMultiplier = 1.5;
    const tpMultiplier = 3.0; // Minimum 2:1 R:R target

    let stopLoss: number, takeProfit: number;

    if (signal === 'BUY') {
        // Stop below support or 1.5 ATR below entry, whichever is tighter
        const atrStop = currentPrice - atr * atrMultiplier;
        const srStop = features.nearest_support * 0.998; // Slightly below support
        stopLoss = Math.max(atrStop, srStop); // Use tighter stop

        // Take profit at resistance or 3 ATR above entry
        const atrTP = currentPrice + atr * tpMultiplier;
        const srTP = features.nearest_resistance * 0.998;
        takeProfit = Math.min(atrTP, srTP > currentPrice ? srTP : atrTP);
    } else if (signal === 'SELL') {
        // Stop above resistance or 1.5 ATR above entry
        const atrStop = currentPrice + atr * atrMultiplier;
        const srStop = features.nearest_resistance * 1.002;
        stopLoss = Math.min(atrStop, srStop);

        // Take profit at support or 3 ATR below entry
        const atrTP = currentPrice - atr * tpMultiplier;
        const srTP = features.nearest_support * 1.002;
        takeProfit = Math.max(atrTP, srTP < currentPrice ? srTP : atrTP);
    } else {
        stopLoss = currentPrice;
        takeProfit = currentPrice;
    }

    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(takeProfit - currentPrice);
    const riskRewardRatio = risk > 0 ? reward / risk : 0;

    return { stopLoss, takeProfit, riskRewardRatio };
}

// ============================================
// MAIN PREDICTION ENGINE v2.0
// ============================================

export async function generatePrediction(asset: string, assetType: 'stock' | 'crypto', timeframe: string = '4h', providedPrice?: number): Promise<any> {
    try {
        const assetSymbol = assetType === 'crypto' ? asset.replace(/USDT$/i, '').toUpperCase() : asset.toUpperCase();
        console.log(`[PredictV2] Starting prediction for ${assetSymbol} (${assetType}) @ ${timeframe}`);

        // --- 1. CONCURRENT DATA FETCHING (400 candles) ---
        const marketPromise = assetType === 'stock'
            ? fetchStockData(assetSymbol, providedPrice)
            : fetchCryptoData(assetSymbol, timeframe, providedPrice);

        const pythonAIPromise = assetType === 'crypto'
            ? fetchPythonAIPrediction(`${assetSymbol}/USDT`, timeframe)
            : Promise.resolve(null);

        const mtfPromise = getMultiTimeframeSignal(assetSymbol, assetType, timeframe);

        const [marketData, pythonAI, mtfResult] = await Promise.all([marketPromise, pythonAIPromise, mtfPromise]);

        if (!marketData || marketData.close.length < 100) {
            return { success: false, error: `Insufficient data for ${asset}. Need 100+ candles, got ${marketData?.close.length || 0}.`, asset };
        }

        const { close, high, low, volume, open } = marketData;
        const currentPrice = close[close.length - 1];

        console.log(`[PredictV3] Got ${close.length} candles for ${assetSymbol}. Price: ${currentPrice}`);

        // --- 2. EXTRACT ALL FEATURES (30+ indicators) ---
        const features = extractFeatures({ close, high, low, volume, open });

        // --- 3. ROUTE-LEVEL INDICATORS ---
        const emaFast = calculateEMA(close, 12);
        const emaSlow = calculateEMA(close, 50);
        const volatility = calculateVolatility(close, 20);
        const atr = calculateATR(high, low, close, 14);
        const returns: number[] = [];
        for (let i = 1; i < close.length; i++) returns.push(Math.log(close[i] / close[i - 1]));
        const latestATRVal = atr.length > 0 ? atr[atr.length - 1] : currentPrice * 0.02;

        // --- REGIME FILTER: Don't trade choppy markets ---
        const isChoppy = features.adx < 20;
        const regime = features.adx > 25 ? 'TRENDING' : isChoppy ? 'CHOPPY' : 'RANGING';

        // --- 4. RUN ALL ML MODELS (concurrently where possible) ---

        // 4a. Technical Ensemble
        const ensembleResult = advancedEnsemblePrediction(features, timeframe);

        // 4b. Random Forest
        const rfModel = trainGradientBoosting(features, 30, 0.1, { close, high, low, volume, open });
        const rfPrediction = predictGradientBoosting(rfModel, features);

        // 4c. LSTM Sequence Prediction
        const lstmResult = sequencePrediction(close, { close, high, low, volume, open });

        // 4d. Chart Pattern CNN
        let cnnResult: PatternCNNResult | null = null;
        try {
            cnnResult = await classifyChartPattern(open, high, low, close);
        } catch (e) {
            console.warn('[PredictV3] CNN skipped:', e);
        }

        // 4e. Structural Pattern Detection
        const structuralPatterns = detectPatterns(close, high, low);

        // 4f. Support/Resistance Line Analysis
        const srAnalysis = analyzeSupportLines(close, high, low, latestATRVal);

        // 4g. Volume Profile & OBV Divergence
        const volumeAnalysis = analyzeVolume(close, high, low, volume, srAnalysis.supportLevel, latestATRVal);

        // 4h. Sentiment + Win-Rate (with 3s hard timeout so network issues never stall the prediction)
        const withTimeout = <T>(promise: Promise<T>, fallback: T, ms = 3000): Promise<T> =>
            Promise.race([promise, new Promise<T>(res => setTimeout(() => res(fallback), ms))]);

        const [sentimentResult, winRateResult] = await Promise.all([
            withTimeout(fetchSentiment(assetSymbol, assetType), { score: 0, confidence: 30, label: 'NEUTRAL' as const, source: 'timeout', articleCount: 0 }),
            withTimeout(fetchWinRate(assetSymbol, assetType), { winRate: 0.5, sampleSize: 0, correctionFactor: 0 })
        ]);

        console.log(`[PredictV3] Sentiment: ${sentimentResult.label}(${sentimentResult.confidence.toFixed(0)}%) | Volume: ${volumeAnalysis.signal} | SR: ${srAnalysis.srSignal} | WinRate: ${(winRateResult.winRate * 100).toFixed(0)}%(n=${winRateResult.sampleSize}) | Regime: ${regime}`);

        // --- 5. OCTET CONFLUENCE ENGINE (8 signals) ---
        // Weight allocation:
        // Technical Ensemble:   20%
        // Random Forest ML:     17%
        // LSTM Sequence:        15%
        // Support/Resistance:   15%
        // Volume Profile/OBV:   13%
        // Sentiment:            10%
        // Visual/CNN:            7%
        // Candlestick Patterns:  3%

        const signTech    = Math.sign(ensembleResult.direction);
        const signRF      = Math.sign(rfPrediction.prediction);
        const signLSTM    = Math.sign(lstmResult.prediction);
        const signSR      = Math.sign(srAnalysis.direction);
        const signVol     = Math.sign(volumeAnalysis.direction);
        const signSentiment = Math.sign(sentimentResult.score);
        const signCNN     = cnnResult ? Math.sign(cnnResult.bullishSignal) : signTech;
        const signVisual  = pythonAI ? Math.sign(pythonAI.direction) : signCNN;

        // Weighted direction (sums to 100%)
        let totalDirection =
            ensembleResult.direction   * 0.20 +
            rfPrediction.prediction    * 0.17 +
            lstmResult.prediction      * 0.15 +
            srAnalysis.direction       * 0.15 +
            volumeAnalysis.direction   * 0.13 +
            sentimentResult.score      * 0.10;

        if (cnnResult && cnnResult.pattern !== 'ERROR' && cnnResult.pattern !== 'INSUFFICIENT_DATA') {
            totalDirection += cnnResult.bullishSignal * 0.07;
        } else if (pythonAI) {
            totalDirection += pythonAI.direction * 0.07;
        } else {
            totalDirection += ensembleResult.direction * 0.07;
        }

        const candleSignal = features.candlestick_bullish_score - features.candlestick_bearish_score;
        totalDirection += Math.tanh(candleSignal) * 0.03;

        // Weighted confidence
        let totalConf =
            ensembleResult.confidence              * 0.20 +
            rfPrediction.confidence                * 0.17 +
            lstmResult.confidence                  * 0.15 +
            srAnalysis.confidence                  * 0.15 +
            volumeAnalysis.confidence              * 0.13 +
            sentimentResult.confidence             * 0.10 +
            (cnnResult ? cnnResult.confidence : 50)* 0.07 +
            (pythonAI ? pythonAI.confidence : 50)  * 0.03;

        // --- 6. CONFLUENCE AGREEMENT BONUS (8 signals) ---
        const allSigns = [signTech, signRF, signLSTM, signSR, signVol, signSentiment, signCNN, signVisual].filter(s => s !== 0);
        const posVotes = allSigns.filter(s => s > 0).length;
        const negVotes = allSigns.filter(s => s < 0).length;
        const dominantVotes = Math.max(posVotes, negVotes);
        const totalVotes = allSigns.length;

        let confluenceLevel = 'NONE';
        let agreementBonus = 0;

        // S/R Bounce/Breakdown event bonus
        if (srAnalysis.srSignal === 'BOUNCE' || srAnalysis.srSignal === 'BREAKDOWN') agreementBonus += 10;
        else if (srAnalysis.srSignal === 'NEAR_SUPPORT' || srAnalysis.srSignal === 'NEAR_RESISTANCE') agreementBonus += 4;

        // Volume spike at support is a very powerful signal
        if (volumeAnalysis.signal === 'VOLUME_SPIKE_SUPPORT') agreementBonus += 12;
        else if (volumeAnalysis.signal === 'OBV_BULL_DIVERGENCE' || volumeAnalysis.signal === 'OBV_BEAR_DIVERGENCE') agreementBonus += 8;

        // Sentiment bonus (strong sentiment in signal direction)
        if (Math.abs(sentimentResult.score) > 0.5 && Math.sign(sentimentResult.score) === Math.sign(totalDirection)) agreementBonus += 6;

        if (dominantVotes >= 7 && totalVotes >= 7) {
            confluenceLevel = 'OCTET';
            agreementBonus += 30;
        } else if (dominantVotes >= 5 && totalVotes >= 5) {
            confluenceLevel = 'SEXTET';
            agreementBonus += 22;
        } else if (dominantVotes >= 4 && totalVotes >= 4) {
            confluenceLevel = 'QUINTUPLE';
            agreementBonus += 15;
        } else if (dominantVotes >= 3 && totalVotes >= 3) {
            confluenceLevel = 'TRIPLE';
            agreementBonus += 10;
        } else if (dominantVotes >= 2) {
            confluenceLevel = 'PARTIAL';
            agreementBonus += 4;
        }

        // --- 7. MULTI-TIMEFRAME VALIDATION ---
        let mtfStatus = 'N/A';
        if (mtfResult) {
            const primaryDir = Math.sign(totalDirection);
            if (primaryDir === mtfResult.dailyBias && mtfResult.dailyBias !== 0) {
                mtfStatus = 'CONFIRMED';
                agreementBonus += 8;
                totalConf += 5;
            } else if (mtfResult.dailyBias !== 0 && primaryDir !== 0 && primaryDir !== mtfResult.dailyBias) {
                mtfStatus = 'CONFLICTING';
                agreementBonus -= 5;
                totalConf *= 0.85; // Reduce confidence when MTF conflicts
            } else {
                mtfStatus = 'NEUTRAL';
            }
        }

        // Apply win-rate correction from historical data
        if (winRateResult.sampleSize >= 5) {
            agreementBonus += winRateResult.correctionFactor;
            console.log(`[PredictV3] Win-rate correction: ${winRateResult.correctionFactor > 0 ? '+' : ''}${winRateResult.correctionFactor} (${(winRateResult.winRate * 100).toFixed(0)}% from ${winRateResult.sampleSize} past predictions)`);
        }

        const finalConfidence = Math.min(92, Math.max(30, totalConf + agreementBonus));

        // --- 8. SIGNAL DECISION ---
        let signal = 'HOLD';
        const isShortTerm = ['1h', '4h', '8h', '12h'].includes(timeframe);
        const dirThreshold = isShortTerm ? 0.02 : 0.04;
        const confThreshold = isShortTerm ? 48 : 55;

        // *** REGIME FILTER: Force HOLD in choppy markets unless very strong signal ***
        if (isChoppy && confluenceLevel !== 'OCTET' && confluenceLevel !== 'SEXTET') {
            console.log(`[PredictV3] REGIME FILTER: Market is CHOPPY (ADX=${features.adx.toFixed(1)}) — forcing HOLD to avoid bad trade`);
            return {
                success: true, asset, type: assetType, timeframe,
                current_price: currentPrice, predicted_price: currentPrice,
                prediction_change_percent: 0, signal: 'HOLD',
                confidence: finalConfidence, stop_loss: currentPrice, take_profit: currentPrice,
                risk_reward_ratio: 0, market_regime: regime,
                prediction_time: new Date().toISOString(), predicted_time: new Date().toISOString(),
                confluence: confluenceLevel, mtf_status: 'N/A',
                regime_filter: 'BLOCKED_CHOPPY',
                sentiment: { label: sentimentResult.label, score: sentimentResult.score, source: sentimentResult.source },
                volume_signal: volumeAnalysis.signal,
                sr_analysis: { signal: srAnalysis.srSignal, detail: srAnalysis.detail, support: srAnalysis.supportLevel, resistance: srAnalysis.resistanceLevel },
                models: null, patterns: [], candlestick_patterns: [], indicators: {}, visual_patterns: []
            };
        }

        // Pro trader rule: ONLY trade when confluence supports the direction
        if (totalDirection > dirThreshold && finalConfidence > confThreshold) {
            const srSupportsLong = srAnalysis.srSignal === 'BOUNCE' || srAnalysis.srSignal === 'NEAR_SUPPORT' || features.sr_distance_ratio < 0.6;
            const volSupportsLong = volumeAnalysis.signal === 'VOLUME_SPIKE_SUPPORT' || volumeAnalysis.signal === 'OBV_BULL_DIVERGENCE' || volumeAnalysis.direction > 0;
            const sentimentOk = sentimentResult.score >= -0.2; // not strongly bearish
            if ((srSupportsLong && sentimentOk) || confluenceLevel === 'OCTET' || confluenceLevel === 'SEXTET' || confluenceLevel === 'QUINTUPLE' || confluenceLevel === 'TRIPLE') {
                signal = 'BUY';
            } else if (totalDirection > dirThreshold * 2 && volSupportsLong) {
                signal = 'BUY';
            }
        } else if (totalDirection < -dirThreshold && finalConfidence > confThreshold) {
            const srSupportsShort = srAnalysis.srSignal === 'BREAKDOWN' || srAnalysis.srSignal === 'NEAR_RESISTANCE' || features.sr_distance_ratio > 0.4;
            const volSupportsShort = volumeAnalysis.signal === 'OBV_BEAR_DIVERGENCE' || volumeAnalysis.direction < 0;
            const sentimentOk = sentimentResult.score <= 0.2; // not strongly bullish
            if ((srSupportsShort && sentimentOk) || confluenceLevel === 'OCTET' || confluenceLevel === 'SEXTET' || confluenceLevel === 'QUINTUPLE' || confluenceLevel === 'TRIPLE') {
                signal = 'SELL';
            } else if (totalDirection < -dirThreshold * 2 && volSupportsShort) {
                signal = 'SELL';
            }
        }

        // Pro trader rule: Don't trade against MTF daily bias with low confidence
        if (mtfStatus === 'CONFLICTING' && finalConfidence < 65) signal = 'HOLD';

        // Weak volume = don't trade (no market conviction)
        if (volumeAnalysis.signal === 'WEAK_VOLUME' && confluenceLevel !== 'OCTET' && confluenceLevel !== 'SEXTET') signal = 'HOLD';

        // --- 9. PRICE TARGET & RISK MANAGEMENT ---
        const latestVol = volatility.length > 0 ? volatility[volatility.length - 1] : 2;
        const latestATR = latestATRVal;

        const predictedChange = totalDirection * (finalConfidence / 100) * (latestVol / 50);
        const predictedPrice = currentPrice * (1 + predictedChange);

        const rr = calculateRiskReward(currentPrice, signal, features, latestATR);

        // Pro trader rule: Don't take trades with R:R below 1.5
        if (signal !== 'HOLD' && rr.riskRewardRatio < 1.5 && confluenceLevel !== 'QUINTUPLE' && confluenceLevel !== 'SEXTET' && confluenceLevel !== 'OCTET') {
            console.log(`[PredictV3] Skipping ${signal} — R:R too low (${rr.riskRewardRatio.toFixed(2)})`);
            signal = 'HOLD';
        }

        // Collect all identified patterns
        const allPatterns = [
            ...structuralPatterns.patterns,
            ...(cnnResult && cnnResult.pattern !== 'ERROR' ? [cnnResult.pattern] : []),
            ...(pythonAI?.patterns || []),
            ...features.candlestick_patterns.filter(p => p.position >= close.length - 5).map(p => p.name)
        ];

        const now = new Date();
        const validTill = new Date(now.getTime() + (parseInt(timeframe) || 4) * 60 * 60 * 1000);

        console.log(`[PredictV3] FINAL: ${signal} | Conf: ${finalConfidence.toFixed(1)}% | Confluence: ${confluenceLevel} | Sentiment: ${sentimentResult.label} | Volume: ${volumeAnalysis.signal} | MTF: ${mtfStatus} | Regime: ${regime} | R:R: ${rr.riskRewardRatio.toFixed(2)}`);

        return {
            success: true,
            asset,
            type: assetType,
            timeframe,
            current_price: currentPrice,
            predicted_price: predictedPrice,
            prediction_change_percent: ((predictedPrice - currentPrice) / currentPrice) * 100,
            signal,
            confidence: finalConfidence,
            stop_loss: rr.stopLoss,
            take_profit: rr.takeProfit,
            risk_reward_ratio: rr.riskRewardRatio,
            market_regime: regime,
            prediction_time: now.toISOString(),
            predicted_time: validTill.toISOString(),
            confluence: confluenceLevel,
            mtf_status: mtfStatus,
            // Detailed model outputs
            models: {
                technical_ensemble: { signal: ensembleResult.signal, confidence: ensembleResult.confidence, direction: ensembleResult.direction },
                random_forest: { prediction: rfPrediction.prediction, confidence: rfPrediction.confidence, oob_accuracy: rfModel.oobAccuracy },
                lstm: { trend: lstmResult.trend, prediction: lstmResult.prediction, confidence: lstmResult.confidence },
                support_resistance: { signal: srAnalysis.srSignal, direction: srAnalysis.direction, confidence: srAnalysis.confidence, detail: srAnalysis.detail, support: srAnalysis.supportLevel, resistance: srAnalysis.resistanceLevel },
                volume_profile: { signal: volumeAnalysis.signal, direction: volumeAnalysis.direction, confidence: volumeAnalysis.confidence, detail: volumeAnalysis.detail, obv_trend: volumeAnalysis.obvTrend },
                sentiment: { label: sentimentResult.label, score: sentimentResult.score, confidence: sentimentResult.confidence, source: sentimentResult.source, articles: sentimentResult.articleCount },
                cnn_pattern: cnnResult ? { pattern: cnnResult.pattern, confidence: cnnResult.confidence, bullish_signal: cnnResult.bullishSignal } : null,
                python_visual: pythonAI ? { direction: pythonAI.direction, confidence: pythonAI.confidence } : null
            },
            win_rate: { rate: winRateResult.winRate, samples: winRateResult.sampleSize, correction_applied: winRateResult.correctionFactor },
            sr_analysis: { signal: srAnalysis.srSignal, detail: srAnalysis.detail, support: srAnalysis.supportLevel, resistance: srAnalysis.resistanceLevel },
            patterns: allPatterns,
            candlestick_patterns: features.candlestick_patterns.filter(p => p.position >= close.length - 10).map(p => ({ name: p.name, type: p.type, strength: p.strength })),
            indicators: {
                rsi14: features.rsi14,
                macd_histogram: features.macd_histogram,
                bb_position: features.bb_position,
                adx: features.adx,
                ichimoku_signal: features.ichimoku_signal,
                supertrend_direction: features.supertrend_direction,
                vwap_deviation: features.vwap_deviation,
                volume_ratio: features.volume_ratio,
                support: srAnalysis.supportLevel || features.nearest_support,
                resistance: srAnalysis.resistanceLevel || features.nearest_resistance,
                sr_signal: srAnalysis.srSignal,
                sr_position: features.sr_distance_ratio,
                obv_trend: volumeAnalysis.obvTrend,
                regime
            },
            visual_patterns: pythonAI?.patterns || []
        };
    } catch (e: any) {
        console.error('[PredictV2] Error:', e);
        return { success: false, error: e.message };
    }
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Config error" }, { status: 500 });

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
                remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
            },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { coinId, coinName, timeframe, type, currentPrice, symbol: providedSymbol } = await req.json();
        const isCrypto = type === 'crypto' || ["btc", "eth", "sol", "doge", "xrp", "ada", "dot"].includes(providedSymbol?.toLowerCase() || coinId?.toLowerCase());
        const assetType = isCrypto ? 'crypto' : 'stock';
        const assetName = isCrypto ? (providedSymbol || coinId) : (coinName || coinId);

        const result = await generatePrediction(assetName, assetType, timeframe || '4h', currentPrice);
        if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 500 });

        // --- BACKGROUND STORAGE (Non-blocking) ---
        (async () => {
            try {
                const predictionsTable = assetType === 'crypto' ? 'crypto_predictions' : 'stock_predictions';
                const predictionData: any = {
                    user_id: user.id,
                    timeframe: result.timeframe,
                    current_price: result.current_price,
                    predicted_price: result.predicted_price,
                    prediction_change_percent: result.prediction_change_percent,
                    stop_loss_price: result.stop_loss,
                    prediction_valid_till_ist: result.predicted_time,
                    created_at: result.prediction_time
                };

                if (assetType === 'stock') {
                    predictionData.stock_name = assetName;
                    predictionData.signal = result.signal;
                    predictionData.accuracy_percent = Math.round(result.confidence);
                    predictionData.prediction_time_ist = result.prediction_time;
                } else {
                    predictionData.coin = assetName;
                    predictionData.trend = result.signal;
                    predictionData.confidence = Math.round(result.confidence);
                    predictionData.predicted_time_ist = result.prediction_time;
                    predictionData.model = 'pro-engine-v2.0';
                }

                const { error: insErr } = await supabase.from(predictionsTable).insert(predictionData);
                if (insErr) console.error('[API] Storage failed:', insErr);
                else console.log(`[API] Saved prediction for ${assetName} to background storage.`);
            } catch (err) {
                console.error('[API] Background storage error:', err);
            }
        })();

        return NextResponse.json({ success: true, prediction: result });
    } catch (e: any) {
        console.error('[API] POST Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
