import React, { useState } from 'react';
import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
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
      const response = await projectsExpressApi.enhanceReadme(readme);
      if (response.success && response.enhanced_readme) {
        setReadme(response.enhanced_readme);
        setIsEnhanced(true);
      }
    } catch (error) {
      console.error('Enhance failed:', error);
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
    <div className="animate-fadeIn space-y-5 text-[#1C1A17]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-semibold">Upload README</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#5C5851]">
            {readme ? 'README auto-detected. Edit it below or polish it for the AI tutor.' : 'Paste your project README here. This is required.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEnhanced && (
            <button
              type="button"
              onClick={handleRevert}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DDD4] bg-white px-3 py-2 text-xs font-bold text-[#5C5851] transition hover:bg-[#F0EDE6]"
            >
              <RotateCcw size={14} /> Revert
            </button>
          )}
          <button
            type="button"
            onClick={handleEnhance}
            disabled={!readme || enhancing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF3DC] px-4 py-2 text-xs font-bold text-[#92580A] transition hover:bg-[#D4840A] hover:text-[#1C1A17] disabled:opacity-40"
          >
            {enhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {enhancing ? 'Enhancing...' : 'Enhance for AI tutor'}
          </button>
        </div>
      </div>

      {isEnhanced && (
        <div className="flex items-center gap-2 rounded-xl border border-[#D4840A]/20 bg-[#FEF3DC] px-4 py-3 text-xs font-bold text-[#92580A]">
          <Sparkles size={14} /> README has been enhanced for better AI tutor context.
        </div>
      )}

      <textarea
        value={readme}
        onChange={(event) => {
          setReadme(event.target.value);
          setIsEnhanced(false);
        }}
        rows={16}
        placeholder="# My Project&#10;&#10;Description of your project..."
        className="w-full resize-none rounded-2xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 font-mono text-sm leading-6 transition-all focus:border-[#1E3A2F] focus:outline-none focus:ring-4 focus:ring-[#1E3A2F]/10"
      />

      {!readme && <p className="text-sm font-bold text-[#C0392B]">README is required to proceed.</p>}
    </div>
  );
}
