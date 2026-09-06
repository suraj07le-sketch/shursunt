export default function JsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'ShursunT AI',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
        },
        description: 'Algorithmic market intelligence platform providing AI-powered price predictions, confluence setups, and real-time execution analytics across Indian equities and crypto pairs.',
        softwareVersion: '3.2',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
        },
    };

    return (
        <script
            id="shursunt-json-ld"
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
