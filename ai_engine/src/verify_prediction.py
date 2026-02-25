import numpy as np
import pandas as pd
from .ensemble import HybridEngine

def test_prediction_balance():
    engine = HybridEngine()
    
    # 1. Create Synthetic UPWARD trend with noise
    x = np.linspace(0, 10, 200)
    up_prices = 100 + 2*x + np.random.normal(0, 0.5, 200)
    df_up = pd.DataFrame({
        'open': up_prices - 0.2,
        'high': up_prices + 0.5,
        'low': up_prices - 0.5,
        'close': up_prices,
        'volume': np.random.uniform(100, 200, 200)
    })
    
    # Mock some indicators to ensure a "Buy" signal
    # We'll inject them into the fe.add_all_features result by monkeypatching or just running prediction
    # Since run_prediction calls fetch_ohlcv, we need to mock that
    
    original_fetch = engine.fetcher.fetch_ohlcv
    engine.fetcher.fetch_ohlcv = lambda sym, tf, limit=200: df_up
    
    result_up = engine.run_prediction(symbol='TEST/UP')
    print(f"\n[Test Upward Trend]")
    print(f"Signal: {result_up['prediction']}")
    print(f"Visual Momentum: {result_up['visual_momentum']:.4f}")
    print(f"Indicators: {result_up['indicators']}")
    
    # 2. Create Synthetic DOWNWARD trend with noise
    x = np.linspace(0, 10, 200)
    down_prices = 110 - 2*x + np.random.normal(0, 0.5, 200)
    df_down = pd.DataFrame({
        'open': down_prices + 0.2,
        'high': down_prices + 0.5,
        'low': down_prices - 0.5,
        'close': down_prices,
        'volume': np.random.uniform(100, 200, 200)
    })
    
    engine.fetcher.fetch_ohlcv = lambda sym, tf, limit=200: df_down
    
    result_down = engine.run_prediction(symbol='TEST/DOWN')
    print(f"\n[Test Downward Trend]")
    print(f"Signal: {result_down['prediction']}")
    print(f"Visual Momentum: {result_down['visual_momentum']:.4f}")
    print(f"Indicators: {result_down['indicators']}")
    
    # Restore
    engine.fetcher.fetch_ohlcv = original_fetch

if __name__ == "__main__":
    test_prediction_balance()
