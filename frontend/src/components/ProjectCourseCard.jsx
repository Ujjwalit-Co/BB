import React from 'react';
import { ArrowRight, Clock, GraduationCap, Lock, Star, Users } from 'lucide-react';

const badgeMeta = {
  silver: { label: 'Starter', className: 'bg-[#E8F2EC] text-[#1E3A2F]' },
  gold: { label: 'Portfolio', className: 'bg-[#FEF3DC] text-[#92580A]' },
  diamond: { label: 'Advanced', className: 'bg-[#FCE8E8] text-[#C0392B]' },
  beginner: { label: 'Starter', className: 'bg-[#E8F2EC] text-[#1E3A2F]' },
  intermediate: { label: 'Portfolio', className: 'bg-[#FEF3DC] text-[#92580A]' },
  advanced: { label: 'Advanced', className: 'bg-[#FCE8E8] text-[#C0392B]' },
};

export default function ProjectCourseCard({ project, onOpen, actionLabel = 'View build course' }) {
  if (!project) return null;

  const badge = badgeMeta[project.badge || project.complexity] || badgeMeta.silver;
  const milestoneCount = project.milestones?.length || project.milestoneCount || 4;
  const priceLabel = Number(project.price) === 0 ? 'Free' : `Rs ${project.price}`;
  const sellerName = project.seller?.name || project.creatorName || 'Student creator';
  const coverImage = project.thumbnail?.secure_url || project.thumbnailUrl || project.screenshots?.[0];
  const reviewCount = project.reviewCount ?? project.reviews?.length ?? 0;
  const ratingLabel = reviewCount > 0 && Number(project.rating) > 0 ? Number(project.rating).toFixed(1) : 'New';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E2DDD4] bg-white text-left shadow-[0_1px_0_rgba(28,26,23,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1E3A2F]/30 hover:shadow-[0_12px_28px_rgba(28,26,23,0.09)] dark:border-white/10 dark:bg-[#171B16] dark:hover:border-[#7FC79C]/45 dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
    >
      <div className="relative aspect-[16/8.6] overflow-hidden bg-[#F0EDE6] dark:bg-[#10130F]">
        {coverImage ? (
          <img
            src={coverImage}
            alt={project.title}
            crossOrigin="anonymous"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F6F4EF,#E8F2EC)] dark:bg-[linear-gradient(135deg,#10130F,#223426)]">
            <GraduationCap className="text-[#1E3A2F]/30 dark:text-[#7FC79C]/35" size={46} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1C1A17] shadow-sm dark:bg-[#10130F]/88 dark:text-[#DDEBDD] dark:ring-1 dark:ring-white/10">
            Milestone 1 free
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {(project.techStack || []).slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[#E2DDD4] bg-[#F0EDE6] px-2.5 py-0.5 font-mono text-[10px] font-medium text-[#5C5851] dark:border-white/10 dark:bg-white/5 dark:text-[#B8C2B1]"
            >
              {tech}
            </span>
          ))}
        </div>

        <h3 className="font-headline text-lg font-semibold leading-snug text-[#1C1A17] transition-colors group-hover:text-[#1E3A2F] dark:text-[#F7F2E8] dark:group-hover:text-[#DDEBDD]">
          {project.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#5C5851] dark:text-[#B8C2B1]">
          {project.description || project.summary}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#5C5851] dark:text-[#B8C2B1]">
          <span className="flex items-center gap-1.5">
            <Lock size={13} /> {milestoneCount} milestones
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> 4-8 hrs
          </span>
          <span className="flex items-center gap-1.5">
            <Star size={13} className={reviewCount > 0 ? 'fill-[#D4840A] text-[#D4840A]' : 'text-[#9B9589] dark:text-[#8F9A8A]'} /> {ratingLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E2DDD4] pt-3 dark:border-white/10">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-[#5C5851] dark:text-[#B8C2B1]">
              <Users size={13} /> by {sellerName}
            </p>
            <p className="mt-0.5 text-base font-bold text-[#1C1A17] dark:text-[#F7F2E8]">{priceLabel}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-[#2D5C42] dark:bg-[#D9A441] dark:text-[#171B16] dark:group-hover:bg-[#F0C565]">
            {actionLabel}
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}
