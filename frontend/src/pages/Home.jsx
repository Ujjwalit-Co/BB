import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsExpressApi } from '../api/express';
import {
  ArrowRight, Sparkles, Code2, Zap, TrendingUp, Trophy,
  Clock, Users, Star, ChevronRight, Terminal, BookOpen, Rocket
} from 'lucide-react';

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsExpressApi.getAll();
        const items = response.projects || [];
        setFeaturedProjects(items.slice(0, 6));
      } catch (e) {
        console.error('Error fetching projects:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = [
    { id: 'trending', name: 'Trending in Market', icon: TrendingUp, color: 'from-orange-500 to-red-500', description: 'Hottest projects right now' },
    { id: 'hackathon', name: 'Hackathon Critic', icon: Trophy, color: 'from-purple-500 to-indigo-500', description: 'Impress any judge' },
    { id: 'last-minute', name: 'Last Minute Helpers', icon: Clock, color: 'from-emerald-500 to-teal-500', description: 'Quick builds for deadlines' },
  ];

  const howItWorks = [
    { step: 1, title: 'Browse & Choose', description: 'Find a project that matches your goals. Filter by category, difficulty, or tech stack.', icon: BookOpen },
    { step: 2, title: 'Buy or Build with AI', description: 'Get the complete code instantly, or learn step-by-step with our AI tutor guiding you through milestones.', icon: Sparkles },
    { step: 3, title: 'Ship & Show Off', description: 'Deploy your project, add it to your portfolio, or submit it for your course. You built it, you own it.', icon: Rocket },
  ];

  const badge = (level) => {
    const map = { beginner: 'Silver', intermediate: 'Gold', advanced: 'Diamond' };
    const colors = { beginner: 'text-slate-400', intermediate: 'text-amber-400', advanced: 'text-purple-400' };
    return <span className={`text-xs font-bold ${colors[level] || 'text-slate-400'}`}>{map[level] || level}</span>;
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">
              AI-POWERED LEARNING MARKETPLACE
            </span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6">
            Don't just buy code.
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500">
              Learn to build it.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            BrainBazaar is the marketplace where every project comes with an AI tutor.
            Buy the code, or learn milestone-by-milestone with guided AI assistance.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="group bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95"
            >
              Browse Projects
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="group font-bold text-lg px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 hover:border-blue-500/50 text-slate-700 dark:text-white flex items-center gap-3 transition-all hover:bg-blue-500/5"
            >
              <Code2 size={20} /> Start Selling
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16">
            {[
              { value: '50+', label: 'Projects' },
              { value: '1K+', label: 'Students' },
              { value: '4.8', label: 'Avg Rating', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black flex items-center justify-center gap-1">
                  {stat.icon && <Star size={20} className="text-amber-400" fill="currentColor" />}
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-8 py-20 bg-slate-50/50 dark:bg-white/2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-3">Explore by Category</h2>
            <p className="text-slate-500 dark:text-slate-400">Find the perfect project for your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="group relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center mb-5 text-white shadow-lg`}>
                  <cat.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{cat.description}</p>
                <ChevronRight size={20} className="absolute top-8 right-8 text-slate-300 dark:text-white/10 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black mb-2">Featured Projects</h2>
              <p className="text-slate-500 dark:text-slate-400">Top-rated projects from our sellers</p>
            </div>
            <Link to="/catalog" className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  className="group p-6 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.techStack || []).slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-bold uppercase tracking-wide">{tag}</span>
                      ))}
                    </div>
                    {badge(project.badge || 'silver')}
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">{project.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {project.isOnSale && project.originalPrice ? (
                        <>₹{project.price} <span className="text-xs line-through text-slate-400 font-normal">₹{project.originalPrice}</span></>
                      ) : project.price ? `₹${project.price}` : 'Free'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Zap size={12} /> Build with AI
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <Terminal size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No projects yet.</p>
              <p className="text-sm">Be the first to <Link to="/auth" className="text-blue-500 underline">upload a project</Link>!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 py-20 bg-slate-50/50 dark:bg-white/2">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400">Three simple steps to mastery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-blue-500/25">
                  <item.icon size={28} />
                </div>
                <div className="text-xs font-bold text-blue-500 mb-2 tracking-widest">STEP {item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">
            Ready to build something{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500">amazing</span>?
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
            Join thousands of students and builders already using BrainBazaar.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95"
          >
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
