"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    tiltStrength?: number;
    perspective?: number;
    resetSpeed?: number;
    glareEffect?: boolean;
}

export function TiltCard({
    children,
    className,
    tiltStrength = 10,
    perspective = 1000,
    resetSpeed = 400,
    glareEffect = true,
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotationY = (mouseX / rect.width) * tiltStrength;
            const rotationX = -(mouseY / rect.height) * tiltStrength;

            setRotation({ x: rotationX, y: rotationY });
            setGlowPosition({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
            });
        },
        [tiltStrength]
    );

    const handleMouseLeave = useCallback(() => {
        setRotation({ x: 0, y: 0 });
        setIsHovered(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    return (
        <div
            ref={cardRef}
            className={cn("relative preserve-3d", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                perspective: `${perspective}px`,
            }}
        >
            {/* Glow effect */}
            <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 blur-xl"
                style={{
                    opacity: isHovered ? 0.5 : 0,
                    background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, hsl(var(--primary) / 0.4), transparent 50%)`,
                }}
            />

            {/* Glare effect */}
            {glareEffect && (
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 0.3 : 0,
                        background: `linear-gradient(
              ${135}deg,
              rgba(255, 255, 255, ${isHovered ? 0.1 : 0}) 0%,
              transparent 50%,
              rgba(255, 255, 255, ${isHovered ? 0.05 : 0}) 100%
            )`,
                    }}
                />
            )}

            {/* Tilted card */}
            <div
                className="relative transition-transform duration-[100ms] ease-out"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: "preserve-3d",
                }}
            >
                <div
                    className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl"
                    style={{
                        transform: "translateZ(0px)",
                    }}
                >
                    {children}
                </div>

                {/* 3D depth layers */}
                <div
                    className="absolute inset-0 rounded-2xl border border-primary/20"
                    style={{
                        transform: "translateZ(-10px)",
                        opacity: isHovered ? 0.5 : 0,
                        transition: "opacity 300ms ease-in-out",
                    }}
                />
                <div
                    className="absolute inset-0 rounded-2xl border border-primary/10"
                    style={{
                        transform: "translateZ(-20px)",
                        opacity: isHovered ? 0.3 : 0,
                        transition: "opacity 300ms ease-in-out",
                    }}
                />
            </div>
        </div>
    );
}

interface TiltButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function TiltButton({
    children,
    className,
    onClick,
}: TiltButtonProps) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        setRotation({
            y: (mouseX / rect.width) * 5,
            x: -(mouseY / rect.height) * 5,
        });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <button
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative overflow-hidden rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground",
                "transition-all duration-100 ease-out hover:scale-[1.02] active:scale-[0.98]",
                className
            )}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
}

interface HoverTiltProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

export function HoverTilt({
    children,
    className,
    intensity = 8,
}: HoverTiltProps) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        setRotation({
            x: y * -intensity,
            y: x * intensity,
        });
    };

    return (
        <div
            className={cn("relative transition-transform duration-200 ease-out", className)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setRotation({ x: 0, y: 0 });
            }}
            style={{
                transform: isHovered
                    ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                    : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
            }}
        >
            {children}
        </div>
    );
}
