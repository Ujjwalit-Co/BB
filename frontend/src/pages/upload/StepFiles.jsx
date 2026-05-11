import React, { useState } from 'react';
import { Check, Code, Info, Loader2, X } from 'lucide-react';

const MAX_FILES = 6;
const MIN_FILES = 1;

export default function StepFiles({ repoFiles, selectedFiles, toggleFileSelection, loading }) {
  const [showInfo, setShowInfo] = useState(false);
  const atLimit = selectedFiles.length >= MAX_FILES;

  return (
    <div className="animate-fadeIn space-y-5 text-[#1C1A17] dark:text-[#F7F2E8]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4840A] dark:text-[#F0C565]">AI context</p>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-2xl font-semibold">Select anchor files</h2>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0EDE6] text-[#5C5851] transition-all hover:bg-[#E8F2EC] hover:text-[#1E3A2F] dark:bg-white/5 dark:text-[#B8C2B1] dark:hover:bg-[#223426]"
            >
              <Info size={14} />
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">
            Select {MIN_FILES}-{MAX_FILES} key entry-point files for AI context.
          </p>
        </div>
        <div className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
          selectedFiles.length === 0 ? 'bg-[#FCE8E8] text-[#C0392B]' :
          atLimit ? 'bg-[#FEF3DC] text-[#92580A]' :
          'bg-[#E8F2EC] text-[#1E3A2F]'
        }`}>
          {selectedFiles.length}/{MAX_FILES} selected
        </div>
      </div>

      {showInfo && (
        <div className="relative rounded-2xl border border-[#E2DDD4] bg-[#FBF9F6] p-4 text-sm text-[#5C5851] dark:border-white/10 dark:bg-[#10130F] dark:text-[#D9D2C7]">
          <button type="button" onClick={() => setShowInfo(false)} className="absolute right-3 top-3 text-[#9B9589] hover:text-[#1C1A17]">
            <X size={14} />
          </button>
          <p className="mb-1 flex items-center gap-1.5 font-bold text-[#D4840A]"><Info size={14} /> What are anchor files?</p>
          <p className="text-xs leading-relaxed">
            Anchor files are key entry points such as <code className="rounded bg-[#F0EDE6] px-1 font-bold">app.js</code>, <code className="rounded bg-[#F0EDE6] px-1 font-bold">server.js</code>, or <code className="rounded bg-[#F0EDE6] px-1 font-bold">index.html</code>. They help AI understand the project architecture.
          </p>
        </div>
      )}

      {selectedFiles.length === 0 && (
        <p className="text-xs font-bold text-[#D4840A]">Select at least {MIN_FILES} file to proceed.</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#1E3A2F]" size={32} />
        </div>
      ) : (
        <div className="custom-scrollbar grid max-h-[430px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
          {repoFiles.filter((file) => !file.path.toLowerCase().match(/^readme\.?/i)).map((file) => {
            const isSelected = selectedFiles.includes(file.path);
            const isDisabled = atLimit && !isSelected;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => !isDisabled && toggleFileSelection(file)}
                disabled={isDisabled}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-[#1E3A2F] bg-[#E8F2EC] text-[#1E3A2F] dark:border-[#7FC79C] dark:bg-[#223426] dark:text-[#DDEBDD]'
                    : isDisabled
                      ? 'cursor-not-allowed border-transparent opacity-40'
                      : 'border-[#E2DDD4] bg-white hover:border-[#1E3A2F]/40 hover:bg-[#F6F4EF] dark:border-white/10 dark:bg-[#10130F] dark:hover:border-[#7FC79C]/50 dark:hover:bg-[#121711]'
                }`}
              >
                <Code size={16} className={isSelected ? 'text-[#1E3A2F]' : 'text-[#9B9589]'} />
                <span className="flex-1 truncate font-mono text-sm font-semibold">{file.path}</span>
                {isSelected && <Check size={16} className="shrink-0 text-[#1E3A2F]" />}
              </button>
            );
          })}
          {repoFiles.length === 0 && (
            <p className="py-8 text-center text-sm font-bold text-[#9B9589]">No files found. You can skip this step.</p>
          )}
        </div>
      )}
    </div>
  );
}
