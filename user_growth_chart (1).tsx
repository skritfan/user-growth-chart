import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const UserGrowthChart = () => {
  const [chartType, setChartType] = useState('weekly');
  
  // Pôvodné dáta z tabuľky
  const rawData = [
    { id: 167473, date: '1.4.2025', count: null },
    { id: 185155, date: '19.4.2025', count: 17682 },
    { id: 191817, date: '25.4.2025', count: 6662 },
    { id: 205575, date: '6.5.2025', count: 13758 },
    { id: 214384, date: '12.5.2025', count: 8809 },
    { id: 222871, date: '17.5.2025', count: 8487 },
    { id: 225096, date: '18.5.2025', count: 2225 },
    { id: 226989, date: '19.5.2025', count: 1893 },
    { id: 228560, date: '20.5.2025', count: 1571 },
    { id: 230020, date: '21.5.2025', count: 1460 },
    { id: 246193, date: '29.5.2025', count: 16173 },
    { id: 252049, date: '1.6.2025', count: 5856 },
    { id: 261010, date: '5.6.2025', count: 8961 },
    { id: 273450, date: '10.6.2025', count: 12440 },
    { id: 279150, date: '12.6.2025', count: 5700 }
  ];

  // Funkcia na parsovanie dátumu
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  // Príprava denných dát
  const dailyData = useMemo(() => {
    return rawData
      .filter(item => item.count !== null)
      .map(item => ({
        ...item,
        dateObj: parseDate(item.date),
        dateFormatted: item.date
      }))
      .sort((a, b) => a.dateObj - b.dateObj);
  }, []);

  // Príprava týždenných dát
  const weeklyData = useMemo(() => {
    const weeks = {};
    
    dailyData.forEach(item => {
      const date = item.dateObj;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Pondelok ako začiatok týždňa
      
      const weekKey = `${weekStart.getDate()}.${weekStart.getMonth() + 1}.${weekStart.getFullYear()}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          week: weekKey,
          totalUsers: 0,
          dateObj: weekStart
        };
      }
      
      weeks[weekKey].totalUsers += item.count;
    });

    return Object.values(weeks).sort((a, b) => a.dateObj - b.dateObj);
  }, [dailyData]);

  // Analýza trendu
  const trendAnalysis = useMemo(() => {
    const data = chartType === 'weekly' ? weeklyData : dailyData;
    if (data.length < 3) return { trend: 'nedostatok dát', color: '#666' };

    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, item) => sum + (chartType === 'weekly' ? item.totalUsers : item.count), 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, item) => sum + (chartType === 'weekly' ? item.totalUsers : item.count), 0) / older.length : recentAvg;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return { trend: 'rastúci', color: '#22c55e', change: change.toFixed(1) };
    if (change < -10) return { trend: 'klesajúci', color: '#ef4444', change: change.toFixed(1) };
    return { trend: 'stagnujúci', color: '#f59e0b', change: change.toFixed(1) };
  }, [chartType, weeklyData, dailyData]);

  const chartData = chartType === 'weekly' ? weeklyData : dailyData;
  const yAxisKey = chartType === 'weekly' ? 'totalUsers' : 'count';
  const xAxisKey = chartType === 'weekly' ? 'week' : 'dateFormatted';

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analýza rastu používateľov</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setChartType('daily')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'daily' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Denný pohľad
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              chartType === 'weekly' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Týždenný pohľad
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Analýza trendu:</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Trend je:</span>
            <span 
              className="font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: trendAnalysis.color }}
            >
              {trendAnalysis.trend}
            </span>
            {trendAnalysis.change && (
              <span className="text-sm text-gray-600">
                ({trendAnalysis.change > 0 ? '+' : ''}{trendAnalysis.change}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value.toLocaleString(), chartType === 'weekly' ? 'Noví používatelia (týždeň)' : 'Noví používatelia (deň)']}
              labelFormatter={(label) => chartType === 'weekly' ? `Týždeň od ${label}` : `Dátum: ${label}`}
            />
            <Legend />
            <Line 
              type="linear" 
              dataKey={yAxisKey} 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              name={chartType === 'weekly' ? 'Noví používatelia (týždeň)' : 'Noví používatelia (deň)'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">Celkový počet záznamov</h4>
          <p className="text-2xl font-bold text-blue-600">{dailyData.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">Priemerne za deň</h4>
          <p className="text-2xl font-bold text-green-600">
            {dailyData.length > 0 
              ? Math.round(dailyData.reduce((sum, item) => sum + item.count, 0) / dailyData.length).toLocaleString()
              : 0
            }
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">Najvyšší denný prírastok</h4>
          <p className="text-2xl font-bold text-purple-600">
            {dailyData.length > 0 
              ? Math.max(...dailyData.map(item => item.count)).toLocaleString()
              : 0
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;