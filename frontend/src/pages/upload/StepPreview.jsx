import React from 'react';
import { Eye, GraduationCap, Lock, Sparkles } from 'lucide-react';

const badgeLabel = {
  silver: 'Starter',
  gold: 'Portfolio',
  diamond: 'Advanced',
};

export default function StepPreview({ projectData, aiGenerated }) {
  const techStack = projectData.techStack || [];
  const milestones = aiGenerated.milestones || [];
  const summary = aiGenerated.summary || projectData.description || '';
  const thumbnail = projectData.thumbnailUrl || projectData.uploadedImages?.[0]?.secure_url;

  return (
    <div className="custom-scrollbar animate-fadeIn max-h-[600px] space-y-8 overflow-y-auto pr-4">
      <div className="flex items-center gap-3 border-b border-[#E2DDD4] pb-4">
        <Eye className="text-[#1E3A2F]" size={24} />
        <div>
          <h2 className="font-headline text-4xl font-semibold">Project preview</h2>
          <p className="text-sm font-semibold text-[#5C5851]">A quick marketplace mockup before learners see it.</p>
        </div>
      </div>

      <div className="pointer-events-none relative rounded-3xl border border-[#E2DDD4] bg-[#F6F4EF] p-6">
        <div className="absolute right-0 top-0 z-10 rounded-bl-xl rounded-tr-3xl bg-[#1E3A2F] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Learner view
        </div>

        <div className="flex flex-col items-start gap-6 md:flex-row">
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white md:w-5/12">
            {thumbnail ? (
              <img src={thumbnail} alt="Project thumbnail" crossOrigin="anonymous" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="text-[#1E3A2F]/30" size={54} />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#1E3A2F]">
                {badgeLabel[projectData.badge] || 'Starter'}
              </span>
              <span className="rounded-full bg-[#FEF3DC] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#92580A]">
                Milestone 1 free
              </span>
            </div>

            <h1 className="font-headline text-4xl font-semibold leading-tight">{projectData.title || 'Untitled project course'}</h1>
            <p className="line-clamp-3 text-sm font-semibold leading-6 text-[#5C5851]">
              {summary || 'No description provided.'}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {techStack.map((tech) => (
                <span key={tech} className="rounded-full border border-[#E2DDD4] bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#5C5851]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="font-headline text-3xl font-semibold text-[#1E3A2F]">Rs {projectData.price || 99}</div>
              <div className="flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-4 py-2 text-sm font-bold text-white">
                <Lock size={16} /> Unlock course
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E2DDD4] pt-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Sparkles size={18} className="text-[#D4840A]" />
            Learning roadmap ({milestones.length})
          </h3>
          <div className="space-y-3">
            {milestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="flex gap-3 rounded-2xl border border-[#E2DDD4] bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0EDE6] text-xs font-bold text-[#1E3A2F]">{index + 1}</div>
                <div>
                  <h4 className="font-bold text-sm">{milestone.title || milestone.name}</h4>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#5C5851]">{milestone.description}</p>
                </div>
              </div>
            ))}
            {milestones.length > 3 && (
              <div className="pt-2 text-center text-sm font-bold text-[#5C5851]">
                + {milestones.length - 3} more milestones
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
