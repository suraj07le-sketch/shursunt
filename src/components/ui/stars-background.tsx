"use client";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useCallback } from "react";

interface StarProps {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    twinkleSpeed: number | null;
}

export const StarsBackground = ({
    starDensity = 0.00015,
    allStarsTwinkle = true,
    twinkleProbability = 0.7,
    minTwinkleSpeed = 0.5,
    maxTwinkleSpeed = 1,
    className,
    minStarSize = 0.5,
    maxStarSize = 1.5,
    starCount,
}: {
    starDensity?: number;
    allStarsTwinkle?: boolean;
    twinkleProbability?: number;
    minTwinkleSpeed?: number;
    maxTwinkleSpeed?: number;
    className?: string;
    minStarSize?: number;
    maxStarSize?: number;
    starCount?: number;
}) => {
    const calculatedStarDensity = starCount ? starCount / 10000 : starDensity;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<StarProps[]>([]);
    const { theme } = useTheme();

    const generateStars = useCallback(
        (width: number, height: number): StarProps[] => {
            const area = width * height;
            const numStars = starCount || Math.floor(area * calculatedStarDensity);
            return Array.from({ length: numStars }, () => {
                const shouldTwinkle = allStarsTwinkle || Math.random() < twinkleProbability;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: minStarSize + Math.random() * (maxStarSize - minStarSize),
                    opacity: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: shouldTwinkle
                        ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
                        : null,
                };
            });
        },
        [
            calculatedStarDensity,
            allStarsTwinkle,
            twinkleProbability,
            minTwinkleSpeed,
            maxTwinkleSpeed,
            minStarSize,
            maxStarSize,
            starCount,
        ]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateStars = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const newW = Math.floor(width);
            const newH = Math.floor(height);
            if (newW > 0 && newH > 0 && (canvas.width !== newW || canvas.height !== newH)) {
                canvas.width = newW;
                canvas.height = newH;
                starsRef.current = generateStars(newW, newH);
            }
        };

        updateStars();

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const currentStars = starsRef.current;
            const starColor = theme === 'light' ? '82, 82, 91' : '255, 255, 255';

            for (let i = 0; i < currentStars.length; i++) {
                const star = currentStars[i];
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

                if (star.twinkleSpeed !== null) {
                    star.opacity = 0.5 + Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
                }

                ctx.fillStyle = `rgba(${starColor}, ${star.opacity})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const resizeObserver = new ResizeObserver(updateStars);
        resizeObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [theme, generateStars]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("h-full w-full absolute inset-0 z-0", className)}
        />
    );
};
