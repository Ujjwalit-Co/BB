import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function StepAI({ loading }) {
  return (
    <div className="animate-fadeIn py-16 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-[#E2DDD4] bg-[#FEF3DC] text-[#D4840A] shadow-[0_16px_36px_rgba(212,132,10,0.15)]">
        <Sparkles size={42} className="animate-pulse" />
      </div>
      <h2 className="mt-7 font-headline text-4xl font-semibold">Drafting your roadmap</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-[#5C5851]">
        AI is reading your README and selected files to shape milestones, learning objectives, and a creator-ready summary.
      </p>
      {loading && <Loader2 className="mx-auto mt-6 animate-spin text-[#1E3A2F]" size={24} />}
    </div>
  );
}
