import { useState, useEffect } from 'react';
import { Mail, Search, Sparkles, Plus, MoreHorizontal } from 'lucide-react';
import api from '../services/api';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingFor, setGeneratingFor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await api.get('/leads');
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Qualified': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Meeting Scheduled': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleGenerateEmail = (id) => {
    setGeneratingFor(id);
    // Simulate AI generation time
    setTimeout(() => {
      setGeneratingFor(null);
      alert('AI Email Draft Generated! Check the Lead Details panel.');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track your prospective customers.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-200 w-64 transition-all"
            />
          </div>
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center text-sm">
            <Plus className="h-4 w-4 mr-2" /> 
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700/50 bg-gray-800/30">
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Name</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Score</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Added</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-800/60 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-100">{lead.name}</div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2 mt-0.5">
                        <span>{lead.company}</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span>{lead.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500" 
                        style={{ width: `${lead.aiScore || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-300">{lead.aiScore || 0}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-400">
                  {new Date(lead.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleGenerateEmail(lead.id)}
                      disabled={generatingFor === lead.id}
                      className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                    >
                      {generatingFor === lead.id ? (
                        <Sparkles className="h-3.5 w-3.5 text-primary-400 animate-pulse" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      <span>
                        {generatingFor === lead.id ? 'Drafting...' : 'AI Email'}
                      </span>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="text-gray-300 font-medium text-sm">No leads found</h3>
            <p className="text-gray-500 text-xs mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
