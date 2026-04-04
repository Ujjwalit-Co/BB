import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../store/usePaymentStore';
import { ShoppingCart, Loader2, Sparkles, Search, Filter, X, ChevronDown, Zap, Code2, Trophy, Clock } from 'lucide-react';
import { projectsExpressApi } from '../api/express';
import { normalizeProject } from '../utils/normalizeProject';

export default function Catalog() {
  const navigate = useNavigate();
  const { setCheckoutModalOpen } = usePaymentStore();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const categories = ['All', 'Trending in Market', 'Hackathon Critic Favorites', 'Last Minute Helpers'];
  const levels = ['All', 'Silver', 'Gold', 'Diamond'];
  const techStacks = ['All', ...new Set(projects.flatMap(p => p.techStack || []))].slice(0, 10);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await projectsExpressApi.getAll();
        if (response.success) {
          // Normalize all projects for consistent field names
          const normalized = (response.projects || []).map(normalizeProject);
          setProjects(normalized);
          setFilteredProjects(normalized);
          setError('');
        }
      } catch (err) {
        console.error("Error fetching catalog:", err);
        setError(err.message || 'Failed to fetch catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Filter projects based on search and filters
  useEffect(() => {
    let result = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.techStack?.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel && selectedLevel !== 'All') {
      const levelMap = { 'Silver': 'beginner', 'Gold': 'intermediate', 'Diamond': 'advanced' };
      result = result.filter(p => p.badge === levelMap[selectedLevel]);
    }

    // Tech stack filter
    if (selectedTech && selectedTech !== 'All') {
      result = result.filter(p => p.techStack?.includes(selectedTech));
    }

    setFilteredProjects(result);
  }, [searchQuery, selectedCategory, selectedLevel, selectedTech, projects]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedTech('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedLevel || selectedTech;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#5d21df]" size={48} />
          <p className="text-[#5a5665] dark:text-[#a3a3a3] font-medium animate-pulse">Loading Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0a0a0a] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] tracking-tight mb-4">
            Explore the Bazaar
          </h1>
          <p className="text-lg text-[#5a5665] dark:text-[#a3a3a3] font-light max-w-2xl">
            Discover premium app templates, learn to build them with AI guidance, or just buy the finished code.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#948da2]" />
            <input
              type="text"
              placeholder="Search projects by name, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-5 bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 rounded-2xl text-[#1a1c1e] dark:text-[#e5e5e5] placeholder-[#948da2] focus:outline-none focus:ring-2 focus:ring-[#5d21df] focus:border-transparent transition-all font-medium text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#f3f4f9] dark:hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-[#948da2]" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle & Active Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[#5d21df] text-white shadow-lg shadow-[#5d21df]/30'
                  : 'bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 text-[#5a5665] dark:text-[#a3a3a3] hover:border-[#5d21df]'
              }`}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#5d21df] bg-[#f1eefb] dark:bg-[#5d21df]/10 hover:bg-[#5d21df]/10 transition-colors"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="text-sm text-[#5a5665] dark:text-[#a3a3a3]">
            <span className="font-bold text-[#1a1c1e] dark:text-[#e5e5e5]">{filteredProjects.length}</span> projects found
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 rounded-2xl shadow-xl shadow-[#5d21df]/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5a5665] dark:text-[#a3a3a3] mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 px-4 bg-[#f8f9fc] dark:bg-white/5 border border-[#e2e0e7] dark:border-white/10 rounded-xl text-[#1a1c1e] dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#5d21df] cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5a5665] dark:text-[#a3a3a3] mb-2">Difficulty</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full h-12 px-4 bg-[#f8f9fc] dark:bg-white/5 border border-[#e2e0e7] dark:border-white/10 rounded-xl text-[#1a1c1e] dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#5d21df] cursor-pointer"
                >
                  <option value="">All Levels</option>
                  {levels.filter(l => l !== 'All').map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Tech Stack Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5a5665] dark:text-[#a3a3a3] mb-2">Technology</label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full h-12 px-4 bg-[#f8f9fc] dark:bg-white/5 border border-[#e2e0e7] dark:border-white/10 rounded-xl text-[#1a1c1e] dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#5d21df] cursor-pointer"
                >
                  <option value="">All Technologies</option>
                  {techStacks.filter(t => t !== 'All').map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Category Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-[#e2e0e7] dark:border-white/10">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              !selectedCategory
                ? 'bg-[#5d21df] text-white shadow-lg shadow-[#5d21df]/30'
                : 'bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 text-[#5a5665] dark:text-[#a3a3a3] hover:border-[#5d21df]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('Trending in Market')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              selectedCategory === 'Trending in Market'
                ? 'bg-[#5d21df] text-white shadow-lg shadow-[#5d21df]/30'
                : 'bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 text-[#5a5665] dark:text-[#a3a3a3] hover:border-[#5d21df]'
            }`}
          >
            <Zap size={14} />
            Trending
          </button>
          <button
            onClick={() => setSelectedCategory('Hackathon Critic Favorites')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              selectedCategory === 'Hackathon Critic Favorites'
                ? 'bg-[#5d21df] text-white shadow-lg shadow-[#5d21df]/30'
                : 'bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 text-[#5a5665] dark:text-[#a3a3a3] hover:border-[#5d21df]'
            }`}
          >
            <Trophy size={14} />
            Hackathon
          </button>
          <button
            onClick={() => setSelectedCategory('Last Minute Helpers')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              selectedCategory === 'Last Minute Helpers'
                ? 'bg-[#5d21df] text-white shadow-lg shadow-[#5d21df]/30'
                : 'bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 text-[#5a5665] dark:text-[#a3a3a3] hover:border-[#5d21df]'
            }`}
          >
            <Clock size={14} />
            Quick Builds
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl text-[#ef4444] flex items-center gap-3">
            <Sparkles className="shrink-0" size={20} />
            <span className="font-medium">Failed to load projects: {error}</span>
          </div>
        )}

        {/* Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const badgeLevel = project.badge || 'beginner';
              const badgeConfig = {
                beginner: { color: 'bg-[#948da2]', label: 'Silver', border: 'border-[#948da2]' },
                intermediate: { color: 'bg-[#f59e0b]', label: 'Gold', border: 'border-[#f59e0b]' },
                advanced: { color: 'bg-[#8b5cf6]', label: 'Diamond', border: 'border-[#8b5cf6]' },
              };
              const badge = badgeConfig[badgeLevel] || badgeConfig.beginner;

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="group rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#e2e0e7] dark:border-white/10 hover:border-[#5d21df]/50 dark:hover:border-[#5d21df]/30 transition-all hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#5d21df]/10 via-[#6b3eea]/10 to-[#00e3fd]/10">
                    {project.thumbnail?.secure_url ? (
                      <img
                        src={project.thumbnail.secure_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code2 className="text-[#5d21df]/30" size={64} />
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 ${badge.color} text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg`}>
                      {badge.label}
                    </div>

                    {/* Category */}
                    {project.category && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#5d21df] uppercase">
                        {project.category.split(' ')[0]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] mb-2 group-hover:text-[#5d21df] dark:group-hover:text-[#cdbdff] transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[#5a5665] dark:text-[#a3a3a3] leading-relaxed line-clamp-2 mb-4 flex-1">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    {(project.techStack?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-[#f1eefb] dark:bg-[#5d21df]/10 text-[#5d21df] dark:text-[#cdbdff] text-[10px] rounded-lg font-bold uppercase"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-4 border-t border-[#e2e0e7]/30 dark:border-white/10 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCheckoutModalOpen(true, project);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5d21df] text-white text-sm font-bold rounded-xl hover:bg-[#6b3eea] transition-all shadow-md shadow-[#5d21df]/30"
                      >
                        <ShoppingCart size={16} />
                        Explore Project
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-[#f3f4f9] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-[#948da2]" size={40} />
            </div>
            <h3 className="text-xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] mb-2">No projects found</h3>
            <p className="text-[#5a5665] dark:text-[#a3a3a3] mb-6">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#5d21df] text-white font-bold rounded-xl hover:bg-[#6b3eea] transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
