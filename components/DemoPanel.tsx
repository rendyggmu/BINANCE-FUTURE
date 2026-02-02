
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, XCircle, History, TrendingUp, TrendingDown } from 'lucide-react';
import { Position, DemoAccount, PositionType, TradingSignal } from '../types';

interface DemoPanelProps {
  symbol: string;
  currentPrice: number;
  account: DemoAccount;
  onOpenPosition: (type: PositionType, margin: number, leverage: number) => void;
  onClosePosition: (positionId: string) => void;
  onResetAccount: () => void;
}

const DemoPanel: React.FC<DemoPanelProps> = ({ 
  symbol, 
  currentPrice, 
  account, 
  onOpenPosition, 
  onClosePosition,
  onResetAccount 
}) => {
  const [margin, setMargin] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'history'>('trade');

  const calculatePnL = (pos: Position) => {
    const priceDiff = pos.type === 'LONG' 
      ? currentPrice - pos.entryPrice 
      : pos.entryPrice - currentPrice;
    return priceDiff * pos.size;
  };

  const totalPnL = account.positions.reduce((acc, pos) => acc + (pos.symbol === symbol ? calculatePnL(pos) : 0), 0);

  return (
    <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden flex flex-col h-full">
      {/* Header Wallet */}
      <div className="p-4 bg-[#2b3139]/50 border-b border-[#2b3139] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#f0b90b]" />
          <span className="text-white font-bold">Demo Wallet</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-bold">Saldo Tersedia</div>
          <div className="text-[#f0b90b] font-mono font-bold">${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2b3139]">
        {['trade', 'positions', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-[#f0b90b] border-b-2 border-[#f0b90b] bg-[#f0b90b]/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab === 'trade' ? 'Buka Posisi' : tab === 'positions' ? `Posisi (${account.positions.length})` : 'Riwayat'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'trade' && (
          <div className="space-y-4">
            <div className="bg-[#0b0e11] p-3 rounded-lg border border-[#2b3139]">
              <div className="flex justify-between text-xs text-gray-500 mb-2 font-bold uppercase">
                <span>Margin (USDT)</span>
                <span>Tersedia: ${account.balance.toFixed(2)}</span>
              </div>
              <input 
                type="number" 
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-transparent text-white font-mono text-lg focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map(pct => (
                  <button 
                    key={pct}
                    onClick={() => setMargin(Math.floor((account.balance * pct) / 100))}
                    className="flex-1 bg-[#2b3139] hover:bg-[#474d57] text-[10px] py-1 rounded text-gray-300"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0e11] p-3 rounded-lg border border-[#2b3139]">
              <div className="flex justify-between text-xs text-gray-500 mb-2 font-bold uppercase">
                <span>Leverage</span>
                <span className="text-[#f0b90b]">{leverage}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-[#f0b90b] h-1.5 bg-[#2b3139] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => onOpenPosition('LONG', margin, leverage)}
                disabled={margin > account.balance || margin <= 0}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span>LONG / BELI</span>
              </button>
              <button 
                onClick={() => onOpenPosition('SHORT', margin, leverage)}
                disabled={margin > account.balance || margin <= 0}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <ArrowDownCircle className="w-5 h-5" />
                <span>SHORT / JUAL</span>
              </button>
            </div>

            <div className="text-[10px] text-gray-500 text-center italic">
              *Demo trade menggunakan harga real-time {symbol} saat ini.
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="space-y-3">
            {account.positions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">Belum ada posisi aktif.</div>
            ) : (
              account.positions.map((pos) => {
                const pnl = pos.symbol === symbol ? calculatePnL(pos) : 0; // Simplified for display
                const pnlPercent = (pnl / pos.margin) * 100;
                
                return (
                  <div key={pos.id} className="bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pos.type === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {pos.type} {pos.leverage}x
                        </span>
                        <div className="text-white font-bold mt-1 text-sm">{pos.symbol}</div>
                      </div>
                      <button 
                        onClick={() => onClosePosition(pos.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                      <div className="text-gray-500">Entry: <span className="text-gray-300 font-mono">${pos.entryPrice.toFixed(4)}</span></div>
                      <div className="text-gray-500 text-right">Margin: <span className="text-gray-300">${pos.margin}</span></div>
                    </div>
                    <div className="flex justify-between items-end border-t border-[#2b3139] pt-2">
                      <div className="text-xs text-gray-500 uppercase font-bold">P&L (USDT)</div>
                      <div className={`text-sm font-mono font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
             <div className="flex justify-between mb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Riwayat Terakhir</span>
                <button onClick={onResetAccount} className="text-[10px] text-red-500 hover:underline">Reset Demo</button>
             </div>
            {account.history.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm italic">Belum ada riwayat trading.</div>
            ) : (
              account.history.slice().reverse().map((trade) => (
                <div key={trade.id} className="flex justify-between items-center bg-[#0b0e11]/50 p-2 rounded border border-[#2b3139]/30 text-xs">
                  <div>
                    <div className="font-bold text-gray-300">{trade.symbol}</div>
                    <div className={`text-[10px] ${trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-600">{new Date(trade.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPanel;
