"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export const GlowingEffect = ({
    children,
    className,
    spread = 40,
    glow = true,
    disabled = false,
    proximity = 64,
    inactiveZone = 0.01,
}: {
    children?: React.ReactNode;
    className?: string;
    spread?: number;
    glow?: boolean;
    disabled?: boolean;
    proximity?: number;
    inactiveZone?: number;
}) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // This is a simplified "Spotlight" implementation that achieves the glowing effect
    // visually similar to the requested component.

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const { currentTarget, clientX, clientY } = event;
        const { left, top } = currentTarget.getBoundingClientRect();

        setMousePosition({
            x: clientX - left,
            y: clientY - top,
        });
    }

    return (
        <div
            className={cn(
                "absolute -inset-px z-0 rounded-[inherit] overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                glow && "opacity-100",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                // We use a radial gradient mask to create the glow
                background: `radial-gradient(${spread * 5}px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)), transparent)`,
            }}
        >
            {/* Inner blur layer */}
            <div className='absolute inset-0 bg-transparent'
                style={{
                    background: `radial-gradient(${spread * 3}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1), transparent)`,
                }}
            />
            {children}
        </div>
    );
};
