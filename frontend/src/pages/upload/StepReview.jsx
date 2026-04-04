import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { projectsExpressApi } from '../../api/express';

export default function StepReview({ projectData, setProjectData, aiGenerated, setAiGenerated, readme }) {
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [enhancingMilestones, setEnhancingMilestones] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState(0);

  const handleEnhanceSummary = async () => {
    setEnhancingSummary(true);
    try {
      const res = await projectsExpressApi.enhanceSummary(aiGenerated.summary, readme);
      if (res.success && res.enhanced_summary) {
        setAiGenerated(prev => ({ ...prev, summary: res.enhanced_summary }));
      }
    } catch (e) { console.error(e); }
    finally { setEnhancingSummary(false); }
  };

  const handleEnhanceMilestones = async () => {
    setEnhancingMilestones(true);
    try {
      const res = await projectsExpressApi.enhanceMilestones(aiGenerated.milestones, readme);
      if (res.success && res.enhanced_milestones) {
        setAiGenerated(prev => ({ ...prev, milestones: res.enhanced_milestones }));
      }
    } catch (e) { console.error(e); }
    finally { setEnhancingMilestones(false); }
  };

  const updateMilestone = (idx, field, value) => {
    const updated = [...aiGenerated.milestones];
    updated[idx] = { ...updated[idx], [field]: value };
    setAiGenerated(prev => ({ ...prev, milestones: updated }));
  };

  const updateStep = (mIdx, sIdx, field, value) => {
    const updated = [...aiGenerated.milestones];
    const steps = [...(updated[mIdx].steps || [])];
    steps[sIdx] = { ...steps[sIdx], [field]: value };
    updated[mIdx] = { ...updated[mIdx], steps };
    setAiGenerated(prev => ({ ...prev, milestones: updated }));
  };

  const EnhanceBtn = ({ loading, onClick, label }) => (
    <button onClick={onClick} disabled={loading}
      className="px-3 py-1.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md hover:scale-[1.02] disabled:hover:scale-100">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? 'Enhancing...' : label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold mb-1">Review AI-Generated Content</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Edit and enhance the generated content below.</p>
      </div>

      {/* Project Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Project Title</label>
        <input
          value={projectData.title}
          onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold transition-all"
        />
      </div>

      {/* Summary */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Summary</label>
          <EnhanceBtn loading={enhancingSummary} onClick={handleEnhanceSummary} label="✨ Enhance" />
        </div>
        <textarea
          value={aiGenerated.summary}
          onChange={(e) => setAiGenerated(prev => ({ ...prev, summary: e.target.value }))}
          rows={3}
          className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
        />
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Milestones ({aiGenerated.milestones.length})
          </label>
          <EnhanceBtn loading={enhancingMilestones} onClick={handleEnhanceMilestones} label="✨ Enhance All" />
        </div>
        <div className="space-y-3">
          {aiGenerated.milestones.map((m, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-white/2">
              {/* Milestone Header */}
              <button
                onClick={() => setExpandedMilestone(expandedMilestone === idx ? -1 : idx)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-md shadow-indigo-500/20">
                  {idx + 1}
                </span>
                <input
                  value={m.title}
                  onChange={(e) => { e.stopPropagation(); updateMilestone(idx, 'title', e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent font-semibold focus:outline-none text-sm"
                />
                {expandedMilestone === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {expandedMilestone === idx && (
                <div className="px-4 pb-4 space-y-3">
                  <input
                    value={m.description || ''}
                    onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                    placeholder="Milestone description..."
                    className="w-full bg-transparent text-sm text-slate-500 dark:text-slate-400 focus:outline-none pl-11"
                  />
                  {/* Steps as individual boxes */}
                  {m.steps && m.steps.length > 0 && (
                    <div className="space-y-2 pl-11">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Steps</span>
                      {m.steps.map((step, sIdx) => (
                        <div key={sIdx} className="p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-indigo-500/10 text-indigo-500 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                              {sIdx + 1}
                            </span>
                            <input
                              value={step.title || ''}
                              onChange={(e) => updateStep(idx, sIdx, 'title', e.target.value)}
                              placeholder="Step title"
                              className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                            />
                          </div>
                          <input
                            value={step.description || ''}
                            onChange={(e) => updateStep(idx, sIdx, 'description', e.target.value)}
                            placeholder="Step description..."
                            className="w-full bg-transparent text-xs text-slate-500 dark:text-slate-400 focus:outline-none pl-7"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
