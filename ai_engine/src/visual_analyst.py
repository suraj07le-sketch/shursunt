import cv2
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

class VisualAnalyst:
    """
    Advanced Computer Vision chart analysis using OpenCV.
    Renders candlestick charts at high resolution, detects visual patterns,
    support/resistance zones, and trend geometry.
    """
    
    def __init__(self, width=800, height=400):
        self.width = width
        self.height = height

    def _create_candlestick_chart(self, open_prices, high_prices, low_prices, close_prices):
        """
        Renders a full OHLC candlestick chart as an image (not just close price line).
        """
        n = len(close_prices)
        if n == 0:
            return np.zeros((self.height, self.width), dtype=np.uint8)

        all_prices = np.concatenate([high_prices, low_prices])
        min_p, max_p = np.min(all_prices), np.max(all_prices)
        price_range = max_p - min_p if max_p != min_p else 1

        def price_to_y(price):
            return int((1 - (price - min_p) / price_range) * (self.height - 20) + 10)

        img = np.zeros((self.height, self.width), dtype=np.uint8)
        candle_width = max(1, self.width // n)
        gap = max(1, candle_width // 4)
        body_width = max(1, candle_width - gap)

        for i in range(n):
            x_center = int((i + 0.5) * candle_width)
            x_left = x_center - body_width // 2
            x_right = x_left + body_width

            wick_top = price_to_y(high_prices[i])
            wick_bottom = price_to_y(low_prices[i])
            body_top = price_to_y(max(open_prices[i], close_prices[i]))
            body_bottom = price_to_y(min(open_prices[i], close_prices[i]))

            is_bullish = close_prices[i] >= open_prices[i]
            
            # Draw wick
            cv2.line(img, (x_center, wick_top), (x_center, wick_bottom), 128, 1)
            
            # Draw body
            if body_top == body_bottom:
                body_bottom = body_top + 1  # At least 1px
            
            if is_bullish:
                cv2.rectangle(img, (x_left, body_top), (x_right, body_bottom), 255, -1)  # Filled bright
            else:
                cv2.rectangle(img, (x_left, body_top), (x_right, body_bottom), 180, 1)  # Outline only

        return img

    def _detect_sr_zones(self, img, prices_high, prices_low):
        """
        Uses Canny edge detection + horizontal line detection to find S/R zones.
        Clusters horizontal lines using KMeans to find key price levels.
        """
        # Edge detection
        edges = cv2.Canny(img, 30, 100)
        
        # Detect horizontal lines
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=15, minLineLength=40, maxLineGap=15)
        
        horizontal_levels = []
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
                if angle < 8:  # Near-horizontal
                    horizontal_levels.append((y1 + y2) / 2)
        
        if len(horizontal_levels) < 2:
            return []
        
        # Cluster horizontal levels into S/R zones
        n_clusters = min(5, len(horizontal_levels))
        horizontal_arr = np.array(horizontal_levels).reshape(-1, 1)
        
        try:
            kmeans = KMeans(n_clusters=n_clusters, n_init=5, random_state=42)
            kmeans.fit(horizontal_arr)
            
            # Convert pixel y-coords back to price levels
            all_prices = np.concatenate([prices_high, prices_low])
            min_p, max_p = np.min(all_prices), np.max(all_prices)
            price_range = max_p - min_p if max_p != min_p else 1
            
            sr_prices = []
            for center_y in kmeans.cluster_centers_:
                y_norm = (center_y[0] - 10) / (self.height - 20)
                price = max_p - y_norm * price_range
                sr_prices.append(float(price))
            
            return sorted(sr_prices)
        except Exception:
            return []

    def _analyze_trend_geometry(self, img):
        """
        Uses Hough Transform on the rendered chart to detect trend angles.
        """
        lines = cv2.HoughLinesP(img, 1, np.pi/180, threshold=25, minLineLength=50, maxLineGap=15)
        
        visual_momentum = 0
        trend_lines = []
        
        if lines is not None:
            max_x = self.width - 1
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = -np.degrees(np.arctan2(y2 - y1, x2 - x1))
                
                # Weight by recency (position on x-axis)
                recency_weight = (max(x1, x2) / max_x) ** 2
                
                if abs(angle) >= 3:  # Not horizontal (those are S/R)
                    trend_lines.append(angle * recency_weight)
            
            if trend_lines:
                visual_momentum = np.mean(trend_lines) / 45.0
                visual_momentum = max(-1.0, min(1.0, visual_momentum))
        
        return visual_momentum, trend_lines

    def _detect_chart_patterns(self, trend_lines, close_prices):
        """
        Detects geometric chart patterns from trendline angles.
        """
        patterns = []
        
        if len(trend_lines) >= 2:
            positive = [a for a in trend_lines if a > 5]
            negative = [a for a in trend_lines if a < -5]
            
            # Triangle/Wedge: converging trendlines
            if positive and negative:
                patterns.append("TRIANGLE/WEDGE")
            # Channel: parallel trendlines
            elif len(positive) >= 2 and np.std(positive) < 3:
                patterns.append("ASCENDING_CHANNEL")
            elif len(negative) >= 2 and np.std(negative) < 3:
                patterns.append("DESCENDING_CHANNEL")
            # Consolidation
            elif np.std(trend_lines) < 2:
                patterns.append("CONSOLIDATION")
        
        # Check for recent breakout
        if len(close_prices) >= 20:
            recent = close_prices[-5:]
            lookback = close_prices[-20:-5]
            high_range = max(lookback)
            low_range = min(lookback)
            
            if recent[-1] > high_range * 1.01:
                patterns.append("BULLISH_BREAKOUT")
            elif recent[-1] < low_range * 0.99:
                patterns.append("BEARISH_BREAKDOWN")
        
        return patterns

    def analyze_patterns(self, price_series, open_prices=None, high_prices=None, low_prices=None):
        """
        Main entry point for CV analysis.
        Returns comprehensive visual features.
        """
        if len(price_series) < 50:
            return {
                "visual_momentum": 0,
                "patterns": [],
                "sr_levels_count": 0,
                "sr_levels": [],
                "has_visual_support": False
            }

        # Use OHLC if available, otherwise synthesize from close
        if open_prices is None:
            open_prices = np.roll(price_series, 1)
            open_prices[0] = price_series[0]
        if high_prices is None:
            high_prices = np.maximum(price_series, open_prices) * 1.002
        if low_prices is None:
            low_prices = np.minimum(price_series, open_prices) * 0.998

        # 1. Render full candlestick chart (800x400)
        img = self._create_candlestick_chart(open_prices, high_prices, low_prices, price_series)
        
        # 2. Detect S/R zones using edge detection + clustering
        sr_levels = self._detect_sr_zones(img, high_prices, low_prices)
        
        # 3. Analyze trend geometry
        visual_momentum, trend_lines = self._analyze_trend_geometry(img)
        
        # 4. Detect chart patterns
        patterns = self._detect_chart_patterns(trend_lines, price_series)
        
        # 5. Check proximity to S/R
        current_price = price_series[-1]
        has_support = False
        has_resistance = False
        
        for level in sr_levels:
            distance_pct = abs(current_price - level) / current_price * 100
            if distance_pct < 1.5:
                if level < current_price:
                    has_support = True
                else:
                    has_resistance = True

        return {
            "visual_momentum": float(visual_momentum),
            "patterns": patterns,
            "sr_levels_count": len(sr_levels),
            "sr_levels": sr_levels,
            "has_visual_support": has_support,
            "has_visual_resistance": has_resistance,
            "trend_line_count": len(trend_lines)
        }

if __name__ == "__main__":
    # Test with sine wave + trend
    x = np.linspace(0, 20, 200)
    prices = 100 + 5 * x + 3 * np.sin(x * 2) + np.random.normal(0, 1, 200)
    opens_list = np.roll(prices, 1).tolist()
    if isinstance(opens_list, list):
        opens_list[0] = float(prices[0])
    opens = np.array(opens_list)
    highs = prices + np.random.uniform(0.5, 2, 200)
    lows = prices - np.random.uniform(0.5, 2, 200)
    
    va = VisualAnalyst()
    result = va.analyze_patterns(prices, opens, highs, lows)
    print("Visual Momentum:", result['visual_momentum'])
    print("Patterns:", result['patterns'])
    sr_levels = result.get('sr_levels', [])
    print("S/R Levels:", len(sr_levels) if isinstance(sr_levels, list) else 0)
    print("Has Support:", result['has_visual_support'])
