import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { githubApi, projectsExpressApi, purchaseApi } from '../api/express';
import {
  AlertTriangle, CheckCircle2, Clock, Eye, Github, Loader2, MessageSquare,
  Package, Pencil, Plus, Send, Sparkles, Trash2, TrendingUp, XCircle
} from 'lucide-react';

const statusMeta = {
  draft: { label: 'Draft', icon: Clock, className: 'bg-[#F0EDE6] text-[#5C5851]' },
  pending: { label: 'In review', icon: Clock, className: 'bg-[#FEF3DC] text-[#92580A]' },
  approved: { label: 'Live', icon: CheckCircle2, className: 'bg-[#E8F2EC] text-[#1E3A2F]' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-[#FCE8E8] text-[#C0392B]' },
  'needs-changes': { label: 'Needs edits', icon: AlertTriangle, className: 'bg-[#FEF3DC] text-[#92580A]' },
};

export default function SellerPortal() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [sales, setSales] = useState([]);
  const [githubStatus, setGithubStatus] = useState({ connected: false, username: null });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [projectsData, salesData, ghStatus] = await Promise.allSettled([
        projectsExpressApi.getSellerProjects(),
        purchaseApi.getSellerSales(),
        githubApi.getStatus(),
      ]);

      if (projectsData.status === 'fulfilled') setProjects(projectsData.value.projects || []);
      if (salesData.status === 'fulfilled') {
        setSales(salesData.value.sales || []);
        setStats({
          totalRevenue: salesData.value.totalRevenue || 0,
          totalSales: salesData.value.count || 0,
        });
      }
      if (ghStatus.status === 'fulfilled' && ghStatus.value?.success) setGithubStatus(ghStatus.value);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const authToken = token || localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/connect`,
        { headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } }
      );
      const data = await response.json();
      if (data.success) window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting GitHub:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await projectsExpressApi.deleteProject(deleteConfirm._id);
      setProjects((items) => items.filter((project) => project._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusBadge = (status = 'draft') => {
    const meta = statusMeta[status] || statusMeta.draft;
    const Icon = meta.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>
        <Icon size={14} /> {meta.label}
      </span>
    );
  };

  if (!user || user.role !== 'seller') return null;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] text-[#1E3A2F]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const draftCount = projects.filter((project) => project.reviewStatus !== 'approved').length;
  const creatorShare = Number(stats.totalRevenue * 0.8).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 py-12 text-[#1C1A17] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-[#E2DDD4] bg-[#1E3A2F] p-6 text-white shadow-[0_22px_60px_rgba(28,26,23,0.10)] md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white/65">
              <Sparkles size={14} />
              Creator Studio
            </p>
            <h1 className="mt-5 font-headline text-4xl font-semibold leading-tight md:text-5xl">
              Turn your best builds into project courses.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              Shape repositories into milestones, publish a guided journey, and track how learners move through your work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/seller/upload')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D4840A] px-5 py-3 text-sm font-bold text-[#1C1A17] transition hover:brightness-105"
              >
                <Plus size={18} /> New project course
              </button>
              <button
                type="button"
                onClick={() => window.open(`/seller/${user?._id || user?.id}/profile`, '_blank')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Eye size={18} /> View public profile
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E2DDD4] bg-white p-6 shadow-[0_18px_50px_rgba(28,26,23,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B9589]">GitHub status</p>
                <h2 className="mt-2 font-headline text-3xl font-semibold">Repo shelf</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EDE6] text-[#1E3A2F]">
                <Github size={24} />
              </div>
            </div>
            {githubStatus.connected ? (
              <div className="mt-6 rounded-2xl border border-[#E2DDD4] bg-[#E8F2EC] p-4">
                <p className="font-bold text-[#1E3A2F]">Connected as @{githubStatus.username}</p>
                <p className="mt-1 text-sm leading-6 text-[#5C5851]">You can import repositories into the upload wizard.</p>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm leading-6 text-[#5C5851]">Connect GitHub to import repos and let AI draft milestones.</p>
                <button
                  type="button"
                  onClick={handleConnectGitHub}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42]"
                >
                  <Github size={17} /> Connect GitHub
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Project courses', value: projects.length, icon: Package },
            { label: 'Sales', value: stats.totalSales, icon: TrendingUp },
            { label: 'Creator share', value: `Rs ${creatorShare}`, icon: Sparkles },
            { label: 'Needs attention', value: draftCount, icon: AlertTriangle },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#E2DDD4] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#5C5851]">{item.label}</p>
                <item.icon size={20} className="text-[#1E3A2F]" />
              </div>
              <p className="mt-4 font-headline text-3xl font-semibold text-[#1E3A2F]">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#E2DDD4] bg-white shadow-[0_18px_50px_rgba(28,26,23,0.06)]">
          <div className="flex flex-col gap-3 border-b border-[#E2DDD4] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4840A]">Course shelf</p>
              <h2 className="mt-2 font-headline text-3xl font-semibold">Your published and draft builds</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/seller/upload')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E3A2F] px-4 py-3 text-sm font-bold text-[#1E3A2F] transition hover:bg-[#E8F2EC]"
            >
              <Plus size={17} /> Add course
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto text-[#9B9589]" size={46} />
              <h3 className="mt-4 font-headline text-3xl font-semibold">Your first project course is waiting</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5C5851]">
                Import a repo, choose anchor files, and let AI draft the first version of your roadmap.
              </p>
              <button
                type="button"
                onClick={() => navigate('/seller/upload')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42]"
              >
                <Plus size={18} /> Create first course
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E2DDD4]">
              {projects.map((project) => (
                <div key={project._id} className="grid gap-4 p-6 transition hover:bg-[#F6F4EF] lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0EDE6]">
                      {project.thumbnail?.secure_url ? (
                        <img src={project.thumbnail.secure_url} alt={project.title} crossOrigin="anonymous" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="text-[#1E3A2F]/45" size={26} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-headline text-2xl font-semibold text-[#1C1A17]">{project.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5C5851]">
                        {getStatusBadge(project.reviewStatus || 'draft')}
                        <span className="inline-flex items-center gap-1.5"><Eye size={14} /> {project.views || 0} views</span>
                        <span>Rs {project.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['draft', 'needs-changes', 'rejected'].includes(project.reviewStatus) && (
                      <button
                        type="button"
                        onClick={async () => {
                          await projectsExpressApi.submitForReview(project._id);
                          fetchData();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2D5C42]"
                      >
                        <Send size={16} /> {project.reviewStatus === 'draft' ? 'Submit' : 'Resubmit'}
                      </button>
                    )}
                    {['rejected', 'needs-changes'].includes(project.reviewStatus) && project.adminNotes && (
                      <button
                        type="button"
                        onClick={() => setFeedbackModal(project)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#FEF3DC] px-4 py-2.5 text-sm font-bold text-[#92580A]"
                      >
                        <MessageSquare size={16} /> Feedback
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/project/${project._id}`)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E2DDD4] bg-white px-4 py-2.5 text-sm font-bold text-[#5C5851] transition hover:border-[#1E3A2F] hover:text-[#1E3A2F]"
                    >
                      <Eye size={16} /> View
                    </button>
                    {['draft', 'rejected', 'needs-changes'].includes(project.reviewStatus) && (
                      <button
                        type="button"
                        onClick={() => navigate(`/seller/upload?edit=${project._id}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E2DDD4] bg-white px-4 py-2.5 text-sm font-bold text-[#5C5851] transition hover:border-[#1E3A2F] hover:text-[#1E3A2F]"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(project)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#FCE8E8] px-4 py-2.5 text-sm font-bold text-[#C0392B] transition hover:brightness-95"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {sales.length > 0 && (
          <section className="rounded-3xl border border-[#E2DDD4] bg-white p-6">
            <h2 className="font-headline text-3xl font-semibold">Recent learner activity</h2>
            <div className="mt-5 grid gap-3">
              {sales.slice(0, 4).map((sale) => (
                <div key={sale._id} className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 text-sm font-semibold text-[#5C5851]">
                  {sale.buyer?.name || 'A learner'} unlocked {sale.project?.title || 'a project course'}.
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {feedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2DDD4] bg-white p-6 text-[#1C1A17]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4840A]">Review note</p>
                <h2 className="mt-2 font-headline text-3xl font-semibold">Admin feedback</h2>
              </div>
              <button type="button" onClick={() => setFeedbackModal(null)} className="rounded-lg p-2 text-[#5C5851] hover:bg-[#F0EDE6]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 text-sm leading-6 text-[#5C5851]">
              {feedbackModal.adminNotes}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setFeedbackModal(null)} className="rounded-lg px-4 py-2.5 text-sm font-bold text-[#5C5851] hover:bg-[#F0EDE6]">
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/seller/upload?edit=${feedbackModal._id}`);
                  setFeedbackModal(null);
                }}
                className="rounded-lg bg-[#1E3A2F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2D5C42]"
              >
                Edit project
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E2DDD4] bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCE8E8] text-[#C0392B]">
                <Trash2 size={23} />
              </div>
              <div>
                <h2 className="font-headline text-3xl font-semibold">Delete course?</h2>
                <p className="text-sm font-semibold text-[#5C5851]">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#E2DDD4] bg-[#F6F4EF] p-4">
              <p className="font-bold">{deleteConfirm.title}</p>
              <p className="mt-1 text-sm leading-6 text-[#5C5851]">{deleteConfirm.description?.slice(0, 120)}...</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-[#E2DDD4] px-4 py-3 text-sm font-bold text-[#5C5851] hover:bg-[#F0EDE6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-[#C0392B] px-4 py-3 text-sm font-bold text-white hover:brightness-95"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
