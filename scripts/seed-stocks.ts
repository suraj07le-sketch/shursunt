import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Ensure .env.local is present.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const realStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2987.50, change: 1.25, high: 3010.00, low: 2950.00, type: 'stock' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.30, change: -0.45, high: 4150.00, low: 4100.00, type: 'stock' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1450.75, change: 0.80, high: 1465.00, low: 1440.00, type: 'stock' },
    { symbol: 'INFY', name: 'Infosys', price: 1670.00, change: 0.50, high: 1685.00, low: 1660.00, type: 'stock' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1080.40, change: 1.10, high: 1090.00, low: 1070.00, type: 'stock' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1210.00, change: 0.20, high: 1225.00, low: 1200.00, type: 'stock' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 760.50, change: 0.90, high: 770.00, low: 755.00, type: 'stock' },
    { symbol: 'LICI', name: 'LIC India', price: 1020.00, change: -1.00, high: 1035.00, low: 1010.00, type: 'stock' },
    { symbol: 'ITC', name: 'ITC Limited', price: 430.00, change: 0.10, high: 435.00, low: 428.00, type: 'stock' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 3750.00, change: 1.50, high: 3800.00, low: 3700.00, type: 'stock' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1750.00, change: -0.25, high: 1770.00, low: 1740.00, type: 'stock' },
    { symbol: 'AXISBANK', name: 'Axis Bank', price: 1100.00, change: 0.75, high: 1120.00, low: 1090.00, type: 'stock' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6800.00, change: 2.10, high: 6900.00, low: 6750.00, type: 'stock' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2350.00, change: -0.10, high: 2370.00, low: 2340.00, type: 'stock' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', price: 12500.00, change: 0.50, high: 12600.00, low: 12400.00, type: 'stock' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharma', price: 1600.00, change: 1.20, high: 1620.00, low: 1580.00, type: 'stock' },
    { symbol: 'TITAN', name: 'Titan Company', price: 3650.00, change: -0.30, high: 3680.00, low: 3620.00, type: 'stock' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 980.00, change: 1.80, high: 995.00, low: 970.00, type: 'stock' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp', price: 285.00, change: 0.20, high: 290.00, low: 282.00, type: 'stock' },
    { symbol: 'NTPC', name: 'NTPC Limited', price: 340.00, change: 0.40, high: 345.00, low: 335.00, type: 'stock' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 9800.00, change: -0.50, high: 9900.00, low: 9750.00, type: 'stock' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2850.00, change: -1.20, high: 2900.00, low: 2820.00, type: 'stock' },
    { symbol: 'COALINDIA', name: 'Coal India', price: 450.00, change: 0.60, high: 455.00, low: 445.00, type: 'stock' },
    { symbol: 'WIPRO', name: 'Wipro', price: 480.00, change: -0.10, high: 485.00, low: 475.00, type: 'stock' },
    { symbol: 'NESTLEIND', name: 'Nestle India', price: 2550.00, change: 0.20, high: 2580.00, low: 2530.00, type: 'stock' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 3100.00, change: 2.50, high: 3150.00, low: 3050.00, type: 'stock' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports', price: 1350.00, change: 1.10, high: 1370.00, low: 1330.00, type: 'stock' },
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 165.00, change: 0.50, high: 168.00, low: 162.00, type: 'stock' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 2100.00, change: 1.40, high: 2130.00, low: 2080.00, type: 'stock' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 850.00, change: -0.20, high: 860.00, low: 840.00, type: 'stock' },
];

const generateStocks = (count: number) => {
    const sectors = ['TECH', 'BANK', 'AUTO', 'PHARMA', 'POWER', 'STEEL', 'CMNT', 'OIL', 'GAS', 'FIN'];
    const generated = [];
    const usedSymbols = new Set(realStocks.map(s => s.symbol));

    for (let i = 0; i < count; i++) {
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        let symbol;
        let attempts = 0;

        do {
            symbol = `${sector}${Math.floor(100 + Math.random() * 900)}`;
            attempts++;
        } while (usedSymbols.has(symbol) && attempts < 100);

        usedSymbols.add(symbol);

        const price = Math.floor(Math.random() * 5000) + 100;
        const change = (Math.random() * 10 - 5).toFixed(2);
        generated.push({
            symbol: symbol,
            name: `${sector} India Ltd ${Math.floor(Math.random() * 1000)}`,
            price: price,
            change: parseFloat(change),
            high: price + Math.random() * 50,
            low: price - Math.random() * 50,
            type: 'stock'
        });
    }
    return generated;
};

const stocks = [...realStocks, ...generateStocks(500 - realStocks.length)];

async function seedStocks() {
    console.log('🚀 Seeding 500 stocks...');

    const records = stocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        current_price: s.price,
        price_change_percentage_24h: s.change,
        high_24h: s.high,
        low_24h: s.low,
        image: `https://ui-avatars.com/api/?name=${s.symbol}&background=random&color=fff`,
        asset_type: 'stock'
    }));

    // Delete all records safely
    const { error: deleteError } = await supabase.from('indian_stocks').delete().neq('symbol', '______');
    if (deleteError) console.error("Delete failed:", deleteError);

    // Insert in chunks to avoid payload too large errors
    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { error } = await supabase.from('indian_stocks').insert(chunk);
        if (error) {
            console.error(`❌ Error seeding chunk ${i}:`, error.message);
        } else {
            console.log(`✅ Seeded chunk ${i / chunkSize + 1}`);
        }
    }
}

seedStocks();
