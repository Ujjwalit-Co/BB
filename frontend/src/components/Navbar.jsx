import { Sun, Moon, Terminal, Zap, Shield, Package, LogIn, ShoppingCart, User, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';

export default function Navbar() {
  const { user, logout, getProfile } = useAuthStore();
  const { credits, setCredits } = useLabStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.credits !== undefined) {
      setCredits(user.credits);
    }
  }, [user, setCredits]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, []);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-purple-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex justify-between items-center px-6 md:px-8 h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl md:text-2xl font-bold bg-linear-to-r from-[#5d21df] to-[#00e3fd] bg-clip-text text-transparent font-headline tracking-tight">
            BrainBazaar
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/catalog" className="text-[#5d21df] dark:text-[#cdbdff] border-b-2 border-[#5d21df] pb-1 font-headline tracking-tight transition-all duration-300">
              Marketplace
            </Link>
            {user?.role === 'seller' && (
              <Link to="/seller" className="text-[#5a5665] dark:text-[#a3a3a3] hover:text-[#5d21df] dark:hover:text-[#cdbdff] transition-colors font-headline tracking-tight">
                Creator Portal
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-[#5a5665] dark:text-[#a3a3a3] hover:text-[#5d21df] dark:hover:text-[#cdbdff] cursor-pointer transition-colors hover:bg-[#5d21df]/5"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              {/* Credits Display */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5d21df]/10 text-[#5d21df] dark:text-[#cdbdff]">
                <Zap size={14} fill="currentColor" />
                <span className="text-sm font-bold">{credits}</span>
              </div>

              <div className="hidden sm:block h-5 w-px bg-[#e2e0e7] dark:bg-white/10 mx-1" />

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3">
                {user.role === 'admin' ? (
                  <Link to="/admin" className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all btn-press" title="Admin Dashboard">
                    <Shield size={18} />
                  </Link>
                ) : user.role === 'seller' ? (
                  <Link to="/seller" className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all btn-press" title="Creator Portal">
                    <Package size={18} />
                  </Link>
                ) : (
                  <Link to="/dashboard" className="p-2 rounded-lg bg-[#f1eefb] dark:bg-white/10 text-[#5d21df] dark:text-[#cdbdff] hover:bg-[#5d21df]/10 transition-all btn-press" title="My Dashboard">
                    <User size={18} />
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#5d21df] rounded-xl hover:bg-[#6b3eea] btn-press shadow-xl shadow-[#5d21df]/20"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-[#5a5665] dark:text-[#a3a3a3] hover:bg-[#5d21df]/5"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#5d21df] rounded-xl hover:scale-105 transition-transform shadow-xl shadow-[#5d21df]/20"
              >
                <LogIn size={16} />
                Sign In
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-[#5a5665] dark:text-[#a3a3a3] hover:bg-[#5d21df]/5"
              >
                <Menu size={20} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-purple-500/10 md:hidden shadow-xl">
          <div className="flex flex-col p-6 space-y-4">
            <Link to="/catalog" className="text-[#5d21df] dark:text-[#cdbdff] font-headline font-bold text-lg py-2">
              Marketplace
            </Link>
            {user?.role === 'seller' && (
              <Link to="/seller" className="text-[#5a5665] dark:text-[#a3a3a3] font-headline font-medium text-lg py-2">
                Creator Portal
              </Link>
            )}
            {user ? (
              <>
                <div className="flex items-center gap-2 py-2">
                  <Zap size={16} className="text-[#5d21df]" fill="currentColor" />
                  <span className="text-[#5d21df] dark:text-[#cdbdff] font-bold">{credits} Credits</span>
                </div>
                <Link to="/dashboard" className="text-[#5a5665] dark:text-[#a3a3a3] font-headline font-medium text-lg py-2">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 text-sm font-bold text-white bg-[#5d21df] rounded-xl hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="w-full px-4 py-3 text-sm font-bold text-white bg-[#5d21df] rounded-xl hover:opacity-90 transition-opacity text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

