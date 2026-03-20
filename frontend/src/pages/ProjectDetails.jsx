import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePaymentStore from '../store/usePaymentStore';
import { Lock, Unlock, PlayCircle } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCheckoutModalOpen, orders } = usePaymentStore();

  // Mock data fetching based on ID. In a real app, you'd fetch this from the backend.
  const project = {
    _id: id,
    title: "Weather Dashboard API",
    description: "Learn to build a full-stack weather dashboard with real-time data.",
    price: 499,
    image: "https://images.unsplash.com/photo-1504608524841-42ce6c20b00c?w=1000&q=80",
    modules: [
      "Project Setup & Architecture",
      "Express Server & Routing",
      "External API Integration",
      "Frontend Dashboard in React"
    ]
  };

  // Check if project is unlocked
  const isUnlocked = useMemo(() => {
    if (!user) return false;
    // Check if user has purchased this project ID in their model or orders
    return orders.some(o => o.product?._id === id && o.status === 'paid') || user.purchasedProjects?.includes(id);
  }, [user, orders, id]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full md:w-1/2 aspect-video object-cover rounded-2xl shadow-xl"
        />
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-black">{project.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {project.description}
          </p>

          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Price</span>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{project.price}</div>
            </div>

            {isUnlocked ? (
               <button 
                 onClick={() => navigate(`/lab/${project._id}`)}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
               >
                 <PlayCircle size={20} />
                 Enter Lab
               </button>
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
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {isUnlocked ? <Unlock className="text-emerald-500" /> : <Lock className="text-slate-400" />}
          Course Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.modules.map((mod, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${isUnlocked ? 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70'}`}>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <span className="font-medium">{mod}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
