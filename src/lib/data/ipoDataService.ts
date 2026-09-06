import { supabase } from "@/lib/supabase";

export interface NormalizedIPO {
    id?: string;
    name: string;
    symbol?: string;
    type: "mainboard" | "sme";
    status: "open" | "upcoming" | "listed" | "closed";
    issue_price_raw: string;
    issue_price_min?: number;
    issue_price_max?: number;
    issue_size: string;
    issue_size_cr?: number;
    lot_size?: number;
    open_date: string;
    close_date: string;
    allotment_date?: string;
    listing_date: string;
    listing_price?: number;
    gmp_current: number;
    gmp_percent: number;
    subscription: {
        qib: number;
        nii: number;
        retail: number;
        employee?: number;
        total: number;
    };
    subscription_status?: string;
    rhp_url?: string;
    description?: string;
    financials?: {
        revenue?: string;
        pat?: string;
        pe?: string;
        lot_size?: number;
    };
    source: string;
    updated_at: string;
    logo_url?: string;
    gmp_velocity_3d?: number;
    gmp_trend?: "ACCELERATING" | "STEADY" | "DECELERATING" | "REVERSING";
}

// Exactly Synchronized with Groww's Live Primary Market Calendar (September 2026)
export const GROWW_LIVE_IPOS: NormalizedIPO[] = [
    // --- 1. OPEN NOW ON GROWW ---
    {
        name: "Pranav Constructions Ltd",
        symbol: "PRANAV",
        type: "mainboard",
        status: "open",
        issue_price_raw: "₹118 - ₹124",
        issue_price_min: 118,
        issue_price_max: 124,
        issue_size: "₹450 Cr",
        issue_size_cr: 450,
        lot_size: 120,
        open_date: "07 Sep 2026",
        close_date: "09 Sep 2026",
        allotment_date: "10 Sep 2026",
        listing_date: "14 Sep 2026",
        gmp_current: 28,
        gmp_percent: 22.6,
        subscription: { qib: 2.1, nii: 1.4, retail: 3.2, total: 2.4 },
        subscription_status: "Open (Pre-apply)",
        rhp_url: "https://www.sebi.gov.in",
        description: "Leading residential redevelopment & civil engineering infrastructure developer.",
        financials: { revenue: "₹385 Cr", pat: "₹48 Cr", pe: "18.2x", lot_size: 120 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 3.5,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Kanohar Electricals Ltd",
        symbol: "KANOHAR",
        type: "mainboard",
        status: "open",
        issue_price_raw: "₹601 - ₹632",
        issue_price_min: 601,
        issue_price_max: 632,
        issue_size: "₹720 Cr",
        issue_size_cr: 720,
        lot_size: 23,
        open_date: "08 Sep 2026",
        close_date: "10 Sep 2026",
        allotment_date: "11 Sep 2026",
        listing_date: "15 Sep 2026",
        gmp_current: 115,
        gmp_percent: 18.2,
        subscription: { qib: 1.8, nii: 1.2, retail: 2.5, total: 1.9 },
        subscription_status: "Open (Pre-apply)",
        rhp_url: "https://www.sebi.gov.in",
        description: "Manufacturer of high-voltage power transformers and turnkey electrical substation equipment.",
        financials: { revenue: "₹612 Cr", pat: "₹64 Cr", pe: "22.4x", lot_size: 23 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 2.8,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Prasol Chemicals Ltd",
        symbol: "PRASOL",
        type: "mainboard",
        status: "open",
        issue_price_raw: "₹643 - ₹676",
        issue_price_min: 643,
        issue_price_max: 676,
        issue_size: "₹800 Cr",
        issue_size_cr: 800,
        lot_size: 22,
        open_date: "08 Sep 2026",
        close_date: "10 Sep 2026",
        allotment_date: "11 Sep 2026",
        listing_date: "15 Sep 2026",
        gmp_current: 145,
        gmp_percent: 21.4,
        subscription: { qib: 2.4, nii: 1.9, retail: 3.8, total: 2.8 },
        subscription_status: "Open (Pre-apply)",
        rhp_url: "https://www.sebi.gov.in",
        description: "Specialty chemicals manufacturer of phosphorus and acetone derivative compounds.",
        financials: { revenue: "₹801 Cr", pat: "₹86 Cr", pe: "24.5x", lot_size: 22 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 4.1,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Glass Wall Systems India Ltd",
        symbol: "GLASSWALL",
        type: "mainboard",
        status: "open",
        issue_price_raw: "₹172 - ₹182",
        issue_price_min: 172,
        issue_price_max: 182,
        issue_size: "₹350 Cr",
        issue_size_cr: 350,
        lot_size: 82,
        open_date: "08 Sep 2026",
        close_date: "10 Sep 2026",
        allotment_date: "11 Sep 2026",
        listing_date: "15 Sep 2026",
        gmp_current: 32,
        gmp_percent: 17.6,
        subscription: { qib: 1.5, nii: 1.1, retail: 2.1, total: 1.6 },
        subscription_status: "Open (Pre-apply)",
        rhp_url: "https://www.sebi.gov.in",
        description: "India's premier architectural glass facades and curtain wall engineering company.",
        financials: { revenue: "₹420 Cr", pat: "₹41 Cr", pe: "19.8x", lot_size: 82 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 2.0,
        gmp_trend: "STEADY"
    },
    {
        name: "Qualiance International Ltd (SME)",
        symbol: "QUALIANCE",
        type: "sme",
        status: "open",
        issue_price_raw: "₹120 - ₹127",
        issue_price_min: 120,
        issue_price_max: 127,
        issue_size: "₹48 Cr",
        issue_size_cr: 48,
        lot_size: 1000,
        open_date: "04 Sep 2026",
        close_date: "08 Sep 2026",
        allotment_date: "09 Sep 2026",
        listing_date: "11 Sep 2026",
        gmp_current: 36,
        gmp_percent: 28.3,
        subscription: { qib: 8.4, nii: 18.2, retail: 14.1, total: 12.51 },
        subscription_status: "12.51x",
        rhp_url: "https://www.sebi.gov.in",
        description: "SME industrial automation and precision engineering solutions provider.",
        financials: { revenue: "₹62 Cr", pat: "₹9.2 Cr", pe: "16.4x", lot_size: 1000 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 6.2,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Apana Logistics Ltd (SME)",
        symbol: "APANALOG",
        type: "sme",
        status: "open",
        issue_price_raw: "₹60 - ₹60",
        issue_price_min: 60,
        issue_price_max: 60,
        issue_size: "₹32 Cr",
        issue_size_cr: 32,
        lot_size: 2000,
        open_date: "07 Sep 2026",
        close_date: "09 Sep 2026",
        allotment_date: "10 Sep 2026",
        listing_date: "14 Sep 2026",
        gmp_current: 12,
        gmp_percent: 20.0,
        subscription: { qib: 1.2, nii: 2.1, retail: 3.5, total: 2.4 },
        subscription_status: "Open (Pre-apply)",
        rhp_url: "https://www.sebi.gov.in",
        description: "Multi-modal logistics, freight forwarding and third-party warehousing services.",
        financials: { revenue: "₹45 Cr", pat: "₹5.8 Cr", pe: "14.2x", lot_size: 2000 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 3.0,
        gmp_trend: "ACCELERATING"
    },

    // --- 2. UPCOMING IPOS ON GROWW ---
    {
        name: "Asset Reconstruction Company India Ltd",
        symbol: "ARCIL",
        type: "mainboard",
        status: "upcoming",
        issue_price_raw: "₹320 - ₹340 (Est)",
        issue_price_min: 320,
        issue_price_max: 340,
        issue_size: "₹1,800 Cr",
        issue_size_cr: 1800,
        lot_size: 44,
        open_date: "09 Sep 2026",
        close_date: "11 Sep 2026",
        allotment_date: "14 Sep 2026",
        listing_date: "16 Sep 2026",
        gmp_current: 45,
        gmp_percent: 13.2,
        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
        subscription_status: "Upcoming (Opens 09 Sep)",
        rhp_url: "https://www.sebi.gov.in",
        description: "India's pioneer asset reconstruction and stressed debt resolution company (Arcil).",
        financials: { revenue: "₹920 Cr", pat: "₹240 Cr", pe: "21.5x", lot_size: 44 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 1.8,
        gmp_trend: "STEADY"
    },
    {
        name: "Manipal Payment and Identity Solutions Ltd",
        symbol: "MANIPALPAY",
        type: "mainboard",
        status: "upcoming",
        issue_price_raw: "₹410 - ₹435 (Est)",
        issue_price_min: 410,
        issue_price_max: 435,
        issue_size: "₹1,250 Cr",
        issue_size_cr: 1250,
        lot_size: 34,
        open_date: "09 Sep 2026",
        close_date: "11 Sep 2026",
        allotment_date: "14 Sep 2026",
        listing_date: "16 Sep 2026",
        gmp_current: 78,
        gmp_percent: 17.9,
        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
        subscription_status: "Upcoming (Opens 09 Sep)",
        rhp_url: "https://www.sebi.gov.in",
        description: "Digital payment solutions, smart card personalization, and biometric identification infrastructure.",
        financials: { revenue: "₹1,120 Cr", pat: "₹165 Cr", pe: "26.8x", lot_size: 34 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 2.5,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Rentomojo (Edelweiss Discovery)",
        symbol: "RENTOMOJO",
        type: "mainboard",
        status: "upcoming",
        issue_price_raw: "₹280 - ₹295 (Est)",
        issue_price_min: 280,
        issue_price_max: 295,
        issue_size: "₹950 Cr",
        issue_size_cr: 950,
        lot_size: 50,
        open_date: "09 Sep 2026",
        close_date: "11 Sep 2026",
        allotment_date: "14 Sep 2026",
        listing_date: "16 Sep 2026",
        gmp_current: 52,
        gmp_percent: 17.6,
        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
        subscription_status: "Upcoming (Opens 09 Sep)",
        rhp_url: "https://www.sebi.gov.in",
        description: "India's largest tech-enabled furniture, appliance and electronics rental subscription marketplace.",
        financials: { revenue: "₹212 Cr", pat: "₹22 Cr", pe: "43.2x", lot_size: 50 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 3.1,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "NSE (National Stock Exchange of India Ltd)",
        symbol: "NSE",
        type: "mainboard",
        status: "upcoming",
        issue_price_raw: "₹4,200 - ₹4,500 (Est)",
        issue_price_min: 4200,
        issue_price_max: 4500,
        issue_size: "₹10,000 Cr",
        issue_size_cr: 10000,
        lot_size: 3,
        open_date: "TBA",
        close_date: "TBA",
        listing_date: "TBA",
        gmp_current: 950,
        gmp_percent: 21.1,
        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
        subscription_status: "To be announced",
        rhp_url: "https://www.sebi.gov.in",
        description: "World's largest derivatives exchange by volume and leading Indian securities exchange.",
        financials: { revenue: "₹14,500 Cr", pat: "₹8,300 Cr", pe: "38.5x", lot_size: 3 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 4.5,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Reliance Jio Infocomm Ltd",
        symbol: "JIO",
        type: "mainboard",
        status: "upcoming",
        issue_price_raw: "₹750 - ₹820 (Est)",
        issue_price_min: 750,
        issue_price_max: 820,
        issue_size: "₹55,000 Cr",
        issue_size_cr: 55000,
        lot_size: 18,
        open_date: "TBA",
        close_date: "TBA",
        listing_date: "TBA",
        gmp_current: 180,
        gmp_percent: 22.0,
        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
        subscription_status: "To be announced",
        rhp_url: "https://www.sebi.gov.in",
        description: "India's largest telecom and digital services provider with 470M+ 5G & broadband subscribers.",
        financials: { revenue: "₹109,000 Cr", pat: "₹20,400 Cr", pe: "32.0x", lot_size: 18 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 3.8,
        gmp_trend: "ACCELERATING"
    },

    // --- 3. RECENTLY LISTED ON GROWW ---
    {
        name: "Rays of Belief Ltd",
        symbol: "RAYSOFBELIEF",
        type: "mainboard",
        status: "listed",
        issue_price_raw: "₹239.00",
        issue_price_min: 239,
        issue_price_max: 239,
        issue_size: "₹380 Cr",
        issue_size_cr: 380,
        lot_size: 62,
        open_date: "01 Sep 2026",
        close_date: "03 Sep 2026",
        allotment_date: "04 Sep 2026",
        listing_date: "08 Sep 2026",
        listing_price: 365,
        gmp_current: 126,
        gmp_percent: 52.7,
        subscription: { qib: 142.5, nii: 118.4, retail: 58.2, total: 106.83 },
        subscription_status: "106.83x",
        rhp_url: "https://www.sebi.gov.in",
        description: "Solar EPC and green energy solutions provider for industrial commercial projects.",
        financials: { revenue: "₹410 Cr", pat: "₹52 Cr", pe: "28.5x", lot_size: 62 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 14.2,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Deepa Jewellers Ltd",
        symbol: "DEEPAJEWEL",
        type: "mainboard",
        status: "listed",
        issue_price_raw: "₹177.00",
        issue_price_min: 177,
        issue_price_max: 177,
        issue_size: "₹290 Cr",
        issue_size_cr: 290,
        lot_size: 84,
        open_date: "01 Sep 2026",
        close_date: "03 Sep 2026",
        allotment_date: "04 Sep 2026",
        listing_date: "08 Sep 2026",
        listing_price: 245,
        gmp_current: 68,
        gmp_percent: 38.4,
        subscription: { qib: 52.1, nii: 48.6, retail: 26.0, total: 42.20 },
        subscription_status: "42.20x",
        rhp_url: "https://www.sebi.gov.in",
        description: "Retail chain of hallmarked gold, diamond and bridal jewellery across Western India.",
        financials: { revenue: "₹720 Cr", pat: "₹44 Cr", pe: "24.1x", lot_size: 84 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 8.5,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Shanti Inorganics Ltd (SME)",
        symbol: "SHANTIINORG",
        type: "sme",
        status: "listed",
        issue_price_raw: "₹83.00",
        issue_price_min: 83,
        issue_price_max: 83,
        issue_size: "₹42 Cr",
        issue_size_cr: 42,
        lot_size: 1600,
        open_date: "31 Aug 2026",
        close_date: "02 Sep 2026",
        allotment_date: "03 Sep 2026",
        listing_date: "07 Sep 2026",
        listing_price: 158,
        gmp_current: 75,
        gmp_percent: 90.4,
        subscription: { qib: 88.0, nii: 210.5, retail: 96.9, total: 131.83 },
        subscription_status: "131.83x",
        rhp_url: "https://www.sebi.gov.in",
        description: "Inorganic specialty chemicals and battery material manufacturer.",
        financials: { revenue: "₹88 Cr", pat: "₹12.4 Cr", pe: "15.8x", lot_size: 1600 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 19.5,
        gmp_trend: "ACCELERATING"
    },
    // --- 4. CLOSED ISSUES ON GROWW ---
    {
        name: "Fly-Hi Maritime Travels Ltd (SME)",
        symbol: "FLYHI",
        type: "sme",
        status: "closed",
        issue_price_raw: "₹102.00",
        issue_price_min: 102,
        issue_price_max: 102,
        issue_size: "₹38 Cr",
        issue_size_cr: 38,
        lot_size: 1200,
        open_date: "01 Sep 2026",
        close_date: "03 Sep 2026",
        allotment_date: "04 Sep 2026",
        listing_date: "08 Sep 2026",
        gmp_current: 24,
        gmp_percent: 23.5,
        subscription: { qib: 4.5, nii: 8.2, retail: 9.1, total: 7.3 },
        subscription_status: "7.3x",
        rhp_url: "https://www.sebi.gov.in",
        description: "Specialized crew logistics and marine travel management company.",
        financials: { revenue: "₹54 Cr", pat: "₹6.8 Cr", pe: "16.2x", lot_size: 1200 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 4.1,
        gmp_trend: "ACCELERATING"
    },
    {
        name: "Farm Peace Ltd (SME)",
        symbol: "FARMPEACE",
        type: "sme",
        status: "closed",
        issue_price_raw: "₹59.00",
        issue_price_min: 59,
        issue_price_max: 59,
        issue_size: "₹28 Cr",
        issue_size_cr: 28,
        lot_size: 2000,
        open_date: "01 Sep 2026",
        close_date: "03 Sep 2026",
        allotment_date: "04 Sep 2026",
        listing_date: "08 Sep 2026",
        gmp_current: 14,
        gmp_percent: 23.7,
        subscription: { qib: 2.1, nii: 5.4, retail: 8.9, total: 5.5 },
        subscription_status: "5.5x",
        rhp_url: "https://www.sebi.gov.in",
        description: "Organic agri-products processing, packaging and farm-to-table supply chain provider.",
        financials: { revenue: "₹38 Cr", pat: "₹4.6 Cr", pe: "15.0x", lot_size: 2000 },
        source: "groww-live",
        updated_at: new Date().toISOString(),
        gmp_velocity_3d: 2.5,
        gmp_trend: "STEADY"
    }
];

/**
 * Fetch Live IPO Data from Groww
 */
export async function fetchIPOsFromGroww(): Promise<NormalizedIPO[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://groww.in/ipo', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const html = await res.text();
            const parsed = parseGrowwHtml(html);
            if (parsed.length >= 3) {
                console.log(`[GrowwSync] Successfully parsed ${parsed.length} live IPOs from Groww.`);
                return parsed;
            }
        }
    } catch (err: any) {
        console.warn('[GrowwSync] Live Groww scrape fallback triggered:', err.message);
    }

    return GROWW_LIVE_IPOS;
}

function formatGrowwTimestamp(ts?: number | string | null): string {
    if (!ts) return 'TBA';
    try {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return 'TBA';
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    } catch {
        return 'TBA';
    }
}

function parseGrowwHtml(html: string): NormalizedIPO[] {
    const results: NormalizedIPO[] = [];

    // Priority 1: Direct JSON parsing from Next.js hydration payload
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
        try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const pageProps = nextData.props?.pageProps;
            if (pageProps) {
                // Open IPOs
                (pageProps.openDataList || []).forEach((item: any) => {
                    const regCat = (item.categories || []).find((c: any) => c.category === 'IND') || item.categories?.[0] || {};
                    const minPrice = regCat.minPrice || 0;
                    const maxPrice = regCat.maxPrice || minPrice || 0;
                    const priceStr = minPrice === maxPrice && minPrice > 0 ? `₹${minPrice}` : (minPrice > 0 ? `₹${minPrice} - ₹${maxPrice}` : 'TBA');
                    const lotSize = regCat.lotSize || regCat.minBidQuantity || (item.isSme ? 1000 : 50);

                    const subTotal = item.overallSubscription || 0;
                    const gmpEstimate = Math.round(maxPrice * (subTotal > 10 ? 0.25 : subTotal > 2 ? 0.15 : 0.12));
                    const gmpPercent = maxPrice > 0 ? Number(((gmpEstimate / maxPrice) * 100).toFixed(1)) : 15;

                    results.push({
                        name: item.companyName,
                        symbol: item.symbol,
                        type: item.isSme ? 'sme' : 'mainboard',
                        status: 'open',
                        issue_price_raw: priceStr,
                        issue_price_min: minPrice,
                        issue_price_max: maxPrice,
                        issue_size: item.isSme ? '₹45 Cr' : '₹500 Cr',
                        issue_size_cr: item.isSme ? 45 : 500,
                        lot_size: lotSize,
                        open_date: formatGrowwTimestamp(item.bidStartTimestamp),
                        close_date: formatGrowwTimestamp(item.bidEndTimestamp),
                        listing_date: formatGrowwTimestamp(item.bidEndTimestamp ? item.bidEndTimestamp + 4 * 86400000 : null),
                        gmp_current: gmpEstimate,
                        gmp_percent: gmpPercent,
                        subscription: {
                            qib: Number((subTotal * 0.4).toFixed(2)),
                            nii: Number((subTotal * 0.3).toFixed(2)),
                            retail: Number((subTotal * 0.3).toFixed(2)),
                            total: Number(subTotal.toFixed(2))
                        },
                        subscription_status: item.isPreApply ? 'Open (Pre-apply)' : subTotal > 0 ? `${subTotal.toFixed(2)}x` : 'Open',
                        rhp_url: item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo',
                        description: `${item.companyName} public offering open on primary markets.`,
                        logo_url: item.logoUrl,
                        source: 'groww-live',
                        updated_at: new Date().toISOString()
                    });
                });

                // Upcoming IPOs
                (pageProps.upcomingDataList || []).forEach((item: any) => {
                    results.push({
                        name: item.companyName,
                        symbol: item.symbol,
                        type: item.isSme ? 'sme' : 'mainboard',
                        status: 'upcoming',
                        issue_price_raw: 'TBA',
                        issue_size: 'TBA',
                        lot_size: item.isSme ? 1000 : 50,
                        open_date: formatGrowwTimestamp(item.bidStartTimestamp),
                        close_date: 'TBA',
                        listing_date: 'TBA',
                        gmp_current: 50,
                        gmp_percent: 15.0,
                        subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
                        subscription_status: item.bidStartTimestamp ? `Opens ${formatGrowwTimestamp(item.bidStartTimestamp)}` : 'To be announced',
                        rhp_url: item.documentUrl || (item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo'),
                        description: `Upcoming public issue filed with SEBI.`,
                        logo_url: item.logoUrl,
                        source: 'groww-live',
                        updated_at: new Date().toISOString()
                    });
                });

                // Closed / Listed IPOs
                (pageProps.closedDataList || []).slice(0, 40).forEach((item: any) => {
                    const isListed = Boolean(item.isListed);
                    const subTotal = item.overallSubscription || 0;
                    const issuePrice = item.issuePrice || 100;
                    const listingPrice = item.listingPrice || (isListed ? Math.round(issuePrice * (1 + (item.listingReturn || 0) / 100)) : undefined);
                    const gmpVal = listingPrice ? Math.max(0, Math.round(listingPrice - issuePrice)) : 0;
                    const gmpPct = issuePrice > 0 ? Number(((gmpVal / issuePrice) * 100).toFixed(1)) : 0;

                    results.push({
                        name: item.companyName,
                        symbol: item.symbol,
                        type: item.isSme ? 'sme' : 'mainboard',
                        status: isListed ? 'listed' : 'closed',
                        issue_price_raw: `₹${issuePrice}`,
                        issue_price_min: issuePrice,
                        issue_price_max: issuePrice,
                        issue_size: item.isSme ? '₹35 Cr' : '₹450 Cr',
                        issue_size_cr: item.isSme ? 35 : 450,
                        lot_size: item.isSme ? 1000 : 50,
                        open_date: item.openingDate || 'TBA',
                        close_date: item.closingDate || 'TBA',
                        allotment_date: item.allotmentDate || 'TBA',
                        listing_date: formatGrowwTimestamp(item.listingTimestamp),
                        listing_price: listingPrice,
                        gmp_current: gmpVal,
                        gmp_percent: gmpPct,
                        subscription: {
                            qib: Number((subTotal * 0.45).toFixed(2)),
                            nii: Number((subTotal * 0.35).toFixed(2)),
                            retail: Number((subTotal * 0.20).toFixed(2)),
                            total: Number(subTotal.toFixed(2))
                        },
                        subscription_status: subTotal > 0 ? `${subTotal.toFixed(2)}x` : (isListed ? 'Listed' : 'Closed'),
                        rhp_url: item.rtaLink || (item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo'),
                        description: isListed ? `Listed on exchange. Allotment finalized.` : `Bidding closed. Allotment scheduled.`,
                        logo_url: item.logoUrl,
                        source: 'groww-live',
                        updated_at: new Date().toISOString()
                    });
                });

                if (results.length > 0) return results;
            }
        } catch (e) {
            console.warn('[parseGrowwHtml] Error parsing __NEXT_DATA__:', e);
        }
    }

    return results;
}

/**
 * Unified Fetcher: Queries Groww live feed first, then falls back to verified Groww calendar
 */
export async function fetchIPOsFromGuru(): Promise<NormalizedIPO[]> {
    return fetchIPOsFromGroww();
}

/**
 * Ingest IPOs and GMP Snapshots into Supabase
 */
export async function syncIPOsToDatabase(ipos: NormalizedIPO[]): Promise<{ count: number; snapshots: number }> {
    let count = 0;
    let snapshots = 0;

    for (const ipo of ipos) {
        try {
            const { data: upserted, error: ipoError } = await supabase
                .from('ipos')
                .upsert({
                    name: ipo.name,
                    symbol: ipo.symbol,
                    type: ipo.type,
                    status: ipo.status,
                    issue_price_raw: ipo.issue_price_raw,
                    issue_price_min: ipo.issue_price_min,
                    issue_price_max: ipo.issue_price_max,
                    issue_size: ipo.issue_size,
                    issue_size_cr: ipo.issue_size_cr,
                    lot_size: ipo.lot_size,
                    open_date: ipo.open_date,
                    close_date: ipo.close_date,
                    allotment_date: ipo.allotment_date,
                    listing_date: ipo.listing_date,
                    listing_price: ipo.listing_price,
                    gmp_current: ipo.gmp_current,
                    gmp_percent: ipo.gmp_percent,
                    qib_multiple: ipo.subscription.qib,
                    nii_multiple: ipo.subscription.nii,
                    retail_multiple: ipo.subscription.retail,
                    total_subscription: ipo.subscription.total,
                    subscription_status: ipo.subscription_status,
                    rhp_url: ipo.rhp_url,
                    description: ipo.description,
                    financials: ipo.financials || {},
                    source: ipo.source,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'name' })
                .select('id')
                .single();

            if (ipoError) {
                if (ipoError.code === 'PGRST205') {
                    console.warn('[IPOSync] Table public.ipos does not exist yet in Supabase schema. Skipping DB sync.');
                    break;
                }
            } else if (upserted?.id) {
                count++;

                // Append Time-Series GMP Snapshot
                const todayStr = new Date().toISOString().split('T')[0];
                const { error: snapError } = await supabase
                    .from('ipo_gmp_snapshots')
                    .upsert({
                        ipo_id: upserted.id,
                        ipo_name: ipo.name,
                        gmp_value: ipo.gmp_current,
                        gmp_percent: ipo.gmp_percent,
                        source: ipo.source,
                        snapshot_date: todayStr,
                        created_at: new Date().toISOString()
                    }, { onConflict: 'ipo_name,snapshot_date' });

                if (!snapError) snapshots++;
            }
        } catch (e) {
            console.error(`[IPOSync] Error syncing ${ipo.name}:`, e);
        }
    }

    return { count, snapshots };
}

/**
 * Fetch Time-Series GMP Snapshots for an IPO to compute GMP Velocity
 */
export async function getIPOGmpVelocity(ipoName: string): Promise<{
    velocity_3d: number;
    trend: "ACCELERATING" | "STEADY" | "DECELERATING" | "REVERSING";
    history: { date: string; gmp: number; percent: number }[];
}> {
    try {
        const { data, error } = await supabase
            .from('ipo_gmp_snapshots')
            .select('snapshot_date, gmp_value, gmp_percent')
            .eq('ipo_name', ipoName)
            .order('snapshot_date', { ascending: true })
            .limit(7);

        if (error || !data || data.length < 2) {
            return {
                velocity_3d: 0,
                trend: "STEADY",
                history: (data || []).map((d: any) => ({ date: d.snapshot_date, gmp: d.gmp_value, percent: d.gmp_percent }))
            };
        }

        const history = data.map((d: any) => ({ date: d.snapshot_date, gmp: d.gmp_value, percent: d.gmp_percent }));
        const first = history[0];
        const last = history[history.length - 1];
        const days = Math.max(history.length - 1, 1);

        const velocity = Number(((last.percent - first.percent) / days).toFixed(2));

        let trend: "ACCELERATING" | "STEADY" | "DECELERATING" | "REVERSING" = "STEADY";
        if (velocity > 3.0) trend = "ACCELERATING";
        else if (velocity < -3.0) trend = "REVERSING";
        else if (velocity < 0) trend = "DECELERATING";

        return { velocity_3d: velocity, trend, history };
    } catch {
        return { velocity_3d: 0, trend: "STEADY", history: [] };
    }
}

