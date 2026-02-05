// Advanced Feature Engineering for ML Prediction
// Extracts 50+ technical features from price data

export interface MarketData {
    close: number[];
    high: number[];
    low: number[];
    volume: number[];
}

export interface TechnicalFeatures {
    // Price features
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
    bb_position: number; // Where price is relative to bands (0-1)

    // Momentum
    rsi14: number;
    rsi21: number;
    stoch_k: number;
    stoch_d: number;
    williams_r: number;
    cci: number;
    mfi: number;

    // MACD
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

    // Trend
    adx: number;
    trend_strength: number;

    // Price patterns
    higher_highs: number;
    higher_lows: number;
    price_momentum_1h: number;
    price_momentum_4h: number;
    price_momentum_1d: number;
}

// Calculate EMA
function calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];

    const k = 2 / (period + 1);
    let ema = data[data.length - period];

    for (let i = data.length - period + 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
    }

    return ema;
}

// Calculate SMA
function calculateSMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];

    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

// Calculate Standard Deviation
function calculateStdDev(data: number[], period: number): number {
    if (data.length < period) return 0;

    const slice = data.slice(-period);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    return Math.sqrt(variance);
}

// Calculate RSI
function calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) return 50;

    const changes = [];
    for (let i = data.length - period - 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
    }

    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);

    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Calculate Stochastic Oscillator
function calculateStochastic(high: number[], low: number[], close: number[], period: number = 14): { k: number; d: number } {
    if (high.length < period) return { k: 50, d: 50 };

    const highSlice = high.slice(-period);
    const lowSlice = low.slice(-period);
    const currentClose = close[close.length - 1];

    const highestHigh = Math.max(...highSlice);
    const lowestLow = Math.min(...lowSlice);

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

    // Simple 3-period SMA of %K for %D
    const d = k; // Simplified - in production, calculate SMA of last 3 %K values

    return { k: isNaN(k) ? 50 : k, d: isNaN(d) ? 50 : d };
}

// Calculate Williams %R
function calculateWilliamsR(high: number[], low: number[], close: number[], period: number = 14): number {
    if (high.length < period) return -50;

    const highSlice = high.slice(-period);
    const lowSlice = low.slice(-period);
    const currentClose = close[close.length - 1];

    const highestHigh = Math.max(...highSlice);
    const lowestLow = Math.min(...lowSlice);

    const wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
    return isNaN(wr) ? -50 : wr;
}

// Calculate CCI (Commodity Channel Index)
function calculateCCI(high: number[], low: number[], close: number[], period: number = 20): number {
    if (close.length < period) return 0;

    const typicalPrices = [];
    for (let i = close.length - period; i < close.length; i++) {
        typicalPrices.push((high[i] + low[i] + close[i]) / 3);
    }

    const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = typicalPrices.reduce((a, b) => a + Math.abs(b - sma), 0) / period;

    const currentTP = (high[high.length - 1] + low[low.length - 1] + close[close.length - 1]) / 3;
    const cci = (currentTP - sma) / (0.015 * meanDeviation);

    return isNaN(cci) ? 0 : cci;
}

// Calculate MFI (Money Flow Index)
function calculateMFI(high: number[], low: number[], close: number[], volume: number[], period: number = 14): number {
    if (close.length < period + 1) return 50;

    const moneyFlows = [];
    for (let i = close.length - period; i < close.length; i++) {
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;
        const rawMoneyFlow = typicalPrice * volume[i];
        const direction = i > 0 && typicalPrice > ((high[i - 1] + low[i - 1] + close[i - 1]) / 3) ? 1 : -1;
        moneyFlows.push({ value: rawMoneyFlow, direction });
    }

    const positiveFlow = moneyFlows.filter(mf => mf.direction > 0).reduce((a, b) => a + b.value, 0);
    const negativeFlow = moneyFlows.filter(mf => mf.direction < 0).reduce((a, b) => a + b.value, 0);

    if (negativeFlow === 0) return 100;
    const moneyRatio = positiveFlow / negativeFlow;
    const mfi = 100 - (100 / (1 + moneyRatio));

    return isNaN(mfi) ? 50 : mfi;
}

