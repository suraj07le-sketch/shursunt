

const fs = require('fs');

const companies = [
    ["RELIANCE", "Reliance Industries"], ["TCS", "Tata Consultancy Services"], ["HDFCBANK", "HDFC Bank"],
    ["ICICIBANK", "ICICI Bank"], ["BHARTIARTL", "Bharti Airtel"], ["SBIN", "State Bank of India"],
    ["INFY", "Infosys"], ["LICI", "LIC India"], ["ITC", "ITC Limited"], ["HINDUNILVR", "Hindustan Unilever"],
    ["LT", "Larsen & Toubro"], ["BAJFINANCE", "Bajaj Finance"], ["HCLTECH", "HCL Technologies"],
    ["KOTAKBANK", "Kotak Mahindra Bank"], ["AXISBANK", "Axis Bank"], ["ADANIENT", "Adani Enterprises"],
    ["SUNPHARMA", "Sun Pharma"], ["TITAN", "Titan Company"], ["ULTRACEMCO", "UltraTech Cement"],
    ["ASIANPAINT", "Asian Paints"], ["MARUTI", "Maruti Suzuki"], ["TATASTEEL", "Tata Steel"],
    ["BAJAJFINSV", "Bajaj Finserv"], ["NTPC", "NTPC Limited"], ["M&M", "Mahindra & Mahindra"],
    ["POWERGRID", "Power Grid Corp"], ["WIPRO", "Wipro Limited"], ["ONGC", "ONGC"],
    ["JSWSTEEL", "JSW Steel"], ["TATASTLLP", "Tata Steel Long"], ["ADANIGREEN", "Adani Green Energy"],
    ["ADANIPORTS", "Adani Ports"], ["COALINDIA", "Coal India"], ["SIEMENS", "Siemens India"],
    ["PIDILITIND", "Pidilite Industries"], ["GRASIM", "Grasim Industries"], ["SBILIFE", "SBI Life Insurance"],
    ["BEL", "Bharat Electronics"], ["LTIM", "LTIMindtree"], ["TECHM", "Tech Mahindra"],
    ["HDFCLIFE", "HDFC Life"], ["IOC", "Indian Oil Corp"], ["BRITANNIA", "Britannia Industries"],
    ["BAJAJ-AUTO", "Bajaj Auto"], ["GODREJCP", "Godrej Consumer"], ["VBL", "Varun Beverages"],
    ["TRENT", "Trent Limited"], ["PNB", "Punjab National Bank"], ["INDUSINDBK", "IndusInd Bank"],
    ["TATAPOWER", "Tata Power"], ["HINDALCO", "Hindalco Industries"], ["EICHERMOT", "Eicher Motors"],
    ["DLF", "DLF Limited"], ["DIVISLAB", "Divi's Laboratories"], ["ZOMATO", "Zomato Limited"],
    ["HAL", "Hindustan Aeronautics"], ["GAIL", "GAIL India"], ["JIOFIN", "Jio Financial Services"],
    ["ABB", "ABB India"], ["CIPLA", "Cipla Limited"], ["BPCL", "Bharat Petroleum"],
    ["BANKBARODA", "Bank of Baroda"], ["AMBUJACEM", "Ambuja Cements"], ["TVSMOTOR", "TVS Motor Company"],
    ["BHEL", "BHEL"], ["VEDL", "Vedanta Limited"], ["SHREECEM", "Shree Cement"],
    ["INDIGO", "InterGlobe Aviation"], ["NAUKRI", "Info Edge"], ["HEROMOTOCO", "Hero MotoCorp"],
    ["UNIONBANK", "Union Bank of India"], ["ICICIGI", "ICICI Lombard"], ["HAVELLS", "Havells India"],
    ["DABUR", "Dabur India"], ["ALKEM", "Alkem Laboratories"], ["CANBK", "Canara Bank"],
    ["UNITDSPR", "United Spirits"], ["NMDC", "NMDC Limited"], ["APOLLOHOSP", "Apollo Hospitals"]
];

