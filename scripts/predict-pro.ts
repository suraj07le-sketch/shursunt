import { runProPrediction } from '../src/lib/prediction';

const coin = process.argv[2] || 'BTC';
const userId = '00000000-0000-0000-0000-000000000000'; // Static UUID for testing

async function main() {
    console.log(`🚀 Running Pro Prediction for ${coin}...`);
    const result = await runProPrediction(coin, '4h', userId);

    if (result.success) {
        console.log('---PREDICTION_RESULT_START---');
        console.log(JSON.stringify(result, null, 2));
        console.log('---PREDICTION_RESULT_END---');
    } else {
        console.error('❌ Prediction Failed:', result.error);
    }
}

main();
