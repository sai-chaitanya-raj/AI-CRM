import { useState, useEffect } from 'react';
import { Mail, Search, Sparkles, Plus, MoreHorizontal } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingFor, setGeneratingFor] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: 'Following up', body: '', leadId: null, leadName: '' });
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    status: 'New',
    source: 'Website'
  });

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

  useEffect(() => {
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

  const handleGenerateEmail = async (id, name) => {
    setGeneratingFor(id);
    try {
      const { data } = await api.post(`/ai/lead/${id}/email`, { 
        context: 'Write a warm, professional introduction email to schedule a 15 min discovery call.' 
      });
      setEmailDraft({ subject: `Following up with ${name}`, body: data.draft, leadId: id, leadName: name });
      setIsEmailModalOpen(true);
    } catch (error) {
      console.error("Error generating email:", error);
      alert('Failed to generate email.');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);
    try {
      const { data } = await api.post(`/leads/${emailDraft.leadId}/send-email`, {
        subject: emailDraft.subject,
        body: emailDraft.body
      });
      alert(`Email sent successfully!${data.previewUrl ? `\n\nPreview (Ethereal test mode): ${data.previewUrl}` : ''}`);
      setIsEmailModalOpen(false);
      fetchLeads(); // Refresh to update status to Contacted
    } catch (error) {
      alert('Failed to send email: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create lead, which automatically creates a pipeline deal on the backend
      const res = await api.post('/leads', newLead);
      
      // Auto-trigger AI scoring for the new lead in the background
      api.post(`/ai/lead/${res.data._id}/score`).then(() => fetchLeads()).catch(console.error);

      await fetchLeads();
      setIsModalOpen(false);
      setNewLead({ name: '', email: '', company: '', status: 'New', source: 'Website' });
    } catch (error) {
      console.error("Error adding lead:", error);
      alert('Failed to add lead. ' + (error.response?.data?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center text-sm"
          >
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
              <tr key={lead._id || lead.id} className="hover:bg-gray-800/60 transition-colors group">
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
                      onClick={() => handleGenerateEmail(lead._id || lead.id, lead.name)}
                      disabled={generatingFor === (lead._id || lead.id)}
                      className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50"
                    >
                      {generatingFor === (lead._id || lead.id) ? (
                        <Sparkles className="h-3.5 w-3.5 text-primary-400 animate-pulse" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      <span>
                        {generatingFor === (lead._id || lead.id) ? 'Drafting...' : 'AI Email'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && !loading && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="text-gray-300 font-medium text-sm">No leads found</h3>
            <p className="text-gray-500 text-xs mt-1">Try adding a new lead to get started.</p>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-xl font-bold text-white tracking-tight">Add New Lead</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddLead} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="E.g. Siddharth Sharma"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                  <input 
                    type="email"
                    required 
                    value={newLead.email}
                    onChange={e => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="siddharth@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company / Organization *</label>
                  <input 
                    type="text"
                    required 
                    value={newLead.company}
                    onChange={e => setNewLead({...newLead, company: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="E.g. Tata Consultancy Services"
                  />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select 
                      value={newLead.status}
                      onChange={e => setNewLead({...newLead, status: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Meeting Scheduled">Meeting Scheduled</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                    <select 
                      value={newLead.source}
                      onChange={e => setNewLead({...newLead, source: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Cold Call">Cold Call</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : 'Save Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review & Send Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-xl font-bold text-white tracking-tight">Review and Send AI Email</h3>
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
                  <input 
                    type="text" 
                    readOnly
                    value={emailDraft.leadName}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 focus:outline-none cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <input 
                    type="text"
                    required 
                    value={emailDraft.subject}
                    onChange={e => setEmailDraft({...emailDraft, subject: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Body</label>
                  <textarea 
                    required 
                    rows={8}
                    value={emailDraft.body}
                    onChange={e => setEmailDraft({...emailDraft, body: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans resize-y"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSendingEmail}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center"
                  >
                    {isSendingEmail ? (
                      <>
                        <Sparkles className="animate-spin h-4 w-4 mr-2" />
                        Sending...
                      </>
                    ) : 'Send Email'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leads;
