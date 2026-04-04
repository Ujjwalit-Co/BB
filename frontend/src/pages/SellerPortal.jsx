import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { projectsExpressApi, purchaseApi, githubApi } from '../api/express';
import {
  Package, Plus, Github, DollarSign, Clock, CheckCircle, XCircle,
  AlertTriangle, Eye, Loader2, ExternalLink, LogOut, TrendingUp, MessageSquare
} from 'lucide-react';

export default function SellerPortal() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [sales, setSales] = useState([]);
  const [githubStatus, setGithubStatus] = useState({ connected: false, username: null });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [feedbackModal, setFeedbackModal] = useState(null); // { project }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { project }

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
        githubApi.disconnect().catch(() => null), // just checking status
      ]);

      if (projectsData.status === 'fulfilled') setProjects(projectsData.value.projects || []);
      if (salesData.status === 'fulfilled') {
        setSales(salesData.value.sales || []);
        setStats({
          totalRevenue: salesData.value.totalRevenue || 0,
          totalSales: salesData.value.count || 0,
        });
      }

      // Fetch GitHub status
      try {
        const authToken = token || localStorage.getItem('authToken');
        const status = await fetch(
          `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/status`,
          { headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } }
        );
        const statusData = await status.json();
        if (statusData.success) setGithubStatus(statusData);
      } catch (e) { /* silently fail */ }
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
      if (typeof toast !== 'undefined') {
        toast.success("Project deleted successfully");
      } else {
        alert("Project deleted successfully!");
      }
      setProjects(projects.filter(p => p._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      if (typeof toast !== 'undefined') {
        toast.error(err.response?.data?.message || "Failed to delete project");
      } else {
        alert(err.response?.data?.message || "Failed to delete project");
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-slate-500/10 text-slate-500', icon: Clock, label: 'Draft' },
      pending: { color: 'bg-amber-500/10 text-amber-500', icon: Clock, label: 'Pending Review' },
      approved: { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle, label: 'Published' },
      rejected: { color: 'bg-red-500/10 text-red-500', icon: XCircle, label: 'Rejected' },
      'needs-changes': { color: 'bg-orange-500/10 text-orange-500', icon: AlertTriangle, label: 'Needs Changes' },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        <Icon size={14} /> {badge.label}
      </span>
    );
  };

  if (!user || user.role !== 'seller') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-transparent pt-12 pb-24 px-4 sm:px-8">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-300 mb-2">Creator Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-body">
            Manage your projects and track earnings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/seller/${user?._id || user?.id}/profile`, '_blank')}
            className="flex items-center gap-2 px-4 py-3 glass-card text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/15 btn-press transition-all"
          >
            View Public Profile
          </button>
          <button
            onClick={() => navigate('/seller/upload')}
            className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 btn-press shadow-lg shadow-emerald-500/20"
          >
            <Plus size={20} /> Upload Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Package size={24} /></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Projects</span>
          </div>
          <h3 className="text-3xl font-bold">{projects.length}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><TrendingUp size={24} /></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sales</span>
          </div>
          <h3 className="text-3xl font-bold">{stats.totalSales}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><DollarSign size={24} /></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Revenue (80%)</span>
          </div>
          <h3 className="text-3xl font-bold">₹{Number(stats.totalRevenue * 0.8).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}</h3>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500"><Github size={24} /></div>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">GitHub</span>
          </div>
          {githubStatus.connected ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">Connected</span>
              <span className="text-xs text-slate-500">@{githubStatus.username}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectGitHub}
              className="text-sm font-medium text-indigo-500 hover:text-indigo-400"
            >
              Connect Now →
            </button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-4">You haven't uploaded any projects yet.</p>
            <button
              onClick={() => navigate('/seller/upload')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl inline-flex items-center gap-2"
            >
              <Plus size={18} /> Upload Your First Project
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {projects.map((project) => (
              <div key={project._id} className="p-6 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="text-indigo-500/50" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {getStatusBadge(project.reviewStatus || 'draft')}
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Eye size={14} /> {project.views || 0} views
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        ₹{project.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons — always visible, wraps on small screens */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {['draft', 'needs-changes', 'rejected'].includes(project.reviewStatus) && (
                    <button
                      onClick={async () => {
                        await projectsExpressApi.submitForReview(project._id);
                        fetchData();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {project.reviewStatus === 'draft' ? 'Submit for Review' : 'Resubmit for Review'}
                    </button>
                  )}
                  {['rejected', 'needs-changes'].includes(project.reviewStatus) && project.adminNotes && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setFeedbackModal(project); }}
                      className="relative p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors group flex items-center gap-1.5"
                      title="View Admin Feedback"
                    >
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                      <MessageSquare size={18} />
                      <span className="text-xs font-semibold">Feedback</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  {['draft', 'rejected', 'needs-changes'].includes(project.reviewStatus) && (
                    <button
                      onClick={() => navigate(`/seller/upload?edit=${project._id}`)}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(project);
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    style={{ zIndex: 9999, position: 'relative' }}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-amber-500">
                <AlertTriangle size={20} /> Admin Feedback
              </span>
              <button onClick={() => setFeedbackModal(null)} className="text-slate-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </h2>
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {feedbackModal.adminNotes}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setFeedbackModal(null)}
                className="px-4 py-2 text-slate-500 hover:text-white font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(`/seller/upload?edit=${feedbackModal._id}`);
                  setFeedbackModal(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Edit Project to Fix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                <XCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Delete Project?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4 mb-6">
              <p className="font-semibold">{deleteConfirm.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {deleteConfirm.description?.substring(0, 100)}...
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
