export interface CoinData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
    image: string;
    high_24h: number;
    low_24h: number;
}

export async function getCoinData(coinId: string): Promise<CoinData | null> {
    try {
        // Using CoinGecko Free API
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!res.ok) {
            throw new Error('Failed to fetch coin data');
        }

        const data = await res.json();

        if (data.length === 0) return null;

        const coin = data[0];
        return {
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            image: coin.image,
            high_24h: coin.high_24h,
            low_24h: coin.low_24h,
        };
    } catch (error) {
        console.error('Error fetching coin data:', error);
        return null;
    }
}

export async function getTopCoins(limit: number = 10): Promise<CoinData[]> {
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            throw new Error('Failed to fetch top coins');
        }

        const data = await res.json();
        return data.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            image: coin.image,
            high_24h: coin.high_24h,
            low_24h: coin.low_24h,
        }));
    } catch (error) {
        console.error('Error fetching top coins:', error);
        return [];
    }
}

