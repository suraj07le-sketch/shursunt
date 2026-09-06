// =====================================================
// CHART PATTERN CNN — TensorFlow.js Conv2D
// Renders candlestick charts as images, classifies patterns
// =====================================================

import * as tf from '@tensorflow/tfjs';

const IMG_SIZE = 64;
const CANDLE_WINDOW = 60;
const NUM_CLASSES = 5; // Uptrend, Downtrend, Consolidation, Reversal-Up, Reversal-Down

const PATTERN_LABELS = ['UPTREND', 'DOWNTREND', 'CONSOLIDATION', 'REVERSAL_UP', 'REVERSAL_DOWN'];

declare global {
    var cnnModelCache: { model: tf.LayersModel; timestamp: number } | null;
}
if (!global.cnnModelCache) {
    global.cnnModelCache = null;
}
const CNN_CACHE_TTL = 30 * 60 * 1000; // 30 min

// ============================================================
// RENDER CANDLESTICK CHART AS IMAGE TENSOR
// ============================================================

function renderCandlestickImage(
    open: number[], high: number[], low: number[], close: number[],
    width: number = IMG_SIZE, height: number = IMG_SIZE
): number[][] {
    const len = close.length;
    if (len === 0) return Array(height).fill(null).map(() => Array(width).fill(0));

    // Normalize prices to [0, height-1]
    const allPrices = [...high, ...low];
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP || 1;

    const normalize = (p: number) => Math.floor((1 - (p - minP) / range) * (height - 1));

    // Create image
    const img: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));

    const candleWidth = Math.max(1, Math.floor(width / len));

    for (let i = 0; i < len; i++) {
        const x = Math.floor((i / len) * width);
        const oY = normalize(open[i]);
        const cY = normalize(close[i]);
        const hY = normalize(high[i]);
        const lY = normalize(low[i]);

        const isBullish = close[i] > open[i];
        const bodyTop = Math.min(oY, cY);
        const bodyBottom = Math.max(oY, cY);

        // Draw wick (thin line from high to low)
        for (let y = hY; y <= lY && y < height; y++) {
            if (x < width) img[y][x] = isBullish ? 0.6 : 0.4;
        }

        // Draw body (thicker)
        for (let y = bodyTop; y <= bodyBottom && y < height; y++) {
            for (let dx = 0; dx < candleWidth && (x + dx) < width; dx++) {
                img[y][x + dx] = isBullish ? 1.0 : 0.3; // Bullish=bright, Bearish=dim
            }
        }
    }

    return img;
}

// ============================================================
// BUILD CNN MODEL
// ============================================================

