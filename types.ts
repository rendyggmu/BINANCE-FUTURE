
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Technicals {
  rsi: number;
  ema7: number;
  ema25: number;
  ema99: number;
  currentPrice: number;
  priceChangePercent: number;
}

export enum TradingSignal {
  STRONG_BUY = 'STRONG_BUY',
  BUY = 'BUY',
  NEUTRAL = 'NEUTRAL',
  SELL = 'SELL',
  STRONG_SELL = 'STRONG_SELL'
}

export interface AIAnalysis {
  signal: TradingSignal;
  confidence: number;
  reasoning: string;
  suggestedEntry: number;
  suggestedTakeProfit: number;
  suggestedStopLoss: number;
  riskRewardRatio: string;
}

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
}

// Demo Trading Types
export type PositionType = 'LONG' | 'SHORT';

export interface Position {
  id: string;
  symbol: string;
  type: PositionType;
  entryPrice: number;
  margin: number;
  leverage: number;
  size: number; // Dalam unit koin
  timestamp: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  type: PositionType;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  timestamp: number;
}

export interface DemoAccount {
  balance: number;
  positions: Position[];
  history: TradeHistory[];
}
