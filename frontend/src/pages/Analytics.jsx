import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Activity, PieChart } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [dealData, setDealData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { title: "Win Rate", value: "-", trend: "-", icon: TrendingUp },
    { title: "Avg Deal Cycle", value: "-", trend: "-", icon: Activity },
    { title: "Pipeline Velocity", value: "-", trend: "-", icon: PieChart }
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/deals');
        
        // Aggregate deals by stage
        const stageCounts = {
          'New Lead': 0,
          'Contacted': 0,
          'Meeting Scheduled': 0,
          'Negotiation': 0,
          'Closed Won': 0,
          'Closed Lost': 0
        };

        data.forEach(deal => {
          if (stageCounts[deal.stage] !== undefined) {
            stageCounts[deal.stage]++;
          }
        });

        const chartData = Object.keys(stageCounts).map(stage => ({
          name: stage,
          deals: stageCounts[stage]
        }));

        setDealData(chartData);

        // Dynamic KPI calculations
        const wonDeals = data.filter(d => d.stage === 'Closed Won');
        const closedDeals = data.filter(d => d.stage === 'Closed Won' || d.stage === 'Closed Lost');
        const activeDeals = data.filter(d => d.stage !== 'Closed Lost' && d.stage !== 'Closed Won');
        
        const winRate = closedDeals.length > 0 ? ((wonDeals.length / closedDeals.length) * 100).toFixed(1) + '%' : '0%';
        
        let totalCycleDays = 0;
        wonDeals.forEach(d => {
          const start = new Date(d.createdAt);
          const end = new Date(d.updatedAt);
          totalCycleDays += (end - start) / (1000 * 60 * 60 * 24);
        });
        const avgCycle = wonDeals.length > 0 ? Math.round(totalCycleDays / wonDeals.length) + ' Days' : 'N/A';
        const velocity = activeDeals.length > 5 ? 'High' : (activeDeals.length > 0 ? 'Steady' : 'Low');

        setMetrics([
          { title: "Win Rate", value: winRate, trend: "Live", icon: TrendingUp },
          { title: "Avg Deal Cycle", value: avgCycle, trend: "Live", icon: Activity },
          { title: "Pipeline Velocity", value: velocity, trend: "Live", icon: PieChart }
        ]);

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#ef4444'];

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time breakdown of your pipeline and conversion performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((stat, i) => (
          <div key={i} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm flex items-center">
            <div className="bg-gray-800 p-3 rounded-lg mr-4">
              <stat.icon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <span className="text-xs text-primary-400 font-medium">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-200 mb-6">Pipeline Funnel Distribution</h3>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading chart data...</div>
        ) : dealData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dealData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                />
                <Bar dataKey="deals" radius={[4, 4, 0, 0]}>
                  {dealData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">No deal data available</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
