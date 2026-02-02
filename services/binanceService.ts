
import { Candle, BinanceTicker } from '../types';

const BASE_URL = 'https://fapi.binance.com'; // Futures API

export async function fetchKlines(symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 100): Promise<Candle[]> {
  try {
    const response = await fetch(`${BASE_URL}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await response.json();
    
    return data.map((d: any[]) => ({
      time: d[0],
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));
  } catch (error) {
    console.error('Error fetching Binance klines:', error);
    return [];
  }
}

export async function fetchTopTickers(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch(`${BASE_URL}/fapi/v1/ticker/24hr`);
    const data = await response.json();
    
    // Mengambil SEMUA koin yang berharga di bawah 1 USD
    // Kita tetap urutkan berdasarkan volume sebagai urutan awal default yang logis
    return data
      .filter((t: any) => parseFloat(t.lastPrice) < 1.0)
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .map((t: any) => ({
        symbol: t.symbol,
        lastPrice: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
        volume: t.quoteVolume // Menggunakan quoteVolume untuk representasi volume dalam USD/USDT
      }));
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return [];
  }
}
