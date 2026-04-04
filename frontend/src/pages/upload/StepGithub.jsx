import React, { useState } from 'react';
import { Github, Check, Lock, Globe } from 'lucide-react';

export default function StepGithub({ githubConnected, githubUsername, onConnect }) {
  const [accessLevel, setAccessLevel] = useState('public');

  return (
    <div className="text-center py-10 space-y-8 animate-fadeIn">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
        <Github size={40} className="text-indigo-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect Your GitHub Account</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          We'll use your GitHub account to access your repositories and project files.
        </p>
      </div>

      {githubConnected ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-medium inline-flex items-center gap-2">
          <Check size={20} /> Connected as @{githubUsername}
        </div>
      ) : (
        <div className="space-y-6 max-w-lg mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Choose access level</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAccessLevel('public')}
              className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 group hover:scale-[1.02] ${
                accessLevel === 'public'
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
              }`}
            >
              <Globe size={24} className={`mb-3 ${accessLevel === 'public' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <h4 className="font-bold text-sm mb-1">Public Repos Only</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access only your public repositories</p>
              {accessLevel === 'public' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
            <button
              onClick={() => setAccessLevel('all')}
              className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 group hover:scale-[1.02] ${
                accessLevel === 'all'
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
              }`}
            >
              <Lock size={24} className={`mb-3 ${accessLevel === 'all' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <h4 className="font-bold text-sm mb-1">Public + Private</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access all repositories including private</p>
              {accessLevel === 'all' && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          </div>
          <button
            onClick={() => onConnect(accessLevel)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 px-8 rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            <Github size={20} /> Connect GitHub
          </button>
        </div>
      )}
    </div>
  );
}
