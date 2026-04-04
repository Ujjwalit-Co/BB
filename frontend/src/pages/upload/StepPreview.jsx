import React from 'react';
import { Eye, Sparkles, Lock, Unlock, PlayCircle, Download } from 'lucide-react';

export default function StepPreview({ projectData, aiGenerated, readme }) {
  const techStack = projectData.techStack || [];
  const milestones = aiGenerated.milestones || [];
  const summary = aiGenerated.summary || projectData.description || '';
  const thumbnail = projectData.thumbnailUrl || (projectData.uploadedImages && projectData.uploadedImages[0]?.secure_url);

  return (
    <div className="space-y-8 animate-fadeIn max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <Eye className="text-indigo-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold">Project Preview</h2>
          <p className="text-slate-500 text-sm">This is how your project will appear to buyers in the catalog.</p>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-6 bg-slate-50 dark:bg-black/20 pointer-events-none select-none relative">
        {/* Mock Buyer View Banner */}
        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl z-10">
          Buyer View Mockup
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-5/12 aspect-video bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
            {thumbnail ? (
              <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="text-indigo-500/30" size={48} />
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                projectData.badge === 'diamond' ? 'bg-purple-500/10 text-purple-500' :
                projectData.badge === 'gold' ? 'bg-amber-500/10 text-amber-500' :
                'bg-slate-500/10 text-slate-500'
              }`}>
                {projectData.badge || 'Silver'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-indigo-500/10 text-indigo-500">
                {projectData.category || 'Category'}
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight">{projectData.title || 'Untitled Project'}</h1>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {summary || 'No description provided.'}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {techStack.map((tech) => (
                <span key={tech} className="px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs rounded-md font-medium">
                  {tech}
                </span>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{projectData.price || 99}
              </div>
              <div className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 text-sm opacity-50">
                <Lock size={16} /> Unlock Access
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Lock size={18} className="text-slate-400" /> 
            Learning Milestones ({milestones.length})
          </h3>
          <div className="space-y-3">
            {milestones.slice(0, 3).map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] flex gap-3 opacity-80">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{m.title || m.name}</h4>
                  <p className="text-xs text-slate-500">{m.description}</p>
                </div>
              </div>
            ))}
            {milestones.length > 3 && (
              <div className="text-center text-sm font-medium text-slate-500 pt-2">
                + {milestones.length - 3} more milestones
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
