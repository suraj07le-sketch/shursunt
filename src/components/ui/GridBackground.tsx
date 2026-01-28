"use client";

import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { MouseEvent } from "react";

export function GridBackground() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect();

        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className="absolute inset-0 w-full h-full bg-background overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Base Grid - Visible in both Light and Dark mode */}
            {/* Light Mode: Gray grid on White. Dark Mode: White grid on Black */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.4] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Hover Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          rgba(14, 165, 233, 0.15),
                          transparent 80%
                        )
                    `,
                }}
            />
            {/* Secondary stronger spotlight for Light Mode visibility */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          400px circle at ${mouseX}px ${mouseY}px,
                          var(--primary) 0%,
                          transparent 10%
                        )
                    `,
                    opacity: 0.1
                }}
            />
        </div>
    );
}
