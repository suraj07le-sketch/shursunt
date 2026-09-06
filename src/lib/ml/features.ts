// =====================================================
// PROFESSIONAL FEATURE ENGINEERING — 400-Candle Analysis
// 30+ Technical Indicators + Candlestick Patterns
// =====================================================

export interface MarketData {
    close: number[];
    high: number[];
    low: number[];
    volume: number[];
    open?: number[];
}

export interface CandlestickPattern {
    name: string;
    type: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-1
    position: number; // candle index
}

export interface TechnicalFeatures {
    // Price features — EMAs
    ema9: number;
    ema12: number;
    ema21: number;
    ema50: number;
    ema200: number;

    // Bollinger Bands
    bb_upper: number;
    bb_middle: number;
    bb_lower: number;
    bb_width: number;
    bb_position: number;

    // Momentum
    rsi14: number;
    rsi21: number;
    stoch_k: number;
    stoch_d: number;
    williams_r: number;
    cci: number;
    mfi: number;

    // MACD (FIXED — proper signal line)
    macd_line: number;
    macd_signal: number;
    macd_histogram: number;

    // Volatility
    atr14: number;
    atr21: number;
    volatility20: number;
    volatility50: number;

    // Volume
    volume_sma: number;
    volume_ratio: number;
    obv: number;
    obv_slope: number;

    // Trend
    adx: number;
    trend_strength: number;

    // Ichimoku Cloud
    ichimoku_tenkan: number;
    ichimoku_kijun: number;
    ichimoku_senkou_a: number;
    ichimoku_senkou_b: number;
    ichimoku_signal: number; // 1=above cloud, -1=below, 0=inside

    // SuperTrend
    supertrend: number;
    supertrend_direction: number; // 1=bullish, -1=bearish

    // VWAP
    vwap: number;
    vwap_deviation: number;

    // Price patterns
    higher_highs: number;
    higher_lows: number;
    price_momentum_1h: number;
    price_momentum_4h: number;
    price_momentum_1d: number;

    // Market Structure
    nearest_support: number;
    nearest_resistance: number;
    sr_distance_ratio: number; // distance to S vs R (0=at support, 1=at resistance)

    // Candlestick patterns
    candlestick_patterns: CandlestickPattern[];
    candlestick_bullish_score: number;
    candlestick_bearish_score: number;
}

// ============================================================
// CORE MATH HELPERS
// ============================================================

function calculateEMA(data: number[], period: number): number {
    if (data.length === 0) return 0;
    if (data.length < period) return data[data.length - 1];

    const k = 2 / (period + 1);
    let ema = data[data.length - period];
    for (let i = data.length - period + 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
    }
    return ema;
}

function calculateEMAArray(data: number[], period: number): number[] {
    if (data.length === 0) return [];
    const k = 2 / (period + 1);
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
        result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
}

function calculateSMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateSMAArray(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
    return result;
}

function calculateStdDev(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    return Math.sqrt(variance);
}

// ============================================================
// MOMENTUM INDICATORS
// ============================================================

function calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) return 50;

    let gains = 0, losses = 0;
    // Initial averages
    for (let i = data.length - period; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        if (change >= 0) gains += change;
        else losses -= change;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateStochastic(high: number[], low: number[], close: number[], kPeriod: number = 14, dPeriod: number = 3): { k: number; d: number } {
    if (high.length < kPeriod + dPeriod) return { k: 50, d: 50 };

    const kValues: number[] = [];
    for (let i = kPeriod - 1; i < close.length; i++) {
        const hSlice = high.slice(i - kPeriod + 1, i + 1);
        const lSlice = low.slice(i - kPeriod + 1, i + 1);
        const hh = Math.max(...hSlice);
        const ll = Math.min(...lSlice);
        const range = hh - ll;
        kValues.push(range === 0 ? 50 : ((close[i] - ll) / range) * 100);
    }

    // %D is SMA of %K
    const k = kValues[kValues.length - 1];
    const dSlice = kValues.slice(-dPeriod);
    const d = dSlice.reduce((a, b) => a + b, 0) / dSlice.length;

    return { k: isNaN(k) ? 50 : k, d: isNaN(d) ? 50 : d };
}

function calculateWilliamsR(high: number[], low: number[], close: number[], period: number = 14): number {
    if (high.length < period) return -50;
    const hSlice = high.slice(-period);
    const lSlice = low.slice(-period);
    const hh = Math.max(...hSlice);
    const ll = Math.min(...lSlice);
    const wr = ((hh - close[close.length - 1]) / (hh - ll)) * -100;
    return isNaN(wr) ? -50 : wr;
}

function calculateCCI(high: number[], low: number[], close: number[], period: number = 20): number {
    if (close.length < period) return 0;
    const typicalPrices: number[] = [];
    for (let i = close.length - period; i < close.length; i++) {
        typicalPrices.push((high[i] + low[i] + close[i]) / 3);
    }
    const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
    const meanDev = typicalPrices.reduce((a, b) => a + Math.abs(b - sma), 0) / period;
    if (meanDev === 0) return 0;
    const currentTP = typicalPrices[typicalPrices.length - 1];
    return (currentTP - sma) / (0.015 * meanDev);
}

function calculateMFI(high: number[], low: number[], close: number[], volume: number[], period: number = 14): number {
    if (close.length < period + 1) return 50;
    let positiveFlow = 0, negativeFlow = 0;
    for (let i = close.length - period; i < close.length; i++) {
        const tp = (high[i] + low[i] + close[i]) / 3;
        const prevTp = (high[i - 1] + low[i - 1] + close[i - 1]) / 3;
        const rawFlow = tp * volume[i];
        if (tp > prevTp) positiveFlow += rawFlow;
        else negativeFlow += rawFlow;
    }
    if (negativeFlow === 0) return 100;
    const mfi = 100 - (100 / (1 + positiveFlow / negativeFlow));
    return isNaN(mfi) ? 50 : mfi;
}

// ============================================================
// MACD — FIXED: Proper signal line = 9-period EMA of MACD line
// ============================================================

function calculateMACDFull(data: number[], fastP = 12, slowP = 26, signalP = 9): { line: number; signal: number; histogram: number } {
    if (data.length < slowP + signalP) return { line: 0, signal: 0, histogram: 0 };

    const emaFast = calculateEMAArray(data, fastP);
    const emaSlow = calculateEMAArray(data, slowP);

    // MACD line = fast EMA - slow EMA
    const macdLine: number[] = [];
    for (let i = 0; i < data.length; i++) {
        macdLine.push(emaFast[i] - emaSlow[i]);
    }

    // Signal line = 9-EMA of MACD line (the FIX)
    const signalLine = calculateEMAArray(macdLine, signalP);

    const lastLine = macdLine[macdLine.length - 1];
    const lastSignal = signalLine[signalLine.length - 1];

    return {
        line: lastLine,
        signal: lastSignal,
        histogram: lastLine - lastSignal
    };
}

// ============================================================
// VOLATILITY & VOLUME
// ============================================================

function calculateATR(high: number[], low: number[], close: number[], period: number = 14): number {
    if (close.length < period + 1) return 0;
    const trueRanges: number[] = [];
    for (let i = 1; i < close.length; i++) {
        const tr = Math.max(
            high[i] - low[i],
            Math.abs(high[i] - close[i - 1]),
            Math.abs(low[i] - close[i - 1])
        );
        trueRanges.push(tr);
    }
    // Wilder's smoothing
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < trueRanges.length; i++) {
        atr = (atr * (period - 1) + trueRanges[i]) / period;
    }
    return atr;
}

function calculateOBV(close: number[], volume: number[]): { obv: number; slope: number } {
    let obv = 0;
    const obvArr: number[] = [0];
    for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) obv += volume[i];
        else if (close[i] < close[i - 1]) obv -= volume[i];
        obvArr.push(obv);
    }
    // OBV slope (last 10 periods)
    const recentObv = obvArr.slice(-10);
    const slope = recentObv.length > 1 ? (recentObv[recentObv.length - 1] - recentObv[0]) / recentObv.length : 0;
    return { obv, slope };
}

// ============================================================
// ADX (Average Directional Index) — Proper Implementation
// ============================================================

