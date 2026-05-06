import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Wallet, BarChart3, BookOpen, Settings } from 'lucide-react';

// Types
interface PortfolioData {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  openPositions: number;
  availableCash: number;
}

interface RiskMetrics {
  maxDrawdown: number;
  currentExposure: number;
  winRate: number;
  sharpeRatio: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  pnl?: number;
  strategy: string;
  timestamp: number;
  status: 'open' | 'closed';
}

interface StrategyPerformance {
  name: string;
  pnl: number;
  winRate: number;
  trades: number;
}

// Mock data - in production this would come from the runtime
const mockPortfolio: PortfolioData = {
  totalValue: 12547.32,
  dailyPnL: 342.15,
  dailyPnLPercent: 2.8,
  openPositions: 4,
  availableCash: 5231.45,
};

const mockRisk: RiskMetrics = {
  maxDrawdown: 5.2,
  currentExposure: 58.3,
  winRate: 64.5,
  sharpeRatio: 1.85,
  riskLevel: 'medium',
};

const mockTrades: Trade[] = [
  { id: '1', symbol: 'SOL', side: 'BUY', amount: 12.5, price: 142.30, pnl: 45.20, strategy: 'LLM', timestamp: Date.now() - 3600000, status: 'open' },
  { id: '2', symbol: 'BONK', side: 'BUY', amount: 2500000, price: 0.0000234, pnl: -12.50, strategy: 'Momentum', timestamp: Date.now() - 7200000, status: 'open' },
  { id: '3', symbol: 'WIF', side: 'SELL', amount: 150, price: 2.45, pnl: 23.40, strategy: 'Mean Reversion', timestamp: Date.now() - 86400000, status: 'closed' },
  { id: '4', symbol: 'PEPE', side: 'BUY', amount: 500000, price: 0.0000012, pnl: 8.90, strategy: 'Rule-Based', timestamp: Date.now() - 172800000, status: 'closed' },
];

const mockStrategies: StrategyPerformance[] = [
  { name: 'LLM Strategy', pnl: 1250.45, winRate: 68.5, trades: 42 },
  { name: 'Momentum', pnl: 890.20, winRate: 61.2, trades: 38 },
  { name: 'Mean Reversion', pnl: 645.80, winRate: 72.1, trades: 25 },
  { name: 'Rule-Based', pnl: 420.15, winRate: 58.9, trades: 31 },
];

const equityCurveData = [
  { time: '00:00', value: 10000 },
  { time: '04:00', value: 10120 },
  { time: '08:00', value: 9980 },
  { time: '12:00', value: 10540 },
  { time: '16:00', value: 11200 },
  { time: '20:00', value: 11890 },
  { time: '24:00', value: 12547 },
];

const allocationData = [
  { name: 'SOL', value: 35, color: '#10b981' },
  { name: 'BONK', value: 25, color: '#3b82f6' },
  { name: 'WIF', value: 20, color: '#8b5cf6' },
  { name: 'Cash', value: 20, color: '#6b7280' },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTrading, setIsTrading] = useState(false);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Multi-Strategy AI Trading Agent</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Paper Trading
            </Badge>
            <Button
              onClick={() => setIsTrading(!isTrading)}
              className={isTrading ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isTrading ? 'Stop Trading' : 'Start Trading'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(mockPortfolio.totalValue)}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Daily P&L</p>
                <p className={`text-2xl font-bold ${mockPortfolio.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {mockPortfolio.dailyPnL >= 0 ? '+' : ''}{formatCurrency(mockPortfolio.dailyPnL)}
                  <span className="text-sm ml-2">({mockPortfolio.dailyPnLPercent}%)</span>
                </p>
              </div>
              {mockPortfolio.dailyPnL >= 0 ? <TrendingUp className="w-8 h-8 text-green-400" /> : <TrendingDown className="w-8 h-8 text-red-400" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Open Positions</p>
                <p className="text-2xl font-bold">{mockPortfolio.openPositions}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Risk Level</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(mockRisk.riskLevel)}`} />
                  <p className="text-xl font-bold capitalize">{mockRisk.riskLevel}</p>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">Overview</TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-gray-800">Portfolio</TabsTrigger>
          <TabsTrigger value="trades" className="data-[state=active]:bg-gray-800">Trade Journal</TabsTrigger>
          <TabsTrigger value="strategies" className="data-[state=active]:bg-gray-800">Strategies</TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-gray-800">Risk</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Equity Curve */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={equityCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-400">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Symbol</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Side</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Price</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">P&L</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Strategy</th>
                      <th className="text-left py-2 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTrades.slice(0, 5).map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-800/50">
                        <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                        <td className="py-3 px-4">
                          <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                            {trade.side}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{trade.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">${trade.price.toFixed(6)}</td>
                        <td className={`py-3 px-4 ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-400">{trade.strategy}</td>
                        <td className="py-3 px-4">
                          <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
                            {trade.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Position Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Available Cash</p>
                  <p className="text-xl font-bold">{formatCurrency(mockPortfolio.availableCash)}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">In Positions</p>
                  <p className="text-xl font-bold">{formatCurrency(mockPortfolio.totalValue - mockPortfolio.availableCash)}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Exposure</p>
                  <p className="text-xl font-bold">{mockRisk.currentExposure}%</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">Sharpe Ratio</p>
                  <p className="text-xl font-bold">{mockRisk.sharpeRatio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Complete Trade Journal</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export CSV</Button>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Full trade table would go here */}
              <p className="text-gray-400">Full trade history with reasoning and performance metrics...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockStrategies.map((strategy) => (
              <Card key={strategy.name} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total P&L</span>
                      <span className={strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {strategy.pnl >= 0 ? '+' : ''}{formatCurrency(strategy.pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span>{strategy.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades</span>
                      <span>{strategy.trades}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Risk Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Daily Loss Limit</span>
                    <span className="text-sm">$500</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Max Drawdown</span>
                    <span className="text-sm">10%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Max Exposure</span>
                    <span className="text-sm">80%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '58%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Circuit Breaker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge className="bg-green-500">Inactive</Badge>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Circuit breaker will trigger if daily loss exceeds $500 or max drawdown exceeds 10%.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">No active alerts.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
