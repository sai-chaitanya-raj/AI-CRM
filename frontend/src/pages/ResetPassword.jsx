import { useState } from 'react';
import { Lock, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }
    if (password.length < 6) {
      return setErrorMsg('Password must be at least 6 characters');
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm text-center animate-in zoom-in-95">
          <div className="h-16 w-16 bg-green-500/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
          <p className="text-gray-400 mb-8">Your password has been successfully updated. You can now login using your new password.</p>
          <Link 
            to="/login"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center"
          >
            Continue to Login <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create new password</h2>
          <p className="text-gray-400 text-sm mt-2">Your new password must be at least 6 characters.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-lg mb-6 text-center animate-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 mt-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
