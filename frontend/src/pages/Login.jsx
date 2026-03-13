import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const Login = () => {
  const { loginWithGoogle, login, register } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleNormalAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    let result;
    if (isRegistering) {
      result = await register(name, email, password);
    } else {
      result = await login(email, password, twoFactorCode);
    }
    
    setLoading(false);

    if (result.success) {
      if (result.requires2FA) {
        setRequires2FA(true);
      } else {
        navigate('/', { replace: true });
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center font-inter p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="mx-auto bg-primary-600 w-12 h-12 flex items-center justify-center rounded-xl mb-4 shadow-lg shadow-primary-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to Nova</h2>
          <p className="text-gray-400">The AI-First CRM for modern sales teams.</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          
          {!requires2FA && (
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const result = await loginWithGoogle(credentialResponse.credential);
                  if (result.success) {
                    if (result.requires2FA) {
                      setRequires2FA(true);
                    } else {
                      navigate('/', { replace: true });
                    }
                  } else {
                    setErrorMsg(result.error);
                  }
                }}
                onError={() => setErrorMsg('Google Login initialization failed.')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
          )}

          {!requires2FA && (
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Or continue with email</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleNormalAuth} className="space-y-4">
            {requires2FA ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-white mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <div>
                  <input 
                    type="text" 
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || twoFactorCode.length < 6}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center mt-6 disabled:opacity-70"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </button>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <button type="button" onClick={() => { setRequires2FA(false); setTwoFactorCode(''); setErrorMsg(''); }} className="hover:text-white transition-colors">
                    Back to login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {isRegistering && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                      required={isRegistering}
                    />
                  </motion.div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    {!isRegistering && (
                      <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center mt-6 disabled:opacity-70"
                >
                  {loading ? 'Authenticating...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
                </button>
              </motion.div>
            )}
          </form>

          {!requires2FA && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  {isRegistering ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
