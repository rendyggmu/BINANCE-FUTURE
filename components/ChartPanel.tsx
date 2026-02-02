
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Candle } from '../types';

interface ChartPanelProps {
  data: Candle[];
  symbol: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ data, symbol }) => {
  if (!data.length) return <div className="h-[400px] flex items-center justify-center">Memuat grafik...</div>;

  const formattedData = data.map(c => ({
    time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: c.close,
    high: c.high,
    low: c.low,
    rawTime: c.time
  }));

  const minPrice = Math.min(...data.map(d => d.low)) * 0.999;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.001;

  return (
    <div className="bg-[#1e2329] p-6 rounded-xl border border-[#2b3139] h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {symbol} <span className="text-sm font-normal text-gray-400">Futures 1J</span>
          </h2>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-green-500">Tertinggi: {data[data.length-1].high.toLocaleString()}</span>
          <span className="text-red-500">Terendah: {data[data.length-1].low.toLocaleString()}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f0b90b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f0b90b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2b3139" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#848e9c', fontSize: 12}} 
            minTickGap={30}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#848e9c', fontSize: 12}}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e2329', border: '1px solid #474d57', borderRadius: '8px' }}
            itemStyle={{ color: '#f0b90b' }}
            labelStyle={{ color: '#848e9c' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#f0b90b" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartPanel;
