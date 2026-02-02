import { runProStockPrediction } from '../src/lib/stockPrediction';

const stockName = process.argv[2] || 'RELIANCE';
const userId = '00000000-0000-0000-0000-000000000000'; // Static UUID for testing

async function main() {
    console.log(`🚀 Running Nano-Level Stock Prediction for ${stockName}...`);
    const result = await runProStockPrediction(stockName, '4h', userId);

    if (result.success) {
        console.log('✅ Stock Prediction Successful:');
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error('❌ Stock Prediction Failed:', result.error);
    }
}

main();
