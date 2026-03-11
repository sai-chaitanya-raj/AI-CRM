import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/20 mb-6">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-lg mb-6 text-center animate-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl flex flex-col items-center">
              <CheckCircle className="h-10 w-10 mb-3" />
              <p className="font-medium">Password reset email sent</p>
              <p className="text-sm mt-1 text-green-500/80">Please check your inbox ({email}) for the reset link.</p>
            </div>
            <Link to="/login" className="mt-8 inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="you@company.com"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
