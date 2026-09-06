/**
 * Evidence-based market-intelligence core.
 *
 * This module deliberately does not manufacture candles, prices, confidence,
 * or model performance. It trains on completed OHLCV candles only and evaluates
 * the model with expanding, time-ordered validation windows before emitting a
 * directional signal. It is research tooling, not investment advice.
 */

export type AssetType = 'crypto' | 'stock';

export interface OHLCVBar {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime?: number;
}

export interface OptionalVisualSignal {
    direction: number;
    confidence: number;
    patterns: string[];
}

export interface OptionalSentimentSignal {
    score: number;
    confidence: number;
    label: string;
    source: string;
    articleCount: number;
}

export interface EvidencePredictionInput {
    asset: string;
    assetType: AssetType;
    timeframe: string;
    source: string;
    candles: OHLCVBar[];
    visual?: OptionalVisualSignal | null;
    sentiment?: OptionalSentimentSignal | null;
}

type TrainingSample = { x: number[]; y: number };

type FittedLogit = {
    means: number[];
    scales: number[];
    weights: number[];
};

const MIN_HISTORY_BARS = 260;
const FEATURE_LOOKBACK = 60;
const EPSILON = 1e-12;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function average(values: number[]): number {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function deviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = average(values);
    return Math.sqrt(average(values.map(value => (value - mean) ** 2)));
}

function sigmoid(value: number): number {
    if (value >= 0) {
        const z = Math.exp(-value);
        return 1 / (1 + z);
    }
    const z = Math.exp(value);
    return z / (1 + z);
}

function emaAt(values: number[], end: number, period: number): number {
    const start = Math.max(0, end - period * 5);
    const multiplier = 2 / (period + 1);
    let ema = values[start];
    for (let index = start + 1; index <= end; index++) {
        ema = values[index] * multiplier + ema * (1 - multiplier);
    }
    return ema;
}

function rsiAt(closes: number[], end: number, period = 14): number {
    let gains = 0;
    let losses = 0;
    for (let index = end - period + 1; index <= end; index++) {
        const change = closes[index] - closes[index - 1];
        if (change >= 0) gains += change;
        else losses -= change;
    }
    if (losses < EPSILON) return 100;
    const relativeStrength = gains / losses;
    return 100 - 100 / (1 + relativeStrength);
}

function atrAt(candles: OHLCVBar[], end: number, period = 14): number {
    const ranges: number[] = [];
    for (let index = end - period + 1; index <= end; index++) {
        const current = candles[index];
        const previousClose = candles[index - 1].close;
        ranges.push(Math.max(
            current.high - current.low,
            Math.abs(current.high - previousClose),
            Math.abs(current.low - previousClose),
        ));
    }
    return average(ranges);
}

function buildFeatureVector(candles: OHLCVBar[], end: number): number[] {
    const closes = candles.map(candle => candle.close);
    const current = candles[end];
    const returns20: number[] = [];
    const trueRanges: number[] = [];
    const volumes: number[] = [];

    for (let index = end - 19; index <= end; index++) {
        returns20.push(Math.log(closes[index] / closes[index - 1]));
        volumes.push(candles[index].volume);
    }
    for (let index = end - 13; index <= end; index++) {
        const candle = candles[index];
        const previousClose = candles[index - 1].close;
        trueRanges.push(Math.max(
            candle.high - candle.low,
            Math.abs(candle.high - previousClose),
            Math.abs(candle.low - previousClose),
        ));
    }

    const highs20 = candles.slice(end - 19, end + 1).map(candle => candle.high);
    const lows20 = candles.slice(end - 19, end + 1).map(candle => candle.low);
    const high20 = Math.max(...highs20);
    const low20 = Math.min(...lows20);
    const candleRange = Math.max(current.high - current.low, current.close * 1e-8);
    const upperWick = current.high - Math.max(current.open, current.close);
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const ema12 = emaAt(closes, end, 12);
    const ema26 = emaAt(closes, end, 26);
    const ema50 = emaAt(closes, end, 50);

    return [
        Math.log(current.close / closes[end - 1]),
        Math.log(current.close / closes[end - 5]),
        Math.log(current.close / closes[end - 20]),
        (rsiAt(closes, end) - 50) / 50,
        (ema12 - ema26) / Math.max(current.close, EPSILON),
        (current.close - ema50) / Math.max(current.close, EPSILON),
        deviation(returns20),
        average(trueRanges) / Math.max(current.close, EPSILON),
        (current.volume / Math.max(average(volumes), EPSILON)) - 1,
        ((current.close - low20) / Math.max(high20 - low20, EPSILON)) - 0.5,
        (current.close - current.open) / candleRange,
        (lowerWick - upperWick) / candleRange,
    ];
}

