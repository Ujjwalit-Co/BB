import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Code2,
  GraduationCap,
  Loader2,
  PackageOpen,
  Sparkles,
  UserRound,
} from 'lucide-react';
import ProjectCourseCard from '../components/ProjectCourseCard';

export default function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${baseUrl}/projects/seller/${sellerId}/profile`);
        const data = await response.json();

        if (data.success) {
          setSeller(data.seller);
          setProjects(data.projects || []);
        } else {
          setError(data.message || 'Failed to load creator profile');
        }
      } catch (err) {
        console.error('Error fetching seller profile:', err);
        setError('Network error while loading creator profile');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) fetchSellerProfile();
  }, [sellerId]);

  const joinedAt = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently';

  const techStack = useMemo(() => {
    const tags = new Set();
    projects.forEach((project) => {
      const stack = project.techStack || project.technologies || [];
      stack.forEach((tag) => {
        if (tag) tags.add(tag);
      });
    });
    return Array.from(tags).slice(0, 8);
  }, [projects]);

  const avatarUrl = typeof seller?.avatar === 'string' ? seller.avatar : seller?.avatar?.secure_url;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] text-[#1E3A2F] dark:bg-[#10130F] dark:text-[#7FC79C]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] px-4 dark:bg-[#10130F]">
        <div className="max-w-md rounded-2xl border border-[#E2DDD4] bg-white p-8 text-center text-[#1C1A17] shadow-[0_18px_50px_rgba(28,26,23,0.08)] dark:border-white/10 dark:bg-[#171B16] dark:text-[#F7F2E8]">
          <UserRound className="mx-auto text-[#C0392B]" size={42} />
          <h1 className="mt-4 font-headline text-3xl font-semibold">Creator not found</h1>
          <p className="mt-2 text-sm leading-6 text-[#5C5851] dark:text-[#B8C2B1]">{error}</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42]"
          >
            Browse build courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 py-8 text-[#1C1A17] sm:px-6 lg:px-8 dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#5C5851] dark:text-[#B8C2B1]">
          <Link to="/" className="transition hover:text-[#1E3A2F] dark:hover:text-[#DDEBDD]">Home</Link>
          <ChevronRight size={15} />
          <Link to="/catalog" className="transition hover:text-[#1E3A2F] dark:hover:text-[#DDEBDD]">Marketplace</Link>
          <ChevronRight size={15} />
          <span className="text-[#1C1A17] dark:text-[#F7F2E8]">{seller.name}</span>
        </nav>

        <section className="overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white shadow-[0_22px_60px_rgba(28,26,23,0.08)] dark:border-white/10 dark:bg-[#171B16]">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2DDD4] bg-[#F6F4EF] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#5C5851] dark:border-white/10 dark:bg-white/5 dark:text-[#B8C2B1]">
                <GraduationCap size={14} />
                Student creator
              </span>

              <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E2DDD4] bg-[#F0EDE6] dark:border-white/10 dark:bg-white/5">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={seller.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound size={42} className="text-[#1E3A2F] dark:text-[#7FC79C]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-headline text-4xl font-semibold leading-tight sm:text-5xl">{seller.name}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5C5851] dark:text-[#B8C2B1]">
                    {seller.bio || 'A BrainBazaar creator turning real student-built projects into clear milestone-led learning journeys.'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F2EC] px-3 py-1.5 text-xs font-bold text-[#1E3A2F] dark:bg-[#223426] dark:text-[#DDEBDD]">
                  <Calendar size={14} />
                  Teaching since {joinedAt}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FEF3DC] px-3 py-1.5 text-xs font-bold text-[#92580A] dark:bg-[#3A2A12] dark:text-[#F0C565]">
                  <BookOpen size={14} />
                  {projects.length} project {projects.length === 1 ? 'course' : 'courses'}
                </span>
                {techStack.length > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F0EDE6] px-3 py-1.5 text-xs font-bold text-[#5C5851] dark:bg-white/5 dark:text-[#B8C2B1]">
                    <Code2 size={14} />
                    {techStack.slice(0, 3).join(' / ')}
                  </span>
                )}
              </div>
            </div>

            <aside className="border-t border-[#E2DDD4] bg-[#F9F7F2] p-6 sm:p-8 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-[#121711]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4840A] dark:text-[#F0C565]">Learning promise</p>
              <h2 className="mt-3 font-headline text-3xl font-semibold leading-tight">Build first, understand deeply.</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#5C5851] dark:text-[#B8C2B1]">
                Every project course starts with a visible roadmap and a free first milestone, so learners can test the teaching style before unlocking the full build.
              </p>
              {techStack.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {techStack.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#E2DDD4] bg-white px-3 py-1 text-xs font-bold text-[#5C5851] dark:border-white/10 dark:bg-[#171B16] dark:text-[#B8C2B1]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4840A] dark:text-[#F0C565]">Creator shelf</p>
              <h2 className="mt-2 font-headline text-3xl font-semibold">Project courses by {seller.name}</h2>
            </div>
            <Link
              to="/catalog"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#E2DDD4] bg-white px-4 py-2.5 text-sm font-bold text-[#1E3A2F] transition hover:-translate-y-0.5 hover:border-[#1E3A2F] hover:bg-[#E8F2EC] dark:border-white/10 dark:bg-white/5 dark:text-[#DDEBDD] dark:hover:border-[#7FC79C] dark:hover:bg-[#223426]"
            >
              Explore marketplace
              <ChevronRight size={16} />
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCourseCard
                  key={project._id}
                  project={{ ...project, seller }}
                  onOpen={() => navigate(`/project/${project._id}`)}
                  actionLabel="Open course"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E2DDD4] bg-white p-8 text-center dark:border-white/10 dark:bg-[#171B16]">
              <PackageOpen className="mx-auto text-[#9B9589]" size={44} />
              <h3 className="mt-4 font-headline text-3xl font-semibold">No courses published yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5C5851] dark:text-[#B8C2B1]">
                This creator is still preparing their first project course. Check the marketplace for more builds.
              </p>
              <Link
                to="/catalog"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#1E3A2F] px-5 py-3 text-sm font-bold text-[#1E3A2F] transition hover:bg-[#E8F2EC] dark:border-[#7FC79C] dark:text-[#DDEBDD] dark:hover:bg-[#223426]"
              >
                <Sparkles size={17} />
                Browse marketplace
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
