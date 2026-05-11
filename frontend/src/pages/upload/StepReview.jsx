import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { projectsExpressApi } from '../../api/express';

export default function StepReview({ projectData, setProjectData, aiGenerated, setAiGenerated, readme }) {
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [enhancingMilestones, setEnhancingMilestones] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState(0);

  const handleEnhanceSummary = async () => {
    setEnhancingSummary(true);
    try {
      const response = await projectsExpressApi.enhanceSummary(aiGenerated.summary, readme);
      if (response.success && response.enhanced_summary) {
        setAiGenerated((prev) => ({ ...prev, summary: response.enhanced_summary }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEnhancingSummary(false);
    }
  };

  const handleEnhanceMilestones = async () => {
    setEnhancingMilestones(true);
    try {
      const response = await projectsExpressApi.enhanceMilestones(aiGenerated.milestones, readme);
      if (response.success && response.enhanced_milestones) {
        setAiGenerated((prev) => ({ ...prev, milestones: response.enhanced_milestones }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEnhancingMilestones(false);
    }
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...aiGenerated.milestones];
    updated[index] = { ...updated[index], [field]: value };
    setAiGenerated((prev) => ({ ...prev, milestones: updated }));
  };

  const updateStep = (milestoneIndex, stepIndex, field, value) => {
    const updated = [...aiGenerated.milestones];
    const steps = [...(updated[milestoneIndex].steps || [])];
    steps[stepIndex] = { ...steps[stepIndex], [field]: value };
    updated[milestoneIndex] = { ...updated[milestoneIndex], steps };
    setAiGenerated((prev) => ({ ...prev, milestones: updated }));
  };

  const EnhanceButton = ({ loading, onClick, label }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg bg-[#FEF3DC] px-3 py-1.5 text-xs font-bold text-[#92580A] shadow-sm transition-all hover:bg-[#1E3A2F] hover:text-white disabled:opacity-40"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? 'Enhancing...' : label}
    </button>
  );

  return (
    <div className="animate-fadeIn space-y-8 text-[#1C1A17]">
      <div>
        <h2 className="font-headline text-3xl font-semibold">Review AI content</h2>
        <p className="mt-1 text-sm font-semibold text-[#5C5851]">Edit and enhance the generated roadmap below.</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Course title</label>
        <input
          value={projectData.title}
          onChange={(event) => setProjectData((prev) => ({ ...prev, title: event.target.value }))}
          className="w-full rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 font-headline text-xl font-semibold focus:border-[#1E3A2F] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Marketplace summary</label>
          <EnhanceButton loading={enhancingSummary} onClick={handleEnhanceSummary} label="Rewrite with AI" />
        </div>
        <textarea
          value={aiGenerated.summary}
          onChange={(event) => setAiGenerated((prev) => ({ ...prev, summary: event.target.value }))}
          rows={3}
          className="w-full resize-none rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 text-sm font-medium leading-6 focus:border-[#1E3A2F] focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">
            Learning roadmap ({aiGenerated.milestones.length} milestones)
          </label>
          <EnhanceButton loading={enhancingMilestones} onClick={handleEnhanceMilestones} label="Enhance all steps" />
        </div>

        <div className="space-y-3">
          {aiGenerated.milestones.map((milestone, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white">
              <button
                type="button"
                onClick={() => setExpandedMilestone(expandedMilestone === index ? -1 : index)}
                className="flex w-full items-center gap-4 bg-[#FBF9F6] p-4 transition-colors hover:bg-[#F0EDE6]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A2F] text-xs font-bold text-white shadow-lg shadow-[#1E3A2F]/20">
                  {index + 1}
                </span>
                <input
                  value={milestone.title || ''}
                  onChange={(event) => {
                    event.stopPropagation();
                    updateMilestone(index, 'title', event.target.value);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="flex-1 truncate bg-transparent font-headline text-lg font-semibold focus:outline-none"
                />
                {expandedMilestone === index ? <ChevronUp size={18} className="text-[#5C5851]" /> : <ChevronDown size={18} className="text-[#5C5851]" />}
              </button>

              {expandedMilestone === index && (
                <div className="space-y-4 p-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9B9589]">Objective</label>
                    <textarea
                      value={milestone.description || ''}
                      onChange={(event) => updateMilestone(index, 'description', event.target.value)}
                      placeholder="What will the learner achieve here?"
                      rows={2}
                      className="w-full resize-none bg-transparent pl-2 text-sm font-medium leading-6 text-[#5C5851] focus:outline-none"
                    />
                  </div>

                  {milestone.steps && milestone.steps.length > 0 && (
                    <div className="space-y-3 border-t border-[#E2DDD4] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4840A]">Action steps</p>
                      {milestone.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="space-y-3 rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-[10px] font-bold text-[#1E3A2F] shadow-sm">
                              {stepIndex + 1}
                            </span>
                            <input
                              value={step.title || ''}
                              onChange={(event) => updateStep(index, stepIndex, 'title', event.target.value)}
                              placeholder="Step title"
                              className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                            />
                          </div>
                          <textarea
                            value={step.description || ''}
                            onChange={(event) => updateStep(index, stepIndex, 'description', event.target.value)}
                            placeholder="Briefly explain the task..."
                            rows={2}
                            className="w-full resize-none bg-transparent pl-8 text-xs font-medium leading-5 text-[#5C5851] focus:outline-none"
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
