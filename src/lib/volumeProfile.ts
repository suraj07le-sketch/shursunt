/**
 * Volume Profile & OBV Divergence Analyzer
 * Detects:
 * - Volume spike on support (institutional buying = high accuracy BUY)
 * - OBV divergence (price up but OBV down = fake move = SELL warning)
 * - Volume confirmation of trend
 */

export interface VolumeAnalysis {
    direction: number;      // -1 to +1
    confidence: number;     // 0-100
    signal: 'VOLUME_SPIKE_SUPPORT' | 'OBV_BULL_DIVERGENCE' | 'OBV_BEAR_DIVERGENCE' | 'CONFIRMED_TREND' | 'WEAK_VOLUME' | 'NEUTRAL';
    detail: string;
    obvTrend: 'UP' | 'DOWN' | 'FLAT';
}

/** Calculate On-Balance Volume */
function calculateOBV(close: number[], volume: number[]): number[] {
    const obv: number[] = [0];
    for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) obv.push(obv[i - 1] + volume[i]);
        else if (close[i] < close[i - 1]) obv.push(obv[i - 1] - volume[i]);
        else obv.push(obv[i - 1]);
    }
    return obv;
}

/** Linear regression slope (positive = uptrend) */
function slope(data: number[]): number {
    const n = data.length;
    if (n < 2) return 0;
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (i - xMean) * (data[i] - yMean);
        den += (i - xMean) ** 2;
    }
    return den === 0 ? 0 : num / den;
}

export function analyzeVolume(
    close: number[],
    high: number[],
    low: number[],
    volume: number[],
    nearestSupport: number,
    atr: number
): VolumeAnalysis {
    if (close.length < 30 || volume.length < 30) {
        return { direction: 0, confidence: 30, signal: 'NEUTRAL', detail: 'Insufficient data', obvTrend: 'FLAT' };
    }

    const lookback = Math.min(close.length, 50);
    const recentClose = close.slice(-lookback);
    const recentVol = volume.slice(-lookback);
    const recentLow = low.slice(-lookback);

    const obv = calculateOBV(recentClose, recentVol);
    const current = recentClose[recentClose.length - 1];

    // --- OBV Trend (last 14 periods) ---
    const obvSlice = obv.slice(-14);
    const priceSlice = recentClose.slice(-14);
    const obvSlope = slope(obvSlice);
    const priceSlope = slope(priceSlice);
    const avgVol = recentVol.slice(-20).reduce((a, b) => a + b) / 20;
    const currVol = recentVol[recentVol.length - 1];
    const volRatio = avgVol > 0 ? currVol / avgVol : 1;

    const obvTrend: VolumeAnalysis['obvTrend'] = obvSlope > 0 ? 'UP' : obvSlope < 0 ? 'DOWN' : 'FLAT';

    // --- 1. OBV Bullish Divergence: price falling but OBV rising (hidden demand) ---
    if (priceSlope < -0.001 && obvSlope > 0) {
        return {
            direction: 0.75,
            confidence: 72,
            signal: 'OBV_BULL_DIVERGENCE',
            detail: `OBV rising while price fell — hidden buying pressure detected`,
            obvTrend
        };
    }

    // --- 2. OBV Bearish Divergence: price rising but OBV falling (fake rally) ---
    if (priceSlope > 0.001 && obvSlope < 0) {
        return {
            direction: -0.7,
            confidence: 70,
            signal: 'OBV_BEAR_DIVERGENCE',
            detail: `OBV falling while price rose — distribution/fake rally detected`,
            obvTrend
        };
    }

    // --- 3. Volume Spike on Support (institutional buying) ---
    const nearSupport = Math.abs(current - nearestSupport) < atr * 1.5;
    const isVolumeSpike = volRatio > 2.0; // Volume is 2x average
    const lastCandleBullish = recentClose[recentClose.length - 1] > recentClose[recentClose.length - 2];

    if (nearSupport && isVolumeSpike && lastCandleBullish) {
        return {
            direction: 1.0,
            confidence: 85,
            signal: 'VOLUME_SPIKE_SUPPORT',
            detail: `Volume ${volRatio.toFixed(1)}x above average at support — institutional buying detected`,
            obvTrend
        };
    }

    // --- 4. Volume confirming trend ---
    if (priceSlope > 0 && obvSlope > 0 && volRatio > 1.2) {
        return {
            direction: 0.5,
            confidence: 60,
            signal: 'CONFIRMED_TREND',
            detail: `Rising price confirmed by rising OBV and above-avg volume (${volRatio.toFixed(1)}x)`,
            obvTrend
        };
    }

    if (priceSlope < 0 && obvSlope < 0 && volRatio > 1.2) {
        return {
            direction: -0.5,
            confidence: 60,
            signal: 'CONFIRMED_TREND',
            detail: `Falling price confirmed by falling OBV and above-avg volume (${volRatio.toFixed(1)}x)`,
            obvTrend
        };
    }

    // --- 5. Weak volume (no conviction) ---
    if (volRatio < 0.6) {
        return {
            direction: 0,
            confidence: 35,
            signal: 'WEAK_VOLUME',
            detail: `Volume ${volRatio.toFixed(1)}x below average — move has no conviction`,
            obvTrend
        };
    }

    return {
        direction: priceSlope > 0 ? 0.2 : priceSlope < 0 ? -0.2 : 0,
        confidence: 45,
        signal: 'NEUTRAL',
        detail: `OBV ${obvTrend}, volume ratio: ${volRatio.toFixed(1)}x`,
        obvTrend
    };
}
