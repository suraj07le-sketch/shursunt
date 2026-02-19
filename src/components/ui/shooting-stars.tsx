"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    angle: number;
    scale: number;
    speed: number;
    distance: number;
}

interface ShootingStarsProps {
    minSpeed?: number;
    maxSpeed?: number;
    minDelay?: number;
    maxDelay?: number;
    starColor?: string;
    trailColor?: string;
    starWidth?: number;
    starHeight?: number;
    className?: string;
}

export const ShootingStars = ({
    minSpeed = 10,
    maxSpeed = 30,
    minDelay = 1200,
    maxDelay = 4200,
    starColor = "#9E00FF",
    trailColor = "#2EB9DF",
    starWidth = 10,
    starHeight = 1,
    className,
}: ShootingStarsProps) => {
    const [star, setStar] = useState<ShootingStar | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const createStar = () => {
            const { innerWidth, innerHeight } = window;
            const x = Math.random() * innerWidth;
            const y = 0;
            const angle = Math.random() * 90 + 45; // angle between 45 and 135 degrees
            const scale = 1 + Math.random();
            const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
            const distance = 0;

            setStar({ id: Date.now(), x, y, angle, scale, speed, distance });

            const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
            timeoutId = setTimeout(createStar, randomDelay);
        };

        createStar();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [minSpeed, maxSpeed, minDelay, maxDelay]);

    useEffect(() => {
        const moveStar = () => {
            setStar((prevStar) => {
                if (!prevStar) return null;
                const newX =
                    prevStar.x +
                    prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
                const newY =
                    prevStar.y +
                    prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
                const newDistance = prevStar.distance + prevStar.speed;
                const { innerWidth, innerHeight } = window;

                if (newX < -20 || newX > innerWidth + 20 || newY > innerHeight + 20) {
                    return null;
                }

                return {
                    ...prevStar,
                    x: newX,
                    y: newY,
                    distance: newDistance,
                };
            });
            requestAnimationFrame(moveStar);
        };

        const animationFrame = requestAnimationFrame(moveStar);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <svg
            ref={svgRef}
            className={cn("w-full h-full absolute inset-0 z-0 pointer-events-none", className)}
        >
            {star && (
                <rect
                    key={star.id}
                    x={star.x}
                    y={star.y}
                    width={starWidth * star.scale}
                    height={starHeight}
                    fill="url(#gradient)"
                    transform={`rotate(${star.angle}, ${star.x + (starWidth * star.scale) / 2
                        }, ${star.y + starHeight / 2})`}
                />
            )}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
                    <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
                </linearGradient>
            </defs>
        </svg>
    );
};
