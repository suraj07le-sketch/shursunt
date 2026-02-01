"use client";

import { useState } from "react";
import Image from "next/image";
import { Coin } from "@/types";
import { getLogoUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface AssetIconProps {
    asset: Coin;
    size?: number;
    type?: 'stock' | 'crypto';
    className?: string;
    containerClassName?: string;
    showBackground?: boolean;
}

export default function AssetIcon({ asset, size = 32, type, className, containerClassName, showBackground = true }: AssetIconProps) {
    const [sourceIndex, setSourceIndex] = useState(0); // 0: primary, 1+: secondaries, final: fallback
    const [imageError, setImageError] = useState(false);

    // Determine the effective asset type
    const effectiveType = type || asset.asset_type || 'crypto';

    // Define fallback sources based on type
    const secondarySources = effectiveType === 'crypto'
        ? [
            `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
            `https://static.crypto.com/token/icons/${asset.symbol.toLowerCase()}/color_icon.png`
        ]
        : [
            `https://financialmodelingprep.com/image-stock/${asset.symbol.toUpperCase()}.png`,
            `https://logos.tradier.com/console/logos/${asset.symbol.toUpperCase()}.png`
        ];

    const logoUrl = sourceIndex === 0
        ? getLogoUrl({ ...asset, asset_type: effectiveType, image: imageError ? null : asset.image })
        : secondarySources[sourceIndex - 1];

    // Style object for dynamic sizing
    const containerStyle = {
        width: `${size}px`,
        height: `${size}px`
    };

    const iconFontSizeClass = size <= 32 ? "text-lg" : size <= 40 ? "text-xl" : "text-2xl";

    const handleImageError = () => {
        if (sourceIndex < secondarySources.length) {
            setSourceIndex(prev => prev + 1);
        } else {
            setImageError(true);
        }
    };

    // Cascade 1: Images (Primary -> Secondaries)
    if (!imageError && logoUrl) {
        return (
            <div
                style={containerStyle}
                className={cn("relative rounded-full overflow-hidden flex-shrink-0 border border-white/10", containerClassName)}
            >
                <Image
                    src={logoUrl}
                    alt={asset.name}
                    width={size}
                    height={size}
                    className={cn("object-cover w-full h-full", className)}
                    unoptimized
                    onError={handleImageError}
                />
            </div>
        );
    }

    // Cascade 2: Font Icon (For Crypto Only)
    // Only attempt font icons if we're sure it's crypto and images failed.
    if (effectiveType === 'crypto') {
        return (
            <div
                style={containerStyle}
                className={cn("rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10", containerClassName || className)}
            >
                <span className={cn(`cf cf-${asset.symbol.toLowerCase()}`, iconFontSizeClass)} />
            </div>
        );
    }

    // Cascade 3: Emergency Fallback (Initials via UI Avatars)
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(asset.name)}&background=random&color=fff&rounded=true&bold=true`;

    return (
        <div
            style={containerStyle}
            className={cn("relative rounded-full overflow-hidden bg-white/5 flex-shrink-0 border border-white/10", containerClassName || className)}
        >
            <img
                src={fallbackUrl}
                alt={asset.name}
                className="object-cover w-full h-full"
            />
        </div>
    );
}
