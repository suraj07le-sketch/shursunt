"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBorderProps {
    children: React.ReactNode;
    className?: string;
    borderWidth?: number;
    duration?: number;
    colors?: string[];
}

export function AnimatedGradientBorder({
    children,
    className,
    borderWidth = 2,
    duration = 3000,
    colors = [
        "#ff9f1c",
        "#ffbf00",
        "#00cc88",
        "#00b4d8",
        "#9b5de5",
        "#ff006e",
        "#ff9f1c",
    ],
}: AnimatedGradientBorderProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl bg-background p-[1px]",
                className
            )}
            style={{
                background: `linear-gradient(
          transparent,
          transparent,
          transparent,
          transparent,
          transparent,
          transparent,
          transparent,
          transparent
        )`,
            }}
        >
            {/* Animated gradient border using pseudo-element */}
            <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                    padding: `${borderWidth}px`,
                }}
            >
                <div
                    className="absolute inset-0 rounded-[inherit]"
                    style={{
                        background: `conic-gradient(from 0deg, ${colors.join(", ")})`,
                        animation: `spin ${duration}ms linear infinite`,
                    }}
                />
            </div>

            {/* Inner mask */}
            <div
                className="absolute inset-[1px] rounded-[15px] bg-background"
                style={{
                    backgroundClip: "padding-box",
                }}
            />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}

interface GradientBorderButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "neon";
}

export function GradientBorderButton({
    children,
    className,
    onClick,
    variant = "primary",
}: GradientBorderButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const getGradientColors = () => {
        switch (variant) {
            case "neon":
                return ["#ff00ff", "#00ffff", "#ff00ff"];
            case "secondary":
                return ["#00cc88", "#00b4d8", "#00cc88"];
            default:
                return ["#ff9f1c", "#ffbf69", "#ff9f1c"];
        }
    };

    const colors = getGradientColors();

    return (
        <div className="relative">
            {/* Animated border background */}
            <div
                className="absolute -inset-[1px] rounded-xl overflow-hidden"
                style={{
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 300ms ease-in-out",
                }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `conic-gradient(from 0deg, ${colors.join(", ")})`,
                        animation: "spin 2s linear infinite",
                    }}
                />
            </div>

            <button
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "relative rounded-xl bg-card px-6 py-3 font-semibold text-foreground",
                    "border border-border transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    className
                )}
            >
                {/* Hover glow effect */}
                <div
                    className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 0.5 : 0,
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${colors[0]}33, transparent 50%)`,
                    }}
                />

                <span className="relative z-10">{children}</span>
            </button>
        </div>
    );
}

interface GradientRingProps {
    children: React.ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
}

export function GradientRing({
    children,
    className,
    intensity = "medium",
}: GradientRingProps) {
    const [isHovered, setIsHovered] = useState(false);

    const intensityMap = {
        low: 20,
        medium: 40,
        high: 60,
    };

    return (
        <div
            className={cn("relative", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated gradient ring */}
            <div
                className="absolute -inset-4 rounded-2xl opacity-0 blur-xl transition-all duration-500"
                style={{
                    opacity: isHovered ? 0.6 : 0,
                    background: `conic-gradient(from 0deg, #ff9f1c, #ffbf69, #00cc88, #00b4d8, #9b5de5, #ff006e, #ff9f1c)`,
                    animation: `spin ${intensityMap[intensity] * 100}ms linear infinite`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}
