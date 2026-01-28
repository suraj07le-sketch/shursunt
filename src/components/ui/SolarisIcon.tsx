import React from "react";
import Image from "next/image";

export const SolarisIcon = ({ className = "w-6 h-6", color = "currentColor" }: { className?: string, color?: string }) => {
    // Determine dimensions based on className if possible, or fallback to filling parent container
    // We use 'fill' to let the parent div control the size via className
    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            <Image
                src="/solaris-logo.png"
                alt="Solaris Logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
};
