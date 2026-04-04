import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, registerSeller } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password });
      } else if (isSeller) {
        result = await registerSeller(formData);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        navigate('/catalog');
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center nebula-gradient px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-md relative z-10 transition-transform duration-500 ease-out">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl card-hover relative overflow-hidden">
          {/* subtle top inner glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 mb-3 drop-shadow-sm">
              BrainBazaar
            </h1>
            <p className="font-body font-medium text-slate-600 dark:text-slate-400 text-sm">
              {isLogin 
                ? 'Welcome back! Continue your learning journey.' 
                : isSeller 
                  ? 'Join as a Creator and monetize your projects.' 
                  : 'Create a student account to get started.'}
            </p>
          </div>

          {/* Premium Segmented Control for Role Toggle (Sign Up only) */}
          {!isLogin && (
            <div className="flex mb-8 bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-xl relative z-10">
              <button
                type="button"
                onClick={() => setIsSeller(false)}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isSeller
                    ? 'text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {!isSeller && (
                  <span className="absolute inset-0 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-sm -z-10" style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                )}
                Student
              </button>
              <button
                type="button"
                onClick={() => setIsSeller(true)}
                className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isSeller
                    ? 'text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isSeller && (
                  <span className="absolute inset-0 bg-white dark:bg-[#2A2A2A] rounded-lg shadow-sm -z-10" style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                )}
                Creator
              </button>
            </div>
          )}

          {/* Login/Signup Tabs */}
          <div className="flex justify-center mb-8 border-b border-slate-200 dark:border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                isLogin
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Login
              {isLogin && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                !isLogin
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Sign Up
              {!isLogin && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.5)]" />
              )}
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 font-body">
            {!isLogin && (
              <div className="relative input-focus group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a]/50 text-slate-900 dark:text-white outline-none transition-all placeholder-transparent"
                  placeholder="John Doe"
                />
                <label htmlFor="name" className="absolute left-4 top-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-indigo-500 pointer-events-none">
                  Full Name
                </label>
              </div>
            )}

            <div className="relative input-focus group">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a]/50 text-slate-900 dark:text-white outline-none transition-all placeholder-transparent"
                placeholder="you@email.com"
              />
              <label htmlFor="email" className="absolute left-4 top-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-indigo-500 pointer-events-none">
                Email Address
              </label>
            </div>

            <div className="relative input-focus group">
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="peer w-full px-4 pt-6 pb-2 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/50 dark:bg-[#1a1a1a]/50 text-slate-900 dark:text-white outline-none transition-all placeholder-transparent"
                placeholder="••••••••"
              />
              <label htmlFor="password" className="absolute left-4 top-2 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-indigo-500 pointer-events-none">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 btn-press disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">{isLogin ? 'Welcome Back →' : isSeller ? 'Become a Creator 🚀' : 'Start Learning 🚀'}</span>
                  <div className="absolute inset-0 h-full w-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
