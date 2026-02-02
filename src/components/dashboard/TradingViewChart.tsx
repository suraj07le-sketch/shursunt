"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface TradingViewChartProps {
    coinId: string;
    data?: CandlestickData[];
}

export function TradingViewChart({ coinId }: TradingViewChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#a3a3a3',
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
            },
        });

        const candlestickSeries = (chart as any).addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        // Mock data for the demo
        const generateData = () => {
            const data: CandlestickData[] = [];
            let time = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
            let lastPrice = Math.random() * 50000 + 1000;

            for (let i = 0; i < 100; i++) {
                const open = lastPrice;
                const close = open + (Math.random() - 0.5) * (open * 0.05);
                const high = Math.max(open, close) + Math.random() * (open * 0.02);
                const low = Math.min(open, close) - Math.random() * (open * 0.02);

                data.push({
                    time: (time.getTime() / 1000) as any,
                    open,
                    high,
                    low,
                    close,
                });

                lastPrice = close;
                time.setDate(time.getDate() + 1);
            }
            return data;
        };

        candlestickSeries.setData(generateData());

        chart.timeScale().fitContent();
        chartRef.current = chart;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [coinId]);

    return (
        <div className="w-full bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Live Market Chart</h4>
                <div className="flex gap-2">
                    {['1H', '4H', '1D', '1W'].map((tf) => (
                        <button key={tf} className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold border transition-colors",
                            tf === '1D' ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
                        )}>
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
