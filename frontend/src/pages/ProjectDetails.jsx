import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePaymentStore from '../store/usePaymentStore';
import { Lock, Unlock, PlayCircle, Loader2, Sparkles, ExternalLink, Download } from 'lucide-react';
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

  // Check if project is unlocked
  const isUnlocked = useMemo(() => {
    // TEMPORARY: Always return true for demo/testing
    return true; 
  }, [user, orders, id]);

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

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2 aspect-video bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center overflow-hidden">
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Sparkles className="text-indigo-500/50" size={64} />
          )}
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              project.level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
              project.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {project.level}
            </span>
            {project.isOnSale && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                On Sale
              </span>
            )}
          </div>

          <h1 className="text-4xl font-black">{project.title}</h1>
          
          {project.seller && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Created by</span>
              <Link 
                to={`/seller/${project.seller._id}/profile`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors flex items-center gap-2"
              >
                {project.seller.avatar ? (
                  <img src={project.seller.avatar} alt={project.seller.name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-xs">{project.seller.name.charAt(0)}</span>
                  </div>
                )}
                {project.seller.name}
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
                className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-lg font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Price</span>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {project.isOnSale ? (
                  <div className="flex items-center gap-2">
                    <span>₹{project.price}</span>
                    <span className="text-lg text-slate-400 line-through">₹{project.originalPrice}</span>
                  </div>
                ) : (
                  `₹${project.price}`
                )}
              </div>
            </div>

            {isUnlocked ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEnterLab}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <PlayCircle size={20} />
                  Enter Lab
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {downloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                  Download ZIP
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCheckoutModalOpen(true, project)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Lock size={20} />
                Unlock Full Access
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
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {isUnlocked ? <Unlock className="text-emerald-500" /> : <Lock className="text-slate-400" />}
          Learning Milestones ({project.milestones?.length || 0})
        </h2>
        <div className="space-y-4">
          {(project.milestones || []).map((milestone, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border flex items-start gap-4 ${
                isUnlocked || idx === 0
                  ? 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                idx === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-white/10'
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
        <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(project.techStack || project.technology || []).map((tech, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] flex items-center gap-3"
            >
              <Sparkles className="text-indigo-500" size={20} />
              <span className="font-medium">{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
