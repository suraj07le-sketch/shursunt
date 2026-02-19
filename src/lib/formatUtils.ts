/**
 * Formats a numeric value into a localized currency string with intelligent precision.
 * @param value The raw price value
 * @param isStock Whether the asset is a stock (uses ₹) or crypto (uses $)
 * @returns A formatted string like "$1,234.56" or "₹2,345.00"
 */
export const formatCurrency = (value: number | string | null | undefined, isStock: boolean = false): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num === null || num === undefined || isNaN(num)) return "N/A";

    const currencySymbol = isStock ? '₹' : '$';

    if (isStock) {
        // Stocks (INR) usually have 2 decimal places fixed for precision and readability
        return `${currencySymbol}${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    // Crypto Logic: Adaptive precision based on value
    if (num >= 100) {
        // High-value coins (BTC, ETH): 2 decimals are enough
        return `${currencySymbol}${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    } else if (num >= 1) {
        // Mid-value coins: Up to 4 decimals for precision
        return `${currencySymbol}${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
        })}`;
    } else {
        // Low-value/Penny coins (< $1): Up to 8 decimals to avoid "0.00"
        // We use a slightly smarter approach to avoid excessive trailing zeros
        const formatted = num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        });
        return `${currencySymbol}${formatted}`;
    }
};
