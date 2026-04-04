import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Mail, ChevronRight, PackageOpen, Sparkles, ShoppingCart } from 'lucide-react';
import usePaymentStore from '../store/usePaymentStore';

export default function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { setCheckoutModalOpen } = usePaymentStore();
  const [seller, setSeller] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${baseUrl}/projects/seller/${sellerId}/profile`);
        const data = await response.json();

        if (data.success) {
          setSeller(data.seller);
          setProjects(data.projects);
        } else {
          setError(data.message || 'Failed to load seller profile');
        }
      } catch (err) {
        console.error("Error fetching seller profile:", err);
        setError('Network error while loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerProfile();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0B]">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0A0A0B]">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-md text-center">
          <h2 className="text-lg font-bold mb-2">Profile Not Found</h2>
          <p className="text-sm opacity-80">{error}</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[#0A0A0B] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2 opacity-50" />
          <span>Creators</span>
          <ChevronRight size={16} className="mx-2 opacity-50" />
          <span className="text-gray-900 dark:text-gray-200">{seller.name}</span>
        </nav>

        {/* Profile Header */}
        <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-200 dark:border-gray-800/60 p-8 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-50 dark:border-[#1A1A1E] shadow-xl shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {seller.name}
                </h1>
                {seller.bio && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                    {seller.bio}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <PackageOpen size={16} className="text-indigo-500" />
                  <span>{projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span>Joined {new Date(seller.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Portfolio
            </h2>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="glass-card rounded-[24px] overflow-hidden card-hover group cursor-pointer flex flex-col h-full relative"
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <div className="h-44 overflow-hidden relative bg-slate-100 dark:bg-slate-800/50 rounded-t-[23px]">
                    {project.thumbnail?.secure_url ? (
                      <img
                        src={project.thumbnail.secure_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500/10 to-cyan-500/10">
                        <Sparkles className="text-indigo-500/30 w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/90 px-3 py-1.5 rounded-full text-sm font-black text-slate-900 dark:text-white backdrop-blur-md shadow-lg border border-white/20">
                      ₹{project.price}
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/60 to-transparent opacity-60" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col font-body">
                    <div className="flex items-center gap-2 mb-3">
                      {project.badge && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          project.badge === 'diamond' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' :
                          project.badge === 'gold' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                          'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                        }`}>
                          {project.badge} UI
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                        {project.category || 'App'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-headline mb-2 text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {(project.techStack || []).slice(0, 2).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[10px] rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {(project.techStack?.length || 0) > 2 && (
                        <span className="px-2 py-1 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[10px] rounded-full font-medium">
                          +{(project.techStack.length || 3) - 2}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckoutModalOpen(true, project);
                      }}
                      className="w-full bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 btn-press mt-auto"
                    >
                      <ShoppingCart size={16} />
                      <span className="text-sm">Buy Project</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800/60 shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center mb-4">
                <PackageOpen size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                This creator hasn't published any projects to their portfolio yet. Check back later!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
