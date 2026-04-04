import React, { useEffect } from 'react';
import usePaymentStore from '../store/usePaymentStore';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';
import { Package, CreditCard, ChevronRight, Download, Loader2, Terminal, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectsExpressApi } from '../api/express';

export default function Dashboard() {
  const { orders, fetchMyOrders } = usePaymentStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = React.useState(null);

  const handleStartSandbox = () => {
    useLabStore.getState().startSandbox();
    navigate('/lab');
  };

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
    <div className="min-h-screen bg-slate-50/30 dark:bg-transparent pt-12 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-700 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 mb-2">
          Hey, {user.fullName || user.name} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-body">Welcome back to your learning hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Credits Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between card-hover">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-linear-to-br from-indigo-500/20 to-indigo-500/5 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <CreditCard size={32} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">AI Credits</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">{user.credits || 0}</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate('/buy-credits')}
            className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-bold btn-press shadow-lg shadow-indigo-500/20"
          >
            Buy Credits
          </button>
        </div>

        {/* Projects Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between card-hover">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-linear-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Package size={32} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Projects</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">{purchasedProjects.length}</h3>
            </div>
          </div>
          <button onClick={() => navigate('/catalog')} className="px-5 py-2.5 bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold btn-press transition-all">
            Browse More
          </button>
        </div>

        {/* Sandbox Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between card-hover md:col-span-2 bg-linear-to-r from-slate-900 to-indigo-900 border-none text-white shadow-xl shadow-indigo-900/20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Terminal size={32} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Essential Practice</p>
              <h3 className="text-2xl font-black">AI Sandbox Lab</h3>
            </div>
          </div>
          <button 
            onClick={handleStartSandbox}
            className="px-6 py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold shadow-lg shadow-white/10 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
          >
            Start Coding <Zap size={16} className="text-amber-500" />
          </button>
        </div>
      </div>

      {/* Purchased Projects List */}
      <div className="glass-card border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline text-slate-900 dark:text-white">Your Projects</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-body">{purchasedProjects.length} item{purchasedProjects.length !== 1 ? 's' : ''}</span>
        </div>
        
        {purchasedProjects.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-body font-medium mb-4">You haven't purchased any projects yet.</p>
            <button onClick={() => navigate('/catalog')} className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-bold text-sm btn-press shadow-lg shadow-indigo-500/20">Browse Catalog</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {purchasedProjects.map((purchase) => {
              const project = purchase.project;
              if (!project) return null;
              
              return (
                <div key={purchase._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-white/3 transition-colors group">
                  <div className="flex items-center gap-4">
                    {project.thumbnail?.secure_url ? (
                      <img src={project.thumbnail.secure_url} alt={project.title} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500/10 to-cyan-500/10 flex items-center justify-center border border-slate-200 dark:border-white/10">
                        <Package className="text-indigo-400" size={22} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold font-headline text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{project.title || 'Unknown Project'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-body mt-0.5">Purchased on {new Date(purchase.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
                    <button 
                      onClick={() => handleDownload(project._id, project.title || 'project')}
                      disabled={downloadingId === project._id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/8 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 rounded-xl font-semibold btn-press border border-slate-200 dark:border-white/10 disabled:opacity-50"
                    >
                      {downloadingId === project._id ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
                      <span className="hidden sm:inline text-sm">Download ZIP</span>
                      <span className="sm:hidden text-sm">ZIP</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/lab/${project._id}`)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold btn-press shadow-sm shadow-indigo-500/20 text-sm"
                    >
                      Open Lab <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