function calculateADX(high: number[], low: number[], close: number[], period: number = 14): number {
    if (close.length < period * 2) return 25;

    const trueRanges: number[] = [];
    const plusDM: number[] = [];
    const minusDM: number[] = [];

    for (let i = 1; i < close.length; i++) {
        const tr = Math.max(
            high[i] - low[i],
            Math.abs(high[i] - close[i - 1]),
            Math.abs(low[i] - close[i - 1])
        );
        trueRanges.push(tr);

        const highDiff = high[i] - high[i - 1];
        const lowDiff = low[i - 1] - low[i];

        plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
        minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }

    // Wilder's smoothed averages
    let smoothTR = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothPDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothMDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

    const dxValues: number[] = [];
    for (let i = period; i < trueRanges.length; i++) {
        smoothTR = smoothTR - (smoothTR / period) + trueRanges[i];
        smoothPDM = smoothPDM - (smoothPDM / period) + plusDM[i];
        smoothMDM = smoothMDM - (smoothMDM / period) + minusDM[i];

        const pdi = smoothTR > 0 ? (smoothPDM / smoothTR) * 100 : 0;
        const mdi = smoothTR > 0 ? (smoothMDM / smoothTR) * 100 : 0;
        const diSum = pdi + mdi;
        const dx = diSum > 0 ? Math.abs(pdi - mdi) / diSum * 100 : 0;
        dxValues.push(dx);
    }

    if (dxValues.length < period) return dxValues.length > 0 ? dxValues[dxValues.length - 1] : 25;

    // ADX = smoothed average of DX
    let adx = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < dxValues.length; i++) {
        adx = (adx * (period - 1) + dxValues[i]) / period;
    }
    return isNaN(adx) ? 25 : adx;
}

// ============================================================
// ICHIMOKU CLOUD
// ============================================================

function calculateIchimoku(high: number[], low: number[], close: number[]): {
    tenkan: number; kijun: number; senkou_a: number; senkou_b: number; signal: number;
} {
    const len = close.length;
    const defaultVal = close[len - 1];

    // Tenkan-sen (Conversion Line) = (9-period high + 9-period low) / 2
    const tenkanPeriod = 9;
    const kijunPeriod = 26;
    const senkouBPeriod = 52;

    const tenkan = len >= tenkanPeriod
        ? (Math.max(...high.slice(-tenkanPeriod)) + Math.min(...low.slice(-tenkanPeriod))) / 2
        : defaultVal;

    const kijun = len >= kijunPeriod
        ? (Math.max(...high.slice(-kijunPeriod)) + Math.min(...low.slice(-kijunPeriod))) / 2
        : defaultVal;

    // Senkou Span A = (Tenkan + Kijun) / 2 (projected 26 periods ahead)
    const senkou_a = (tenkan + kijun) / 2;

    // Senkou Span B = (52-period high + 52-period low) / 2 (projected 26 periods ahead)
    const senkou_b = len >= senkouBPeriod
        ? (Math.max(...high.slice(-senkouBPeriod)) + Math.min(...low.slice(-senkouBPeriod))) / 2
        : defaultVal;

    // Signal: 1=above cloud, -1=below cloud, 0=inside cloud
    const currentPrice = close[len - 1];
    const cloudTop = Math.max(senkou_a, senkou_b);
    const cloudBottom = Math.min(senkou_a, senkou_b);

    let signal = 0;
    if (currentPrice > cloudTop) signal = 1;
    else if (currentPrice < cloudBottom) signal = -1;

    return { tenkan, kijun, senkou_a, senkou_b, signal };
}

// ============================================================
// SUPERTREND
// ============================================================

function calculateSuperTrend(high: number[], low: number[], close: number[], period: number = 10, multiplier: number = 3): {
    value: number; direction: number;
} {
    const len = close.length;
    if (len < period + 1) return { value: close[len - 1], direction: 1 };

    const atr = calculateATR(high, low, close, period);

    // Calculate basic upper and lower bands
    const hl2 = (high[len - 1] + low[len - 1]) / 2;
    const upperBand = hl2 + multiplier * atr;
    const lowerBand = hl2 - multiplier * atr;

    // Simple trend determination based on close vs bands
    const prevClose = close[len - 2];
    const currentClose = close[len - 1];

    // If price was above the band and is now below → bearish
    // Simplified: use current close relative to midpoint
    const direction = currentClose > (upperBand + lowerBand) / 2 ? 1 : -1;
    const value = direction === 1 ? lowerBand : upperBand;

    return { value, direction };
}

// ============================================================
// VWAP (Volume Weighted Average Price)
// ============================================================

