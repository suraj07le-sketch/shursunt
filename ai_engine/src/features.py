import pandas as pd
import numpy as np
import ta

class FeatureEngineer:
    def __init__(self):
        pass

    def add_all_features(self, df):
        """
        Adds 30+ technical indicators to the dataframe.
        Designed for 400-candle analysis.
        """
        df = df.copy()
        
        # Ensure correct types
        for col in ['open', 'close', 'high', 'low', 'volume']:
            if col in df.columns:
                df[col] = df[col].astype(float)

        # ========== TREND INDICATORS ==========
        
        # SMA
        df['sma_20'] = ta.trend.sma_indicator(df['close'], window=20)
        df['sma_50'] = ta.trend.sma_indicator(df['close'], window=50)
        df['sma_200'] = ta.trend.sma_indicator(df['close'], window=200)
        
        # EMA
        df['ema_9'] = ta.trend.ema_indicator(df['close'], window=9)
        df['ema_20'] = ta.trend.ema_indicator(df['close'], window=20)
        df['ema_50'] = ta.trend.ema_indicator(df['close'], window=50)
        
        # Ichimoku Cloud
        ichi = ta.trend.IchimokuIndicator(df['high'], df['low'])
        df['ichimoku_a'] = ichi.ichimoku_a()
        df['ichimoku_b'] = ichi.ichimoku_b()
        df['ichimoku_base'] = ichi.ichimoku_base_line()
        df['ichimoku_conv'] = ichi.ichimoku_conversion_line()
        
        # ADX
        adx = ta.trend.ADXIndicator(df['high'], df['low'], df['close'], window=14)
        df['adx'] = adx.adx()
        df['adx_pos'] = adx.adx_pos()
        df['adx_neg'] = adx.adx_neg()

        # ========== MOMENTUM INDICATORS ==========
        
        # RSI
        df['rsi'] = ta.momentum.rsi(df['close'], window=14)
        df['rsi_21'] = ta.momentum.rsi(df['close'], window=21)
        
        # MACD
        macd = ta.trend.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        # Stochastic Oscillator
        stoch = ta.momentum.StochasticOscillator(df['high'], df['low'], df['close'])
        df['stoch_k'] = stoch.stoch()
        df['stoch_d'] = stoch.stoch_signal()
        
        # Williams %R
        df['williams_r'] = ta.momentum.williams_r(df['high'], df['low'], df['close'])
        
        # CCI
        df['cci'] = ta.trend.cci(df['high'], df['low'], df['close'], window=20)

        # ========== VOLATILITY INDICATORS ==========
        
        # Bollinger Bands
        bb = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
        df['bb_high'] = bb.bollinger_hband()
        df['bb_low'] = bb.bollinger_lband()
        df['bb_width'] = bb.bollinger_wband()
        df['bb_pband'] = bb.bollinger_pband()  # Price position within bands
        
        # ATR
        df['atr'] = ta.volatility.average_true_range(df['high'], df['low'], df['close'], window=14)
        df['atr_21'] = ta.volatility.average_true_range(df['high'], df['low'], df['close'], window=21)

        # ========== VOLUME INDICATORS ==========
        
        # OBV
        df['obv'] = ta.volume.on_balance_volume(df['close'], df['volume'])
        
        # MFI (Money Flow Index)
        df['mfi'] = ta.volume.money_flow_index(df['high'], df['low'], df['close'], df['volume'], window=14)
        
        # Volume SMA
        df['volume_sma_20'] = ta.trend.sma_indicator(df['volume'], window=20)
        df['volume_ratio'] = df['volume'] / df['volume_sma_20']

        # ========== CANDLESTICK PATTERN LABELS ==========
        df['candle_body'] = abs(df['close'] - df['open'])
        df['candle_upper_wick'] = df['high'] - df[['open', 'close']].max(axis=1)
        df['candle_lower_wick'] = df[['open', 'close']].min(axis=1) - df['low']
        df['candle_range'] = df['high'] - df['low']
        df['is_bullish'] = (df['close'] > df['open']).astype(int)

        # Doji (small body relative to range)
        df['is_doji'] = ((df['candle_body'] < df['candle_range'] * 0.1) & (df['candle_range'] > 0)).astype(int)
        
        # Hammer (long lower wick, small body at top)
        df['is_hammer'] = ((df['candle_lower_wick'] > df['candle_body'] * 2) & 
                           (df['candle_upper_wick'] < df['candle_body'] * 0.5) & 
                           (df['candle_body'] > 0)).astype(int)

        # ========== DERIVED FEATURES ==========
        
        # Price momentum
        df['momentum_5'] = df['close'].pct_change(5)
        df['momentum_10'] = df['close'].pct_change(10)
        df['momentum_20'] = df['close'].pct_change(20)
        
        # Trend strength
        df['trend_strength'] = (df['ema_9'] - df['ema_50']) / df['ema_50'] * 100

        # Drop NaN values
        df.dropna(inplace=True)
        
        return df

if __name__ == "__main__":
    try:
        df = pd.read_csv('../data/BTC_USDT_4h.csv')
        fe = FeatureEngineer()
        df_features = fe.add_all_features(df)
        print(f"Features: {len(df_features.columns)} columns, {len(df_features)} rows")
        print(df_features.tail())
    except Exception as e:
        print(f"Error: {e}")
