import React, { useEffect, useState } from 'react';
import usePaymentStore from '../store/usePaymentStore';
import { ShoppingCart, Loader2 } from 'lucide-react';
import productService from '../api/product';

export default function Catalog() {
  const { setCheckoutModalOpen } = usePaymentStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await productService.getProducts();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching catalog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black mb-8">Explore Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project._id} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-48 overflow-hidden relative">
                <img src={project.thumbnail?.secure_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                  ₹{project.price}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                  {project.description}
                </p>
                <button 
                  onClick={() => setCheckoutModalOpen(true, project)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <p className="text-slate-500">No projects found in the catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