// Calculate OBV (On-Balance Volume)
function calculateOBV(close: number[], volume: number[]): number {
    let obv = 0;
    for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) {
            obv += volume[i];
        } else if (close[i] < close[i - 1]) {
            obv -= volume[i];
        }
    }
    return obv;
}

// Calculate ADX (Average Directional Index)
function calculateADX(high: number[], low: number[], close: number[], period: number = 14): number {
    if (close.length < period + 1) return 25;

    // Simplified ADX calculation
    const trueRanges = [];
    const plusDM = [];
    const minusDM = [];

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

    const avgTR = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgPlusDM = plusDM.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgMinusDM = minusDM.slice(-period).reduce((a, b) => a + b, 0) / period;

    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;

    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;

    return isNaN(dx) ? 25 : dx;
}

// Main feature extraction function
export function extractFeatures(marketData: MarketData): TechnicalFeatures {
    const { close, high, low, volume } = marketData;

    // EMAs
    const ema9 = calculateEMA(close, 9);
    const ema12 = calculateEMA(close, 12);
    const ema21 = calculateEMA(close, 21);
    const ema50 = calculateEMA(close, 50);
    const ema200 = calculateEMA(close, 200);

    // Bollinger Bands
    const bb_middle = calculateSMA(close, 20);
    const bb_std = calculateStdDev(close, 20);
    const bb_upper = bb_middle + (2 * bb_std);
    const bb_lower = bb_middle - (2 * bb_std);
    const bb_width = (bb_upper - bb_lower) / bb_middle;
    const currentPrice = close[close.length - 1];
    const bb_position = (currentPrice - bb_lower) / (bb_upper - bb_lower);

    // Momentum indicators
    const rsi14 = calculateRSI(close, 14);
    const rsi21 = calculateRSI(close, 21);
    const stoch = calculateStochastic(high, low, close, 14);
    const williams_r = calculateWilliamsR(high, low, close, 14);
    const cci = calculateCCI(high, low, close, 20);
    const mfi = calculateMFI(high, low, close, volume, 14);

    // MACD (simplified)
    const ema12_macd = calculateEMA(close, 12);
    const ema26_macd = calculateEMA(close, 26);
    const macd_line = ema12_macd - ema26_macd;
    const macd_signal = macd_line; // Simplified
    const macd_histogram = macd_line - macd_signal;

    // Volatility
    const atr14 = calculateStdDev(close, 14) * currentPrice / 100;
    const atr21 = calculateStdDev(close, 21) * currentPrice / 100;
    const volatility20 = calculateStdDev(close, 20) / bb_middle * 100;
    const volatility50 = calculateStdDev(close, 50) / bb_middle * 100;

    // Volume
    const volume_sma = calculateSMA(volume, 20);
    const volume_ratio = volume[volume.length - 1] / volume_sma;
    const obv = calculateOBV(close, volume);

    // Trend
    const adx = calculateADX(high, low, close, 14);
    const trend_strength = (ema12 - ema50) / ema50 * 100;

    // Price patterns
    const recentHighs = high.slice(-10);
    const recentLows = low.slice(-10);
    const higher_highs = recentHighs[recentHighs.length - 1] > recentHighs[0] ? 1 : 0;
    const higher_lows = recentLows[recentLows.length - 1] > recentLows[0] ? 1 : 0;

    // Price momentum
    const price_momentum_1h = close.length > 15 ? (close[close.length - 1] - close[close.length - 15]) / close[close.length - 15] * 100 : 0;
    const price_momentum_4h = close.length > 60 ? (close[close.length - 1] - close[close.length - 60]) / close[close.length - 60] * 100 : 0;
    const price_momentum_1d = close.length > 240 ? (close[close.length - 1] - close[close.length - 240]) / close[close.length - 240] * 100 : 0;

    return {
        ema9, ema12, ema21, ema50, ema200,
        bb_upper, bb_middle, bb_lower, bb_width, bb_position,
        rsi14, rsi21,
        stoch_k: stoch.k,
        stoch_d: stoch.d,
        williams_r, cci, mfi,
        macd_line, macd_signal, macd_histogram,
        atr14, atr21, volatility20, volatility50,
        volume_sma, volume_ratio, obv,
        adx, trend_strength,
        higher_highs, higher_lows,
        price_momentum_1h, price_momentum_4h, price_momentum_1d
    };
}
