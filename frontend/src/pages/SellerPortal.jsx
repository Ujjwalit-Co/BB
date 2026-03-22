import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { projectsExpressApi, purchaseApi, githubApi } from '../api/express';
import {
  Package, Plus, Github, DollarSign, Clock, CheckCircle, XCircle,
  AlertTriangle, Eye, Loader2, ExternalLink, LogOut, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerPortal() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [sales, setSales] = useState([]);
  const [githubStatus, setGithubStatus] = useState({ connected: false, username: null });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [editingProject, setEditingProject] = useState(null);

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
        const status = await fetch(
          `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/status`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
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
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/connect`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const data = await response.json();
      if (data.success) window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting GitHub:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await projectsExpressApi.updateProject(editingProject._id, {
        title: editingProject.title,
        description: editingProject.description,
        price: editingProject.price,
        badge: editingProject.badge,
        category: editingProject.category,
        thumbnail: { secure_url: editingProject.thumbnail?.secure_url || '' }
      });
      setEditingProject(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update project", error);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2">Seller Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your projects and track sales
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.open(`/seller/${user?._id || user?.id}/profile`, '_blank')}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            View Public Profile
          </button>
          <button
            onClick={() => navigate('/seller/upload')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
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
          <h3 className="text-3xl font-bold">₹{Math.round(stats.totalRevenue * 0.8)}</h3>
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
                  {project.reviewStatus === 'rejected' && project.adminNotes && (
                    <span className="text-xs text-red-400 max-w-[200px] truncate" title={project.adminNotes}>
                      Note: {project.adminNotes}
                    </span>
                  )}
                  {project.reviewStatus === 'needs-changes' && project.adminNotes && (
                    <span className="text-xs text-orange-400 max-w-[200px] truncate" title={project.adminNotes}>
                      Note: {project.adminNotes}
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  {['draft', 'rejected', 'needs-changes'].includes(project.reviewStatus) && (
                    <button
                      onClick={() => setEditingProject(project)}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        try {
                          await projectsExpressApi.deleteProject(project._id);
                          toast.success("Project deleted successfully");
                          fetchData();
                        } catch (err) {
                          toast.error(err.response?.data?.message || err.message || "Failed to delete project");
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Edit Project Details
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProject.price}
                    onChange={(e) => setEditingProject({ ...editingProject, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail Image URL</label>
                  <input
                    value={editingProject.thumbnail?.secure_url || ''}
                    onChange={(e) => setEditingProject({ 
                      ...editingProject, 
                      thumbnail: { secure_url: e.target.value } 
                    })}
                    placeholder="https://imgur.com/... (Optional)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">All</option>
                    <option value="trending">🔥 Trending in Market</option>
                    <option value="hackathon">🏆 Hackathon Critic</option>
                    <option value="last-minute">⚡ Last Minute Helpers</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Badge Tier</label>
                <select
                  value={editingProject.badge}
                  onChange={(e) => setEditingProject({ ...editingProject, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="silver">🥈 Silver (₹99-₹299)</option>
                  <option value="gold">🥇 Gold (₹499-₹999)</option>
                  <option value="diamond">💎 Diamond (₹1499-₹3999)</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 italic">
                Note: Updating code files requires deleting and re-uploading the project.
              </p>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
