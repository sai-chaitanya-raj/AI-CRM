import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, IndianRupee, Target, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import AIInsightCard from '../components/AIInsightCard';
import api from '../services/api';

const Dashboard = () => {
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/leads');
        // Grab only the latest 4 leads
        setRecentLeads(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch dashboard leads:", error);
      }
    };
    fetchDashboardData();
  }, []);

  // Temporary mock metrics until full aggregation backend is built
  const metrics = [
    { title: 'Total Leads', value: recentLeads.length || '142', change: '+12%', icon: Users },
    { title: 'Pipeline Value', value: '₹70.25L', change: '+8%', icon: IndianRupee },
    { title: 'Conversion Rate', value: '24.8%', change: '+2.1%', icon: Target },
    { title: 'Active Deals', value: '28', change: '-4%', icon: TrendingUp },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Qualified': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Meeting Scheduled': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Here's what's happening with your pipeline today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-lg text-sm text-gray-300 backdrop-blur-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change.startsWith('+');
          
          return (
            <motion.div 
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/60 transition-colors backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className={isPositive ? 'text-green-400' : 'text-red-400'}>
                  <div className="flex items-center text-xs font-semibold bg-gray-900/50 px-2 py-1 rounded-full">
                    {isPositive && <ArrowUpRight className="h-3 w-3 mr-1" />}
                    {metric.change}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-gray-400 text-sm font-medium">{metric.title}</h4>
                <div className="text-2xl font-bold text-white mt-1">{metric.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads Table */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
            <button className="text-sm text-primary-400 hover:text-primary-300 font-medium">View All</button>
          </div>
          
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gray-800/30">
                  <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Lead</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">AI Score</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {recentLeads.map((lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-100">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.company}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500" 
                            style={{ width: `${lead.aiScore || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-300">{lead.aiScore || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Nova Assistant</h2>
          <div className="space-y-4">
            <AIInsightCard 
              title="Hot Lead Alert"
              insight="Kabir Singhania from Ascend Enterprises has shown high intent based on recent interactions. Recommend sending the customized pricing proposal today."
              confidence={0.92}
            />
            <AIInsightCard 
              title="Pipeline Bottleneck"
              insight="You have 4 deals stuck in the 'Negotiation' stage for over 14 days. Generating follow-up drafts for these contacts may accelerate closing."
              confidence={0.88}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
