const fetch = require('node-fetch');

const API_KEY = "sk-live-ASP6f2VKjpJhs4yUrBjmRXw5kUI6gUVRlLrhmrYv";

async function run() {
    try {
        const res = await fetch("https://stock.indianapi.in/ipo", {
            headers: { "X-Api-Key": API_KEY }
        });
        const data = await res.json();
        console.log("KEYS:", Object.keys(data));

        ['active', 'upcoming', 'listed'].forEach(category => {
            if (data[category] && data[category].length > 0) {
                const item = data[category][0];
                console.log(`\n--- ${category.toUpperCase()} ---`);
                console.log("Keys:", Object.keys(item).join(", "));
                console.log("Company:", item.company_name || item.name || item.company || "NOT FOUND");
                console.log("Type:", item.issue_type || item.type || "NOT FOUND");
            }
        });
    } catch (e) {
        console.error(e);
    }
}

run();
