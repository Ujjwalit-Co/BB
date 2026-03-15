import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">
          Empowering Project Based Education
        </div>
        <div className="text-xs text-slate-600 dark:text-white/40 font-medium tracking-tight">
          © {new Date().getFullYear()} BrainBazaar. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