const prefixes = ["Aditya", "Bharat", "Chola", "Delta", "Electro", "Future", "Global", "Hind", "India", "Jay", 
            "Kaveri", "Laxmi", "Maha", "Navin", "Orient", "Prime", "Quality", "Royal", "Super", "Techno",
            "Ultra", "Vikas", "Western", "Xenon", "Yash", "Zenith", "Alpha", "Beta", "Gamma", "Om", "Jai"];
const suffixes = ["Industries", "Enterprises", "Solutions", "Motors", "Energy", "Power", "Infra", "Holdings", 
            "Finance", "Chemicals", "Pharma", "Textiles", "Exports", "Trading", "Global", "Systems", "Networks"];

const existingSymbols = new Set(companies.map(c => c[0]));

while (companies.length < 250) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const name = `${p} ${s}`;
    const symbol = `${p.substring(0, 4).toUpperCase()}${s.substring(0, 4).toUpperCase()}`;
    
    if (!existingSymbols.has(symbol)) {
        companies.push([symbol, name]);
        existingSymbols.add(symbol);
    }
}

const sqlValues = companies.map(([symbol, name]) => {
    const price = (Math.random() * 4900 + 100).toFixed(2);
    const change = (Math.random() * 10 - 5).toFixed(2);
    const mcap = (Math.random() * 1900 + 100).toFixed(2) * 1000000000;
    const high = (parseFloat(price) * (1 + Math.random() * 0.05)).toFixed(2);
    const low = (parseFloat(price) * (1 - Math.random() * 0.05)).toFixed(2);
    
    // Always provide a fallback domain for clearbit to test our fix
    const domain = name.toLowerCase().replace(/ /g, "").replace("limited", "").replace("industries", "") + ".com";
    const image = `https://logo.clearbit.com/${domain}`;
    
    return `('${symbol}', '${name}', ${price}, ${change}, ${mcap}, ${high}, ${low}, '${image}')`;
});

console.log(sqlValues.join(",\n"));

companies = [
    ("RELIANCE", "Reliance Industries"), ("TCS", "Tata Consultancy Services"), ("HDFCBANK", "HDFC Bank"),
    ("ICICIBANK", "ICICI Bank"), ("BHARTIARTL", "Bharti Airtel"), ("SBIN", "State Bank of India"),
    ("INFY", "Infosys"), ("LICI", "LIC India"), ("ITC", "ITC Limited"), ("HINDUNILVR", "Hindustan Unilever"),
    ("LT", "Larsen & Toubro"), ("BAJFINANCE", "Bajaj Finance"), ("HCLTECH", "HCL Technologies"),
    ("KOTAKBANK", "Kotak Mahindra Bank"), ("AXISBANK", "Axis Bank"), ("ADANIENT", "Adani Enterprises"),
    ("SUNPHARMA", "Sun Pharma"), ("TITAN", "Titan Company"), ("ULTRACEMCO", "UltraTech Cement"),
    ("ASIANPAINT", "Asian Paints"), ("MARUTI", "Maruti Suzuki"), ("TATASTEEL", "Tata Steel"),
    ("BAJAJFINSV", "Bajaj Finserv"), ("NTPC", "NTPC Limited"), ("M&M", "Mahindra & Mahindra"),
    ("POWERGRID", "Power Grid Corp"), ("WIPRO", "Wipro Limited"), ("ONGC", "ONGC"),
    ("JSWSTEEL", "JSW Steel"), ("TATASTLLP", "Tata Steel Long"), ("ADANIGREEN", "Adani Green Energy"),
    ("ADANIPORTS", "Adani Ports"), ("COALINDIA", "Coal India"), ("SIEMENS", "Siemens India"),
    ("PIDILITIND", "Pidilite Industries"), ("GRASIM", "Grasim Industries"), ("SBILIFE", "SBI Life Insurance"),
    ("BEL", "Bharat Electronics"), ("LTIM", "LTIMindtree"), ("TECHM", "Tech Mahindra"),
    ("HDFCLIFE", "HDFC Life"), ("IOC", "Indian Oil Corp"), ("BRITANNIA", "Britannia Industries"),
    ("BAJAJ-AUTO", "Bajaj Auto"), ("GODREJCP", "Godrej Consumer"), ("VBL", "Varun Beverages"),
    ("TRENT", "Trent Limited"), ("PNB", "Punjab National Bank"), ("INDUSINDBK", "IndusInd Bank"),
    ("TATAPOWER", "Tata Power"), ("HINDALCO", "Hindalco Industries"), ("EICHERMOT", "Eicher Motors"),
    ("DLF", "DLF Limited"), ("DIVISLAB", "Divi's Laboratories"), ("ZOMATO", "Zomato Limited"),
    ("HAL", "Hindustan Aeronautics"), ("GAIL", "GAIL India"), ("JIOFIN", "Jio Financial Services"),
    ("ABB", "ABB India"), ("CIPLA", "Cipla Limited"), ("BPCL", "Bharat Petroleum"),
    ("BANKBARODA", "Bank of Baroda"), ("AMBUJACEM", "Ambuja Cements"), ("TVSMOTOR", "TVS Motor Company"),
    ("BHEL", "BHEL"), ("VEDL", "Vedanta Limited"), ("SHREECEM", "Shree Cement"),
    ("INDIGO", "InterGlobe Aviation"), ("NAUKRI", "Info Edge"), ("HEROMOTOCO", "Hero MotoCorp"),
    ("UNIONBANK", "Union Bank of India"), ("ICICIGI", "ICICI Lombard"), ("HAVELLS", "Havells India"),
    ("DABUR", "Dabur India"), ("ALKEM", "Alkem Laboratories"), ("CANBK", "Canara Bank"),
    ("UNITDSPR", "United Spirits"), ("NMDC", "NMDC Limited"), ("APOLLOHOSP", "Apollo Hospitals")
]

