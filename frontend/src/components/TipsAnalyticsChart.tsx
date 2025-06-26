import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CalendarIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface TipData {
  date: string;
  amount: number;
  tips: number;
}

interface TipsAnalyticsChartProps {
  className?: string;
}

export const TipsAnalyticsChart: React.FC<TipsAnalyticsChartProps> = ({ className = '' }) => {
  // Generate mock data for the last 30 days
  const generateTipsData = (): TipData[] => {
    const data: TipData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic tip data with some variation
      const baseTips = Math.floor(Math.random() * 8) + 2; // 2-10 tips per day
      const baseAmount = baseTips * (Math.random() * 15 + 5); // $5-20 average per tip
      
      data.push({
        date: date.toISOString().split('T')[0],
        amount: Math.round(baseAmount * 100) / 100,
        tips: baseTips
      });
    }
    
    return data;
  };

  const tipsData = generateTipsData();
  
  // Calculate statistics
  const totalAmount = tipsData.reduce((sum, day) => sum + day.amount, 0);
  const totalTips = tipsData.reduce((sum, day) => sum + day.tips, 0);
  const averagePerTip = totalTips > 0 ? totalAmount / totalTips : 0;
  const bestDay = tipsData.reduce((max, day) => day.amount > max.amount ? day : max, tipsData[0]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{new Date(label).toLocaleDateString()}</p>
          <p className="text-green-600">
            <span className="font-medium">${data.amount.toFixed(2)}</span> from {data.tips} tips
          </p>
          <p className="text-sm text-gray-500">
            Avg: ${data.tips > 0 ? (data.amount / data.tips).toFixed(2) : '0.00'} per tip
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tips Analytics</h3>
              <p className="text-sm text-gray-600">Last 30 days performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>30 days</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
            <div className="text-sm text-green-700">Total Received</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTips}</div>
            <div className="text-sm text-blue-700">Total Tips</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${averagePerTip.toFixed(2)}</div>
            <div className="text-sm text-purple-700">Avg per Tip</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">${bestDay.amount.toFixed(2)}</div>
            <div className="text-sm text-orange-700">Best Day</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tips Amount Chart */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
            <span>Daily Tips Amount</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tipsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tips Count Chart */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <span className="text-blue-500">📊</span>
            <span>Daily Tips Count</span>
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [value, name === 'tips' ? 'Tips Count' : name]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar 
                  dataKey="tips" 
                  fill="#3B82F6" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">💡 Insights</h5>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Your best day was {new Date(bestDay.date).toLocaleDateString()} with ${bestDay.amount.toFixed(2)}</p>
            <p>• You're averaging {(totalTips / 30).toFixed(1)} tips per day</p>
            <p>• Your supporters love ${averagePerTip >= 10 ? 'generous' : averagePerTip >= 5 ? 'thoughtful' : 'regular'} tips!</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 