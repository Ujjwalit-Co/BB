import React, { useEffect } from 'react';
import usePaymentStore from '../store/usePaymentStore';
import useAuthStore from '../store/useAuthStore';
import { Package, CreditCard, ChevronRight, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsExpressApi } from '../api/express';

export default function Dashboard() {
  const { orders, fetchMyOrders } = usePaymentStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = React.useState(null);

  const handleDownload = async (projectId, title) => {
    try {
      setDownloadingId(projectId);
      const blob = await projectsExpressApi.download(projectId);
      // If blob is null, the API opened a URL redirect in a new tab
      if (!blob) return;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download project files. Please try again later.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user, fetchMyOrders]);

  if (!user) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center mt-20">
        <h2 className="text-2xl font-semibold mb-4">Please log in to view your dashboard</h2>
        <button onClick={() => navigate('/auth')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Log In</button>
      </div>
    );
  }

  const purchasedProjects = orders;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Overview Section */}
      <div>
        <h1 className="text-4xl font-black mb-2">Welcome Back, {user.fullName || user.name}</h1>
        <p className="text-slate-500 dark:text-slate-400">Here's an overview of your account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits Card */}
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <CreditCard size={32} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Available AI Credits</p>
              <h3 className="text-3xl font-bold">{user.credits || 0}</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate('/buy-credits')}
            className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Buy Credits
          </button>
        </div>

        {/* Projects Card */}
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Package size={32} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Purchased Projects</p>
              <h3 className="text-3xl font-bold">{purchasedProjects.length}</h3>
            </div>
          </div>
          <button onClick={() => navigate('/catalog')} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            Browse Catalog
          </button>
        </div>
      </div>

      {/* Purchased Projects List */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold">Your Purchased Projects</h2>
        </div>
        
        {purchasedProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>You haven't purchased any projects yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {purchasedProjects.map((purchase) => {
              const project = purchase.project;
              if (!project) return null; // Defensive check for orphaned purchases
              
              return (
                <div key={purchase._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {project.thumbnail?.secure_url ? (
                      <img src={project.thumbnail.secure_url} alt={project.title} className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-white/5" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <Package className="text-slate-400" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{project.title || "Unknown Project"}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Purchased on {new Date(purchase.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleDownload(project._id, project.title || 'project')}
                      disabled={downloadingId === project._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                      {downloadingId === project._id ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      <span className="hidden sm:inline">Download ZIP</span>
                      <span className="sm:hidden">ZIP</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/lab/${project._id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-500/20"
                    >
                      Open in Lab <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
