import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, BookOpen, CheckCircle2, Filter, Loader2, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { projectsExpressApi } from '../api/express';
import { normalizeProject } from '../utils/normalizeProject';
import ProjectCourseCard from '../components/ProjectCourseCard';

const categories = [
  { label: 'All builds', value: '' },
  { label: 'Trending', value: 'trending' },
  { label: 'Hackathon ready', value: 'hackathon' },
  { label: 'Quick builds', value: 'last-minute' },
];

const levels = [
  { label: 'All levels', value: '' },
  { label: 'Starter', value: 'silver' },
  { label: 'Portfolio', value: 'gold' },
  { label: 'Advanced', value: 'diamond' },
];

const sorters = [
  { label: 'Newest', value: 'newest' },
  { label: 'Highest rated', value: 'rating' },
  { label: 'Lowest price', value: 'price-low' },
  { label: 'Highest price', value: 'price-high' },
];

export default function Catalog() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await projectsExpressApi.getAll();
        setProjects((response.projects || []).map(normalizeProject));
        setError('');
      } catch (err) {
        console.error('Error fetching catalog:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const techStacks = useMemo(() => {
    const values = new Set(projects.flatMap((project) => project.techStack || []));
    return ['', ...Array.from(values).sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = projects.filter((project) => {
      const matchesSearch = !query
        || project.title?.toLowerCase().includes(query)
        || project.description?.toLowerCase().includes(query)
        || project.techStack?.some((tech) => tech.toLowerCase().includes(query));

      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      const matchesLevel = !selectedLevel || project.badge === selectedLevel;
      const matchesTech = !selectedTech || project.techStack?.includes(selectedTech);

      return matchesSearch && matchesCategory && matchesLevel && matchesTech;
    });

    return result.sort((a, b) => {
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [projects, searchQuery, selectedCategory, selectedLevel, selectedTech, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory || selectedLevel || selectedTech || sortBy !== 'newest';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedTech('');
    setSortBy('newest');
    setSearchOpen(false);
    setFiltersOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] dark:bg-[#10130F]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#1E3A2F] dark:text-[#7FC79C]" size={42} />
          <p className="mt-4 font-semibold text-[#5C5851] dark:text-[#B8C2B1]">Loading build courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] pb-16 pt-6 text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="grid gap-5 border-b border-[#E2DDD4] pb-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center dark:border-white/10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#FEF3DC] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#92580A] dark:bg-[#3A2A12] dark:text-[#F0C565]">
              <Sparkles size={13} />
              Explore build courses
            </p>
            <h1 className="mt-3 max-w-3xl font-headline text-3xl font-semibold tracking-tight md:text-4xl">
              Pick a real project. Learn the path behind it.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5C5851] dark:text-[#B8C2B1]">
              A marketplace of student-built projects turned into compact milestone courses.
              Try the first milestone free, then unlock the full build when it clicks.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#5C5851] dark:text-[#B8C2B1]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DDD4] bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                <CheckCircle2 size={14} className="text-[#2A9D6F]" /> Milestone roadmaps
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DDD4] bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                <CheckCircle2 size={14} className="text-[#2A9D6F]" /> AI-guided practice
              </span>
            </div>
          </div>

          <div className="relative min-h-[168px] overflow-hidden rounded-2xl border border-[#E2DDD4] bg-[#F9F7F2] p-5 shadow-[0_14px_34px_rgba(28,26,23,0.05)] dark:border-white/10 dark:bg-[#171B16]">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#FEF3DC] dark:bg-[#3A2A12]" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#B8C2B1]">Learner path</p>
              <div className="mt-5 grid grid-cols-[28px_1fr] gap-x-3 gap-y-0">
                {[
                  { label: 'Preview', copy: 'See the roadmap before paying.' },
                  { label: 'Try', copy: 'Start milestone one for free.' },
                  { label: 'Unlock', copy: 'Buy when the course feels right.' },
                ].map((step, index, list) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E3A2F] text-[11px] font-extrabold text-white dark:bg-[#2F6B49] dark:text-[#F7F2E8] dark:ring-1 dark:ring-[#9DE6B8]/35">
                      {index + 1}
                    </span>
                      {index < list.length - 1 && <span className="h-8 w-px bg-[#D4840A]/45 dark:bg-[#7FC79C]/45" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-extrabold text-[#1C1A17] dark:text-[#F7F2E8]">{step.label}</p>
                      <p className="mt-0.5 text-xs font-semibold leading-5 text-[#4F493F] dark:text-[#D9D2C7]">{step.copy}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-20 z-20 -mx-4 border-b border-[#E2DDD4] bg-[#F6F4EF]/92 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 dark:border-white/10 dark:bg-[#10130F]/92">
          <div className="rounded-2xl border border-[#E2DDD4] bg-white/86 p-2.5 shadow-[0_12px_34px_rgba(28,26,23,0.06)] dark:border-white/10 dark:bg-[#171B16]/88">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-bold text-[#1E3A2F] transition hover:border-[#1E3A2F] hover:bg-[#E8F2EC] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:hover:border-[#7FC79C] dark:hover:bg-[#223426]"
                >
                  <Search size={16} /> Search
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-bold text-[#1E3A2F] transition hover:border-[#1E3A2F] hover:bg-[#E8F2EC] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:hover:border-[#7FC79C] dark:hover:bg-[#223426]"
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#F0EDE6] px-3 text-sm font-bold text-[#5C5851] transition hover:bg-[#E8F2EC] hover:text-[#1C1A17] dark:bg-white/5 dark:text-[#B8C2B1] dark:hover:bg-[#223426] dark:hover:text-[#DDEBDD]">
                    <X size={16} /> Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-xl bg-[#F0EDE6] px-3 py-2 text-xs font-bold text-[#5C5851] dark:bg-white/5 dark:text-[#B8C2B1] sm:inline-flex">
                  <BookOpen size={14} /> {filteredProjects.length} courses
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-10 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-bold text-[#1C1A17] outline-none transition focus:border-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:focus:border-[#7FC79C]"
                >
                  {sorters.map((sorter) => (
                    <option key={sorter.value} value={sorter.value}>{sorter.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ${searchOpen || searchQuery ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="relative min-h-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9589] dark:text-[#8F9A8A]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search React, auth, AI, dashboard..."
                  className="h-10 w-full rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] pl-11 pr-10 text-sm font-semibold text-[#1C1A17] outline-none transition placeholder:text-[#9B9589] focus:border-[#1E3A2F] focus:bg-white focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:placeholder:text-[#8F9A8A] dark:focus:border-[#7FC79C] dark:focus:bg-[#121711]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9B9589] hover:bg-[#F0EDE6] hover:text-[#1C1A17] dark:hover:bg-white/10 dark:hover:text-[#F7F2E8]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-3 gap-2 lg:grid-cols-[1fr_1fr_1fr]`}>
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="h-10 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-semibold text-[#1C1A17] outline-none transition focus:border-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:focus:border-[#7FC79C]">
                {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
              <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} className="h-10 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-semibold text-[#1C1A17] outline-none transition focus:border-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:focus:border-[#7FC79C]">
                {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
              <select value={selectedTech} onChange={(event) => setSelectedTech(event.target.value)} className="h-10 rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] px-3 text-sm font-semibold text-[#1C1A17] outline-none transition focus:border-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#F7F2E8] dark:focus:border-[#7FC79C]">
                {techStacks.map((tech) => <option key={tech || 'all-tech'} value={tech}>{tech || 'All tech stacks'}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-[#C0392B]/20 bg-[#FCE8E8] p-4 font-semibold text-[#C0392B] dark:bg-[#3A1715] dark:text-[#F8B4AA]">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5C5851] dark:text-[#B8C2B1]">
            <Filter size={16} /> {filteredProjects.length} build course{filteredProjects.length === 1 ? '' : 's'} found
          </p>
          <p className="hidden items-center gap-2 text-sm font-semibold text-[#9B9589] dark:text-[#8F9A8A] sm:flex">
            <ArrowUpDown size={15} /> Sorted by {sorters.find((sorter) => sorter.value === sortBy)?.label}
          </p>
        </div>

        {filteredProjects.length ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCourseCard
                key={project._id}
                project={project}
                onOpen={() => navigate(`/project/${project._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E2DDD4] bg-white p-8 text-center dark:border-white/10 dark:bg-[#171B16]">
            <Search className="mx-auto text-[#9B9589] dark:text-[#8F9A8A]" size={42} />
            <h3 className="mt-4 font-headline text-3xl font-semibold">No matching build courses</h3>
            <p className="mt-2 text-[#5C5851] dark:text-[#B8C2B1]">Try removing a filter or searching for a broader skill.</p>
            <button type="button" onClick={clearFilters} className="mt-6 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42] dark:bg-[#D9A441] dark:text-[#171B16] dark:hover:bg-[#F0C565]">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
