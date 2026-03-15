import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Terminal } from 'lucide-react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="h-16 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300">
      <Link to="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xl tracking-tight">
        <Terminal size={26} strokeWidth={2.5} />
        <span>BrainBazaar</span>
      </Link>

      <div className="flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
        <Link to="/catalog" className="hover:text-blue-500 transition-colors">Catalog</Link>
        <Link to="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link>
        <Link to="/seller" className="hover:text-blue-500 transition-colors">Sellers</Link>
        <Link to="/lab/demo" className="hover:text-blue-500 transition-colors text-blue-600 dark:text-blue-400">The Lab</Link>
        
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:text-blue-500 transition-all border border-transparent dark:border-white/5"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <Link to="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          Sign In
        </Link>
      </div>
    </nav>
  );
}
