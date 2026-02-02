import { MetadataRoute } from 'next'
import { getTopCoins } from '@/lib/coingecko'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://shursunt.com' // Replace with actual domain

    // Static Routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]

    // Dynamic Coin Routes
    const topCoins = await getTopCoins(50);
    const coinRoutes: MetadataRoute.Sitemap = topCoins.map((coin) => ({
        url: `${baseUrl}/price-prediction/${coin.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    return [...routes, ...coinRoutes];
}
