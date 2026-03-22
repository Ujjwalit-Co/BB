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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
              BrainBazaar
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isLogin 
                ? 'Welcome back! Continue your learning journey.' 
                : isSeller 
                  ? 'Start selling your projects today.' 
                  : 'Create an account to get started.'}
            </p>
          </div>

          {/* Tabs */}
          {!isLogin && (
            <div className="flex mb-6 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setIsSeller(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                  !isSeller
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setIsSeller(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                  isSeller
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Seller
              </button>
            </div>
          )}

          {/* Toggle Login/Signup */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                isLogin
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`ml-4 px-4 py-2 text-sm font-semibold transition-all ${
                !isLogin
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                isLogin ? 'Login' : isSeller ? 'Register as Seller' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                🎯 Demo Mode: You can skip login for testing
              </p>
              <button
                onClick={() => navigate('/catalog')}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded transition-all"
              >
                Continue as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
