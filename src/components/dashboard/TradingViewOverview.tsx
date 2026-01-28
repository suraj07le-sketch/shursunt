"use client";

import { useEffect, useRef, memo } from 'react';

function TradingViewOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "460",
        "plotLineColorGrowing": "rgba(34, 197, 94, 1)",
        "plotLineColorFalling": "rgba(239, 68, 68, 1)",
        "gridLineColor": "rgba(255, 255, 255, 0.05)",
        "scaleFontColor": "rgba(255, 255, 255, 0.5)",
        "belowLineFillColorGrowing": "rgba(34, 197, 94, 0.12)",
        "belowLineFillColorFalling": "rgba(239, 68, 68, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(34, 197, 94, 0)",
        "belowLineFillColorFallingBottom": "rgba(239, 68, 68, 0)",
        "symbolActiveColor": "rgba(255, 255, 255, 0.12)",
        "tabs": [
          {
            "title": "Crypto",
            "symbols": [
              {
                "s": "BINANCE:BTCUSDT",
                "d": "Bitcoin"
              },
              {
                "s": "BINANCE:ETHUSDT",
                "d": "Ethereum"
              },
              {
                "s": "BINANCE:BNBUSDT",
                "d": "BNB"
              },
               {
                "s": "BINANCE:XRPUSDT",
                "d": "XRP"
              },
              {
                "s": "BINANCE:SOLUSDT",
                "d": "Solana"
              }
            ],
            "originalTitle": "Indices"
          }
        ]
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="h-[85vh] w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewOverview);
