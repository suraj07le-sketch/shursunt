import ccxt
import pandas as pd
import os
import time
from datetime import datetime

class DataFetcher:
    def __init__(self, exchange_id='binance', data_dir='../data'):
        self.exchange = getattr(ccxt, exchange_id)()
        self.data_dir = data_dir
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def fetch_ohlcv(self, symbol, timeframe='4h', limit=400):
        """
        Fetches 400 OHLCV candles from exchange.
        Falls back to cached CSV if exchange fetch fails.
        """
        filename = f"{symbol.replace('/', '_')}_{timeframe}.csv"
        filepath = os.path.join(self.data_dir, filename)

        try:
            print(f"Fetching {symbol} {timeframe} ({limit} candles) from {self.exchange.id}...")
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            # Save to CSV cache
            df.to_csv(filepath, index=False)
            print(f"Saved {len(df)} candles to {filepath}")
            
            return df
        except Exception as e:
            print(f"Error fetching data: {e}")
            # Fallback to cached data
            if os.path.exists(filepath):
                print(f"Using cached data from {filepath}")
                df = pd.read_csv(filepath)
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                return df
            return None

if __name__ == "__main__":
    fetcher = DataFetcher(data_dir=os.path.join(os.path.dirname(__file__), '../data'))
    df = fetcher.fetch_ohlcv('BTC/USDT', '4h', limit=400)
    if df is not None:
        print(f"Fetched {len(df)} candles")
        print(df.tail())
