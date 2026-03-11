import { useState, useEffect } from 'react';
import { User, Bell, Shield, Paintbrush, LogOut, Save, Key, Mail, Moon, Sun, Monitor, AlertTriangle, Fingerprint } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company: '',
    role: 'user',
    authProvider: 'local',
    hasCustomPassword: true
  });

  const [emailPrefs, setEmailPrefs] = useState({
    dailyDigest: true,
    aiAlerts: true,
    marketing: false,
    agreedToTerms: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true
  });

  const [appearance, setAppearance] = useState('dark');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile({
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          role: data.role || 'user',
          authProvider: data.authProvider || 'local',
          hasCustomPassword: data.hasCustomPassword !== false
        });
        if (data.emailPreferences) {
          setEmailPrefs(prev => ({
            ...prev,
            dailyDigest: !!data.emailPreferences.dailyDigest,
            aiAlerts: !!data.emailPreferences.aiAlerts,
            marketing: !!data.emailPreferences.marketing
          }));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveInitiate = () => {
    if (activeTab === 'notifications' && !emailPrefs.agreedToTerms) {
      alert("Please agree to the Email Preferences terms before saving notifications.");
      return;
    }
    setShowPasswordModal(true);
  };

  const submitSave = async () => {
    if (!password) {
      alert('Please enter your password to confirm changes.');
      return;
    }
    
    try {
      setSaving(true);
      const updateData = {
        name: profile.name,
        email: profile.email,
        company: profile.company,
        emailPreferences: {
          dailyDigest: emailPrefs.dailyDigest,
          aiAlerts: emailPrefs.aiAlerts,
          marketing: emailPrefs.marketing
        }
      };

      if (!profile.hasCustomPassword) {
        updateData.password = password; // Set password for the first time
      } else {
        updateData.currentPassword = password; // Validate current password
      }

      const { data } = await api.put('/auth/profile', updateData);
      
      // Update global store user state so Sidebar picks it up immediately
      useAuthStore.setState({ user: data, token: data.token });
      localStorage.setItem('token', data.token);

      alert('Settings saved successfully!');
      setShowPasswordModal(false);
      setPassword('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save settings. Check your password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500 max-w-5xl mx-auto relative">
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
            { id: 'security', icon: Shield, label: 'Security' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 pb-8">
          
          {activeTab === 'profile' && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl animate-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-gray-700/50 pb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <input 
                    type="text" 
                    value={profile.role}
                    readOnly
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl animate-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-4 flex items-center"><Mail className="h-5 w-5 mr-2 text-primary-500" /> Email Preferences</h3>
              <div className="space-y-4 pt-2">
                <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={emailPrefs.dailyDigest} onChange={(e) => setEmailPrefs({...emailPrefs, dailyDigest: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Receive daily pipeline digest emails</span>
                </label>
                <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={emailPrefs.aiAlerts} onChange={(e) => setEmailPrefs({...emailPrefs, aiAlerts: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Alert me when an AI task is due</span>
                </label>
                <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={emailPrefs.marketing} onChange={(e) => setEmailPrefs({...emailPrefs, marketing: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Marketing emails & product updates</span>
                </label>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <label className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" checked={emailPrefs.agreedToTerms} onChange={(e) => setEmailPrefs({...emailPrefs, agreedToTerms: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-primary-600 rounded bg-gray-900 checked:bg-primary-500 checked:border-primary-500 cursor-pointer transition-colors" />
                    <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>I agree to receive the selected emails and confirm that my email preferences will be stored by Uptiq.ai.</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm shadow-xl animate-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700/50 pb-4 flex items-center"><Fingerprint className="h-5 w-5 mr-2 text-primary-500" /> Security Settings</h3>
              
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-200 font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={security.twoFactor} onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSaveInitiate}
              className="flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/20"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>

        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center">
              <Key className="h-5 w-5 mr-2 text-primary-500" />
              {!profile.hasCustomPassword ? 'Set Password' : 'Confirm Action'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {!profile.hasCustomPassword 
                ? "As a Google Auth user, please set a password to save profile changes. You can use this later to login manually."
                : "Please enter your current password to save these changes to your profile."}
            </p>
            <input 
              type="password" 
              placeholder={!profile.hasCustomPassword ? "Enter new password" : "Confirm current Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white mb-6 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={submitSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
