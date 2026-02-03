import { runProStockPrediction } from '../src/lib/stockPrediction';

async function test() {
    console.log("Testing stock prediction for RELIANCE...");

    try {
        const result = await runProStockPrediction("RELIANCE", "4h", "test-user-id");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
