import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePaymentStore from '../store/usePaymentStore';
import { Lock, Unlock, PlayCircle, Loader2, Sparkles, ExternalLink, Download, ChevronLeft, ChevronRight, Star, Eye, ShoppingCart } from 'lucide-react';
import { projectsApi } from '../api/fastapi';
import { projectsExpressApi } from '../api/express';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCheckoutModalOpen, orders } = usePaymentStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectsExpressApi.getById(id);
        setProject(data.project || data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const images = project.screenshots?.length > 0 ? project.screenshots : (project.thumbnail?.secure_url ? [project.thumbnail.secure_url] : []);
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIdx((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [project]);

  // Check if project is unlocked (purchased or free)
  const isUnlocked = useMemo(() => {
    if (!user || !project) return false;

    // Check if project is free
    if (!project.price || project.price === 0) return true;

    // Check if user has purchased this project
    return orders.some(order =>
      order.project?._id === id || order.project?.id === id
    );
  }, [user, orders, id, project]);

  const handleEnterLab = async () => {
    // Navigate to Lab directly with the project ID in the URL path
    navigate(`/lab/${id}`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await projectsExpressApi.download(project._id || id);
      
      // Axios returns Blob for 'blob' response type
      if (response && response.type === 'application/json') {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        } else if (data.message) {
          toast.error(data.message);
        }
      } else if (response) {
        // It's a binary stream (ZIP file)
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${project.title ? project.title.replace(/\s+/g, '-') : 'project'}-source.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Download started!');
      }
    } catch (err) {
      console.error("Download failed:", err);
      toast.error('Error downloading project files. Ensure you have purchased it.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Project Not Found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error || "The project you're looking for doesn't exist."}
        </p>
        <button
          onClick={() => navigate('/catalog')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  const projectImages = project?.screenshots?.length > 0 
    ? project.screenshots 
    : (project?.thumbnail?.secure_url || project?.image ? [project.thumbnail?.secure_url || project.image] : []);

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-transparent">
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-1/2 relative aspect-video bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center overflow-hidden shadow-xl shadow-indigo-500/5 group">
          {projectImages.length > 0 ? (
            <>
              <img
                src={projectImages[currentImageIdx]}
                alt={`${project.title} - ${currentImageIdx + 1}`}
                className="w-full h-full object-contain p-4 transition-opacity duration-500"
              />
              
              {/* Carousel Controls */}
              {projectImages.length > 1 && (
                <>
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
                    {projectImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-indigo-500 w-4' : 'bg-slate-400/50 hover:bg-slate-400'}`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentImageIdx((prev) => (prev - 1 + projectImages.length) % projectImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIdx((prev) => (prev + 1) % projectImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 text-slate-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </>
          ) : (
            <Sparkles className="text-indigo-500/30" size={64} />
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              project.level === 'Beginner' || project.badge === 'silver' ? 'bg-slate-500/10 text-slate-500' :
              project.level === 'Intermediate' || project.badge === 'gold' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-indigo-500/10 text-indigo-500'
            }`}>
              {project.badge ? project.badge.charAt(0).toUpperCase() + project.badge.slice(1) : project.level}
            </span>
            {project.isOnSale && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                On Sale
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-slate-900 dark:text-white">{project.title}</h1>
          
          {/* Social Proof */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2.5 py-1 rounded-lg">
              <Star size={16} className="fill-current" />
              <span>{project.rating || '4.8'} ({project.reviews?.length || 24})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={16} />
              <span>{project.views || 102} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingCart size={16} />
              <span>{project.purchases || 15} purchases</span>
            </div>
          </div>
          
          {project.seller && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">by</span>
              <Link 
                to={`/seller/${project.seller._id}/profile`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-400 transition-colors flex items-center gap-2 group"
              >
                {project.seller.avatar ? (
                  <img src={project.seller.avatar} alt={project.seller.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-500/30" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{project.seller.name.charAt(0)}</span>
                  </div>
                )}
                <span className="group-hover:underline">{project.seller.name}</span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Creator</span>
              </Link>
            </div>
          )}

          <p className="text-lg text-slate-600 dark:text-slate-400">
            {project.description || project.summary}
          </p>

          <div className="flex flex-wrap gap-2">
            {(project.techStack || project.technology || []).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm rounded-full font-semibold font-body shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Price</span>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 mt-1">
                {project.isOnSale ? (
                  <div className="flex items-center gap-3">
                    <span>₹{project.price}</span>
                    <span className="text-xl text-slate-400 line-through font-medium">₹{project.originalPrice}</span>
                  </div>
                ) : (
                  `₹${project.price}`
                )}
              </div>
            </div>

            {isUnlocked ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleEnterLab}
                  className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-7 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 btn-press"
                >
                  <PlayCircle size={20} />
                  Enter Lab
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/10 btn-press"
                >
                  {downloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  Download ZIP
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/auth');
                  } else {
                    setCheckoutModalOpen(true, project);
                  }
                }}
                className="bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3 px-7 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 btn-press"
              >
                <Lock size={20} />
                {user ? "Unlock Full Access" : "Login to Start"}
              </button>
            )}
          </div>

          {project.youtube && (
            <a
              href={project.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 font-medium"
            >
              <ExternalLink size={16} />
              Watch Project Demo
            </a>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-headline mb-2 text-slate-900 dark:text-white flex items-center gap-3">
          {isUnlocked ? <Unlock className="text-emerald-500" size={28} /> : <Lock className="text-slate-400" size={28} />}
          Learning Path
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-body">{project.milestones?.length || 0} milestone{(project.milestones?.length || 0) !== 1 ? 's' : ''} to completion</p>
        <div className="space-y-3 relative">
          {/* Timeline vertical line */}
          <div className="absolute left-[23px] top-10 bottom-4 w-0.5 bg-slate-200 dark:bg-white/10" />
          {(project.milestones || []).map((milestone, idx) => (
            <div
              key={idx}
              className={`p-5 pl-16 rounded-2xl border relative card-hover ${
                isUnlocked || idx === 0
                  ? 'glass-card'
                  : 'bg-slate-50/50 dark:bg-white/2 border-slate-200 dark:border-white/5 opacity-60'
              }`}
            >
              <div className={`absolute left-3 top-5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                idx === 0 ? 'bg-linear-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{milestone.title || milestone.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{milestone.description}</p>
                {milestone.steps && milestone.steps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {milestone.steps.slice(0, 3).map((step, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-xs rounded-md font-medium"
                      >
                        Step {step.stepNumber}: {step.title?.substring(0, 30)}...
                      </span>
                    ))}
                    {milestone.steps.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">
                        +{milestone.steps.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You'll Learn */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-headline mb-2 text-slate-900 dark:text-white">What You'll Learn</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-body">Technologies and skills you'll gain</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(project.techStack || project.technology || []).map((tech, idx) => (
            <div
              key={idx}
              className="glass-card p-4 rounded-xl flex items-center gap-4 card-hover group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 group-hover:from-indigo-500/30 group-hover:to-cyan-500/30 transition-all">
                <Sparkles className="text-indigo-500" size={18} />
              </div>
              <span className="font-semibold font-body text-slate-800 dark:text-slate-200">{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