function validCandle(candle: OHLCVBar): boolean {
    return [candle.open, candle.high, candle.low, candle.close, candle.volume]
        .every(value => Number.isFinite(value))
        && candle.open > 0
        && candle.high > 0
        && candle.low > 0
        && candle.close > 0
        && candle.volume >= 0
        && candle.high >= candle.low;
}

function cleanCandles(candles: OHLCVBar[]): OHLCVBar[] {
    const now = Date.now();
    return candles
        .filter(validCandle)
        .filter(candle => !candle.closeTime || candle.closeTime <= now)
        .sort((a, b) => (a.closeTime || 0) - (b.closeTime || 0));
}

function buildSamples(candles: OHLCVBar[]): TrainingSample[] {
    const samples: TrainingSample[] = [];
    for (let index = FEATURE_LOOKBACK; index < candles.length - 1; index++) {
        const nextReturn = Math.log(candles[index + 1].close / candles[index].close);
        samples.push({
            x: buildFeatureVector(candles, index),
            y: nextReturn > 0 ? 1 : 0,
        });
    }
    return samples;
}

function fitLogisticRegression(samples: TrainingSample[]): FittedLogit {
    const dimensions = samples[0].x.length;
    const means = Array.from({ length: dimensions }, (_, feature) => average(samples.map(sample => sample.x[feature])));
    const scales = Array.from({ length: dimensions }, (_, feature) => Math.max(
        deviation(samples.map(sample => sample.x[feature])),
        1e-6,
    ));
    const weights = new Array(dimensions + 1).fill(0);
    const l2 = 0.015;

    for (let iteration = 0; iteration < 360; iteration++) {
        const gradient = new Array(dimensions + 1).fill(0);
        for (const sample of samples) {
            let score = weights[0];
            for (let feature = 0; feature < dimensions; feature++) {
                score += weights[feature + 1] * ((sample.x[feature] - means[feature]) / scales[feature]);
            }
            const error = sigmoid(score) - sample.y;
            gradient[0] += error;
            for (let feature = 0; feature < dimensions; feature++) {
                gradient[feature + 1] += error * ((sample.x[feature] - means[feature]) / scales[feature]);
            }
        }
        const learningRate = 0.09 / Math.sqrt(1 + iteration * 0.02);
        for (let weight = 0; weight < weights.length; weight++) {
            const regularization = weight === 0 ? 0 : l2 * weights[weight];
            weights[weight] -= learningRate * ((gradient[weight] / samples.length) + regularization);
        }
    }

    return { means, scales, weights };
}

function probability(model: FittedLogit, features: number[]): number {
    let score = model.weights[0];
    for (let feature = 0; feature < features.length; feature++) {
        score += model.weights[feature + 1] * ((features[feature] - model.means[feature]) / model.scales[feature]);
    }
    return sigmoid(score);
}

function walkForwardValidate(samples: TrainingSample[]) {
    const firstTest = Math.floor(samples.length * 0.6);
    const foldSize = Math.floor((samples.length - firstTest) / 4);
    const probabilities: number[] = [];
    const labels: number[] = [];
    let folds = 0;

    for (let fold = 0; fold < 4; fold++) {
        const testStart = firstTest + fold * foldSize;
        const testEnd = fold === 3 ? samples.length : Math.min(samples.length, testStart + foldSize);
        const training = samples.slice(0, testStart - 1); // one-bar embargo between train and test
        const testing = samples.slice(testStart, testEnd);
        if (training.length < 120 || testing.length < 12) continue;

        const model = fitLogisticRegression(training);
        for (const sample of testing) {
            probabilities.push(probability(model, sample.x));
            labels.push(sample.y);
        }
        folds++;
    }

    const correct = probabilities.filter((value, index) => (value >= 0.5 ? 1 : 0) === labels[index]).length;
    const accuracy = labels.length ? correct / labels.length : 0;
    const positiveRate = average(labels);
    const baselineAccuracy = Math.max(positiveRate, 1 - positiveRate);
    const brierScore = labels.length
        ? average(probabilities.map((value, index) => (value - labels[index]) ** 2))
        : 1;

    return { accuracy, baselineAccuracy, brierScore, folds, testSamples: labels.length };
}

function timeframeMs(timeframe: string): number {
    const match = /^(\d+)(m|h|d|w)$/i.exec(timeframe.trim());
    if (!match) return 4 * 60 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    if (unit === 'd') return value * 24 * 60 * 60 * 1000;
    return value * 7 * 24 * 60 * 60 * 1000;
}

