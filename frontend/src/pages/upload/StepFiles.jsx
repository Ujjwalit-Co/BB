import React, { useState } from 'react';
import { Code, Check, Loader2, Info, X } from 'lucide-react';

const MAX_FILES = 6;
const MIN_FILES = 1;

export default function StepFiles({ repoFiles, selectedFiles, toggleFileSelection, loading }) {
  const [showInfo, setShowInfo] = useState(false);
  const atLimit = selectedFiles.length >= MAX_FILES;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Select Main Files</h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
            >
              <Info size={14} />
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Select {MIN_FILES}–{MAX_FILES} key entry-point files for AI context.
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
          selectedFiles.length === 0 ? 'bg-red-500/10 text-red-400' :
          atLimit ? 'bg-amber-500/10 text-amber-400' :
          'bg-indigo-500/10 text-indigo-400'
        }`}>
          {selectedFiles.length}/{MAX_FILES} selected
        </div>
      </div>

      {showInfo && (
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-sm text-slate-600 dark:text-slate-300 relative">
          <button onClick={() => setShowInfo(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={14} /></button>
          <p className="font-semibold text-indigo-400 mb-1 flex items-center gap-1.5"><Info size={14} /> What are Important Files?</p>
          <p className="text-xs leading-relaxed">
            Important files are your project's key entry-point files (e.g., <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">app.js</code>, <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">server.js</code>, <code className="bg-slate-200 dark:bg-white/10 px-1 rounded">index.html</code>). 
            These help the AI Tutor understand your project's architecture and provide better guidance. Select 1 to 6 files (README is included separately).
          </p>
        </div>
      )}

      {selectedFiles.length === 0 && (
        <p className="text-xs text-amber-400">⚠️ Select at least {MIN_FILES} file to proceed.</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
      ) : (
        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {repoFiles.filter(f => !f.path.toLowerCase().match(/^readme\.?/i)).map(file => {
            const isSelected = selectedFiles.includes(file.path);
            const isDisabled = atLimit && !isSelected;
            return (
              <button
                key={file.path}
                onClick={() => !isDisabled && toggleFileSelection(file)}
                disabled={isDisabled}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : isDisabled
                    ? 'border-transparent opacity-40 cursor-not-allowed'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'
                }`}
              >
                <Code size={16} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                <span className="font-mono text-sm truncate flex-1">{file.path}</span>
                {isSelected && <Check size={16} className="text-indigo-500 shrink-0" />}
              </button>
            );
          })}
          {repoFiles.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8 text-sm">No files found. You can skip this step.</p>
          )}
        </div>
      )}
    </div>
  );
}
