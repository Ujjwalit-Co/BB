import React, { useState } from 'react';
import { Search, Loader2, Globe, Lock, Star } from 'lucide-react';

export default function StepRepos({ repos, loading, selectedRepo, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, public, private

  const filtered = repos.filter(repo => {
    const matchesSearch = !search ||
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'public' && !repo.private) ||
      (filter === 'private' && repo.private);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold mb-1">Select Repository</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Choose the project repository you want to upload.</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'public', 'private'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'public' ? '🔓 Public' : '🔐 Private'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} of {repos.length} repos</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {filtered.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8 text-sm">No repositories found.</p>
          )}
          {filtered.map(repo => (
            <button
              key={repo.id}
              onClick={() => onSelect(repo)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] group ${
                selectedRepo?.id === repo.id
                  ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{repo.name}</h3>
                    {repo.private ? (
                      <Lock size={12} className="text-amber-500 shrink-0" />
                    ) : (
                      <Globe size={12} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{repo.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-3">
                  {repo.language && <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md font-medium">{repo.language}</span>}
                  {repo.stargazersCount > 0 && (
                    <span className="flex items-center gap-1"><Star size={12} />{repo.stargazersCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
