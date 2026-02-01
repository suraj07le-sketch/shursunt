"use client";

import { motion } from "framer-motion";

export function PredictionsLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-8">
            <div className="relative w-24 h-24">
                {/* Core Pulsing Circle */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                />

                {/* Rotating Rings */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-transparent border-l-transparent"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-2 border-secondary/30 border-b-transparent border-r-transparent"
                />

                {/* Center Tech Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-foreground rounded-full shadow-[0_0_10px_currentColor] dark:shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    />
                </div>
            </div>


        </div>
    );
}
