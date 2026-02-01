"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ThinShineTextProps {
    children: React.ReactNode;
    className?: string;
    shineColor?: string;
    duration?: number;
}

/** Creates a thin, sharp shine effect for text - no boxy gradient */
export function ThinShineText({
    children,
    className,
    shineColor = "rgba(255, 255, 255, 0.9)",
    duration = 800,
}: ThinShineTextProps) {
    return (
        <span className={cn("relative inline-block overflow-hidden", className)}>
            {/* Thin sharp shine line */}
            <span
                className="pointer-events-none absolute inset-0 -translate-x-full animate-shine-thin"
                style={{
                    background: `linear-gradient(
            90deg,
            transparent 0%,
            ${shineColor} 48%,
            ${shineColor} 52%,
            transparent 100%
          )`,
                    animationDuration: `${duration}ms`,
                    width: "8%",
                    left: "-8%",
                }}
            />
            {children}
        </span>
    );
}

interface ThinShineBorderProps {
    children: React.ReactNode;
    className?: string;
    shineColor?: string;
    duration?: number;
    direction?: "horizontal" | "vertical";
}

/** Creates a thin, sharp border shine effect */
export function ThinShineBorder({
    children,
    className,
    shineColor = "#ffffff",
    duration = 1000,
    direction = "horizontal",
}: ThinShineBorderProps) {
    const isHorizontal = direction === "horizontal";

    return (
        <div className={cn("relative inline-block", className)}>
            {/* Thin sharp shine */}
            <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                    transform: isHorizontal ? "rotate(0deg)" : "rotate(0deg)",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 animate-shine-thin"
                    style={{
                        transform: isHorizontal ? "translateX(-100%)" : "translateY(-100%)",
                        animationDuration: `${duration}ms`,
                        background: isHorizontal
                            ? `linear-gradient(
                  90deg,
                  transparent 0%,
                  ${shineColor} 45%,
                  ${shineColor} 55%,
                  transparent 100%
                )`
                            : `linear-gradient(
                  180deg,
                  transparent 0%,
                  ${shineColor} 45%,
                  ${shineColor} 55%,
                  transparent 100%
                )`,
                    }}
                />
            </div>
            {children}
        </div>
    );
}

interface ThinShineButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    shineColor?: string;
    lineThickness?: number;
}

export function ThinShineButton({
    children,
    className,
    onClick,
    shineColor = "rgba(255, 255, 255, 0.8)",
    lineThickness = 0.5,
}: ThinShineButtonProps) {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative overflow-hidden rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground",
                "transition-all duration-200",
                className
            )}
        >
            {/* Top thin shine line */}
            <div
                className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
                style={{ height: `${lineThickness}px` }}
            >
                <div
                    className="h-full"
                    style={{
                        background: `linear-gradient(
              90deg,
              transparent 0%,
              ${shineColor} 45%,
              ${shineColor} 55%,
              transparent 100%
            )`,
                        transform: isHovered ? "translateX(0)" : "translateX(-100%)",
                        transition: "transform 350ms ease-in-out",
                        width: "200%",
                    }}
                />
            </div>
            {/* Bottom thin shine line */}
            <div
                className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden"
                style={{ height: `${lineThickness}px` }}
            >
                <div
                    className="h-full"
                    style={{
                        background: `linear-gradient(
              90deg,
              transparent 0%,
              ${shineColor} 45%,
              ${shineColor} 55%,
              transparent 100%
            )`,
                        transform: isHovered ? "translateX(0)" : "translateX(100%)",
                        transition: "transform 350ms ease-in-out",
                        width: "200%",
                    }}
                />
            </div>
            <span className="relative z-10">{children}</span>
        </button>
    );
}

interface GlintProps {
    children: React.ReactNode;
    className?: string;
    color?: string;
    duration?: number;
}

/** Creates a subtle glint/shimmer effect for any element */
export function Glint({
    children,
    className,
    color = "rgba(255, 255, 255, 0.6)",
    duration = 2000,
}: GlintProps) {
    return (
        <span className={cn("relative inline-block overflow-hidden", className)}>
            <span
                className="pointer-events-none absolute inset-0 -translate-x-full animate-glint"
                style={{
                    background: `linear-gradient(
            90deg,
            transparent 0%,
            ${color} 40%,
            ${color} 60%,
            transparent 100%
          )`,
                    animationDuration: `${duration}ms`,
                    width: "15%",
                    left: "-15%",
                }}
            />
            {children}
        </span>
    );
}

interface SweepLineProps {
    className?: string;
    color?: string;
    height?: number;
    duration?: number;
}

/** Creates a sweeping thin line effect */
export function SweepLine({
    className,
    color = "rgba(255, 255, 255, 0.8)",
    height = 0.5,
    duration = 600,
}: SweepLineProps) {
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <div
                className="absolute inset-0"
                style={{
                    height: `${height}px`,
                    background: color,
                    opacity: 0.2,
                }}
            />
            <div
                className="absolute inset-y-0 left-0 animate-sweep-line"
                style={{
                    height: `${height}px`,
                    background: color,
                    animationDuration: `${duration}ms`,
                    width: "100%",
                }}
            />
        </div>
    );
}

interface EdgeShineProps {
    children: React.ReactNode;
    className?: string;
    shineColor?: string;
    thickness?: number;
}

/** Creates a thin edge shine that runs along the border */
export function EdgeShine({
    children,
    className,
    shineColor = "rgba(255, 255, 255, 0.7)",
    thickness = 0.5,
}: EdgeShineProps) {
    return (
        <div className={cn("relative inline-block", className)}>
            {/* Base element */}
            <div className="relative">{children}</div>
            {/* Top edge shine */}
            <div
                className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
                style={{ height: `${thickness}px` }}
            >
                <div
                    className="h-full w-full animate-edge-shine"
                    style={{
                        background: `linear-gradient(
              90deg,
              transparent 0%,
              ${shineColor} 45%,
              ${shineColor} 55%,
              transparent 100%
            )`,
                        animationDuration: "2s",
                        width: "200%",
                    }}
                />
            </div>
        </div>
    );
}
