
export function getLogoUrl(coin: { image?: string | null; symbol: string; name: string; asset_type?: string }): string | null {
    // Return provided image if valid and NOT a broken generator URL
    if (coin.image && !coin.image.includes("clearbit.com")) {
        return coin.image;
    }

    return null;
}