function calculateVWAP(high: number[], low: number[], close: number[], volume: number[]): {
    vwap: number; deviation: number;
} {
    const len = close.length;
    // Use last 50 candles for intraday VWAP equivalent
    const lookback = Math.min(50, len);
    let cumTPV = 0;
    let cumVol = 0;

    for (let i = len - lookback; i < len; i++) {
        const tp = (high[i] + low[i] + close[i]) / 3;
        cumTPV += tp * volume[i];
        cumVol += volume[i];
    }

    const vwap = cumVol > 0 ? cumTPV / cumVol : close[len - 1];
    const currentPrice = close[len - 1];
    const deviation = currentPrice > 0 ? ((currentPrice - vwap) / currentPrice) * 100 : 0;

    return { vwap, deviation };
}

// ============================================================
// MARKET STRUCTURE — Support & Resistance
// ============================================================

function findSupportResistance(high: number[], low: number[], close: number[]): {
    support: number; resistance: number; srRatio: number;
} {
    const len = close.length;
    const currentPrice = close[len - 1];
    const lookback = Math.min(100, len);

    // Find swing highs and swing lows (5-period pivots)
    const swingHighs: number[] = [];
    const swingLows: number[] = [];

    for (let i = len - lookback + 2; i < len - 2; i++) {
        // Swing high: high[i] > neighbors
        if (high[i] > high[i - 1] && high[i] > high[i - 2] &&
            high[i] > high[i + 1] && high[i] > high[i + 2]) {
            swingHighs.push(high[i]);
        }
        // Swing low: low[i] < neighbors
        if (low[i] < low[i - 1] && low[i] < low[i - 2] &&
            low[i] < low[i + 1] && low[i] < low[i + 2]) {
            swingLows.push(low[i]);
        }
    }

    // Nearest support = highest swing low below current price
    const supports = swingLows.filter(l => l < currentPrice).sort((a, b) => b - a);
    const resistances = swingHighs.filter(h => h > currentPrice).sort((a, b) => a - b);

    const support = supports.length > 0 ? supports[0] : currentPrice * 0.97;
    const resistance = resistances.length > 0 ? resistances[0] : currentPrice * 1.03;

    // SR Ratio: 0 = at support, 1 = at resistance
    const range = resistance - support;
    const srRatio = range > 0 ? (currentPrice - support) / range : 0.5;

    return { support, resistance, srRatio: Math.max(0, Math.min(1, srRatio)) };
}

// ============================================================
// CANDLESTICK PATTERN DETECTION
// ============================================================

