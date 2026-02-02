
import { GoogleGenAI, Type } from "@google/genai";
import { Technicals, Candle, AIAnalysis, TradingSignal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeMarket(
  symbol: string,
  technicals: Technicals,
  recentCandles: Candle[]
): Promise<AIAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const candleSummary = recentCandles.slice(-10).map(c => 
    `Waktu: ${new Date(c.time).toISOString()}, Tutup: ${c.close}, Vol: ${c.volume.toFixed(2)}`
  ).join('\n');

  const prompt = `
    Analisis data pasar berikut untuk perdagangan Binance Futures ${symbol}.
    Berikan analisis teknis yang ringkas dan sinyal perdagangan yang jelas dalam Bahasa Indonesia.
    
    Data Saat Ini:
    - Harga: ${technicals.currentPrice}
    - Perubahan 24 jam: ${technicals.priceChangePercent.toFixed(2)}%
    - RSI: ${technicals.rsi.toFixed(2)}
    - EMA7: ${technicals.ema7.toFixed(2)}
    - EMA25: ${technicals.ema25.toFixed(2)}
    - EMA99: ${technicals.ema99.toFixed(2)}
    
    Riwayat Harga Terakhir:
    ${candleSummary}
    
    Fokus pada pola aksi harga (price action), kejenuhan tren, dan keselarasan indikator.
    Sangat spesifik tentang titik masuk (entry), stop loss, dan target take profit.
    WAJIB MENJAWAB DALAM BAHASA INDONESIA.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: {
              type: Type.STRING,
              description: "Sinyal perdagangan: STRONG_BUY, BUY, NEUTRAL, SELL, atau STRONG_SELL",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Tingkat kepercayaan dari 0 hingga 100",
            },
            reasoning: {
              type: Type.STRING,
              description: "Penjelasan teknis singkat untuk sinyal dalam Bahasa Indonesia",
            },
            suggestedEntry: {
              type: Type.NUMBER,
              description: "Titik harga masuk yang dioptimalkan",
            },
            suggestedTakeProfit: {
              type: Type.NUMBER,
              description: "Target harga keluar untuk profit",
            },
            suggestedStopLoss: {
              type: Type.NUMBER,
              description: "Harga keluar untuk membatasi kerugian",
            },
            riskRewardRatio: {
              type: Type.STRING,
              description: "Rasio risiko terhadap keuntungan (contoh: 1:2)",
            }
          },
          required: ["signal", "confidence", "reasoning", "suggestedEntry", "suggestedTakeProfit", "suggestedStopLoss", "riskRewardRatio"],
        },
      },
    });

    const result = JSON.parse(response.text.trim());
    return result as AIAnalysis;
  } catch (error) {
    console.error("Kesalahan analisis Gemini:", error);
    throw error;
  }
}
