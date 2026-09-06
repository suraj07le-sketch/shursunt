"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let timeoutId: NodeJS.Timeout;

        let star: {
            x: number;
            y: number;
            angle: number;
            scale: number;
            speed: number;
        } | null = null;

        const createStar = () => {
            const width = canvas.width || window.innerWidth;
            star = {
                x: Math.random() * width,
                y: 0,
                angle: Math.random() * 90 + 45,
                scale: 1 + Math.random(),
                speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
            };

            const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
            timeoutId = setTimeout(createStar, randomDelay);
        };

        const updateSize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const newW = Math.floor(width);
            const newH = Math.floor(height);
            if (canvas.width !== newW || canvas.height !== newH) {
                canvas.width = newW;
                canvas.height = newH;
            }
        };

        updateSize();
        createStar();

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (star) {
                star.x += star.speed * Math.cos((star.angle * Math.PI) / 180);
                star.y += star.speed * Math.sin((star.angle * Math.PI) / 180);

                if (star.x < -50 || star.x > canvas.width + 50 || star.y > canvas.height + 50) {
                    star = null;
                } else {
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.rotate((star.angle * Math.PI) / 180);

                    const currentWidth = starWidth * star.scale;
                    const gradient = ctx.createLinearGradient(-currentWidth, 0, 0, 0);
                    gradient.addColorStop(0, "rgba(46, 185, 223, 0)");
                    gradient.addColorStop(1, starColor);

                    ctx.fillStyle = gradient;
                    ctx.fillRect(-currentWidth, 0, currentWidth, starHeight);
                    ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(canvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (timeoutId) clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [minSpeed, maxSpeed, minDelay, maxDelay, starColor, trailColor, starWidth, starHeight]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full absolute inset-0 z-0 pointer-events-none", className)}
        />
    );
};
