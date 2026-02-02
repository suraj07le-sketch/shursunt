const fetch = require('node-fetch');
const API_KEY = "sk-live-ASP6f2VKjpJhs4yUrBjmRXw5kUI6gUVRlLrhmrYv";
const URL = "https://stock.indianapi.in/NSE_most_active";

async function run() {
    console.log(`Fetching ${URL}...`);
    try {
        const res = await fetch(URL, { headers: { "X-Api-Key": API_KEY } });
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log("Data preview (first 2 items):");
            if (Array.isArray(data)) {
                console.log(JSON.stringify(data.slice(0, 2), null, 2));
            } else {
                console.log(JSON.stringify(data, null, 2));
            }
        } else {
            const txt = await res.text();
            console.log("Error body:", txt);
        }
    } catch (e) {
        console.log("Error:", e);
    }
}
run();