function detectCandlestickPatterns(
    open: number[], high: number[], low: number[], close: number[]
): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];
    const len = close.length;
    if (len < 5) return patterns;

    const avgRange = calculateATR(high, low, close, 14);

    for (let i = Math.max(3, len - 20); i < len; i++) {
        const o = open[i], h = high[i], l = low[i], c = close[i];
        const body = Math.abs(c - o);
        const upperWick = h - Math.max(o, c);
        const lowerWick = Math.min(o, c) - l;
        const totalRange = h - l;
        const isBullish = c > o;

        // ——— DOJI ———
        if (body < totalRange * 0.1 && totalRange > 0) {
            patterns.push({
                name: 'DOJI',
                type: 'neutral',
                strength: 0.6,
                position: i
            });
        }

        // ——— HAMMER (Bullish Reversal) ———
        if (lowerWick > body * 2 && upperWick < body * 0.5 && body > 0) {
            // Confirm: preceded by downtrend
            if (i >= 3 && close[i - 1] < close[i - 3]) {
                patterns.push({
                    name: 'HAMMER',
                    type: 'bullish',
                    strength: 0.75,
                    position: i
                });
            }
        }

        // ——— INVERTED HAMMER ———
        if (upperWick > body * 2 && lowerWick < body * 0.5 && body > 0) {
            if (i >= 3 && close[i - 1] < close[i - 3]) {
                patterns.push({
                    name: 'INVERTED_HAMMER',
                    type: 'bullish',
                    strength: 0.6,
                    position: i
                });
            }
        }

        // ——— SHOOTING STAR (Bearish Reversal) ———
        if (upperWick > body * 2 && lowerWick < body * 0.5 && body > 0) {
            if (i >= 3 && close[i - 1] > close[i - 3]) {
                patterns.push({
                    name: 'SHOOTING_STAR',
                    type: 'bearish',
                    strength: 0.7,
                    position: i
                });
            }
        }

        // ——— BULLISH ENGULFING ———
        if (i >= 1 && isBullish && close[i - 1] < open[i - 1]) {
            if (o < close[i - 1] && c > open[i - 1]) {
                patterns.push({
                    name: 'BULLISH_ENGULFING',
                    type: 'bullish',
                    strength: 0.85,
                    position: i
                });
            }
        }

        // ——— BEARISH ENGULFING ———
        if (i >= 1 && !isBullish && close[i - 1] > open[i - 1]) {
            if (o > close[i - 1] && c < open[i - 1]) {
                patterns.push({
                    name: 'BEARISH_ENGULFING',
                    type: 'bearish',
                    strength: 0.85,
                    position: i
                });
            }
        }

        // ——— MORNING STAR (3-candle bullish reversal) ———
        if (i >= 2) {
            const prev2Body = Math.abs(close[i - 2] - open[i - 2]);
            const prev1Body = Math.abs(close[i - 1] - open[i - 1]);
            // Day 1: large bearish, Day 2: small body, Day 3: large bullish
            if (close[i - 2] < open[i - 2] && prev2Body > avgRange * 0.5 &&
                prev1Body < avgRange * 0.3 &&
                isBullish && body > avgRange * 0.5) {
                patterns.push({
                    name: 'MORNING_STAR',
                    type: 'bullish',
                    strength: 0.9,
                    position: i
                });
            }
        }

        // ——— EVENING STAR (3-candle bearish reversal) ———
        if (i >= 2) {
            const prev2Body = Math.abs(close[i - 2] - open[i - 2]);
            const prev1Body = Math.abs(close[i - 1] - open[i - 1]);
            if (close[i - 2] > open[i - 2] && prev2Body > avgRange * 0.5 &&
                prev1Body < avgRange * 0.3 &&
                !isBullish && body > avgRange * 0.5) {
                patterns.push({
                    name: 'EVENING_STAR',
                    type: 'bearish',
                    strength: 0.9,
                    position: i
                });
            }
        }

        // ——— THREE WHITE SOLDIERS ———
        if (i >= 2) {
            const allBullish = close[i] > open[i] && close[i - 1] > open[i - 1] && close[i - 2] > open[i - 2];
            const ascending = close[i] > close[i - 1] && close[i - 1] > close[i - 2];
            if (allBullish && ascending) {
                const bodies = [
                    Math.abs(close[i] - open[i]),
                    Math.abs(close[i - 1] - open[i - 1]),
                    Math.abs(close[i - 2] - open[i - 2])
                ];
                if (bodies.every(b => b > avgRange * 0.3)) {
                    patterns.push({
                        name: 'THREE_WHITE_SOLDIERS',
                        type: 'bullish',
                        strength: 0.85,
                        position: i
                    });
                }
            }
        }

        // ——— THREE BLACK CROWS ———
        if (i >= 2) {
            const allBearish = close[i] < open[i] && close[i - 1] < open[i - 1] && close[i - 2] < open[i - 2];
            const descending = close[i] < close[i - 1] && close[i - 1] < close[i - 2];
            if (allBearish && descending) {
                const bodies = [
                    Math.abs(close[i] - open[i]),
                    Math.abs(close[i - 1] - open[i - 1]),
                    Math.abs(close[i - 2] - open[i - 2])
                ];
                if (bodies.every(b => b > avgRange * 0.3)) {
                    patterns.push({
                        name: 'THREE_BLACK_CROWS',
                        type: 'bearish',
                        strength: 0.85,
                        position: i
                    });
                }
            }
        }
    }

    return patterns;
}

// ============================================================
// MAIN FEATURE EXTRACTION — Uses 400 Candles
// ============================================================

