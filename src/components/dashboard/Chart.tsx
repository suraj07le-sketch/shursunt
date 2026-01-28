"use client";

import { createChart, ColorType, IChartApi, UTCTimestamp, CandlestickSeries } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ChartProps {
    coinId: string;
    theme?: "dark" | "light" | "neon" | "cyber";
}

const timeframes = ["1H", "4H", "1D", "1W"];

export default function Chart({ coinId, theme = "dark" }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [activeTimeframe, setActiveTimeframe] = useState("1D");

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: theme === "light" ? "black" : "white",
            },
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.1)" },
                horzLines: { color: "rgba(255, 255, 255, 0.1)" },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        const candlestickSeriesInstance = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderVisible: false,
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
        });

        // Mock Data Generator
        const generateData = () => {
            const data = [];
            let time = (new Date("2023-01-01").getTime() / 1000) as UTCTimestamp;
            let open = 100;
            for (let i = 0; i < 100; i++) {
                const close = open + (Math.random() - 0.5) * 10;
                const high = Math.max(open, close) + Math.random() * 5;
                const low = Math.min(open, close) - Math.random() * 5;
                data.push({ time, open, high, low, close });
                time = (time + 86400) as UTCTimestamp;
                open = close;
            }
            return data;
        };

        candlestickSeriesInstance.setData(generateData());

        chartRef.current = chart;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [theme, coinId]);

    return (
        <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Price Chart</h3>
                <div className="flex gap-2">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={cn(
                                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                                activeTimeframe === tf ? "bg-primary text-white" : "hover:bg-white/10"
                            )}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}
