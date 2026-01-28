import React from "react";
import { CSSProperties } from "react";

interface RippleProps {
    mainCircleSize?: number;
    mainCircleOpacity?: number;
    numCircles?: number;
}

export const Ripple = React.memo(function Ripple({
    mainCircleSize = 210,
    mainCircleOpacity = 0.24,
    numCircles = 8,
}: RippleProps) {
    return (
        <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none select-none">
            {Array.from({ length: numCircles }).map((_, i) => {
                const size = mainCircleSize + i * 70;
                const opacity = mainCircleOpacity - i * 0.03;
                const animationDelay = `${i * 0.06}s`;
                const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
                const borderOpacity = 5 + i * 5;

                return (
                    <div
                        key={i}
                        className={`absolute animate-ripple rounded-full bg-white/5 shadow-xl border border-blue-500/10 [--i:${i}]`}
                        style={
                            {
                                width: size,
                                height: size,
                                opacity: opacity,
                                animationDelay: animationDelay,
                                borderStyle: borderStyle,
                                borderWidth: "1px",
                                borderColor: `rgba(59, 130, 246, ${borderOpacity / 100})`, // Blue tint
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%) scale(1)",
                            } as CSSProperties
                        }
                    />
                );
            })}
        </div>
    );
});

Ripple.displayName = "Ripple";
