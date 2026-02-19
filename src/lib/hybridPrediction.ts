import axios from "axios";
import * as tf from "@tensorflow/tfjs";

// ============================
// TECHNICAL INDICATORS
// ============================

export const calculateEMA = (prices: number[], period: number) => {
    if (prices.length === 0) return 0;
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
};

export const calculateRSI = (prices: number[], period = 14) => {
    if (prices.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
};

export const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices.slice(-12), 12);
    const ema26 = calculateEMA(prices.slice(-26), 26);
    const macd = ema12 - ema26;
    // Signal line is EMA 9 of MACD (Simplified for now)
    return { macd, signal: macd * 0.9 };
};

export const calculateATR = (klines: any[], period = 14) => {
    if (klines.length < period) return 0;
    const trs = klines.slice(-period).map((k: any) => {
        const h = Number(k[2]);
        const l = Number(k[3]);
        const pc = Number(k[4]);
        return Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
    });
    return trs.reduce((a: number, b: number) => a + b, 0) / period;
};

export const calculateBollingerBands = (prices: number[], period = 20, multiplier = 2) => {
    const slice = prices.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
        upper: sma + multiplier * stdDev,
        middle: sma,
        lower: sma - multiplier * stdDev
    };
};

export const calculateFibonacci = (high: number, low: number) => {
    const diff = high - low;
    return {
        "0.236": high - diff * 0.236,
        "0.382": high - diff * 0.382,
        "0.5": high - diff * 0.5,
        "0.618": high - diff * 0.618,
        "0.786": high - diff * 0.786
    };
};

// ============================
// SIMULATED LSTM LOGIC
// ============================

async function simulateLSTM(prices: number[], windowSize: number, horizon: number) {
    if (prices.length < windowSize + 10) return { trend: "NEUTRAL", change: 0 };

    // Normalize data
    const min = Math.min(...prices.slice(-windowSize - 10));
    const max = Math.max(...prices.slice(-windowSize - 10));
    const range = max - min || 1;

    const normalized = prices.slice(-windowSize).map(p => (p - min) / range);

    // Simple sequence acceleration logic to simulate LSTM trend persistence
    const last3 = normalized.slice(-3);
    const accel = (last3[2] - last3[1]) - (last3[1] - last3[0]);
    const slope = last3[2] - normalized[0];

    const predictionChange = (slope * 0.8) + (accel * 0.2);
    const predictedPrice = prices[prices.length - 1] + (predictionChange * range);

    return {
        trend: predictionChange > 0.01 ? "UP" : predictionChange < -0.01 ? "DOWN" : "SIDEWAYS",
        change: predictionChange
    };
}

// ============================
// SIMULATED XGBOOST LOGIC
// ============================

function simulateXGBoost(features: any) {
    let bullishScore = 0;
    let bearishScore = 0;

    // Feature 1: EMA Crossovers
    if (features.ema21 > features.ema50) bullishScore += 2; else bearishScore += 2;
    if (features.ema50 > features.ema200) bullishScore += 3; else bearishScore += 3;

    // Feature 2: RSI Levels
    if (features.rsi > 60) bullishScore += 2; else if (features.rsi < 40) bearishScore += 2;

    // Feature 3: MACD Trend
    if (features.macd > features.macdSignal) bullishScore += 2; else bearishScore += 2;

    // Feature 4: Volume Spike
    if (features.volDelta > 1.5) bullishScore += 1;

    // Normalize to probabilities
    const total = bullishScore + bearishScore || 1;
    const probBreakout = (bullishScore / total) * 100;
    const probBreakdown = (bearishScore / total) * 100;

    return {
        probBreakout,
        probBreakdown,
        sentiment: probBreakout > 60 ? "BULLISH" : probBreakdown > 60 ? "BEARISH" : "CONSIDER_SIDEWAYS"
    };
}

// ============================
// HYBRID ANALYZER
// ============================

export async function runHybridAnalysis(symbol: string, timeframe: string, horizon: number) {
    try {
        // 1. Fetch Data
        console.log(`[HybridAI] Loading market data for ${symbol}...`);
        const res = await axios.get("https://api.binance.com/api/v3/klines", {
            params: { symbol, interval: timeframe, limit: 500 }
        });

        const klines = res.data;
        const closes = klines.map((k: any) => Number(k[4]));
        const currentPrice = closes[closes.length - 1];

        // 2. Technical Feature Engineering
        const ema21 = calculateEMA(closes, 21);
        const ema50 = calculateEMA(closes, 50);
        const ema200 = calculateEMA(closes, 200);
        const rsi = calculateRSI(closes);
        const { macd, signal: macdSignal } = calculateMACD(closes);
        const atr = calculateATR(klines);
        const bb = calculateBollingerBands(closes);

        const high = Math.max(...closes.slice(-100));
        const low = Math.min(...closes.slice(-100));
        const fib = calculateFibonacci(high, low);

        // 3. Simulated Models
        const lstm = await simulateLSTM(closes, 30, horizon);

        const volAvg = klines.slice(-20).reduce((a: any, b: any) => a + Number(b[5]), 0) / 20;
        const volDelta = Number(klines[klines.length - 1][5]) / volAvg;

        const xgboost = simulateXGBoost({
            ema21, ema50, ema200, rsi, macd, macdSignal, volDelta
        });

        // 4. Trend Validation
        let bias = "SIDEWAYS";
        if (ema21 > ema50 && macd > macdSignal && rsi > 55) bias = "BULLISH";
        else if (ema21 < ema50 && macd < macdSignal && rsi < 45) bias = "BEARISH";

        // 5. Final Ensemble
        const confidence = (xgboost.sentiment === bias.toUpperCase() ? 85 : 65);

        // Calculate targets
        const volatilityShift = atr * 1.5;
        const upperTarget = currentPrice + volatilityShift;
        const lowerTarget = currentPrice - volatilityShift;

        return {
            symbol,
            timeframe,
            horizon,
            currentPrice,
            trend: bias,
            upperTarget,
            lowerTarget,
            confidence,
            probBreakout: xgboost.probBreakout,
            probBreakdown: xgboost.probBreakdown,
            support: fib["0.618"],
            resistance: fib["0.382"],
            bias: bias === "BULLISH" ? "Long" : bias === "BEARISH" ? "Short" : "No Trade",
            entry: currentPrice,
            stopLoss: bias === "BULLISH" ? currentPrice - atr * 2 : currentPrice + atr * 2,
            takeProfit: bias === "BULLISH" ? currentPrice + atr * 4 : currentPrice - atr * 4,
            logic: `Hybrid AI detected ${bias} bias with ${confidence}% confidence. ` +
                `XGBoost signals ${xgboost.probBreakout.toFixed(1)}% breakout probability. ` +
                `RSI at ${rsi.toFixed(1)} confirms ${rsi > 50 ? 'bullish' : 'bearish'} momentum.`
        };

    } catch (error: any) {
        console.error("Analysis failed:", error.message);
        throw error;
    }
}
