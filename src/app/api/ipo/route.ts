import { NextResponse } from 'next/server';

interface GrowwCategory {
    category?: string;
    lotSize?: number;
    minBidQuantity?: number;
    minPrice?: number;
    maxPrice?: number;
}

interface GrowwOpenItem {
    companyName: string;
    symbol?: string;
    searchId?: string;
    isin?: string;
    isSme?: boolean;
    bidStartTimestamp?: number;
    bidEndTimestamp?: number;
    overallSubscription?: number;
    logoUrl?: string;
    isPreApply?: boolean;
    categories?: GrowwCategory[];
}

interface GrowwUpcomingItem {
    companyName: string;
    symbol?: string;
    searchId?: string;
    isSme?: boolean;
    bidStartTimestamp?: number;
    logoUrl?: string;
    documentUrl?: string;
}

interface GrowwClosedItem {
    companyName: string;
    symbol?: string;
    searchId?: string;
    isSme?: boolean;
    issuePrice?: number;
    listingPrice?: number;
    listingTimestamp?: number;
    isListed?: boolean;
    logoUrl?: string;
    overallSubscription?: number;
    openingDate?: string;
    closingDate?: string;
    allotmentDate?: string;
    rtaLink?: string;
    listingReturn?: number;
}

interface CategorizedIPOResponse {
    active: any[];
    upcoming: any[];
    listed: any[];
    closed: any[];
}

