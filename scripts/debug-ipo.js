const fetch = require('node-fetch');

const API_KEY = "sk-live-ASP6f2VKjpJhs4yUrBjmRXw5kUI6gUVRlLrhmrYv";

async function check(type) {
    console.log(`Checking ${type}...`);
    try {
        const res = await fetch(`https://stock.indianapi.in/ipo?issue_type=${type}`, {
            headers: { "X-Api-Key": API_KEY }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`${type} count: ${data.length}`);
            console.log(JSON.stringify(data.slice(0, 2), null, 2));
        } else {
            console.log(`${type} failed with status: ${res.status}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await check('mainboard');
    await check('sme');
}

run();
