import { useState } from 'react';
import { User, Bell, Shield, Paintbrush, LogOut, Save } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Sai Chaitanya',
    email: user?.email || 'sai.chaitanya@example.com',
    company: 'Uptiq.ai',
    role: 'Admin'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Preferences</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account, notifications, and application settings.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav for Settings */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security' },
            { id: 'appearance', icon: Paintbrush, label: 'Appearance' },
          ].map(tab => (
            <button 
              key={tab.id}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tab.id === 'profile' ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 pb-8">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700/50 pb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={profile.company}
                  onChange={(e) => setProfile({...profile, company: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <input 
                  type="text" 
                  value={profile.role}
                  readOnly
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/20">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-4">Email Preferences</h3>
            <div className="space-y-4 pt-2">
              <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Receive daily pipeline digest emails</span>
              </label>
              <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" defaultChecked className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Alert me when an AI task is due</span>
              </label>
              <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Marketing emails & product updates</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
