/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ArrowRightLeft, 
  DollarSign, 
  Wallet,
  Activity,
  Coins,
  Calculator
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatCurrency, formatNumber } from './lib/utils';
import { CryptoData, CRYPTO_IDS, SYMBOLS, COLORS } from './types';

export default function App() {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [history, setHistory] = useState<any[]>([]);
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcBase, setCalcBase] = useState<string>('BTC');

  const fetchData = async () => {
    try {
      setLoading(true);
      // We'll use CoinGecko API. It includes ARS and 24h change.
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS.join(',')}&vs_currencies=usd,ars&include_24hr_change=true`
      );
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      
      // Update history for the chart
      setHistory(prev => {
        const newEntry = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          btc: result.bitcoin.usd,
          eth: result.ethereum.usd,
          xmr: result.monero.usd,
        };
        const updated = [...prev, newEntry].slice(-20); // Keep last 20 points
        return updated;
      });
      
      setError(null);
    } catch (err) {
      setError('Error fetching data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const conversions = useMemo(() => {
    if (!data) return [];
    
    const pairs = [
      { from: 'bitcoin', to: 'ethereum' },
      { from: 'bitcoin', to: 'monero' },
      { from: 'ethereum', to: 'monero' },
    ];

    return pairs.map(pair => {
      const rate = data[pair.from as keyof CryptoData].usd / data[pair.to as keyof CryptoData].usd;
      return {
        from: SYMBOLS[pair.from],
        to: SYMBOLS[pair.to],
        rate: rate,
        reverseRate: 1 / rate
      };
    });
  }, [data]);

  const calculatorResults = useMemo(() => {
    if (!data) return [];
    
    // Get USD value of 1 unit of the base currency
    let usdValue = 0;
    if (calcBase === 'BTC') usdValue = data.bitcoin.usd;
    else if (calcBase === 'ETH') usdValue = data.ethereum.usd;
    else if (calcBase === 'XMR') usdValue = data.monero.usd;
    else if (calcBase === 'USD') usdValue = 1;
    else if (calcBase === 'ARS') {
      // Approximate ARS/USD from the data we have
      const arsPerUsd = data.bitcoin.ars / data.bitcoin.usd;
      usdValue = 1 / arsPerUsd;
    }

    const totalUsd = calcAmount * usdValue;
    const arsPerUsd = data.bitcoin.ars / data.bitcoin.usd;

    return [
      { label: 'Bitcoin', symbol: 'BTC', value: totalUsd / data.bitcoin.usd, type: 'crypto' },
      { label: 'Ethereum', symbol: 'ETH', value: totalUsd / data.ethereum.usd, type: 'crypto' },
      { label: 'Monero', symbol: 'XMR', value: totalUsd / data.monero.usd, type: 'crypto' },
      { label: 'US Dollar', symbol: 'USD', value: totalUsd, type: 'fiat' },
      { label: 'Argentine Peso', symbol: 'ARS', value: totalUsd * arsPerUsd, type: 'fiat' },
    ].filter(item => item.symbol !== calcBase);
  }, [data, calcAmount, calcBase]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-emerald-500 w-8 h-8" />
            CryptoDash <span className="text-zinc-500 font-light">ARS</span>
          </h1>
          <p className="text-zinc-400 mt-1">Real-time market overview and conversions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Last Update</p>
            <p className="text-sm font-mono text-zinc-300">{lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-3 glass-card hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5 text-emerald-500", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CRYPTO_IDS.map((id) => {
          const crypto = data?.[id as keyof CryptoData];
          const symbol = SYMBOLS[id];
          const color = COLORS[id];
          
          return (
            <div key={id} className="glass-card p-6 space-y-4 relative overflow-hidden group">
              <div 
                className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110"
                style={{ backgroundColor: color, borderRadius: '50%' }}
              />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {symbol[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg capitalize">{id}</h3>
                    <span className="text-xs text-zinc-500 font-mono">{symbol}</span>
                  </div>
                </div>
                {crypto && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                    crypto.usd_24h_change >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {crypto.usd_24h_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(crypto.usd_24h_change).toFixed(2)}%
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-3xl font-bold font-mono tracking-tighter">
                  {crypto ? formatCurrency(crypto.usd) : '---'}
                </p>
                <p className="text-zinc-500 text-sm flex items-center gap-1">
                  <span className="font-mono">{crypto ? formatCurrency(crypto.ars, 'ARS') : '---'}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculator Section */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-500" />
          <h2 className="text-xl font-bold">Quick Converter</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Amount</label>
            <div className="relative">
              <input 
                type="number" 
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="Enter amount..."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">From</label>
            <select 
              value={calcBase}
              onChange={(e) => setCalcBase(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="XMR">Monero (XMR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="ARS">Argentine Peso (ARS)</option>
            </select>
          </div>

          <div className="hidden md:block pb-4 text-zinc-600 italic text-sm">
            Results update automatically
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {calculatorResults.map((res, idx) => (
            <div key={idx} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/30 space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{res.label}</p>
              <p className="text-lg font-mono font-bold text-white truncate">
                {res.type === 'fiat' 
                  ? formatCurrency(res.value, res.symbol)
                  : `${formatNumber(res.value)} ${res.symbol}`
                }
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Price Trends (USD)
            </h2>
            <div className="flex gap-4 text-xs font-mono">
              {CRYPTO_IDS.map(id => (
                <div key={id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[id] }} />
                  <span className="text-zinc-400 uppercase">{SYMBOLS[id]}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  {CRYPTO_IDS.map(id => (
                    <linearGradient key={id} id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[id]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS[id]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                {CRYPTO_IDS.map(id => (
                  <Area 
                    key={id}
                    type="monotone" 
                    dataKey={SYMBOLS[id].toLowerCase()} 
                    stroke={COLORS[id]} 
                    fillOpacity={1} 
                    fill={`url(#gradient-${id})`} 
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversions */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
            Conversion Rates
          </h2>
          
          <div className="space-y-4">
            {conversions.length > 0 ? conversions.map((pair, idx) => (
              <div key={idx} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 font-medium">Pair</span>
                  <span className="font-bold text-white">{pair.from} / {pair.to}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-500">1 {pair.from} =</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatNumber(pair.rate)} {pair.to}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-500">1 {pair.to} =</span>
                    <span className="font-mono text-zinc-300">
                      {formatNumber(pair.reverseRate)} {pair.from}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Loading conversion data...
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Coins className="w-3 h-3" />
              <span>Calculated based on current USD market prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-zinc-800">
        <div className="flex items-center gap-4 text-zinc-500 text-sm">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
          <p>Prices provided by CoinGecko API. ARS rates are based on official market conversion.</p>
        </div>
        <div className="flex items-center gap-4 text-zinc-500 text-sm md:justify-end">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
          <p>Dashboard updates automatically every 60 seconds.</p>
        </div>
      </footer>
    </div>
  );
}