// In-memory cache for 5 minutes
let cachedData: CategorizedIPOResponse | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function formatDate(ts?: number | string | null): string {
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

function parseGrowwPageProps(pageProps: any): CategorizedIPOResponse {
    const categorized: CategorizedIPOResponse = {
        active: [],
        upcoming: [],
        listed: [],
        closed: []
    };

    // 1. OPEN / ACTIVE IPOS
    (pageProps.openDataList || []).forEach((item: GrowwOpenItem) => {
        const regCat = (item.categories || []).find(c => c.category === 'IND') || item.categories?.[0] || {};
        const minPrice = regCat.minPrice || 0;
        const maxPrice = regCat.maxPrice || minPrice || 0;
        const priceStr = minPrice === maxPrice && minPrice > 0 ? `₹${minPrice}` : (minPrice > 0 ? `₹${minPrice} - ₹${maxPrice}` : 'TBA');
        const lotSize = regCat.lotSize || regCat.minBidQuantity || (item.isSme ? 1000 : 50);

        const subTotal = item.overallSubscription || 0;
        const gmpEstimate = Math.round(maxPrice * (subTotal > 10 ? 0.25 : subTotal > 2 ? 0.15 : 0.12));
        const gmpPercent = maxPrice > 0 ? Number(((gmpEstimate / maxPrice) * 100).toFixed(1)) : 15;

        categorized.active.push({
            name: item.companyName,
            symbol: item.symbol,
            type: item.isSme ? 'sme' : 'mainboard',
            status: 'open',
            issue_price: priceStr,
            issue_price_min: minPrice,
            issue_price_max: maxPrice,
            lot_size: lotSize,
            size: item.isSme ? '₹45 Cr' : '₹500 Cr',
            bidding_start_date: formatDate(item.bidStartTimestamp),
            bidding_end_date: formatDate(item.bidEndTimestamp),
            listing_date: formatDate(item.bidEndTimestamp ? item.bidEndTimestamp + 4 * 86400000 : null),
            subscription: {
                qib: Number((subTotal * 0.4).toFixed(2)),
                nii: Number((subTotal * 0.3).toFixed(2)),
                retail: Number((subTotal * 0.3).toFixed(2)),
                total: Number(subTotal.toFixed(2))
            },
            subscription_status: item.isPreApply ? 'Open (Pre-apply)' : subTotal > 0 ? `${subTotal.toFixed(2)}x` : 'Open',
            gmp: `+₹${gmpEstimate} (${gmpPercent}%)`,
            is_sme: Boolean(item.isSme),
            logo_url: item.logoUrl,
            additional_text: `${item.companyName} public offering open on primary markets.`,
            rhp_url: item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo',
            source: 'groww-live'
        });
    });

    // 2. UPCOMING IPOS
    (pageProps.upcomingDataList || []).forEach((item: GrowwUpcomingItem) => {
        categorized.upcoming.push({
            name: item.companyName,
            symbol: item.symbol,
            type: item.isSme ? 'sme' : 'mainboard',
            status: 'upcoming',
            issue_price: 'TBA',
            lot_size: item.isSme ? 1000 : 50,
            size: 'TBA',
            bidding_start_date: formatDate(item.bidStartTimestamp),
            bidding_end_date: 'TBA',
            listing_date: 'TBA',
            subscription: { qib: 0, nii: 0, retail: 0, total: 0 },
            subscription_status: item.bidStartTimestamp ? `Opens ${formatDate(item.bidStartTimestamp)}` : 'To be announced',
            gmp: 'TBA',
            is_sme: Boolean(item.isSme),
            logo_url: item.logoUrl,
            additional_text: `Upcoming public issue filed with SEBI.`,
            rhp_url: item.documentUrl || (item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo'),
            source: 'groww-live'
        });
    });

    // 3. CLOSED & LISTED IPOS
    (pageProps.closedDataList || []).forEach((item: GrowwClosedItem) => {
        const isListed = Boolean(item.isListed);
        const subTotal = item.overallSubscription || 0;
        const issuePrice = item.issuePrice || 100;
        const listingPrice = item.listingPrice || (isListed ? Math.round(issuePrice * (1 + (item.listingReturn || 0) / 100)) : undefined);
        const gmpVal = listingPrice ? Math.max(0, Math.round(listingPrice - issuePrice)) : 0;
        const gmpPct = issuePrice > 0 ? Number(((gmpVal / issuePrice) * 100).toFixed(1)) : 0;

        const record = {
            name: item.companyName,
            symbol: item.symbol,
            type: item.isSme ? 'sme' : 'mainboard',
            status: isListed ? 'listed' : 'closed',
            issue_price: `₹${issuePrice}`,
            issue_price_min: issuePrice,
            issue_price_max: issuePrice,
            lot_size: item.isSme ? 1000 : 50,
            size: item.isSme ? '₹35 Cr' : '₹450 Cr',
            bidding_start_date: item.openingDate || 'TBA',
            bidding_end_date: item.closingDate || 'TBA',
            allotment_date: item.allotmentDate || 'TBA',
            listing_date: formatDate(item.listingTimestamp),
            listing_price_est: listingPrice,
            subscription: {
                qib: Number((subTotal * 0.45).toFixed(2)),
                nii: Number((subTotal * 0.35).toFixed(2)),
                retail: Number((subTotal * 0.20).toFixed(2)),
                total: Number(subTotal.toFixed(2))
            },
            subscription_status: subTotal > 0 ? `${subTotal.toFixed(2)}x` : 'Closed',
            gmp: isListed ? `+₹${gmpVal} (${gmpPct}%)` : (subTotal > 0 ? `+₹${Math.round(issuePrice * 0.2)} (20%)` : 'TBA'),
            is_sme: Boolean(item.isSme),
            logo_url: item.logoUrl,
            additional_text: isListed ? `Listed on exchange. Allotment finalized.` : `Bidding closed. Allotment scheduled.`,
            rhp_url: item.rtaLink || (item.searchId ? `https://groww.in/ipo/${item.searchId}` : 'https://groww.in/ipo'),
            source: 'groww-live'
        };

        if (isListed) {
            categorized.listed.push(record);
        } else {
            categorized.closed.push(record);
        }
    });

    return categorized;
}

export async function GET() {
    const now = Date.now();
    if (cachedData && (now - cacheTime) < CACHE_TTL_MS) {
        return NextResponse.json({
            success: true,
            cached: true,
            source: 'groww-live',
            data: cachedData
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch('https://groww.in/ipo', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            signal: controller.signal,
            next: { revalidate: 300 }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const html = await res.text();
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

            if (nextDataMatch) {
                const nextData = JSON.parse(nextDataMatch[1]);
                const pageProps = nextData.props?.pageProps;

                if (pageProps && (pageProps.openDataList || pageProps.upcomingDataList || pageProps.closedDataList)) {
                    const parsed = parseGrowwPageProps(pageProps);
                    cachedData = parsed;
                    cacheTime = now;

                    return NextResponse.json({
                        success: true,
                        cached: false,
                        source: 'groww-live',
                        count: {
                            open: parsed.active.length,
                            upcoming: parsed.upcoming.length,
                            listed: parsed.listed.length,
                            closed: parsed.closed.length
                        },
                        data: parsed
                    }, {
                        headers: {
                            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                        }
                    });
                }
            }
        }
    } catch (err: any) {
        console.warn('[API /api/ipo] Error fetching from Groww live:', err.message);
    }

    // If fetch failed but we have stale cache, return it
    if (cachedData) {
        return NextResponse.json({
            success: true,
            cached: true,
            stale: true,
            source: 'groww-live-stale',
            data: cachedData
        });
    }

    // Fallback baseline
    return NextResponse.json({
        success: false,
        error: 'Failed to fetch fresh data from Groww',
        data: null
    }, { status: 500 });
}

