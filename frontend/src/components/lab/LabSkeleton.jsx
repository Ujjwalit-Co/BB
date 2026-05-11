import React from 'react';

const editorLineWidths = ['82%', '74%', '91%', '68%', '88%', '76%', '94%', '71%'];

export const SidebarSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-md w-1/2 animate-pulse" />
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
          <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-md flex-1 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

export const EditorSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="h-10 border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-24 h-6 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
      ))}
    </div>
    <div className="flex-1 p-6 space-y-4">
      {editorLineWidths.map((width, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-white/5 rounded animate-pulse w-full" style={{ width }} />
      ))}
    </div>
  </div>
);

export const AiPanelSkeleton = () => (
  <div className="h-full flex flex-col p-4 space-y-6">
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/3 animate-pulse" />
      <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
    </div>
    <div className="flex-1 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="h-12 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
  </div>
);
