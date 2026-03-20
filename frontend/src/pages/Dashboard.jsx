import React, { useEffect } from 'react';
import usePaymentStore from '../store/usePaymentStore';
import useAuthStore from '../store/useAuthStore';
import { Package, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { orders, fetchMyOrders } = usePaymentStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

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
          <button className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
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
            {purchasedProjects.map((project) => (
              <div key={project._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  {project.thumbnail?.secure_url && (
                    <img src={project.thumbnail.secure_url} alt={project.title} className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-white/5" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{project.title || "Unknown Project"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Purchased on {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/lab/${project._id}`)}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Open Project <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