# Generate more dummy names to reach 250
prefixes = ["Aditya", "Bharat", "Chola", "Delta", "Electro", "Future", "Global", "Hind", "India", "Jay", 
            "Kaveri", "Laxmi", "Maha", "Navin", "Orient", "Prime", "Quality", "Royal", "Super", "Techno",
            "Ultra", "Vikas", "Western", "Xenon", "Yash", "Zenith", "Alpha", "Beta", "Gamma", "Om", "Jai"]
suffixes = ["Industries", "Enterprises", "Solutions", "Motors", "Energy", "Power", "Infra", "Holdings", 
            "Finance", "Chemicals", "Pharma", "Textiles", "Exports", "Trading", "Global", "Systems", "Networks"]

existing_symbols = set(c[0] for c in companies)

while len(companies) < 250:
    p = random.choice(prefixes)
    s = random.choice(suffixes)
    name = f"{p} {s}"
    symbol = f"{p[:4].upper()}{s[:4].upper()}"
    if symbol not in existing_symbols:
        companies.append((symbol, name))
        existing_symbols.add(symbol)

sql_values = []
for symbol, name in companies:
    price = round(random.uniform(100, 5000), 2)
    change = round(random.uniform(-5, 5), 2)
    mcap = round(random.uniform(100, 20000), 2) * 1000000000 # Billions to value
    high = round(price * (1 + random.uniform(0.01, 0.05)), 2)
    low = round(price * (1 - random.uniform(0.01, 0.05)), 2)
    
    # Use logo.clearbit.com for top companies, but we know our app now handles the fallback!
    # So we can just put a dummy URL or the clearbit one, and the app will fix it.
    # Actually, for the generated ones, let's leave image null so our app correctly uses the letter icon
    # OR we can put clearbit just to test the fallback.
    # Let's put clearbit for all to fully utilize the new getLogoUrl logic :)
    domain = name.lower().replace(" ", "").replace("limited", "").replace("industries", "") + ".com"
    image = f"https://logo.clearbit.com/{domain}"
    
    sql_values.append(f"('{symbol}', '{name}', {price}, {change}, {mcap}, {high}, {low}, '{image}')")

print(",\n".join(sql_values))
