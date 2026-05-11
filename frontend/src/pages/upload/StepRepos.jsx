import React, { useState } from 'react';
import { Globe, Loader2, Lock, Search, Star } from 'lucide-react';

export default function StepRepos({ repos, loading, selectedRepo, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = repos.filter((repo) => {
    const matchesSearch = !search
      || repo.name.toLowerCase().includes(search.toLowerCase())
      || (repo.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all'
      || (filter === 'public' && !repo.private)
      || (filter === 'private' && repo.private);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-fadeIn space-y-5 text-[#1C1A17] dark:text-[#F7F2E8]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4840A] dark:text-[#F0C565]">Repository source</p>
          <h2 className="mt-1 font-headline text-2xl font-semibold">Choose the project repository.</h2>
          <p className="mt-1 text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">Pick the repo learners will rebuild step by step.</p>
        </div>
        <span className="w-fit rounded-full bg-[#F0EDE6] px-3 py-1 text-xs font-bold text-[#5C5851] dark:bg-white/5 dark:text-[#B8C2B1]">
          {filtered.length} matching repos
        </span>
      </div>

      <div className="rounded-2xl border border-[#E2DDD4] bg-[#F9F7F2] p-3 dark:border-white/10 dark:bg-[#10130F]">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9589]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your repositories..."
            className="h-10 w-full rounded-xl border border-[#E2DDD4] bg-white pl-12 pr-4 text-sm font-semibold transition-all focus:border-[#1E3A2F] focus:outline-none focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#171B16]"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          {['all', 'public', 'private'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                filter === item
                  ? 'bg-[#1E3A2F] text-white shadow-lg shadow-[#1E3A2F]/20 dark:bg-[#2F6B49]'
                  : 'bg-white text-[#5C5851] hover:bg-[#E8F2EC] hover:text-[#1E3A2F] dark:bg-white/5 dark:text-[#B8C2B1]'
              }`}
            >
              {item === 'all' ? 'All' : item === 'public' ? 'Public' : 'Private'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#1E3A2F]" size={32} />
        </div>
      ) : (
        <div className="custom-scrollbar grid max-h-[410px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm font-bold text-[#9B9589]">No repositories found.</p>
          )}
          {filtered.map((repo) => (
            <button
              key={repo.id}
              type="button"
              onClick={() => onSelect(repo)}
              className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                selectedRepo?.id === repo.id
                  ? 'border-[#1E3A2F] bg-[#E8F2EC] shadow-xl shadow-[#1E3A2F]/10 dark:border-[#7FC79C] dark:bg-[#223426]'
                  : 'border-[#E2DDD4] bg-white hover:border-[#1E3A2F]/40 hover:bg-[#F6F4EF] dark:border-white/10 dark:bg-[#10130F] dark:hover:border-[#7FC79C]/50 dark:hover:bg-[#121711]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate font-headline text-lg font-semibold">{repo.name}</h3>
                    {repo.private ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FEF3DC] text-[#92580A] shadow-sm"><Lock size={10} /></span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-[#E8F2EC] text-[#1E3A2F] shadow-sm"><Globe size={10} /></span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[#5C5851] dark:text-[#D9D2C7]">{repo.description || 'No description provided'}</p>
                </div>
                <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
                  {repo.language && (
                    <span className="rounded-full border border-[#E2DDD4] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E3A2F]">
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazersCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#D4840A]">
                      <Star size={13} className="fill-[#D4840A]" />{repo.stargazersCount}
                    </span>
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
