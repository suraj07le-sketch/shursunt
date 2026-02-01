"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ShineButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  shineColor?: string;
  shineSize?: "sm" | "md" | "lg";
}

export function ShineButton({
  children,
  className,
  onClick,
  shineColor = "#ffffff",
  shineSize = "md",
}: ShineButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeMap = {
    sm: { width: 80, offset: 40 },
    md: { width: 120, offset: 60 },
    lg: { width: 200, offset: 100 },
  };

  const { width, offset } = sizeMap[shineSize];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground",
        "transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 h-full w-full opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.6 : 0,
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${shineColor}20 20%,
            ${shineColor}50 50%,
            ${shineColor}20 80%,
            transparent 100%
          )`,
          transform: "skewX(-20deg)",
          animation: isHovered ? `shine ${width * 10}ms linear infinite` : "none",
        }}
      />

      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface ShineCardProps {
  children: React.ReactNode;
  className?: string;
  shineColor?: string;
}

export function ShineCard({
  children,
  className,
  shineColor = "#ffffff",
}: ShineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base background */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
        {/* Shine effect */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.3 : 0,
            background: `linear-gradient(
              135deg,
              transparent 0%,
              ${shineColor}10 25%,
              ${shineColor}30 50%,
              ${shineColor}10 75%,
              transparent 100%
            )`,
          }}
        />

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

interface ShimmerProps {
  className?: string;
  speed?: number;
}

export function Shimmer({ className, speed = 1.5 }: ShimmerProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        animation: `shimmer ${speed}s infinite linear`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 25%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 75%,
            transparent 100%
          )`,
          transform: "translateX(-100%)",
          animation: `shimmer-slide ${speed}s infinite linear`,
        }}
      />
    </div>
  );
}

interface SweepRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
  duration?: number;
}

export function SweepReveal({
  children,
  className,
  direction = "right",
  duration = 300,
}: SweepRevealProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTransformOrigin = () => {
    switch (direction) {
      case "left":
        return "left center";
      case "right":
        return "right center";
      case "top":
        return "center top";
      case "bottom":
        return "center bottom";
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformOrigin: getTransformOrigin(),
      }}
    >
      <div
        className="absolute inset-0 bg-primary/10"
        style={{
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
          transition: `transform ${duration}ms ease-out`,
          transformOrigin: getTransformOrigin(),
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.05,
  duration = 200,
}: HoverScaleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="transition-all duration-200 ease-out"
        style={{
          transform: isHovered ? `scale(${scale})` : "scale(1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function RippleEffect({
  children,
  className,
  color = "#ff9f1c",
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
    >
      {children}

      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
            backgroundColor: color,
            opacity: 0.3,
            animation: "ripple 600ms ease-out forwards",
          }}
        />
      ))}
    </div>
  );
}

interface SpotlightButtonV2Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SpotlightButtonV2({
  children,
  className,
  onClick,
}: SpotlightButtonV2Props) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border px-6 py-3 font-semibold text-foreground",
        "transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        className
      )}
    >
      {/* Spotlight */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 159, 28, 0.15), transparent 50%)`,
        }}
      />

      {/* Animated gradient border effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.5 : 0,
          background: `linear-gradient(
            ${mousePosition.x / 300}deg,
            transparent,
            rgba(255, 159, 28, 0.1),
            transparent
          )`,
        }}
      />

      <span className="relative z-10">{children}</span>
    </button>
  );
}
