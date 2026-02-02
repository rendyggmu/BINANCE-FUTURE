
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart2, 
  Search, 
  RefreshCw,
  Zap,
  ShieldAlert,
  ChevronRight,
  ArrowUpDown,
  Filter,
  PlayCircle
} from 'lucide-react';
import { fetchKlines, fetchTopTickers } from './services/binanceService';
import { analyzeMarket } from './services/geminiService';
import { getTechnicals } from './utils/indicators';
import { Candle, Technicals, AIAnalysis, BinanceTicker, DemoAccount, PositionType, Position, TradeHistory } from './types';
import ChartPanel from './components/ChartPanel';
import SignalCard from './components/SignalCard';
import DemoPanel from './components/DemoPanel';

type SortKey = 'volume' | 'price' | 'change';
type SortOrder = 'asc' | 'desc';

const INITIAL_DEMO: DemoAccount = {
  balance: 10000,
  positions: [],
  history: []
};

const App: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('DOGEUSDT');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [technicals, setTechnicals] = useState<Technicals | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [tickers, setTickers] = useState<BinanceTicker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Demo Trading
  const [demoAccount, setDemoAccount] = useState<DemoAccount>(() => {
    const saved = localStorage.getItem('binance_demo_account');
    return saved ? JSON.parse(saved) : INITIAL_DEMO;
  });

  // State untuk Sorting
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Persistence
  useEffect(() => {
    localStorage.setItem('binance_demo_account', JSON.stringify(demoAccount));
  }, [demoAccount]);

  // Fungsi untuk memuat data pasar
  const loadData = useCallback(async (symbol: string) => {
    setIsRefreshing(true);
    try {
      const data = await fetchKlines(symbol);
      if (data.length > 0) {
        setCandles(data);
        const tech = getTechnicals(data);
        setTechnicals(tech);
      }
    } catch (error) {
      console.error("Gagal memuat data kline:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Menjalankan analisis AI
  const runAIAnalysis = async () => {
    if (!technicals || candles.length === 0) return;
    setIsLoading(true);
    try {
      const res = await analyzeMarket(selectedSymbol, technicals, candles);
      setAnalysis(res);
    } catch (err) {
      console.error("Gagal melakukan analisis AI:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Trading Handlers
  const handleOpenPosition = (type: PositionType, margin: number, leverage: number) => {
    if (!technicals) return;
    
    const entryPrice = technicals.currentPrice;
    const size = (margin * leverage) / entryPrice;
    
    const newPosition: Position = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type,
      entryPrice,
      margin,
      leverage,
      size,
      timestamp: Date.now()
    };

    setDemoAccount(prev => ({
      ...prev,
      balance: prev.balance - margin,
      positions: [...prev.positions, newPosition]
    }));
  };

  const handleClosePosition = (positionId: string) => {
    if (!technicals) return;
    
    const position = demoAccount.positions.find(p => p.id === positionId);
    if (!position) return;

    // We use technicals.currentPrice if it matches the position's symbol
    // For simplicity in this demo, we assume the user only closes the selected symbol's position
    // Or we'd need a multi-symbol price tracker. Let's use the current selected price.
    const currentPrice = technicals.currentPrice;
    
    const priceDiff = position.type === 'LONG' 
      ? currentPrice - position.entryPrice 
      : position.entryPrice - currentPrice;
    
    const pnl = priceDiff * position.size;
    
    const historyEntry: TradeHistory = {
      id: position.id,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: currentPrice,
      pnl,
      timestamp: Date.now()
    };

    setDemoAccount(prev => ({
      ...prev,
      balance: prev.balance + position.margin + pnl,
      positions: prev.positions.filter(p => p.id !== positionId),
      history: [...prev.history, historyEntry]
    }));
  };

  const handleResetDemo = () => {
    if (window.confirm("Apakah Anda yakin ingin meriset akun demo? Semua riwayat akan hilang.")) {
      setDemoAccount(INITIAL_DEMO);
    }
  };

  // Effect 1: Inisialisasi daftar ticker dan interval update
  useEffect(() => {
    const initTickers = async () => {
      const top = await fetchTopTickers();
      setTickers(top);
    };
    initTickers();
    
    const interval = setInterval(async () => {
      const top = await fetchTopTickers();
      setTickers(top);
    }, 10000); // Percepat update untuk demo yang responsif
    
    return () => clearInterval(interval);
  }, []);

  // Effect 2: Reset dan Load Data saat koin berubah
  useEffect(() => {
    setAnalysis(null);
    setTechnicals(null);
    setCandles([]);
    loadData(selectedSymbol);
  }, [selectedSymbol, loadData]);

  // Logika Filter dan Sort gabungan
  const processedTickers = useMemo(() => {
    let result = tickers.filter(t => t.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    
    result.sort((a, b) => {
      let valA: number, valB: number;
      switch (sortKey) {
        case 'price':
          valA = parseFloat(a.lastPrice);
          valB = parseFloat(b.lastPrice);
          break;
        case 'change':
          valA = parseFloat(a.priceChangePercent);
          valB = parseFloat(b.priceChangePercent);
          break;
        case 'volume':
        default:
          valA = parseFloat(a.volume);
          valB = parseFloat(b.volume);
          break;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
    return result;
  }, [tickers, searchQuery, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#181a20] border-b border-[#2b3139] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f0b90b] rounded-lg">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">FUTURES <span className="text-[#f0b90b]">AI</span></h1>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Semua Koin &lt;$1 Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <div className="flex flex-col items-end">
              <span className="text-gray-400 text-xs">Akun Demo</span>
              <span className="text-green-500 font-bold">${demoAccount.balance.toLocaleString()} USDT</span>
            </div>
            <div className="h-8 w-px bg-[#2b3139]"></div>
            <div className="flex flex-col items-end">
              <span className="text-gray-400 text-xs">Status Gemini</span>
              <span className="text-blue-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Flash Aktif
              </span>
            </div>
          </div>
          <button 
            onClick={() => loadData(selectedSymbol)}
            className="p-2 hover:bg-[#2b3139] rounded-lg transition-colors text-gray-400"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-[#1e2329] border-r border-[#2b3139] flex flex-col h-full lg:h-[calc(100vh-73px)]">
          <div className="p-4 space-y-3 border-b border-[#2b3139]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Cari koin murah..." 
                className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#f0b90b]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-tight text-gray-400">
              <button onClick={() => toggleSort('volume')} className={`flex-1 py-1 px-1 rounded border ${sortKey === 'volume' ? 'bg-[#f0b90b]/10 border-[#f0b90b] text-[#f0b90b]' : 'border-[#2b3139]'}`}>Volume</button>
              <button onClick={() => toggleSort('price')} className={`flex-1 py-1 px-1 rounded border ${sortKey === 'price' ? 'bg-[#f0b90b]/10 border-[#f0b90b] text-[#f0b90b]' : 'border-[#2b3139]'}`}>Harga</button>
              <button onClick={() => toggleSort('change')} className={`flex-1 py-1 px-1 rounded border ${sortKey === 'change' ? 'bg-[#f0b90b]/10 border-[#f0b90b] text-[#f0b90b]' : 'border-[#2b3139]'}`}>% 24J</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {processedTickers.map((ticker) => (
              <button
                key={ticker.symbol}
                onClick={() => setSelectedSymbol(ticker.symbol)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#2b3139] border-b border-[#2b3139]/50 ${selectedSymbol === ticker.symbol ? 'bg-[#2b3139]' : ''}`}
              >
                <div className="text-left">
                  <div className="font-bold text-white text-sm">{ticker.symbol}</div>
                  <div className="text-[10px] text-gray-500">Vol: ${(parseFloat(ticker.volume) / 1000000).toFixed(1)}M</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm text-gray-200">${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 4 })}</div>
                  <div className={`text-xs font-semibold ${parseFloat(ticker.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{ticker.priceChangePercent}%</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center - Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
              <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Harga {selectedSymbol}</div>
              <div className="text-xl font-bold text-white">${technicals?.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 4 }) || '---'}</div>
            </div>
            <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
              <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Perubahan 24j</div>
              <div className={`text-xl font-bold ${technicals && technicals.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {technicals ? `${technicals.priceChangePercent.toFixed(2)}%` : '---'}
              </div>
            </div>
            <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
              <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">RSI (14)</div>
              <div className="text-xl font-bold text-blue-400">{technicals ? technicals.rsi.toFixed(2) : '---'}</div>
            </div>
            <div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139]">
              <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Wallet Demo</div>
              <div className="text-xl font-bold text-[#f0b90b]">${demoAccount.balance.toFixed(0)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <ChartPanel data={candles} symbol={selectedSymbol} />
              <SignalCard analysis={analysis} isLoading={isLoading} />
              
              {!analysis && !isLoading && (
                <div className="bg-[#1e2329] p-12 rounded-xl border border-dashed border-[#474d57] flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#2b3139] rounded-full flex items-center justify-center mb-4">
                    <BarChart2 className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">Analisis AI untuk {selectedSymbol}</h3>
                  <button onClick={runAIAnalysis} disabled={!technicals} className="bg-[#f0b90b] hover:bg-[#d8a60a] disabled:opacity-50 text-black font-bold py-3 px-8 rounded-lg mt-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Buat Sinyal Trading
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - Demo Trading */}
            <div className="flex flex-col gap-6">
              <DemoPanel 
                symbol={selectedSymbol}
                currentPrice={technicals?.currentPrice || 0}
                account={demoAccount}
                onOpenPosition={handleOpenPosition}
                onClosePosition={handleClosePosition}
                onResetAccount={handleResetDemo}
              />

              <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139]">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#f0b90b]" /> Indikator Teknis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">RSI (14)</span>
                    <span className="text-white font-mono">{technicals?.rsi.toFixed(2) || '---'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">EMA (7)</span>
                    <span className="text-white font-mono">{technicals?.ema7.toFixed(4) || '---'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">EMA (25)</span>
                    <span className="text-white font-mono">{technicals?.ema25.toFixed(4) || '---'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#181a20] border-t border-[#2b3139] px-6 py-3 flex items-center justify-between text-[11px] text-gray-600">
        <div className="flex items-center gap-4">
          <span>Server Time: {new Date().toLocaleTimeString()}</span>
          <span className="text-green-500">Demo Trading Mode: AKTIF</span>
        </div>
        <div className="flex items-center gap-1 text-[#f0b90b]">
          <PlayCircle className="w-3 h-3" /> Trading Tanpa Risiko
        </div>
      </footer>
    </div>
  );
};

export default App;
