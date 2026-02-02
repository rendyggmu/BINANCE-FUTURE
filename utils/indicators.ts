
import { Candle, Technicals } from '../types';

export function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function getTechnicals(candles: Candle[]): Technicals {
  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];
  const prevPrice = closes[closes.length - 2];
  
  return {
    rsi: calculateRSI(closes),
    ema7: calculateEMA(closes, 7),
    ema25: calculateEMA(closes, 25),
    ema99: calculateEMA(closes, 99),
    currentPrice,
    priceChangePercent: ((currentPrice - prevPrice) / prevPrice) * 100
  };
}
