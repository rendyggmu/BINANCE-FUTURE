
import React from 'react';
import { AIAnalysis, TradingSignal } from '../types';

interface SignalCardProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
}

const SignalCard: React.FC<SignalCardProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] animate-pulse">
        <div className="h-4 bg-[#2b3139] rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-[#2b3139] rounded w-full mb-6"></div>
        <div className="h-20 bg-[#2b3139] rounded w-full mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-[#2b3139] rounded"></div>
          <div className="h-10 bg-[#2b3139] rounded"></div>
          <div className="h-10 bg-[#2b3139] rounded"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const getSignalColor = (signal: TradingSignal) => {
    switch (signal) {
      case TradingSignal.STRONG_BUY: return 'text-green-500 bg-green-500/10 border-green-500/20';
      case TradingSignal.BUY: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case TradingSignal.SELL: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case TradingSignal.STRONG_SELL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getSignalBadge = (signal: TradingSignal) => {
    switch (signal) {
      case TradingSignal.STRONG_BUY: return 'BELI KUAT';
      case TradingSignal.BUY: return 'BELI';
      case TradingSignal.NEUTRAL: return 'NETRAL';
      case TradingSignal.SELL: return 'JUAL';
      case TradingSignal.STRONG_SELL: return 'JUAL KUAT';
      default: return signal;
    }
  };

  return (
    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Rekomendasi AI</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-lg font-bold ${getSignalColor(analysis.signal)}`}>
            {getSignalBadge(analysis.signal)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm mb-1">Tingkat Kepercayaan</div>
          <div className="text-2xl font-bold text-white">{analysis.confidence}%</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Analisis & Alasan:</h4>
        <p className="text-gray-400 text-sm leading-relaxed bg-[#161a1e] p-4 rounded-lg border border-[#2b3139]">
          {analysis.reasoning}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161a1e] p-3 rounded-lg border border-[#2b3139]">
          <div className="text-xs text-gray-500 mb-1">Harga Masuk</div>
          <div className="text-sm font-bold text-blue-400">${analysis.suggestedEntry.toLocaleString()}</div>
        </div>
        <div className="bg-[#161a1e] p-3 rounded-lg border border-[#2b3139]">
          <div className="text-xs text-gray-500 mb-1">Take Profit</div>
          <div className="text-sm font-bold text-green-400">${analysis.suggestedTakeProfit.toLocaleString()}</div>
        </div>
        <div className="bg-[#161a1e] p-3 rounded-lg border border-[#2b3139]">
          <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
          <div className="text-sm font-bold text-red-400">${analysis.suggestedStopLoss.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Rasio RR:</span>
          <span className="text-white font-medium">{analysis.riskRewardRatio}</span>
        </div>
        <div className="text-xs text-gray-600 italic text-right max-w-[200px]">
          *Bukan saran finansial. Risiko ditanggung sendiri.
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
