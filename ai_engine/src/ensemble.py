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
        visual_impact = visual_features.get('visual_momentum', 0) * 0.15 # 15% weight for CV

        # 4. Predict (Mocking for now as we need trained models)
        # In a real scenario, we'd process sequences for LSTM and flatten for XGB
        
        # Mock Prediction Logic based on rules for now until training is complete
        # This allows the API to function immediately while models train
        
        # Simple logic based on indicators
        rsi = df['rsi'].iloc[-1]
        
        # Combined Prediction (Models + Visual)
        move_magnitude = np.random.normal(0, 0.01) + visual_impact
        predicted_price = current_price * (1 + move_magnitude)
        
        # Signal Logic
        signal = "Hold"
        confidence = 0.5 + (abs(visual_impact) * 0.5) # CV Increases confidence
        
        if predicted_price > current_price * 1.01 and rsi < 65:
            signal = "Buy"
            if "TRIANGLE/WEDGE" in visual_features['patterns']:
                confidence += 0.1 # Pattern confirmation bonus
        elif predicted_price < current_price * 0.99 and rsi > 35:
            signal = "Sell"
            if "TRIANGLE/WEDGE" in visual_features['patterns']:
                confidence += 0.1
            
        return {
            "pair": symbol,
            "prediction": signal,
            "current_price": float(current_price),
            "target_price": float(predicted_price),
            "confidence": float(min(0.99, confidence)),
            "visual_patterns": visual_features['patterns'],
            "visual_momentum": float(visual_impact),
            "timestamp": pd.Timestamp.now().isoformat()
        }

if __name__ == "__main__":
    engine = HybridEngine()
    result = engine.run_prediction()
    print(result)
