import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { ChevronsRight, Send, Check, X, Sparkles, ArrowRight, HelpCircle, AlertTriangle, User, Terminal } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function AiPanel() {
  const {
    aiMessages, aiSuggestion, isAiThinking, aiInput,
    toggleRightSidebar, acceptAiSuggestion, rejectAiSuggestion,
    addAiUserMessage, milestones, currentMilestoneId,
    proceedToNextMilestone, showQuiz, setAiInput,
    insufficientCreditsError, setInsufficientCreditsError,
    isLabLoading
  } = useLabStore();

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Robust Auto-scroll
  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Small timeout to ensure DOM has updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [aiMessages, isAiThinking, isLabLoading]);

  // Precise auto-resize textarea
  useLayoutEffect(() => {
    const target = textareaRef.current;
    if (target) {
      if (!aiInput.trim()) {
        target.style.height = '40px';
      } else {
        target.style.height = 'auto'; 
        const newHeight = target.scrollHeight;
        target.style.height = `${Math.min(Math.max(newHeight, 40), 160)}px`;
      }
    }
  }, [aiInput]);

  const handleSend = () => {
    if (!aiInput.trim()) return;
    addAiUserMessage(aiInput.trim());
    setAiInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMilestone = milestones.find(m => m.id === currentMilestoneId);
  const milestoneProgress = currentMilestone?.steps
    ? currentMilestone.steps.filter(s => s.status === 'completed').length / currentMilestone.steps.length
    : 0;
  const showMilestonePrompt = milestoneProgress >= 0.7 && milestoneProgress < 1;
  const milestoneCompleted = milestoneProgress === 1;

  const AiAvatar = () => (
    <div className="w-5 h-5 rounded-sm bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-sm">
      <Sparkles size={11} className="text-indigo-500" />
    </div>
  );

  const UserAvatar = () => (
    <div className="w-5 h-5 rounded-sm bg-gray-500/10 flex items-center justify-center shrink-0 border border-gray-500/20 shadow-sm">
      <User size={11} className="text-gray-500" />
    </div>
  );

  return (
    <aside className="flex flex-col h-full bg-[var(--lab-surface)] border-l border-[var(--lab-border)] w-full overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--lab-border-subtle)] bg-[var(--lab-surface)] sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            className="p-1 rounded text-[var(--lab-text-muted)] hover:text-[var(--lab-text)] hover:bg-[var(--lab-accent-soft)] transition-all active:scale-95 outline-none border-none ring-0 focus:ring-0" 
            onClick={toggleRightSidebar}
          >
            <ChevronsRight size={16} />
          </button>
          <span className="text-[11px] font-bold text-[var(--lab-text-secondary)] uppercase tracking-wider">AI Tutor</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles size={10} className="text-indigo-500" />
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">PREMIUM</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto lab-ai-chat scrollbar-thin scrollbar-thumb-[var(--lab-border)] scrollbar-track-transparent"
      >
        {isLabLoading ? (
          <div className="p-6 space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded bg-[var(--lab-accent-soft)] animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-[var(--lab-accent-soft)] animate-pulse rounded" />
                  <div className="h-16 w-full bg-[var(--lab-accent-soft)] animate-pulse rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            <div className="flex-1">
              {aiMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 pt-20 space-y-4 opacity-40 animate-in fade-in duration-700">
                  <div className="p-4 rounded-2xl bg-[var(--lab-surface-elevated)] border border-[var(--lab-border-subtle)] shadow-inner">
                    <Sparkles size={32} className="text-[var(--lab-accent)]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--lab-text)]">How can I assist you?</p>
                    <p className="text-[11px] text-[var(--lab-text-secondary)] max-w-[200px] leading-relaxed">Ask about code logic, milestones, or debugging tips.</p>
                  </div>
                </div>
              ) : (
                aiMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`group px-4 py-8 mb-4 border-b border-(--lab-border-subtle) transition-all duration-300 ${
                      msg.role === 'ai' ? 'bg-(--lab-accent-soft)/40 shadow-sm' : 'bg-transparent'
                    } hover:bg-(--lab-accent-soft)/60`}
                  >
                    <div className="flex gap-4">
                      {msg.role === 'ai' ? <AiAvatar /> : <UserAvatar />}
                      <div className="flex-1 space-y-4 min-w-0">
                        <span className="text-[11px] font-extrabold text-[var(--lab-text-secondary)] uppercase tracking-tight block">
                          {msg.role === 'ai' ? 'AI Tutor' : 'You'}
                        </span>
                        <div className="text-[13px] leading-[1.7] text-(--lab-text) break-words font-medium">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          
                          {/* Legacy Diff Handling */}
                          {msg.diff && (
                            <div className="mt-5 rounded border border-(--lab-border) text-[11px] font-mono bg-(--lab-bg) shadow-md overflow-hidden animate-in slide-in-from-left-2 duration-300">
                              <div className="px-3.5 py-2.5 bg-red-500/[0.04] text-red-500 line-through border-b border-(--lab-border-subtle) italic opacity-80">{msg.diff.original}</div>
                              <div className="px-3.5 py-2.5 bg-green-500/[0.04] text-green-600 whitespace-pre-wrap font-semibold">{msg.diff.replacement}</div>
                            </div>
                          )}

                          {/* New AI Response Model Handling - Minimalist */}
                          {msg.responseModel && msg.responseModel.hasActions && (
                            <div className="mt-5 flex flex-wrap gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                              {msg.responseModel.suggestions.map((suggestion, sIdx) => (
                                <button 
                                  key={sIdx}
                                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-500/10 text-indigo-500 text-[11px] font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all active:scale-95 shadow-sm"
                                  onClick={() => acceptAiSuggestion(suggestion)}
                                >
                                  <ArrowRight size={13} strokeWidth={2.5} />
                                  <span>Apply Changes to {suggestion.name}</span>
                                </button>
                              ))}
                              {msg.responseModel.commands.map((cmd, cIdx) => (
                                <button 
                                  key={cIdx}
                                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-500/10 text-slate-400 text-[11px] font-bold border border-slate-500/20 hover:bg-slate-500/20 transition-all active:scale-95 shadow-sm font-mono"
                                  onClick={(e) => {
                                    navigator.clipboard.writeText(cmd.command);
                                    const btn = e.currentTarget;
                                    const originalContent = btn.innerHTML;
                                    btn.innerHTML = '<span class="text-green-500">Copied!</span>';
                                    btn.classList.add('border-green-500/50');
                                    setTimeout(() => {
                                      btn.innerHTML = originalContent;
                                      btn.classList.remove('border-green-500/50');
                                    }, 2000);
                                  }}
                                >
                                  <Terminal size={13} strokeWidth={2.5} />
                                  <span>{cmd.command}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Global Apply/Dismiss for Legacy or Catch-all */}
                        {msg.role === 'ai' && idx === aiMessages.length - 1 && aiSuggestion && (
                          <div className="flex gap-2.5 pt-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0" onClick={() => acceptAiSuggestion()}>
                              <Check size={14} strokeWidth={3} /><span>Apply Changes</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-(--lab-surface) text-(--lab-text-secondary) border border-(--lab-border) text-[11px] font-bold hover:bg-(--lab-surface-elevated) active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0" onClick={rejectAiSuggestion}>
                              <X size={14} /><span>Dismiss</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isAiThinking && (
                <div className="px-4 py-6 border-b border-[var(--lab-border-subtle)] bg-[var(--lab-accent-soft)]/40 animate-in fade-in duration-300">
                  <div className="flex gap-4"><AiAvatar />
                    <div className="flex-1 pt-1.5">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {milestoneCompleted && (
              <div className="p-8 border-b border-[var(--lab-border-subtle)] bg-gradient-to-b from-indigo-500/[0.03] to-transparent animate-in fade-in duration-500">
                <div className="max-w-md mx-auto text-center space-y-5">
                  <div className="inline-flex p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default"><Sparkles size={24} /></div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-[var(--lab-text)] tracking-tight">Milestone Unlocked</h3>
                    <p className="text-[12px] text-[var(--lab-text-secondary)] leading-relaxed max-w-[220px] mx-auto">You've crushed all the tasks. Ready for the next challenge?</p>
                  </div>
                  <div className="flex flex-col gap-2.5 pt-3">
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 outline-none border-none ring-0 focus:ring-0" onClick={showQuiz}>
                      <ArrowRight size={16} strokeWidth={3} /><span>Take Quiz & Proceed</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 w-full py-2 rounded bg-transparent text-[var(--lab-text-secondary)] text-[11px] font-bold hover:bg-[var(--lab-surface-elevated)] transition-all outline-none border-none ring-0 focus:ring-0" onClick={() => { addAiUserMessage("I have a question about this milestone."); }}>
                      <HelpCircle size={15} /><span>I still have questions</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showMilestonePrompt && !milestoneCompleted && (
              <div className="px-5 py-4 border-b border-[var(--lab-border-subtle)] bg-indigo-500/[0.03] animate-pulse">
                <div className="flex items-center gap-2.5 text-[11px] font-black text-indigo-500 uppercase tracking-wider">
                  <Sparkles size={14} /><span>Finishing Touches Remaining!</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {insufficientCreditsError && (
        <div className="m-4 p-4 rounded border border-red-500/30 bg-red-500/[0.03] shadow-lg shadow-red-500/5 animate-in slide-in-from-bottom-4 duration-400">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-red-500 font-black text-[10px] uppercase tracking-widest"><AlertTriangle size={14} /><span>Credit Alert</span></div>
            <button onClick={() => setInsufficientCreditsError(false)} className="p-0.5 rounded-full hover:bg-red-500/10 text-red-400 transition-colors outline-none border-none ring-0 focus:ring-0"><X size={14} /></button>
          </div>
          <p className="mt-2 text-[11px] text-[var(--lab-text-secondary)] leading-relaxed font-medium">You need at least <span className="text-red-500 font-bold underline underline-offset-2">2 credits</span> to initiate an AI session.</p>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-3 bg-[var(--lab-surface)] border-t border-[var(--lab-border-subtle)] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="relative flex flex-col bg-[var(--lab-surface-elevated)] rounded-xl transition-all duration-300 group border border-transparent focus-within:border-indigo-500/20">
          <textarea
            ref={textareaRef}
            style={{ height: '40px' }}
            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none resize-none px-3.5 py-2.5 text-[13px] text-[var(--lab-text)] placeholder:text-[var(--lab-text-muted)] max-h-[160px] lab-ai-input-sleek font-medium leading-relaxed overflow-y-auto"
            placeholder="Ask a question..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="flex items-center justify-end px-2.5 pb-2.5">
            <button
              className={`flex items-center justify-center px-3.5 py-1.5 rounded-lg transition-all font-black text-[10px] uppercase tracking-wider outline-none border-none ring-0 focus:ring-0 ${aiInput.trim()
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95'
                  : 'bg-[var(--lab-surface)] text-[var(--lab-text-muted)] border border-[var(--lab-border)] cursor-not-allowed opacity-50'
                }`}
              onClick={handleSend}
              disabled={!aiInput.trim()}
            >
              <Send size={12} className={`mr-1.5 ${aiInput.trim() ? 'animate-in fade-in zoom-in duration-300' : ''}`} strokeWidth={3} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
