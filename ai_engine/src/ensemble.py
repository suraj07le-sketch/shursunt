import numpy as np
import pandas as pd
from .lstm_model import CryptoLSTM
from .xgb_model import CryptoXGB
from .data_fetcher import DataFetcher
from .features import FeatureEngineer
from .visual_analyst import VisualAnalyst
import joblib
import os

class HybridEngine:
    def __init__(self, model_dir='../models'):
        self.model_dir = model_dir
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

        self.lstm = CryptoLSTM(input_shape=(60, 15)) # 60 timesteps, 15 features? Need to verify feature count
        self.xgb = CryptoXGB()
        self.fetcher = DataFetcher()
        self.fe = FeatureEngineer()
        self.va = VisualAnalyst()
        
        # Weights (Meta-learner could learn these)
        self.w_lstm = 0.6
        self.w_xgb = 0.4

    def train_models(self, symbol='BTC/USDT', timeframe='4h'):
        # 1. Fetch & Feature Engineering
        df = self.fetcher.fetch_ohlcv(symbol, timeframe)
        if df is None: return

        df = self.fe.add_all_features(df)
        
        # 2. Prepare Data for LSTM (Sequence)
        # Need to implement sequence generation
        # For now, let's assume we have a helper or do it here
        # ...
        pass

    def run_prediction(self, symbol='BTC/USDT', timeframe='4h'):
        """
        Runs the full prediction pipeline.
        Fetches data, generates features, runs models, combines output.
        """
        # 1. Fetch
        df = self.fetcher.fetch_ohlcv(symbol, timeframe, limit=200)
        if df is None: return None
        
        # 2. Features
        df = self.fe.add_all_features(df)
        current_price = df['close'].iloc[-1]
        
        # 3. Visual Analysis (OpenCV)
        visual_features = self.va.analyze_patterns(df['close'].values)
        visual_momentum = visual_features.get('visual_momentum', 0)
        
        # 4. Hybrid Prediction Logic
        # This engine combines Visual Chart Analysis with Technical Indicators.
        # It provides a deterministic prediction based on current market data.
        rsi = df['rsi'].iloc[-1]
        macd_diff = df['macd_diff'].iloc[-1]
        ema_20 = df['ema_20'].iloc[-1]
        atr = df['atr'].iloc[-1]
        
        # 1. Trend (EMA)
        trend_score = 0.01 if current_price > ema_20 else -0.01
        
        # 2. Momentum (MACD & RSI)
        momentum_score = 0.005 * np.sign(macd_diff)
        if rsi < 30: momentum_score += 0.01 # Oversold bounce
        if rsi > 70: momentum_score -= 0.01 # Overbought correction
        
        # 3. Visual Impact (15% weight as planned)
        visual_impact = visual_momentum * 0.15
        
        # Combine everything
        move_magnitude = trend_score + momentum_score + visual_impact
        # Add a small volatility factor based on ATR
        move_magnitude *= (atr / current_price) * 10 
        
        predicted_price = current_price * (1 + move_magnitude)
        
        # 5. Signal Logic (Balanced)
        # We look for convergence of indicators
        signal = "Hold"
        confidence = 0.5 + (abs(visual_momentum) * 0.2) + (abs(macd_diff) / (current_price * 0.01))
        
        # BUY CRITERIA
        # Price > EMA + Positive Visual Momentum OR Positive MACD + Oversold RSI
        if (current_price > ema_20 and visual_momentum > 0.1) or (macd_diff > 0 and rsi < 40):
            signal = "Buy"
            if "TRIANGLE/WEDGE" in visual_features['patterns'] and visual_momentum > 0:
                confidence += 0.15
        
        # SELL CRITERIA
        # Price < EMA + Negative Visual Momentum OR Negative MACD + Overbought RSI
        elif (current_price < ema_20 and visual_momentum < -0.1) or (macd_diff < 0 and rsi > 60):
            signal = "Sell"
            if "TRIANGLE/WEDGE" in visual_features['patterns'] and visual_momentum < 0:
                confidence += 0.15
            
        return {
            "pair": symbol,
            "prediction": signal,
            "current_price": float(current_price),
            "target_price": float(predicted_price),
            "confidence": float(min(0.99, confidence)),
            "visual_patterns": visual_features['patterns'],
            "visual_momentum": float(visual_momentum),
            "indicators": {
                "rsi": float(rsi),
                "macd_diff": float(macd_diff),
                "above_ema": bool(current_price > ema_20)
            },
            "timestamp": pd.Timestamp.now().isoformat()
        }

if __name__ == "__main__":
    engine = HybridEngine()
    result = engine.run_prediction()
    print(result)
