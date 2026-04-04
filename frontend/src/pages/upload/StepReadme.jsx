import React, { useState } from 'react';
import { Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { projectsExpressApi } from '../../api/express';

export default function StepReadme({ readme, setReadme }) {
  const [enhancing, setEnhancing] = useState(false);
  const [originalReadme, setOriginalReadme] = useState(null);
  const [isEnhanced, setIsEnhanced] = useState(false);

  const handleEnhance = async () => {
    if (!readme) return;
    setEnhancing(true);
    setOriginalReadme(readme);
    try {
      const res = await projectsExpressApi.enhanceReadme(readme);
      if (res.success && res.enhanced_readme) {
        setReadme(res.enhanced_readme);
        setIsEnhanced(true);
      }
    } catch (e) {
      console.error('Enhance failed:', e);
    } finally {
      setEnhancing(false);
    }
  };

  const handleRevert = () => {
    if (originalReadme) {
      setReadme(originalReadme);
      setIsEnhanced(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Upload README</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {readme ? 'README auto-detected! Edit below or enhance it for the AI Tutor.' : 'Paste your project README here. This is mandatory.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEnhanced && (
            <button onClick={handleRevert} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5">
              <RotateCcw size={14} /> Revert
            </button>
          )}
          <button
            onClick={handleEnhance}
            disabled={!readme || enhancing}
            className="px-4 py-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] disabled:hover:scale-100"
          >
            {enhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {enhancing ? 'Enhancing...' : '✨ Enhance for AI Tutor'}
          </button>
        </div>
      </div>
      {isEnhanced && (
        <div className="px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-400 font-medium flex items-center gap-2">
          <Sparkles size={14} /> README has been enhanced for better AI Tutor understanding
        </div>
      )}
      <textarea
        value={readme}
        onChange={(e) => { setReadme(e.target.value); setIsEnhanced(false); }}
        rows={16}
        placeholder="# My Project&#10;&#10;Description of your project..."
        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
      />
      {!readme && <p className="text-sm text-red-400">README is required to proceed.</p>}
    </div>
  );
}
