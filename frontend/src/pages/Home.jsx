import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectsExpressApi } from '../api/express';
import {
  Zap, TrendingUp, Trophy, Clock, Star, ChevronRight, Terminal,
  Sparkles, Users, Target, Shield, ArrowRight, Eye, Download,
  Cpu, Globe, Users2, GitBranch, Brain, Activity, Server
} from 'lucide-react';

// Team member data
const teamMembers = [
  { name: 'Daksh Dixit', role: 'Code Editor & Lab Lead', image: 'https://ui-avatars.com/api/?name=Daksh+Dixit&background=5d21df&color=fff&size=200' },
  { name: 'Tanishq Rastogi', role: 'Node.js Backend & Payments', image: 'https://ui-avatars.com/api/?name=Tanishq+Rastogi&background=00e3fd&color=fff&size=200' },
  { name: 'Aayush Kumar', role: 'AI Services & FastAPI', image: 'https://ui-avatars.com/api/?name=Aayush+Kumar&background=8b5cf6&color=fff&size=200' },
  { name: 'Priyanshu Sharma', role: 'Frontend & User Experience', image: 'https://ui-avatars.com/api/?name=Priyanshu+Sharma&background=f59e0b&color=fff&size=200' },
];

// Floating particles for dynamic background
const FloatingParticles = () => {
  const shapes = useMemo(() => [
    { char: '{', size: 40, x: 15, y: 20, delay: 0, duration: 20 },
    { char: '}', size: 35, x: 80, y: 15, delay: 2, duration: 18 },
    { char: '<>', size: 50, x: 70, y: 70, delay: 4, duration: 22 },
    { char: '/>', size: 30, x: 25, y: 80, delay: 1, duration: 16 },
    { char: '()', size: 45, x: 90, y: 45, delay: 3, duration: 24 },
    { char: '[]', size: 38, x: 5, y: 50, delay: 5, duration: 19 },
    { char: '=>', size: 42, x: 50, y: 25, delay: 2, duration: 21 },
    { char: '::', size: 32, x: 60, y: 85, delay: 6, duration: 17 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute font-mono font-bold text-[#5d21df]/8 dark:text-[#5d21df]/10 animate-float"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            fontSize: `${shape.size}px`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
        >
          {shape.char}
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsExpressApi.getAll();
        const items = response.projects || [];
        setFeaturedProjects(items.slice(0, 3));
      } catch (e) {
        console.error('Error fetching projects:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const badge = (level) => {
    const map = { beginner: 'bg-[#948da2]', intermediate: 'bg-[#f59e0b]', advanced: 'bg-[#8b5cf6]' };
    const colors = { beginner: 'bg-[#948da2]', intermediate: 'bg-[#f59e0b]', advanced: 'bg-[#8b5cf6]' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${colors[level] || 'bg-[#948da2]'}`}>{map[level] || level}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[700px] flex flex-col items-center justify-center overflow-hidden px-6 py-32">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient with animated mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5d21df]/5 via-transparent to-[#00e3fd]/5"></div>
          
          {/* Primary glow orb with parallax */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-transform duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(93,33,223,0.15) 0%, transparent 70%)',
              top: '20%',
              left: '30%',
              transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
            }}
          ></div>
          
          {/* Secondary glow orb with opposite parallax */}
          <div 
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px] transition-transform duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(0,227,253,0.12) 0%, transparent 70%)',
              bottom: '10%',
              right: '20%',
              transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
            }}
          ></div>
          
          {/* Accent orb - purple */}
          <div 
            className="absolute w-[300px] h-[300px] rounded-full blur-[80px] transition-transform duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
              top: '60%',
              left: '60%',
              transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * -0.5}px)`,
            }}
          ></div>

          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(93,33,223,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(93,33,223,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              animation: 'gridMove 20s linear infinite',
            }}></div>
          </div>

          {/* Floating code symbols */}
          <FloatingParticles />
        </div>

        {/* Floating geometric elements with parallax */}
        <div 
          className="absolute bottom-20 left-10 hidden lg:block transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}
        >
          <div className="relative">
            <div className="w-40 h-40 border-2 border-[#5d21df]/20 rounded-full"></div>
            <div className="absolute inset-4 border border-[#00e3fd]/15 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
            <div className="absolute inset-8 border border-[#8b5cf6]/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          </div>
        </div>

        <div 
          className="absolute top-32 right-20 hidden lg:block transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
        >
          <div className="w-24 h-24 border border-[#00e3fd]/20 rotate-45 animate-pulse"></div>
        </div>

        <div 
          className="absolute top-1/2 left-20 hidden lg:block transition-transform duration-300"
          style={{ transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * 0.6}px)` }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5d21df]/5 to-[#00e3fd]/5 rounded-lg rotate-12"></div>
        </div>

        <div className="max-w-4xl text-center space-y-8 relative z-10">
          {/* Glass backdrop behind text for readability */}
          <div className="absolute inset-0 -z-10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl"></div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5d21df]/10 dark:bg-[#5d21df]/20 border border-[#5d21df]/30 shadow-lg shadow-[#5d21df]/10">
            <span className="w-2 h-2 rounded-full bg-[#5d21df] animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#5d21df] dark:text-[#a78bfa] font-headline">Intelligence Reimagined</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter leading-[0.9] drop-shadow-lg">
            <span className="text-[#0f0f1a] dark:text-white">Welcome to</span> <br/>
            <span className="bg-gradient-to-r from-[#5d21df] via-[#7c3aed] to-[#00e3fd] bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: '200% auto' }}>
              BrainBazaar
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#3a3a4a] dark:text-[#d4d4d8] max-w-2xl mx-auto font-normal leading-relaxed">
            The premium ecosystem where academic rigor meets frontier AI. Exchange knowledge, collaborate with global peers, and accelerate your learning trajectory.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="px-8 py-4 bg-[#5d21df] hover:bg-[#4c1fbf] text-white rounded-xl font-bold shadow-2xl shadow-[#5d21df]/30 hover:scale-105 hover:shadow-[#5d21df]/40 transition-all"
            >
              Enter Marketplace
            </Link>
            <Link
              to="/lab/demo"
              className="px-8 py-4 bg-white/80 dark:bg-white/10 backdrop-blur-md border-2 border-[#5d21df]/30 dark:border-white/20 rounded-xl font-bold text-[#1a1c1e] dark:text-white hover:bg-white dark:hover:bg-white/20 hover:border-[#5d21df]/50 transition-all shadow-lg"
            >
              Explore Labs
            </Link>
          </div>
        </div>

        {/* Geometric Floating Elements */}
        <div className="absolute bottom-10 left-10 hidden lg:block opacity-40">
          <div className="w-32 h-32 border border-[#5d21df]/30 rounded-full flex items-center justify-center p-4">
            <div className="w-full h-full border border-[#00e3fd]/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Feature Section */}
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] tracking-tight mb-4">Core Ecosystem</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#5d21df] to-[#00e3fd] rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[minmax(180px,auto)]">
          {/* AI Tutor Integration (Large Box) */}
          <div className="md:col-span-2 md:row-span-2 glass-card rounded-xl p-10 flex flex-col justify-between group overflow-hidden relative bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl border border-[#5d21df]/10">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
              <Brain size={120} />
            </div>
            <div>
              <Cpu className="text-[#5d21df] mb-6" size={40} />
              <h3 className="text-3xl font-headline font-bold mb-4 text-[#1a1c1e] dark:text-[#e5e5e5]">AI Tutor Integration</h3>
              <p className="text-[#5a5665] dark:text-[#a3a3a3] font-light leading-relaxed max-w-sm">
                Personalized learning paths driven by neural-link feedback. Your curriculum adapts in real-time to your cognitive strengths and weaknesses.
              </p>
            </div>
            <div className="pt-8">
              <Link to="/lab/demo" className="flex items-center gap-2 text-[#5d21df] font-bold text-sm cursor-pointer group">
                <span>Launch Neural Sandbox</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Global Marketplace */}
          <div className="md:col-span-2 glass-card rounded-xl p-8 flex items-center justify-between group bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl border border-[#5d21df]/10">
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5]">Global Marketplace</h3>
              <p className="text-sm text-[#5a5665] dark:text-[#a3a3a3]">Trade validated research modules & verified datasets.</p>
            </div>
            <Globe className="text-[#00e3fd] group-hover:rotate-12 transition-transform" size={40} />
          </div>

          {/* Peer Collaboration */}
          <div className="glass-card rounded-xl p-8 flex flex-col justify-center gap-4 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl border border-[#5d21df]/10">
            <div className="w-12 h-12 bg-[#f1eefb] dark:bg-[#5d21df]/10 rounded-lg flex items-center justify-center">
              <Users2 className="text-[#5d21df]" size={24} />
            </div>
            <h3 className="text-lg font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5]">Peer Hub</h3>
            <p className="text-xs text-[#5a5665] dark:text-[#a3a3a3] font-medium">Real-time collaborative workspaces.</p>
          </div>

          {/* Milestone Tracking */}
          <div className="glass-card rounded-xl p-8 flex flex-col justify-center gap-4 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl border border-[#5d21df]/10">
            <div className="w-12 h-12 bg-[#00e3fd]/10 rounded-lg flex items-center justify-center">
              <Target className="text-[#006874]" size={24} />
            </div>
            <h3 className="text-lg font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5]">Milestones</h3>
            <p className="text-xs text-[#5a5665] dark:text-[#a3a3a3] font-medium">Blockchain-verified academic credentials.</p>
          </div>
        </div>
      </section>

      {/* Marketplace Section - Matching Landing Page Theme */}
      <section className="py-20 px-6 md:px-8 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] tracking-tight">Featured Projects</h2>
              <p className="text-[#5a5665] dark:text-[#a3a3a3] font-light">Discover premium academic modules with AI-powered learning paths</p>
            </div>
            <Link to="/catalog" className="flex items-center gap-2 text-[#5d21df] dark:text-[#cdbdff] font-bold hover:gap-3 transition-all group">
              View All Projects
              <ArrowRight size={16} className="group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-[#f3f4f9] dark:bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => {
                const badgeLevel = project.badge || 'beginner';
                const badgeConfig = {
                  beginner: { color: 'bg-[#948da2]', label: 'Silver', border: 'border-[#948da2]' },
                  intermediate: { color: 'bg-[#f59e0b]', label: 'Gold', border: 'border-[#f59e0b]' },
                  advanced: { color: 'bg-[#8b5cf6]', label: 'Diamond', border: 'border-[#8b5cf6]' },
                };
                const badge = badgeConfig[badgeLevel] || badgeConfig.beginner;

                return (
                  <Link
                    key={project._id}
                    to={`/project/${project._id}`}
                    className="group p-6 rounded-2xl bg-[#f8f9fc] dark:bg-[#0a0a0a] border border-[#e2e0e7] dark:border-white/10 hover:border-[#5d21df]/50 dark:hover:border-[#5d21df]/30 transition-all hover:-translate-y-1.5 hover:shadow-2xl"
                  >
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1.5 ${badge.color} text-white text-[10px] font-bold uppercase tracking-widest rounded-full`}>
                        {badge.label}
                      </span>
                      {(project.techStack?.length > 0) && (
                        <span className="text-[10px] font-bold text-[#5d21df] dark:text-[#cdbdff] uppercase">
                          {project.techStack[0]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] mb-2 group-hover:text-[#5d21df] dark:group-hover:text-[#cdbdff] transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[#5a5665] dark:text-[#a3a3a3] leading-relaxed line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Tech Stack Tags */}
                    {(project.techStack?.length > 1) && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(1, 4).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#f1eefb] dark:bg-[#5d21df]/10 text-[#5d21df] dark:text-[#cdbdff] text-[10px] rounded-md font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-4 border-t border-[#e2e0e7]/30 dark:border-white/10">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#5d21df] text-white text-xs font-bold rounded-lg group-hover:bg-[#6b3eea] transition-all">
                        Explore Project
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-[#5a5665] dark:text-[#a3a3a3]">
              <Terminal size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No projects yet.</p>
              <p className="text-sm">Be the first to <Link to="/auth" className="text-[#5d21df] underline">upload a project</Link>!</p>
            </div>
          )}
        </div>
      </section>

      {/* AI Lab Engine Section */}
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded bg-[#00e3fd]/10 border border-[#00e3fd]/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#006874] font-headline">Internal Interface</span>
            </div>
            <h2 className="text-5xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] leading-tight">
              The AI Lab Engine: <br/>
              <span className="text-[#5d21df]">Cognitive Synthesis</span>
            </h2>
            <p className="text-[#5a5665] dark:text-[#a3a3a3] text-lg font-light leading-relaxed">
              Our reimagined laboratory interface allows you to monitor neural training in high-fidelity. Fine-tune your models with a suite of sophisticated light-themed diagnostic tools.
            </p>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#5a5665] dark:text-[#a3a3a3]">
                  <span>Synaptic Connectivity</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-[#e7e0eb] dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[88%] bg-gradient-to-r from-[#5d21df] to-[#00e3fd] shadow-[0_0_10px_rgba(93,33,223,0.3)]"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#5a5665] dark:text-[#a3a3a3]">
                  <span>Data Ingestion Speed</span>
                  <span>1.2 PB/s</span>
                </div>
                <div className="h-1.5 w-full bg-[#e7e0eb] dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-[#00e3fd] shadow-[0_0_10px_rgba(0,227,253,0.3)]"></div>
                </div>
              </div>
            </div>
            <Link
              to="/lab/demo"
              className="flex items-center gap-3 px-6 py-3 border-2 border-[#5d21df] text-[#5d21df] dark:text-[#cdbdff] font-bold rounded-xl hover:bg-[#5d21df] hover:text-white dark:hover:bg-[#5d21df] transition-all"
            >
              <Activity size={20} />
              <span>Initialize Lab Instance</span>
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#5d21df]/10 to-[#00e3fd]/10 rounded-2xl blur-2xl -z-10 group-hover:from-[#5d21df]/20 group-hover:to-[#00e3fd]/20 transition-all duration-700"></div>
            <div className="glass-card rounded-2xl p-4 shadow-2xl border-white/50 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-xl">
              {/* Simulated Lab Interface UI */}
              <div className="bg-[#ffffff] dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-inner p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#e2e0e7]/30 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#5a5665] dark:text-[#a3a3a3]">INSTANCE_ID: BB_AI_LAB_092</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#f3f4f9] dark:bg-white/5 rounded-lg p-4 border border-[#e2e0e7]/20 dark:border-white/10">
                    <span className="text-[10px] font-bold text-[#5a5665] dark:text-[#a3a3a3] block mb-2 uppercase">Mean Loss</span>
                    <span className="text-2xl font-headline font-bold text-[#5d21df]">0.0032</span>
                  </div>
                  <div className="bg-[#f3f4f9] dark:bg-white/5 rounded-lg p-4 border border-[#e2e0e7]/20 dark:border-white/10">
                    <span className="text-[10px] font-bold text-[#5a5665] dark:text-[#a3a3a3] block mb-2 uppercase">Epochs</span>
                    <span className="text-2xl font-headline font-bold text-[#006874]">1,400</span>
                  </div>
                </div>
                <div className="h-32 bg-[#f3f4f9] dark:bg-white/5 rounded-lg p-2 flex items-end gap-1 overflow-hidden">
                  {/* Minimal CSS Chart */}
                  {[30, 45, 35, 60, 55, 80, 75, 95, 90].map((height, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t-sm ${idx === 8 ? 'bg-[#00e3fd]' : 'bg-[#5d21df]/80'}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team: The Architects */}
      <section className="py-20 px-6 md:px-8 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-headline font-bold text-[#1a1c1e] dark:text-[#e5e5e5] tracking-tight uppercase">The Architects</h2>
            <p className="text-[#5a5665] dark:text-[#a3a3a3] font-light max-w-xl mx-auto">The visionary team crafting the interface between human potential and machine intelligence.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center space-y-4 group">
                <div className="w-32 h-32 mx-auto relative">
                  <div className="absolute inset-0 bg-[#5d21df]/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
                  <img
                    alt={member.name}
                    src={member.image}
                    className="w-full h-full rounded-full object-cover relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg text-[#1a1c1e] dark:text-[#e5e5e5]">{member.name}</h4>
                  <p className="text-[10px] font-bold uppercase text-[#5d21df] tracking-widest">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-8 pb-40">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-[#5d21df] via-[#6b3eea] to-[#7c52e8] overflow-hidden text-center">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00e3fd]/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-white mb-6">
                Ready to build something amazing?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
                Join thousands of students and builders already using BrainBazaar to learn and ship projects.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-3 bg-white text-[#5d21df] hover:bg-white/90 font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
