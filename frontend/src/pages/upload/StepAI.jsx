import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function StepAI({ loading }) {
  return (
    <div className="text-center py-16 space-y-6 animate-fadeIn">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
        <div className="absolute inset-2 bg-purple-500/15 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="relative w-24 h-24 bg-linear-to-br from-indigo-500/15 to-purple-500/15 rounded-full flex items-center justify-center">
          <Sparkles size={40} className="text-indigo-400 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold">AI is Analyzing Your Project</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
        Generating milestones, summary, and description from your README and code files...
      </p>
      {loading && <Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} />}
    </div>
  );
}
