"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CanvasRevealEffectProps {
  animationSpeed?: number;
  containerClassName?: string;
  colors?: number[][];
  dotSize?: number;
  showGradient?: boolean;
}

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  containerClassName,
  colors = [[59, 130, 246], [139, 92, 246]],
  dotSize = 3,
  showGradient = true,
}: CanvasRevealEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !container) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient effect based on colors
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const color1 = colors[0] || [59, 130, 246];
      const color2 = colors[1] || [139, 92, 246];
      
      gradient.addColorStop(0, `rgb(${color1[0]}, ${color1[1]}, ${color1[2]})`);
      gradient.addColorStop(1, `rgb(${color2[0]}, ${color2[1]}, ${color2[2]})`);
      
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add dot matrix effect
      const spacing = 15;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          
          // Calculate fade-in effect based on time
          const delay = (i + j) * 0.01;
          const progress = Math.max(0, Math.min(1, (time - delay) * animationSpeed));
          
          // Create twinkling effect
          const noise = Math.sin(i * 0.5 + j * 0.3 + time * 2) * 0.5 + 0.5;
          const opacity = progress * noise * 0.6;
          
          if (opacity > 0.01) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize * 0.5, 0, Math.PI * 2);
            
            // Mix colors based on position
            const mixFactor = (i / cols + j / rows) / 2;
            const r = Math.floor(color1[0] * (1 - mixFactor) + color2[0] * mixFactor);
            const g = Math.floor(color1[1] * (1 - mixFactor) + color2[1] * mixFactor);
            const b = Math.floor(color1[2] * (1 - mixFactor) + color2[2] * mixFactor);
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fill();
          }
        }
      }
      
      time += 0.016;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [container, animationSpeed, colors, dotSize]);

  return (
    <div
      ref={setContainer}
      className={cn("absolute inset-0", containerClassName)}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
      />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default CanvasRevealEffect;
