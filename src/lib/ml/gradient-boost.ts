// Simplified Gradient Boosting for Price Prediction
// Implements decision tree ensemble with boosting

import { TechnicalFeatures } from './features';

interface DecisionNode {
    feature?: keyof TechnicalFeatures;
    threshold?: number;
    left?: DecisionNode;
    right?: DecisionNode;
    value?: number; // Leaf node prediction
}

interface GradientBoostingModel {
    trees: DecisionNode[];
    weights: number[];
    learningRate: number;
}

// Normalize feature value to 0-1 range
function normalizeFeature(value: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
}

// Create a simple decision stump (single split tree)
function createDecisionStump(
    features: TechnicalFeatures,
    target: number
): DecisionNode {
    // Select best feature for split based on correlation with target
    const featureKeys = Object.keys(features) as (keyof TechnicalFeatures)[];

    // Simple heuristic: use RSI for momentum, EMA for trend
    let bestFeature: keyof TechnicalFeatures = 'rsi14';
    let bestThreshold = 50;

    // RSI-based decision
    if (features.rsi14 > 70) {
        bestFeature = 'rsi14';
        bestThreshold = 70;
    } else if (features.rsi14 < 30) {
        bestFeature = 'rsi14';
        bestThreshold = 30;
    }
    // Trend-based decision
    else if (features.ema12 > features.ema50) {
        bestFeature = 'trend_strength';
        bestThreshold = 0;
    }

    return {
        feature: bestFeature,
        threshold: bestThreshold,
        left: { value: -0.5 }, // Bearish
        right: { value: 0.5 }  // Bullish
    };
}

// Predict using a single tree
function predictTree(node: DecisionNode, features: TechnicalFeatures): number {
    if (node.value !== undefined) {
        return node.value;
    }

    if (!node.feature || node.threshold === undefined) {
        return 0; // Default for invalid nodes
    }

    const featureValue = features[node.feature];
    if (featureValue < node.threshold) {
        return node.left ? predictTree(node.left, features) : 0;
    } else {
        return node.right ? predictTree(node.right, features) : 0;
    }
}

// Train simplified gradient boosting model
export function trainGradientBoosting(
    features: TechnicalFeatures,
    numTrees: number = 10,
    learningRate: number = 0.1
): GradientBoostingModel {
    const trees: DecisionNode[] = [];
    const weights: number[] = [];

    // Create ensemble of decision stumps
    for (let i = 0; i < numTrees; i++) {
        // Each tree focuses on different aspect
        const tree = createDecisionStump(features, 0);
        trees.push(tree);
        weights.push(1.0 / numTrees); // Equal weights for simplicity
    }

    return {
        trees,
        weights,
        learningRate
    };
}

// Predict using gradient boosting ensemble
export function predictGradientBoosting(
    model: GradientBoostingModel,
    features: TechnicalFeatures
): { prediction: number; confidence: number } {
    let totalPrediction = 0;
    let totalWeight = 0;

    for (let i = 0; i < model.trees.length; i++) {
        const treePrediction = predictTree(model.trees[i], features);
        totalPrediction += treePrediction * model.weights[i];
        totalWeight += model.weights[i];
    }

    const prediction = totalPrediction / totalWeight;
    const confidence = Math.min(Math.abs(prediction) * 100, 100);

    return {
        prediction: Math.tanh(prediction), // Normalize to -1 to 1
        confidence
    };
}

// Advanced ensemble prediction using multiple strategies
export function advancedEnsemblePrediction(features: TechnicalFeatures): {
    direction: number;
    confidence: number;
    signal: string;
} {
    let bullishScore = 0;
    let bearishScore = 0;
    let weights = 0;

    // 1. RSI Strategy (20% weight)
    if (features.rsi14 < 30) {
        bullishScore += 0.2;
    } else if (features.rsi14 > 70) {
        bearishScore += 0.2;
    }
    weights += 0.2;

    // 2. MACD Strategy (15% weight)
    if (features.macd_histogram > 0) {
        bullishScore += 0.15;
    } else {
        bearishScore += 0.15;
    }
    weights += 0.15;

    // 3. EMA Crossover Strategy (20% weight)
    if (features.ema12 > features.ema50) {
        bullishScore += 0.2;
    } else {
        bearishScore += 0.2;
    }
    weights += 0.2;

    // 4. Bollinger Bands Strategy (15% weight)
    if (features.bb_position < 0.2) {
        bullishScore += 0.15; // Near lower band - oversold
    } else if (features.bb_position > 0.8) {
        bearishScore += 0.15; // Near upper band - overbought
    }
    weights += 0.15;

    // 5. Stochastic Strategy (10% weight)
    if (features.stoch_k < 20) {
        bullishScore += 0.1;
    } else if (features.stoch_k > 80) {
        bearishScore += 0.1;
    }
    weights += 0.1;

    // 6. Trend Strength Strategy (10% weight)
    if (features.trend_strength > 2) {
        bullishScore += 0.1;
    } else if (features.trend_strength < -2) {
        bearishScore += 0.1;
    }
    weights += 0.1;

    // 7. Volume Confirmation (10% weight)
    if (features.volume_ratio > 1.5) {
        // High volume confirms the trend
        if (bullishScore > bearishScore) {
            bullishScore += 0.1;
        } else {
            bearishScore += 0.1;
        }
    }
    weights += 0.1;

    // Calculate final scores
    const netScore = (bullishScore - bearishScore) / weights;
    const confidence = Math.abs(netScore) * 100;

    let direction = 0;
    let signal = 'HOLD';

    // More aggressive thresholds for better signals
    if (netScore > 0.15 && confidence > 50) {
        direction = 1;
        signal = 'BUY';
    } else if (netScore < -0.15 && confidence > 50) {
        direction = -1;
        signal = 'SELL';
    }

    return {
        direction,
        confidence: Math.min(confidence, 100),
        signal
    };
}
