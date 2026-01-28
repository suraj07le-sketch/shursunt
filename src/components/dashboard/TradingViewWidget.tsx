"use client";

import { useEffect, useRef, memo } from 'react';

export default memo(function TradingViewWidget({ symbol, className, style }: { symbol: string, className?: string, style?: React.CSSProperties }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    // Clear previous widget
    currentContainer.innerHTML = '';

    // Generate a unique ID to ensure the script finds the correct container
    const containerId = `tradingview_${Math.random().toString(36).substring(2, 11)}`;

    // Create widget container div
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.id = containerId; // Assign the ID
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    currentContainer.appendChild(widgetContainer);

    // Create script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "symbol": symbol,
      "interval": "D",
      "timezone": "Asia/Kolkata",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "gridColor": "rgba(255, 255, 255, 0.05)",
      "allow_symbol_change": true,
      "container_id": containerId, // Pass the ID to the widget
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    // Append script (this triggers the widget load)
    // Use requestAnimationFrame to ensure the DOM has updated
    const timer = setTimeout(() => {
      if (currentContainer && document.getElementById(containerId)) {
        currentContainer.appendChild(script);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [symbol]);

  // If style is provided, use it. Otherwise default to full width/height of parent.
  const containerStyle = style ? { width: "100%", ...style } : { width: "100%", height: "100%" };

  return (
    <div
      className={`tradingview-widget-container ${className || ""}`}
      ref={container}
      style={containerStyle}
    >
      {/* Widget and Script will be injected here */}
    </div>
  );
});