export function generateEvidenceBasedPrediction(input: EvidencePredictionInput) {
    const candles = cleanCandles(input.candles);
    if (candles.length < MIN_HISTORY_BARS) {
        return {
            success: false,
            error: `Insufficient completed real OHLCV history for ${input.asset}. Need ${MIN_HISTORY_BARS} bars, received ${candles.length}.`,
        };
    }

    const samples = buildSamples(candles);
    if (samples.length < 180) {
        return { success: false, error: `Insufficient post-lookback training samples for ${input.asset}.` };
    }

    const validation = walkForwardValidate(samples);
    if (validation.testSamples < 48 || validation.folds < 3) {
        return { success: false, error: `Insufficient walk-forward validation samples for ${input.asset}.` };
    }

    const finalModel = fitLogisticRegression(samples);
    const latestFeatures = buildFeatureVector(candles, candles.length - 1);
    const rawUpProbability = probability(finalModel, latestFeatures);
    const validationSkill = validation.accuracy - validation.baselineAccuracy;
    const reliability = clamp((validationSkill + 0.01) / 0.1, 0, 1);
    const calibratedUpProbability = clamp(0.5 + (rawUpProbability - 0.5) * reliability, 0.35, 0.65);
    const isReliable = validation.accuracy >= validation.baselineAccuracy + 0.015
        && validation.accuracy >= 0.52
        && validation.brierScore <= 0.255;

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (isReliable && calibratedUpProbability >= 0.55) signal = 'BUY';
    if (isReliable && calibratedUpProbability <= 0.45) signal = 'SELL';

    const current = candles[candles.length - 1];
    const closes = candles.map(candle => candle.close);
    const atr = atrAt(candles, candles.length - 1);
    const realizedVolatility = deviation(closes.slice(-21).map((close, index, values) =>
        index === 0 ? 0 : Math.log(close / values[index - 1]),
    ).slice(1));
    const atrRatio = atr / current.close;
    const moveRatio = Math.min(Math.max(atrRatio * 0.8, realizedVolatility * 1.25), 0.12);
    const direction = signal === 'BUY' ? 1 : signal === 'SELL' ? -1 : 0;
    const predictedPrice = current.close * Math.exp(direction * moveRatio);
    const confidence = clamp(
        validation.accuracy * 100 + Math.abs(calibratedUpProbability - 0.5) * 20,
        50,
        75,
    );
    const stopLoss = signal === 'BUY'
        ? current.close - atr * 1.5
        : signal === 'SELL'
            ? current.close + atr * 1.5
            : current.close;
    const takeProfit = signal === 'BUY'
        ? current.close + atr * 2.5
        : signal === 'SELL'
            ? current.close - atr * 2.5
            : current.close;
    const trend = (emaAt(closes, closes.length - 1, 12) - emaAt(closes, closes.length - 1, 50)) / current.close;
    const marketRegime = realizedVolatility > 0.04
        ? 'HIGH_VOLATILITY'
        : Math.abs(trend) > 0.01
            ? 'TRENDING'
            : 'RANGING';
    const now = new Date();
    const validTill = new Date(now.getTime() + timeframeMs(input.timeframe));
    const usableSentiment = input.sentiment && input.sentiment.source !== 'fallback' && input.sentiment.source !== 'timeout'
        ? input.sentiment
        : null;

    return {
        success: true,
        asset: input.asset,
        type: input.assetType,
        timeframe: input.timeframe,
        current_price: current.close,
        predicted_price: predictedPrice,
        prediction_change_percent: ((predictedPrice - current.close) / current.close) * 100,
        signal,
        confidence,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        risk_reward_ratio: signal === 'HOLD' ? 0 : 2.5 / 1.5,
        market_regime: marketRegime,
        prediction_time: now.toISOString(),
        predicted_time: validTill.toISOString(),
        confluence: isReliable ? 'WALK_FORWARD_VALIDATED_ML' : 'NO_VALIDATED_EDGE',
        mtf_status: 'single_timeframe_validated',
        models: {
            logistic_walk_forward: {
                direction_probability_up: calibratedUpProbability,
                raw_probability_up: rawUpProbability,
                oos_accuracy: validation.accuracy,
                baseline_accuracy: validation.baselineAccuracy,
                validation_skill: validationSkill,
                brier_score: validation.brierScore,
                folds: validation.folds,
                test_samples: validation.testSamples,
                training_samples: samples.length,
                reliable: isReliable,
            },
            opencv_visual: input.visual
                ? { direction: input.visual.direction, confidence: input.visual.confidence, patterns: input.visual.patterns, status: 'supplementary_only' }
                : { status: 'not_configured' },
            sentiment: usableSentiment
                ? { ...usableSentiment, status: 'observed_not_used_for_confidence' }
                : { status: 'unavailable_not_used' },
        },
        indicators: {
            rsi14: rsiAt(closes, closes.length - 1),
            atr,
            atr_ratio: atrRatio,
            realized_volatility: realizedVolatility,
            ema_trend: trend,
        },
        patterns: input.visual?.patterns || [],
        visual_patterns: input.visual?.patterns || [],
        data_quality: {
            source: input.source,
            completed_bars: candles.length,
            latest_candle_close: current.closeTime ? new Date(current.closeTime).toISOString() : null,
            synthetic_data_used: false,
        },
        disclaimer: 'Research signal only. Historical validation does not guarantee future performance.',
    };
}
