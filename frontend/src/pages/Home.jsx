import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Github,
  Layers3,
  MessageSquare,
  Sparkles,
  Trophy,
  Upload,
} from 'lucide-react';
import { projectsExpressApi } from '../api/express';
import ProjectCourseCard from '../components/ProjectCourseCard';
import { normalizeProject } from '../utils/normalizeProject';

const proofStats = [
  { label: 'Guided builds', value: '20+' },
  { label: 'Free first milestones', value: '1 per course' },
  { label: 'AI help limit', value: '10+ msgs' },
];

const paths = [
  {
    title: 'Frontend Foundations',
    copy: 'Learn routing, state, APIs, forms, and deployment through real app builds.',
    tags: ['React', 'Tailwind', 'APIs'],
  },
  {
    title: 'Backend Confidence',
    copy: 'Build auth, databases, payments, file uploads, and server-side workflows.',
    tags: ['Node.js', 'MongoDB', 'Razorpay'],
  },
  {
    title: 'AI Product Builder',
    copy: 'Turn prompts, code context, and checkpoints into useful AI-powered products.',
    tags: ['FastAPI', 'Gemini', 'Python'],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsExpressApi.getAll();
        setFeaturedProjects((response.projects || []).map(normalizeProject).slice(0, 3));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <section className="relative overflow-hidden border-b border-[#E2DDD4] dark:border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:px-8 lg:min-h-[620px] lg:grid-cols-[1fr_420px] lg:items-center lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2DDD4] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#1E3A2F] dark:border-white/10 dark:bg-white/5 dark:text-[#DDEBDD]">
              <Sparkles size={14} />
              Project-based learning marketplace
            </div>

            <h1 className="font-headline text-4xl font-semibold leading-[1.02] tracking-tight text-[#1C1A17] md:text-6xl dark:text-[#F7F2E8]">
              Learn real projects by rebuilding the journey.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5C5851] md:text-lg dark:text-[#B8C2B1]">
              BrainBazaar turns student-built repositories into guided build courses.
              Start with the first milestone, ask for hints when stuck, and unlock the full project after you understand how it works.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(30,58,47,0.18)] transition hover:bg-[#2D5C42] dark:!bg-[#C8F7D4] dark:!text-[#08140D] dark:!shadow-[0_0_0_1px_rgba(200,247,212,0.22),0_16px_34px_rgba(127,199,156,0.22)] dark:hover:!bg-[#DDFBE5]"
              >
                Explore projects
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/seller"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E3A2F] px-5 py-3 text-sm font-bold text-[#1E3A2F] transition hover:bg-[#E8F2EC] dark:border-[#7FC79C] dark:text-[#DDEBDD] dark:hover:bg-[#223426]"
              >
                Become a creator
                <Upload size={18} />
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 divide-x divide-[#E2DDD4] rounded-xl border border-[#E2DDD4] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#171B16]">
              {proofStats.map((stat) => (
                <div key={stat.label} className="p-3.5">
                  <p className="font-headline text-xl font-semibold text-[#1E3A2F] dark:text-[#7FC79C]">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#5C5851] dark:text-[#B8C2B1]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-[#D8D0C2] bg-[#FFFCF6] p-4 shadow-[0_18px_46px_rgba(28,26,23,0.09)] dark:border-white/10 dark:bg-[#171B16]">
              <div className="relative min-h-[318px] overflow-hidden rounded-xl border border-[#E2DDD4] bg-[#F8F3E8] p-5 dark:border-white/10 dark:bg-[#10130F]">
                <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-[#F6D89C] opacity-70 dark:bg-[#4B3515] dark:opacity-80" />
                <div className="absolute bottom-6 right-12 h-16 w-16 rotate-6 rounded-2xl bg-[#DCEBE3] dark:bg-[#203727]" />

                <div className="relative grid h-full gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#4B463E] dark:text-[#D9D2C7]">Build course map</p>
                    <span className="rounded-full bg-[#FEF3DC] px-3 py-1 text-xs font-extrabold text-[#7A4704] ring-1 ring-[#D4840A]/15 dark:bg-[#4B3515] dark:text-[#FFD98A] dark:ring-[#F0C565]/20">
                      Milestone 1 free
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3">
                    {[
                      { title: 'Context', copy: 'What are we building?' },
                      { title: 'Milestone', copy: 'Ship one useful part.' },
                      { title: 'Checkpoint', copy: 'Prove you understood it.' },
                    ].map((step, index) => (
                      <div key={step.title} className="grid grid-cols-[36px_1fr] gap-3">
                        <div className="flex flex-col items-center">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A2F] text-sm font-extrabold text-white shadow-sm dark:bg-[#2F6B49] dark:text-[#F7F2E8] dark:ring-1 dark:ring-[#9DE6B8]/35">
                            {index + 1}
                          </span>
                          {index < 2 && <span className="h-10 w-px bg-[#D4840A]/40 dark:bg-[#7FC79C]/45" />}
                        </div>
                        <div className="rounded-xl border border-[#D8D0C2] bg-[#FFFCF6] p-3 dark:border-white/10 dark:bg-[#171B16]">
                          <p className="font-headline text-lg font-semibold text-[#1C1A17] dark:text-[#F7F2E8]">{step.title}</p>
                          <p className="mt-1 text-sm font-semibold text-[#4F493F] dark:text-[#D9D2C7]">{step.copy}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { icon: Layers3, label: 'Roadmap' },
                      { icon: MessageSquare, label: 'Hints' },
                      { icon: Trophy, label: 'Proof' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-[#D8D0C2] bg-[#FFFCF6] p-3 text-center dark:border-white/10 dark:bg-[#171B16]">
                        <item.icon className="mx-auto text-[#1E3A2F] dark:text-[#9DE6B8]" size={18} />
                        <p className="mt-2 text-xs font-extrabold text-[#4F493F] dark:text-[#D9D2C7]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">Featured build courses</p>
            <h2 className="mt-2 font-headline text-4xl font-semibold text-[#1C1A17]">Pick a real outcome and start at milestone one.</h2>
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-2 font-bold text-[#1E3A2F]">
            Explore all builds <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-96 animate-pulse rounded-xl border border-[#E2DDD4] bg-white" />
            ))}
          </div>
        ) : featuredProjects.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCourseCard
                key={project._id}
                project={project}
                onOpen={() => navigate(`/project/${project._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E2DDD4] bg-white p-10 text-center">
            <BookOpen className="mx-auto text-[#1E3A2F]" size={42} />
            <h3 className="mt-4 font-headline text-2xl font-semibold">No build courses published yet</h3>
            <p className="mt-2 text-[#5C5851]">Creator courses will appear here after review.</p>
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">How it works</p>
            <h2 className="mt-2 font-headline text-4xl font-semibold text-[#1C1A17]">A marketplace with a learning loop inside.</h2>
            <p className="mt-4 leading-7 text-[#5C5851]">
              Every course starts with a real repository, but the learner sees a guided path:
              context first, then tasks, then checkpoints, then source access.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Github, title: 'Creators upload', copy: 'A senior connects GitHub and selects the files that explain the project.' },
              { icon: Compass, title: 'AI structures', copy: 'BrainBazaar turns the repo into milestones, tasks, and checkpoints.' },
              { icon: CheckCircle2, title: 'Learners build', copy: 'Juniors complete the journey with hints, quizzes, and unlocks.' },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-6">
                <step.icon className="text-[#1E3A2F]" size={26} />
                <h3 className="mt-5 font-headline text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5C5851]">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">Skill pathways</p>
          <h2 className="mt-2 font-headline text-4xl font-semibold">Curated shelves for independent students.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {paths.map((path) => (
            <div key={path.title} className="rounded-xl border border-[#E2DDD4] bg-white p-6">
              <h3 className="font-headline text-2xl font-semibold">{path.title}</h3>
              <p className="mt-3 min-h-20 leading-7 text-[#5C5851]">{path.copy}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {path.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#1E3A2F]">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
