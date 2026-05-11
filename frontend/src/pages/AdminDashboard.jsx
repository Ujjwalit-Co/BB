import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { adminApi } from '../api/express';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Clock, Eye,
  Users, Package, TrendingUp, DollarSign, Loader2, ChevronDown, Edit3, Award
} from 'lucide-react';
import AdminQuizDialog from '../components/admin/AdminQuizDialog';
import CertificateDesigner from '../components/admin/CertificateDesigner';
import CreatorCertTemplates from '../components/admin/CreatorCertTemplates';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pendingProjects, setPendingProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedPublishedProject, setExpandedPublishedProject] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [adminCategories, setAdminCategories] = useState({});
  const [certificateDrafts, setCertificateDrafts] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [editingQuizProject, setEditingQuizProject] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [pendingData, allData, statsData] = await Promise.allSettled([
        adminApi.getPendingProjects(),
        adminApi.getAllProjects(),
        adminApi.getStats(),
      ]);

      if (pendingData.status === 'fulfilled') setPendingProjects(pendingData.value.projects || []);
      if (allData.status === 'fulfilled') setAllProjects(allData.value.projects || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value.stats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateDraft = (project) => certificateDrafts[project._id] || project.certificateTemplate || {
    enabled: true,
    name: 'BrainBazaar Builder Certificate',
    headline: 'Certified Project Builder',
    body: "This certifies that {{studentName}} completed {{projectTitle}} through BrainBazaar's milestone-based project course.",
    issuerName: 'BrainBazaar',
    accentColor: '#1E3A2F',
  };

  const updateCertificateDraft = (project, patch) => {
    setCertificateDrafts((prev) => ({
      ...prev,
      [project._id]: { ...getCertificateDraft(project), ...patch },
    }));
  };

  const saveCertificateTemplate = async (project) => {
    setActionLoading(`cert-${project._id}`);
    try {
      await adminApi.updateCertificateTemplate(project._id, getCertificateDraft(project));
      await fetchData();
    } catch (error) {
      console.error('Error saving certificate template:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (projectId, action) => {
    setActionLoading(projectId);
    try {
      const notes = adminNotes[projectId] || '';
      const category = adminCategories[projectId];
      
      if (action === 'approve') {
        if (category && category !== 'all') {
          await projectsExpressApi.updateProject(projectId, { category });
        }
        await adminApi.approveProject(projectId);
      }
      else if (action === 'decline') await adminApi.declineProject(projectId, notes);
      else if (action === 'request-changes') await adminApi.requestChanges(projectId, notes);

      await fetchData();
      setExpandedProject(null);
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

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
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 rounded-xl"><Shield size={28} className="text-indigo-500" /></div>
        <div>
          <h1 className="text-4xl font-black">Admin Panel</h1>
          <p className="text-slate-500 dark:text-slate-400">Review projects and monitor platform health</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo' },
            { label: 'Published Projects', value: stats.publishedProjects, icon: Package, color: 'emerald' },
            { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'amber' },
            { label: 'Platform Revenue', value: stats.platformRevenue ? `₹${Number(stats.platformRevenue).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}` : '₹0', icon: DollarSign, color: 'purple' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={18} className={`text-${stat.color}-500`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</span>
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Pending Reviews */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="text-amber-500" size={22} />
            Pending Reviews ({pendingProjects.length})
          </h2>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/50" />
            <p>All caught up! No projects pending review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {pendingProjects.map(project => (
              <div key={project._id} className="transition-colors">
                <div
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                  onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="text-indigo-500/50" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>by {project.seller?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          project.badge === 'diamond' ? 'bg-purple-500/10 text-purple-500' :
                          project.badge === 'gold' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>{project.badge}</span>
                        <span>•</span>
                        <span>₹{project.price}</span>
                        <span>•</span>
                        <span>{project.milestones?.length || 0} milestones</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedProject === project._id ? 'rotate-180' : ''}`} />
                </div>

                {expandedProject === project._id && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                      <h4 className="font-medium mb-2">Tech Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack?.map(tech => (
                          <span key={tech} className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-xs rounded-md font-medium">{tech}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-400 font-medium">
                          <Eye size={16} /> View on GitHub →
                        </a>
                      )}
                      
                      <button 
                         onClick={() => setEditingQuizProject(project)}
                         className="inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 font-medium"
                      >
                         <Edit3 size={16} /> Inspect &amp; Edit Quizzes
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Set Category</label>
                        <select
                          value={adminCategories[project._id] || project.category || 'all'}
                          onChange={(e) => setAdminCategories(prev => ({ ...prev, [project._id]: e.target.value }))}
                          className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        >
                          <option value="all">General (All)</option>
                          <option value="trending">🔥 Trending in Market</option>
                          <option value="hackathon">🏆 Hackathon Critic</option>
                          <option value="last-minute">⚡ Last Minute Helpers</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Admin Notes</label>
                        <textarea
                          value={adminNotes[project._id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({ ...prev, [project._id]: e.target.value }))}
                          placeholder="Add feedback or notes for the seller..."
                          rows={3}
                          className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={18} className="text-indigo-500" />
                        <label className="block text-sm font-bold uppercase tracking-widest text-indigo-500">Completion Certificate</label>
                      </div>
                      <div className="grid gap-3">
                        <input
                          value={getCertificateDraft(project).headline || ''}
                          onChange={(e) => updateCertificateDraft(project, { headline: e.target.value })}
                          placeholder="Certified Project Builder"
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-3 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                        />
                        <CertificateDesigner
                          template={getCertificateDraft(project)}
                          onSave={async (formData) => {
                            updateCertificateDraft(project, formData);
                            // Wait for state to update before saving to API
                            setTimeout(() => saveCertificateTemplate(project), 100);
                          }}
                          title="Learner Certificate Layout"
                          isCreator={false}
                        />
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          Issued automatically when a learner completes all milestones.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(project._id, 'approve')}
                        disabled={actionLoading === project._id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle size={18} /> Approve & Publish
                      </button>
                      <button
                        onClick={() => handleAction(project._id, 'request-changes')}
                        disabled={actionLoading === project._id}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <AlertTriangle size={18} /> Request Changes
                      </button>
                      <button
                        onClick={() => handleAction(project._id, 'decline')}
                        disabled={actionLoading === project._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <XCircle size={18} /> Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Projects */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="text-emerald-500" size={22} />
            Published Projects ({allProjects.filter(p => p.reviewStatus === 'approved').length})
          </h2>
        </div>

        {allProjects.filter(p => p.reviewStatus === 'approved').length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500/50" />
            <p>No published projects yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {allProjects.filter(p => p.reviewStatus === 'approved').map(project => (
              <div key={project._id} className="transition-colors">
                <div
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                  onClick={() => setExpandedPublishedProject(expandedPublishedProject === project._id ? null : project._id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-linear-to-br from-emerald-500/10 to-teal-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="text-emerald-500/50" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <span>by {project.seller?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          project.badge === 'diamond' ? 'bg-purple-500/10 text-purple-500' :
                          project.badge === 'gold' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>{project.badge}</span>
                        <span>•</span>
                        <span>₹{project.price}</span>
                        <span>•</span>
                        <span>{project.milestones?.length || 0} milestones</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedPublishedProject === project._id ? 'rotate-180' : ''}`} />
                </div>

                {expandedPublishedProject === project._id && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="flex items-center gap-4 py-2">
                      <button 
                         onClick={() => setEditingQuizProject(project)}
                         className="inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-400 font-medium"
                      >
                         <Edit3 size={16} /> Inspect &amp; Edit Quizzes
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={18} className="text-indigo-500" />
                        <label className="block text-sm font-bold uppercase tracking-widest text-indigo-500">Completion Certificate</label>
                      </div>
                      <div className="grid gap-3">
                        <input
                          value={getCertificateDraft(project).headline || ''}
                          onChange={(e) => updateCertificateDraft(project, { headline: e.target.value })}
                          placeholder="Certified Project Builder"
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-3 text-sm font-bold focus:border-indigo-500 focus:outline-none"
                        />
                        <CertificateDesigner
                          template={getCertificateDraft(project)}
                          onSave={async (formData) => {
                            updateCertificateDraft(project, formData);
                            setTimeout(() => saveCertificateTemplate(project), 100);
                          }}
                          title="Learner Certificate Layout"
                          isCreator={false}
                        />
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          Issued automatically when a learner completes all milestones.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl pt-8">
        <CreatorCertTemplates />
      </div>

      {/* Render the generic project list as before (if needed) ... */}

      {editingQuizProject && (
        <AdminQuizDialog 
          project={editingQuizProject}
          onClose={() => setEditingQuizProject(null)}
          onSave={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