function buildCNNModel(): tf.LayersModel {
    const model = tf.sequential();

    // Conv Layer 1
    model.add(tf.layers.conv2d({
        inputShape: [IMG_SIZE, IMG_SIZE, 1],
        filters: 16,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Conv Layer 2
    model.add(tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    // Flatten + Dense
    model.add(tf.layers.flatten());
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: NUM_CLASSES, activation: 'softmax' }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

// ============================================================
// GENERATE TRAINING LABELS FROM PRICE DATA
// ============================================================

function labelWindow(close: number[]): number {
    const len = close.length;
    if (len < 10) return 2; // CONSOLIDATION

    const firstHalf = close.slice(0, Math.floor(len / 2));
    const secondHalf = close.slice(Math.floor(len / 2));

    const firstReturn = (firstHalf[firstHalf.length - 1] - firstHalf[0]) / firstHalf[0];
    const secondReturn = (secondHalf[secondHalf.length - 1] - secondHalf[0]) / secondHalf[0];
    const overallReturn = (close[len - 1] - close[0]) / close[0];

    // Check future direction (next candle after window)
    const threshold = 0.01; // 1% move threshold

    if (firstReturn < -threshold && secondReturn > threshold) return 3; // REVERSAL_UP
    if (firstReturn > threshold && secondReturn < -threshold) return 4; // REVERSAL_DOWN
    if (overallReturn > threshold) return 0; // UPTREND
    if (overallReturn < -threshold) return 1; // DOWNTREND
    return 2; // CONSOLIDATION
}

// ============================================================
// PREPARE TRAINING DATA
// ============================================================

function prepareImageTrainingData(
    open: number[], high: number[], low: number[], close: number[]
): { images: number[][][][]; labels: number[][] } {
    const images: number[][][][] = [];
    const labels: number[][] = [];
    const len = close.length;

    // Slide window across data
    const step = Math.max(1, Math.floor(CANDLE_WINDOW / 4));

    for (let i = CANDLE_WINDOW; i < len; i += step) {
        const wOpen = open.slice(i - CANDLE_WINDOW, i);
        const wHigh = high.slice(i - CANDLE_WINDOW, i);
        const wLow = low.slice(i - CANDLE_WINDOW, i);
        const wClose = close.slice(i - CANDLE_WINDOW, i);

        const img = renderCandlestickImage(wOpen, wHigh, wLow, wClose);
        // Add channel dimension
        images.push(img.map(row => row.map(v => [v])));

        const label = labelWindow(wClose);
        const oneHot = Array(NUM_CLASSES).fill(0);
        oneHot[label] = 1;
        labels.push(oneHot);
    }

    return { images, labels };
}

// ============================================================
// PUBLIC API
// ============================================================

export interface PatternCNNResult {
    pattern: string;
    confidence: number;
    allPatterns: { name: string; probability: number }[];
    bullishSignal: number; // -1 to 1
}

export async function classifyChartPattern(
    open: number[], high: number[], low: number[], close: number[]
): Promise<PatternCNNResult> {
    try {
        const len = close.length;
        if (len < CANDLE_WINDOW + 10) {
            return {
                pattern: 'INSUFFICIENT_DATA',
                confidence: 0,
                allPatterns: PATTERN_LABELS.map(name => ({ name, probability: 0.2 })),
                bullishSignal: 0
            };
        }

        // Check cache
        let model: tf.LayersModel;

        if (global.cnnModelCache && (Date.now() - global.cnnModelCache.timestamp) < CNN_CACHE_TTL) {
            model = global.cnnModelCache.model;
        } else {
            model = buildCNNModel();

            // Train on historical data
            const { images, labels } = prepareImageTrainingData(open, high, low, close);

            if (images.length > 20) {
                const xTensor = tf.tensor4d(images);
                const yTensor = tf.tensor2d(labels);

                await model.fit(xTensor, yTensor, {
                    epochs: 10,
                    batchSize: 16,
                    shuffle: true,
                    verbose: 0
                });

                xTensor.dispose();
                yTensor.dispose();
            }

            global.cnnModelCache = { model, timestamp: Date.now() };
        }

        // Predict on last window
        const lastOpen = open.slice(-CANDLE_WINDOW);
        const lastHigh = high.slice(-CANDLE_WINDOW);
        const lastLow = low.slice(-CANDLE_WINDOW);
        const lastClose = close.slice(-CANDLE_WINDOW);

        const img = renderCandlestickImage(lastOpen, lastHigh, lastLow, lastClose);
        const imgWithChannel = img.map(row => row.map(v => [v]));

        const inputTensor = tf.tensor4d([imgWithChannel]);
        const predTensor = model.predict(inputTensor) as tf.Tensor;
        const probabilities = await predTensor.data();

        inputTensor.dispose();
        predTensor.dispose();

        // Find top pattern
        let maxIdx = 0;
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > probabilities[maxIdx]) maxIdx = i;
        }

        const allPatterns = PATTERN_LABELS.map((name, i) => ({
            name,
            probability: Math.round(probabilities[i] * 100) / 100
        }));

        // Calculate bullish signal from pattern
        // UPTREND=bullish, REVERSAL_UP=bullish, DOWNTREND=bearish, REVERSAL_DOWN=bearish
        const bullishSignal =
            (probabilities[0] * 0.8) +  // UPTREND
            (probabilities[3] * 0.6) -   // REVERSAL_UP (bullish reversal)
            (probabilities[1] * 0.8) -   // DOWNTREND
            (probabilities[4] * 0.6);    // REVERSAL_DOWN (bearish reversal)

        return {
            pattern: PATTERN_LABELS[maxIdx],
            confidence: Math.round(probabilities[maxIdx] * 100),
            allPatterns,
            bullishSignal: Math.max(-1, Math.min(1, bullishSignal))
        };
    } catch (e) {
        console.error('[PatternCNN] Error:', e);
        return {
            pattern: 'ERROR',
            confidence: 0,
            allPatterns: PATTERN_LABELS.map(name => ({ name, probability: 0.2 })),
            bullishSignal: 0
        };
    }
}