export function extractFeatures(marketData: MarketData): TechnicalFeatures {
    const { close, high, low, volume } = marketData;
    const open = marketData.open || close.map((c, i) => i > 0 ? close[i - 1] : c);
    const len = close.length;
    const currentPrice = close[len - 1];

    // ——— EMAs ———
    const ema9 = calculateEMA(close, 9);
    const ema12 = calculateEMA(close, 12);
    const ema21 = calculateEMA(close, 21);
    const ema50 = calculateEMA(close, 50);
    const ema200 = calculateEMA(close, 200);

    // ——— Bollinger Bands ———
    const bb_middle = calculateSMA(close, 20);
    const bb_std = calculateStdDev(close, 20);
    const bb_upper = bb_middle + (2 * bb_std);
    const bb_lower = bb_middle - (2 * bb_std);
    const bb_width = bb_middle > 0 ? (bb_upper - bb_lower) / bb_middle : 0;
    const bbRange = bb_upper - bb_lower;
    const bb_position = bbRange > 0 ? (currentPrice - bb_lower) / bbRange : 0.5;

    // ——— Momentum ———
    const rsi14 = calculateRSI(close, 14);
    const rsi21 = calculateRSI(close, 21);
    const stoch = calculateStochastic(high, low, close, 14, 3);
    const williams_r = calculateWilliamsR(high, low, close, 14);
    const cci = calculateCCI(high, low, close, 20);
    const mfi = calculateMFI(high, low, close, volume, 14);

    // ——— MACD (FIXED) ———
    const macd = calculateMACDFull(close, 12, 26, 9);

    // ——— Volatility ———
    const atr14 = calculateATR(high, low, close, 14);
    const atr21 = calculateATR(high, low, close, 21);
    const volatility20 = bb_middle > 0 ? calculateStdDev(close, 20) / bb_middle * 100 : 0;
    const volatility50 = bb_middle > 0 ? calculateStdDev(close, 50) / bb_middle * 100 : 0;

    // ——— Volume ———
    const volume_sma = calculateSMA(volume, 20);
    const volume_ratio = volume_sma > 0 ? volume[len - 1] / volume_sma : 1;
    const obvResult = calculateOBV(close, volume);

    // ——— Trend ———
    const adx = calculateADX(high, low, close, 14);
    const trend_strength = ema50 > 0 ? (ema12 - ema50) / ema50 * 100 : 0;

    // ——— Ichimoku Cloud ———
    const ichimoku = calculateIchimoku(high, low, close);

    // ——— SuperTrend ———
    const superTrend = calculateSuperTrend(high, low, close, 10, 3);

    // ——— VWAP ———
    const vwapResult = calculateVWAP(high, low, close, volume);

    // ——— Market Structure ———
    const sr = findSupportResistance(high, low, close);

    // ——— Candlestick Patterns ———
    const candlestickPatterns = detectCandlestickPatterns(open, high, low, close);

    // Score recent patterns (last 5 candles weighted higher)
    let bullishScore = 0, bearishScore = 0;
    for (const p of candlestickPatterns) {
        const recency = Math.max(0, 1 - (len - 1 - p.position) / 10); // decay over 10 candles
        const weight = p.strength * recency;
        if (p.type === 'bullish') bullishScore += weight;
        else if (p.type === 'bearish') bearishScore += weight;
    }

    // ——— Price Patterns ———
    const recentHighs = high.slice(-10);
    const recentLows = low.slice(-10);
    const higher_highs = recentHighs[recentHighs.length - 1] > recentHighs[0] ? 1 : 0;
    const higher_lows = recentLows[recentLows.length - 1] > recentLows[0] ? 1 : 0;

    const price_momentum_1h = len > 15 ? (close[len - 1] - close[len - 15]) / close[len - 15] * 100 : 0;
    const price_momentum_4h = len > 60 ? (close[len - 1] - close[len - 60]) / close[len - 60] * 100 : 0;
    const price_momentum_1d = len > 240 ? (close[len - 1] - close[len - 240]) / close[len - 240] * 100 : 0;

    return {
        ema9, ema12, ema21, ema50, ema200,
        bb_upper, bb_middle, bb_lower, bb_width, bb_position,
        rsi14, rsi21,
        stoch_k: stoch.k,
        stoch_d: stoch.d,
        williams_r, cci, mfi,
        macd_line: macd.line,
        macd_signal: macd.signal,
        macd_histogram: macd.histogram,
        atr14, atr21, volatility20, volatility50,
        volume_sma, volume_ratio,
        obv: obvResult.obv,
        obv_slope: obvResult.slope,
        adx, trend_strength,
        ichimoku_tenkan: ichimoku.tenkan,
        ichimoku_kijun: ichimoku.kijun,
        ichimoku_senkou_a: ichimoku.senkou_a,
        ichimoku_senkou_b: ichimoku.senkou_b,
        ichimoku_signal: ichimoku.signal,
        supertrend: superTrend.value,
        supertrend_direction: superTrend.direction,
        vwap: vwapResult.vwap,
        vwap_deviation: vwapResult.deviation,
        higher_highs, higher_lows,
        price_momentum_1h, price_momentum_4h, price_momentum_1d,
        nearest_support: sr.support,
        nearest_resistance: sr.resistance,
        sr_distance_ratio: sr.srRatio,
        candlestick_patterns: candlestickPatterns,
        candlestick_bullish_score: bullishScore,
        candlestick_bearish_score: bearishScore
    };
}
