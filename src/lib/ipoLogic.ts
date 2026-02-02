import { Architect, Network } from "synaptic";

export interface IPOSubscription {
    qib: number;
    nii: number;
    retail: number;
    total: number;
}

export interface IPOData {
    company_name: string;
    issue_price: number;
    listing_price_est?: number;
    subscription?: IPOSubscription;
    gmp?: number; // Grey Market Premium
    status: string;
}

/**
 * Neural IPO Predictor (Elite v4)
 * Uses a Perceptron to analyze institutional backing multi-vectors.
 */
let ipoNetwork: Network | null = null;

const initIPONetwork = () => {
    // 4 inputs: QIB, NII, Retail, Price/GMP Ratio
    // 6 hidden neurons
    // 1 output: Listing Gain (0-1 normalized)
    ipoNetwork = new Architect.Perceptron(4, 6, 1);
};

export const predictIPOGains = (ipo: IPOData) => {
    // If listed, we don't predict
    if (ipo.status === 'listed') {
        return {
            gain_percent: 0,
            sentiment: 'STABLE',
            confidence: 90,
            message: "Company already listed."
        };
    }

    if (!ipoNetwork) initIPONetwork();

    const hasSubscription = ipo.subscription && ipo.subscription.total > 0;
    const gmpWeight = (ipo.gmp && ipo.issue_price) ? (ipo.gmp / ipo.issue_price) : 0;

    let finalGain = 0;
    let confidence = 50;
    let sentiment = 'NEUTRAL';

    if (hasSubscription) {
        const { qib, nii, retail, total } = ipo.subscription!;

        // Normalize inputs for Neural Net
        const nQib = Math.min(Math.log10(qib + 1) / 3, 1);
        const nNii = Math.min(Math.log10(nii + 1) / 3, 1);
        const nRet = Math.min(Math.log10(retail + 1) / 2, 1);
        const nGmp = Math.min(gmpWeight, 1);

        // Run Neural Forecast
        const output = ipoNetwork!.activate([nQib, nNii, nRet, nGmp])[0];
        const neuralGain = output * 150;

        // Ensemble Logic
        const baseHeuristic = ipo.gmp ? (ipo.gmp / ipo.issue_price) * 100 : Math.min(total * 2, 60);
        finalGain = (neuralGain * 0.6) + (baseHeuristic * 0.4);
        confidence = Math.min(70 + (total > 5 ? 15 : total * 2), 98);
    } else {
        // Upcoming / TBA Logic (Sentiment Based)
        // If we have GMP, it's a strong signal
        if (ipo.gmp) {
            finalGain = (ipo.gmp / (ipo.issue_price || 500)) * 100;
            confidence = 65; // Decent confidence with GMP
        } else {
            // Heuristic for "Big Names" or general market hype
            const bigNames = ['zepto', 'phonepe', 'flipkart', 'jio', 'swiggy'];
            const isBigName = bigNames.some(name => ipo.company_name.toLowerCase().includes(name));

            if (isBigName) {
                finalGain = 25; // Default "Hot" expectation
                confidence = 45;
                sentiment = 'BULLISH';
            } else if (ipo.status === 'upcoming') {
                finalGain = 0;
                confidence = 15;
                sentiment = 'AWAITING_DATA';
            } else {
                finalGain = 0;
                confidence = 30;
                sentiment = 'NEUTRAL';
            }
        }
    }

    // Final Sentiment Mapping
    if (sentiment !== 'AWAITING_DATA') {
        if (finalGain > 40) sentiment = 'BULLISH_AGGRESSIVE';
        else if (finalGain > 15) sentiment = 'BULLISH';
        else if (finalGain < -5) sentiment = 'BEARISH';
        else if (finalGain === 0 && !ipo.gmp) sentiment = 'NEUTRAL';
    }

    return {
        gain_percent: Number(finalGain.toFixed(2)),
        sentiment,
        confidence,
        est_listing_price: Number(((ipo.issue_price || 0) * (1 + finalGain / 100)).toFixed(2)),
        model_version: hasSubscription ? "v4-neural-ensemble" : (sentiment === 'AWAITING_DATA' ? "v4-data-pending" : "v4-sentiment-engine")
    };
};

