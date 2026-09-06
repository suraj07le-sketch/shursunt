import numpy as np
import pandas as pd
from .lstm_model import CryptoLSTM
from .xgb_model import CryptoXGB
from .data_fetcher import DataFetcher
from .features import FeatureEngineer
from .visual_analyst import VisualAnalyst
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

class HybridEngine:
    def __init__(self, model_dir='./models'):
        self.model_dir = model_dir
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

        self.fetcher = DataFetcher()
        self.fe = FeatureEngineer()
        self.va = VisualAnalyst(width=800, height=400)
        
        # Model weights for ensemble
        self.w_lstm = 0.35
        self.w_xgb = 0.35
        self.w_visual = 0.15
        self.w_candle = 0.15

    def _prepare_lstm_data(self, df, seq_len=60):
        """Prepare sequence data for LSTM from feature-engineered dataframe."""
        feature_cols = ['close', 'rsi', 'macd_diff', 'bb_pband', 'volume_ratio', 
                       'atr', 'adx', 'trend_strength', 'momentum_5']
        
        # Use available features only
        available = [c for c in feature_cols if c in df.columns]
        if len(available) < 3:
            return None, None, None, None
        
        data = df[available].values
        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(data)
        
        X, Y = [], []
        for i in range(seq_len, len(scaled) - 1):
            X.append(scaled[i - seq_len:i])
            # Target: next candle direction (1=up, 0=down)
            Y.append(1 if df['close'].iloc[i + 1] > df['close'].iloc[i] else 0)
        
        X = np.array(X)
        Y = np.array(Y)
        
        return X, Y, scaler, len(available)

    def _prepare_xgb_data(self, df):
        """Prepare flat feature data for XGBoost."""
        exclude = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        feature_cols = [c for c in df.columns if c not in exclude and df[c].dtype in ['float64', 'float32', 'int64']]
        
        df_ml = df.copy()
        df_ml['target'] = (df_ml['close'].shift(-1) > df_ml['close']).astype(int)
        df_ml.dropna(inplace=True)
        
        X = df_ml[feature_cols].values
        Y = df_ml['target'].values
        
        return X, Y, feature_cols

    def run_prediction(self, symbol='BTC/USDT', timeframe='4h'):
        """
        Pro prediction pipeline with real ML models.
        Fetches 400 candles, trains models, generates ensemble prediction.
        """
        # 1. Fetch 400 candles
        df = self.fetcher.fetch_ohlcv(symbol, timeframe, limit=400)
        if df is None or len(df) < 100:
            return None
        
        # 2. Feature Engineering (35+ indicators)
        df = self.fe.add_all_features(df)
        current_price = df['close'].iloc[-1]
        
        # 3. Visual Analysis (OpenCV — 800x400 candlestick chart)
        visual_features = self.va.analyze_patterns(
            df['close'].values,
            df['open'].values if 'open' in df.columns else None,
            df['high'].values,
            df['low'].values
        )
        visual_momentum = visual_features.get('visual_momentum', 0)
        
        # 4. Train & Predict with LSTM
        lstm_direction = 0
        lstm_confidence = 50
        try:
            res = self._prepare_lstm_data(df)
            X_lstm, Y_lstm, scaler, n_features = res
            
            if X_lstm is not None:
                # Type narrowing for static analyzer
                x_len = len(X_lstm) if hasattr(X_lstm, '__len__') else 0
                if x_len > 50:
                    lstm = CryptoLSTM(input_shape=(60, n_features))
                    
                    split = int(x_len * 0.8)
                X_train, Y_train = X_lstm[:split], Y_lstm[:split]
                X_val, Y_val = X_lstm[split:], Y_lstm[split:]
                
                # Train
                lstm.train(X_train, Y_train, epochs=20, batch_size=32)
                
                # Predict direction
                pred = lstm.predict(X_lstm[-1:])
                lstm_direction = 1 if pred[0][0] > 0.5 else -1
                
                # Validate
                if len(X_val) > 0:
                    val_preds = lstm.predict(X_val)
                    val_acc = np.mean((val_preds.flatten() > 0.5).astype(int) == Y_val)
                    lstm_confidence = float(val_acc * 100)
        except Exception as e:
            print(f"LSTM training error: {e}")
        
        # 5. Train & Predict with XGBoost
        xgb_direction = 0
        xgb_confidence = 50
        try:
            X_xgb, Y_xgb, feature_names = self._prepare_xgb_data(df)
            if len(X_xgb) > 50:
                xgb = CryptoXGB()
                
                split = int(len(X_xgb) * 0.8)
                X_train, Y_train = X_xgb[:split], Y_xgb[:split]
                X_val, Y_val = X_xgb[split:], Y_xgb[split:]
                
                xgb.train(X_train, Y_train)
                
                pred = xgb.predict(X_xgb[-1:])
                xgb_direction = 1 if pred[0] > 0.5 else -1
                
                # Validate
                val_preds = xgb.predict(X_val)
                val_acc = np.mean((val_preds > 0.5).astype(int) == Y_val)
                xgb_confidence = float(val_acc * 100)
        except Exception as e:
            print(f"XGBoost training error: {e}")
        
        # 6. Technical Indicator Signals
        rsi = df['rsi'].iloc[-1]
        macd_diff = df['macd_diff'].iloc[-1]
        ema_20 = df['ema_20'].iloc[-1]
        atr = df['atr'].iloc[-1]
        adx = df['adx'].iloc[-1] if 'adx' in df.columns else 25
        
        # 7. Candlestick Pattern Signal
        candle_signal = 0
        if 'is_hammer' in df.columns and df['is_hammer'].iloc[-1]:
            candle_signal = 0.5
        if 'is_doji' in df.columns and df['is_doji'].iloc[-1]:
            candle_signal = 0  # Doji = indecision

        # 8. WEIGHTED ENSEMBLE — Real ML + Visual + Technical
        ensemble_score = (
            self.w_lstm * lstm_direction +
            self.w_xgb * xgb_direction +
            self.w_visual * visual_momentum +
            self.w_candle * candle_signal
        )
        
        # Add technical overlay
        tech_bias = 0
        if current_price > ema_20 and macd_diff > 0:
            tech_bias = 0.3
        elif current_price < ema_20 and macd_diff < 0:
            tech_bias = -0.3
        
        ensemble_score += tech_bias * 0.2

        # 9. Signal Decision
        signal = "Hold"
        if ensemble_score > 0.15:
            signal = "Buy"
        elif ensemble_score < -0.15:
            signal = "Sell"
        
        # 10. Confidence (based on model agreement)
        all_dirs = [lstm_direction, xgb_direction, np.sign(visual_momentum), np.sign(candle_signal), np.sign(tech_bias)]
        non_zero = [d for d in all_dirs if d != 0]
        agreement = abs(sum(non_zero)) / max(len(non_zero), 1) if non_zero else 0
        
        confidence = (
            lstm_confidence * 0.3 +
            xgb_confidence * 0.3 +
            50 * 0.2 +  # Visual baseline
            agreement * 20
        )
        confidence = min(0.92, confidence / 100)
        
        # 11. Price Target
        move_pct = ensemble_score * (atr / current_price) * 5
        predicted_price = current_price * (1 + move_pct)
        
        # 12. Risk-Reward
        stop_loss = current_price - atr * 1.5 if signal == "Buy" else current_price + atr * 1.5
        take_profit = current_price + atr * 3 if signal == "Buy" else current_price - atr * 3
        
        return {
            "pair": symbol,
            "prediction": signal,
            "current_price": float(current_price),
            "target_price": float(predicted_price),
            "confidence": float(confidence),
            "stop_loss": float(stop_loss),
            "take_profit": float(take_profit),
            "risk_reward_ratio": 2.0,
            "visual_patterns": visual_features['patterns'],
            "visual_momentum": float(visual_momentum),
            "sr_levels": visual_features.get('sr_levels', []),
            "models": {
                "lstm": {"direction": lstm_direction, "confidence": lstm_confidence},
                "xgboost": {"direction": xgb_direction, "confidence": xgb_confidence},
                "visual": {"momentum": float(visual_momentum)},
                "ensemble_score": float(ensemble_score)
            },
            "indicators": {
                "rsi": float(rsi),
                "macd_diff": float(macd_diff),
                "above_ema": bool(current_price > ema_20),
                "adx": float(adx)
            },
            "timestamp": pd.Timestamp.now().isoformat()
        }

if __name__ == "__main__":
    engine = HybridEngine()
    result = engine.run_prediction()
    if result:
        print(f"Signal: {result['prediction']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Models: {result['models']}")
    else:
        print("Prediction failed")
