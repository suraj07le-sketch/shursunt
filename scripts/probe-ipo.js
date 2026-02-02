const fetch = require('node-fetch');

const API_KEY = "sk-live-ASP6f2VKjpJhs4yUrBjmRXw5kUI6gUVRlLrhmrYv";
const endpoints = [
    "https://stock.indianapi.in/ipo",
    "https://stock.indianapi.in/ipo/v2",
    "https://stock.indianapi.in/ipo_v2",
    "https://stock.indianapi.in/all_ipo",
    "https://stock.indianapi.in/upcoming_ipo",
    "https://stock.indianapi.in/ipo_data"
];

async function run() {
    for (const url of endpoints) {
        console.log(`Testing ${url}...`);
        try {
            const res = await fetch(url, { headers: { "X-Api-Key": API_KEY } });
            console.log(`- Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log("- Full Schema Map:");
                ['active', 'upcoming'].forEach(key => {
                    if (data[key] && data[key].length > 0) {
                        console.log(`\n--- ${key} sample keys ---`);
                        console.log(Object.keys(data[key][0]).join(", "));
                        console.log("\n--- Sample Content ---");
                        console.log(JSON.stringify(data[key][0], null, 2));
                    }
                });
                return;
            }
        } catch (e) {
            console.log(`- Error: ${e.message}`);
        }
    }
}

run();
