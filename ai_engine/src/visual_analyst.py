import cv2
import numpy as np
import pandas as pd

class VisualAnalyst:
    """
    Uses Computer Vision (OpenCV) to analyze price charts as geometric structures.
    This mimics how human traders identify patterns like trendlines and support/resistance.
    """
    
    def __init__(self, width=400, height=200):
        self.width = width
        self.height = height

    def _create_synthetic_chart(self, prices):
        """
        Converts a price series into a black and white image.
        """
        # Normalize prices to fit in image height
        min_p, max_p = np.min(prices), np.max(prices)
        if max_p == min_p:
            normalized = np.zeros_like(prices)
        else:
            normalized = (prices - min_p) / (max_p - min_p)
            normalized = (1 - normalized) * (self.height - 1)
        
        # Create empty image
        img = np.zeros((self.height, self.width), dtype=np.uint8)
        
        # X coordinates (stretching sequence to image width)
        x_coords = np.linspace(0, self.width - 1, len(prices)).astype(int)
        y_coords = normalized.astype(int)
        
        # Draw the line
        points = np.column_stack((x_coords, y_coords))
        cv2.polylines(img, [points], isClosed=False, color=255, thickness=1)
        
        return img

    def analyze_patterns(self, price_series):
        """
        Main entry point for CV analysis.
        Returns a dictionary of visual features.
        """
        if len(price_series) < 50:
            return {"visual_momentum": 0, "patterns": [], "sr_count": 0}

        img = self._create_synthetic_chart(price_series)
        
        # 1. Detect Lines using Probabilistic Hough Transform
        # This identifies trendlines and horizontal S/R zones
        lines = cv2.HoughLinesP(img, 1, np.pi/180, threshold=20, minLineLength=30, maxLineGap=10)
        
        visual_momentum = 0
        sr_lines = []
        trend_lines = []
        
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                
                # Calculate slope (angle)
                angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                
                # Horizontal-ish lines are Support/Resistance
                if abs(angle) < 5:
                    sr_lines.append(y1) # Normalized Y level
                else:
                    trend_lines.append(angle)
            
            if trend_lines:
                visual_momentum = np.mean(trend_lines) / 90.0 # Normalize -1 to 1

        # 2. Heuristic Pattern Detection (Triangle/Channel)
        patterns = []
        if len(trend_lines) >= 2:
            # If we have multiple lines with opposing angles, it might be a triangle
            if any(a > 5 for a in trend_lines) and any(a < -5 for a in trend_lines):
                patterns.append("TRIANGLE/WEDGE")
            elif np.std(trend_lines) < 2:
                patterns.append("CHANNEL")

        return {
            "visual_momentum": float(visual_momentum),
            "patterns": patterns,
            "sr_levels_count": len(sr_lines),
            "has_visual_support": any(abs(price_series[-1] - l) < 5 for l in sr_lines) if sr_lines else False
        }

if __name__ == "__main__":
    # Test with dummy data
    dummy_prices = np.sin(np.linspace(0, 10, 100)) + np.linspace(0, 5, 100)
    va = VisualAnalyst()
    print(va.analyze_patterns(dummy_prices))
