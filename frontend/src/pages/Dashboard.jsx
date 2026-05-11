import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, CreditCard, Loader2, Package, PlayCircle, Terminal, Trophy, Zap } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';
import usePaymentStore from '../store/usePaymentStore';
import { projectsExpressApi } from '../api/express';

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, fetchMyOrders } = usePaymentStore();
  const { user } = useAuthStore();
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user, fetchMyOrders]);

  const purchasedProjects = orders || [];
  const activeProject = useMemo(() => purchasedProjects.find((purchase) => purchase.project)?.project, [purchasedProjects]);

  const handleStartSandbox = () => {
    useLabStore.getState().startSandbox();
    window.location.href = '/lab';
  };

  const handleDownload = async (projectId, title) => {
    try {
      setDownloadingId(projectId);
      const blob = await projectsExpressApi.download(projectId);
      if (!blob) return;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download project files. Please try again later.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[#F6F4EF] px-6 py-14 text-center">
        <h2 className="font-headline text-3xl font-semibold text-[#1C1A17]">Please sign in to view your learning desk</h2>
        <button onClick={() => navigate('/auth')} className="mt-6 rounded-lg bg-[#1E3A2F] px-6 py-3 font-bold text-white">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 pb-20 pt-10 text-[#1C1A17] sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 rounded-2xl border border-[#E2DDD4] bg-white p-6 shadow-[0_18px_50px_rgba(28,26,23,0.08)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">My learning desk</p>
            <h1 className="mt-3 font-headline text-4xl font-semibold tracking-tight">
              Welcome back, {user.fullName || user.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5C5851]">
              Continue a build course, practice in the lab, or pick the next project that moves your portfolio forward.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => activeProject ? (window.location.href = `/lab/${activeProject._id}`) : navigate('/catalog')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white hover:bg-[#2D5C42]"
              >
                <PlayCircle size={18} />
                {activeProject ? 'Continue current build' : 'Find a build course'}
              </button>
              <button
                onClick={handleStartSandbox}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E3A2F] px-5 py-3 text-sm font-bold text-[#1E3A2F] hover:bg-[#E8F2EC]"
              >
                <Terminal size={18} />
                Open sandbox
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-5">
              <CreditCard className="text-[#1E3A2F]" size={22} />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#5C5851]">AI credits</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-headline text-3xl font-semibold">{user.credits || 0}</p>
                <button onClick={() => navigate('/buy-credits')} className="rounded-lg bg-[#FEF3DC] px-3 py-2 text-xs font-bold text-[#92580A]">
                  Top up
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-5">
              <BookOpen className="text-[#1E3A2F]" size={22} />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#5C5851]">Unlocked builds</p>
              <p className="mt-2 font-headline text-3xl font-semibold">{purchasedProjects.length}</p>
            </div>
            <div className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-5">
              <Trophy className="text-[#1E3A2F]" size={22} />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#5C5851]">Certificates</p>
              <p className="mt-2 font-headline text-3xl font-semibold">{(user.certificates || []).length}</p>
            </div>
          </div>
        </section>

        {activeProject && (
          <section className="rounded-2xl border border-[#E2DDD4] bg-[#1E3A2F] p-6 text-white">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/55">Continue learning</p>
                <h2 className="mt-2 font-headline text-3xl font-semibold">{activeProject.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Resume the lab, complete the next checkpoint, and keep the build moving.
                </p>
              </div>
              <button onClick={() => window.location.href = `/lab/${activeProject._id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#1E3A2F]">
                Open Lab <ChevronRight size={17} />
              </button>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[#E2DDD4] bg-white">
          <div className="flex items-center justify-between border-b border-[#E2DDD4] px-6 py-5">
            <div>
              <h2 className="font-headline text-3xl font-semibold">Your build courses</h2>
              <p className="mt-1 text-sm text-[#5C5851]">{purchasedProjects.length} unlocked course{purchasedProjects.length === 1 ? '' : 's'}</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="hidden rounded-lg border border-[#E2DDD4] px-4 py-2 text-sm font-bold text-[#1E3A2F] hover:bg-[#E8F2EC] sm:inline-flex">
              Browse more
            </button>
          </div>

          {purchasedProjects.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto text-[#9B9589]" size={46} />
              <h3 className="mt-4 font-headline text-2xl font-semibold">No full builds unlocked yet</h3>
              <p className="mt-2 text-[#5C5851]">Start with a free first milestone, then unlock the full course when it clicks.</p>
              <button onClick={() => navigate('/catalog')} className="mt-6 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white">
                Explore build courses
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E2DDD4]">
              {purchasedProjects.map((purchase) => {
                const project = purchase.project;
                if (!project) return null;

                return (
                  <div key={purchase._id} className="flex flex-col gap-4 p-5 transition hover:bg-[#F6F4EF] md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      {project.thumbnail?.secure_url ? (
                        <img src={project.thumbnail.secure_url} alt={project.title} crossOrigin="anonymous" className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#E8F2EC]">
                          <BookOpen className="text-[#1E3A2F]" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-headline text-xl font-semibold">{project.title || 'Unknown build'}</h3>
                        <p className="mt-1 text-xs font-semibold text-[#5C5851]">
                          Unlocked {new Date(purchase.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownload(project._id, project.title || 'project')}
                        disabled={downloadingId === project._id}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E2DDD4] px-4 py-2.5 text-sm font-bold text-[#5C5851] hover:text-[#1C1A17] disabled:opacity-50 md:flex-none"
                      >
                        {downloadingId === project._id ? <Loader2 className="animate-spin" size={17} /> : <Package size={17} />}
                        Source
                      </button>
                      <button
                        onClick={() => window.location.href = `/lab/${project._id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2D5C42] md:flex-none"
                      >
                        Lab <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
