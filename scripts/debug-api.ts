const API_KEY = "sk-live-ASP6f2VKjpJhs4yUrBjmRXw5kUI6gUVRlLrhmrYv";
const stockname = "RELIANCE";
const url = `https://stock.indianapi.in/historical_data?stock_name=${stockname}&period=1m&filter=default`;

async function debug() {
    console.log(`Fetching from: ${url}`);
    const res = await fetch(url, {
        headers: { "X-Api-Key": API_KEY }
    });
    const text = await res.text();
    console.log("---RESPONSE START---");
    console.log(text.substring(0, 500));
    console.log("---RESPONSE END---");
}

debug();
