// LSTM-Inspired Sequence Predictor
// Simplified implementation for time series prediction

import { TechnicalFeatures } from './features';

interface SequenceState {
    hiddenState: number[];
    cellState: number[];
}

// Simplified LSTM cell
function lstmCell(
    input: number,
    prevHidden: number,
    prevCell: number,
    weights: { forget: number; input: number; output: number }
): { hidden: number; cell: number } {
    // Forget gate
    const forgetGate = 1 / (1 + Math.exp(-(weights.forget * prevCell)));

    // Input gate
    const inputGate = 1 / (1 + Math.exp(-(weights.input * input)));

    // Cell state update
    const cellCandidate = Math.tanh(input + prevHidden);
    const newCell = forgetGate * prevCell + inputGate * cellCandidate;

    // Output gate
    const outputGate = 1 / (1 + Math.exp(-(weights.output * newCell)));
    const newHidden = outputGate * Math.tanh(newCell);

    return {
        hidden: newHidden,
        cell: newCell
    };
}

// Process sequence through LSTM layers
export function sequencePrediction(priceSequence: number[]): {
    prediction: number;
    confidence: number;
    trend: string;
} {
    if (priceSequence.length < 10) {
        return { prediction: 0, confidence: 30, trend: 'NEUTRAL' };
    }

    // Normalize sequence
    const mean = priceSequence.reduce((a, b) => a + b, 0) / priceSequence.length;
    const std = Math.sqrt(
        priceSequence.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / priceSequence.length
    );
    const normalized = priceSequence.map(p => (p - mean) / (std || 1));

    // LSTM weights (simplified - in production, these would be learned)
    const weights = {
        forget: 0.5,
        input: 0.3,
        output: 0.4
    };

    // Process sequence
    let hidden = 0;
    let cell = 0;

    for (const value of normalized.slice(-20)) {
        const result = lstmCell(value, hidden, cell, weights);
        hidden = result.hidden;
        cell = result.cell;
    }

    // Final prediction based on hidden state
    const prediction = Math.tanh(hidden);

    // Calculate confidence based on sequence consistency
    const returns = [];
    for (let i = 1; i < priceSequence.length; i++) {
        returns.push((priceSequence[i] - priceSequence[i - 1]) / priceSequence[i - 1]);
    }

    const returnsMean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnsStd = Math.sqrt(
        returns.reduce((a, b) => a + Math.pow(b - returnsMean, 2), 0) / returns.length
    );

    // Lower volatility = higher confidence
    const confidence = Math.min(100, Math.max(40, 100 - (returnsStd * 1000)));

    let trend = 'NEUTRAL';
    if (prediction > 0.1) trend = 'BULLISH';
    else if (prediction < -0.1) trend = 'BEARISH';

    return {
        prediction,
        confidence,
        trend
    };
}

// Multi-horizon prediction
export function multiHorizonPrediction(priceSequence: number[]): {
    shortTerm: number;  // Next 1-4 hours
    mediumTerm: number; // Next 1-3 days
    longTerm: number;   // Next 1-2 weeks
    consensus: number;
    confidence: number;
} {
    // Short-term: focus on recent data
    const shortSeq = priceSequence.slice(-50);
    const shortPred = sequencePrediction(shortSeq);

    // Medium-term: broader window
    const mediumSeq = priceSequence.slice(-200);
    const mediumPred = sequencePrediction(mediumSeq);

    // Long-term: full history
    const longPred = sequencePrediction(priceSequence);

    // Weighted consensus (short-term has more weight)
    const consensus = (
        shortPred.prediction * 0.5 +
        mediumPred.prediction * 0.3 +
        longPred.prediction * 0.2
    );

    // Confidence based on agreement
    const agreement = 1 - Math.abs(shortPred.prediction - mediumPred.prediction);
    const confidence = (
        shortPred.confidence * 0.4 +
        mediumPred.confidence * 0.3 +
        longPred.confidence * 0.2 +
        agreement * 100 * 0.1
    );

    return {
        shortTerm: shortPred.prediction,
        mediumTerm: mediumPred.prediction,
        longTerm: longPred.prediction,
        consensus,
        confidence: Math.min(confidence, 100)
    };
}

// Pattern recognition using sequence analysis
export function detectPatterns(priceSequence: number[], high: number[], low: number[]): {
    patterns: string[];
    bullishScore: number;
    bearishScore: number;
} {
    const patterns: string[] = [];
    let bullishScore = 0;
    let bearishScore = 0;

    if (priceSequence.length < 10) {
        return { patterns, bullishScore: 0, bearishScore: 0 };
    }

    const recent = priceSequence.slice(-10);
    const recentHigh = high.slice(-10);
    const recentLow = low.slice(-10);

    // Higher highs and higher lows (uptrend)
    const higherHighs = recentHigh[recentHigh.length - 1] > recentHigh[0];
    const higherLows = recentLow[recentLow.length - 1] > recentLow[0];

    if (higherHighs && higherLows) {
        patterns.push('UPTREND');
        bullishScore += 15;
    }

    // Lower highs and lower lows (downtrend)
    const lowerHighs = recentHigh[recentHigh.length - 1] < recentHigh[0];
    const lowerLows = recentLow[recentLow.length - 1] < recentLow[0];

    if (lowerHighs && lowerLows) {
        patterns.push('DOWNTREND');
        bearishScore += 15;
    }

    // Consolidation (range-bound)
    const priceRange = Math.max(...recent) - Math.min(...recent);
    const avgPrice = recent.reduce((a, b) => a + b, 0) / recent.length;
    const rangePercent = (priceRange / avgPrice) * 100;

    if (rangePercent < 2) {
        patterns.push('CONSOLIDATION');
    }

    // Breakout detection
    const currentPrice = recent[recent.length - 1];
    const recentMax = Math.max(...recent.slice(0, -1));
    const recentMin = Math.min(...recent.slice(0, -1));

    if (currentPrice > recentMax * 1.02) {
        patterns.push('BULLISH_BREAKOUT');
        bullishScore += 20;
    } else if (currentPrice < recentMin * 0.98) {
        patterns.push('BEARISH_BREAKDOWN');
        bearishScore += 20;
    }

    // V-shaped recovery
    const midPoint = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, midPoint);
    const secondHalf = recent.slice(midPoint);

    const firstTrend = firstHalf[firstHalf.length - 1] - firstHalf[0];
    const secondTrend = secondHalf[secondHalf.length - 1] - secondHalf[0];

    if (firstTrend < 0 && secondTrend > 0 && Math.abs(secondTrend) > Math.abs(firstTrend)) {
        patterns.push('V_RECOVERY');
        bullishScore += 10;
    }

    return {
        patterns,
        bullishScore,
        bearishScore
    };
}
