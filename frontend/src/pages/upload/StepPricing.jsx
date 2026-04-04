import React, { useState, useRef } from 'react';
import { Upload, X, Image, Loader2, Check, Plus, AlertCircle } from 'lucide-react';
import { TECH_OPTIONS, PRICE_TIERS, getBadgeFromPrice, getPriceError } from './constants';
import { projectsExpressApi } from '../../api/express';

export default function StepPricing({ projectData, setProjectData, techInput, setTechInput, addTech, removeTech }) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showCustomTech, setShowCustomTech] = useState(false);
  const fileInputRef = useRef(null);

  const priceError = getPriceError(projectData.price);
  const currentTier = getBadgeFromPrice(projectData.price);

  // Auto-sync badge whenever price changes
  const handlePriceChange = (val) => {
    const price = parseInt(val) || 0;
    setProjectData(prev => ({
      ...prev,
      price,
      badge: getBadgeFromPrice(price),
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const oversized = files.filter(f => f.size > 5242880);
    if (oversized.length > 0) {
      alert("Error: Images must be smaller than 5MB each.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxTotal = 5 - (projectData.uploadedImages || []).length;
    if (files.length > maxTotal) {
      alert(`You can upload up to ${maxTotal} more images (max 5 total).`);
      return;
    }
    setUploadingImages(true);
    try {
      const res = await projectsExpressApi.uploadImages(files);
      if (res.success) {
        setProjectData(prev => ({
          ...prev,
          uploadedImages: [...(prev.uploadedImages || []), ...res.images],
          thumbnailUrl: prev.thumbnailUrl || res.images[0]?.secure_url || '',
        }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    setProjectData(prev => {
      const updated = [...(prev.uploadedImages || [])];
      updated.splice(idx, 1);
      return {
        ...prev,
        uploadedImages: updated,
        thumbnailUrl: updated[0]?.secure_url || '',
      };
    });
  };

  const toggleTech = (tech) => {
    if (projectData.techStack.includes(tech)) {
      removeTech(tech);
    } else {
      setProjectData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech],
      }));
    }
  };

  const images = projectData.uploadedImages || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-2xl font-bold">Set Pricing & Details</h2>

      {/* Price Section */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pricing</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {Object.entries(PRICE_TIERS).map(([key, tier]) => (
            <div key={key} className={`p-3 rounded-xl border-2 text-center transition-all ${
              currentTier === key
                ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10'
                : 'border-slate-200 dark:border-white/10 opacity-50'
            }`}>
              <div className="text-lg mb-0.5">{tier.label.split(' ')[0]}</div>
              <div className="text-xs font-bold">{tier.label.split(' ')[1]}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">₹{tier.min}–₹{tier.max}</div>
            </div>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
          <input
            type="number"
            value={projectData.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={`w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-lg font-bold ${
              priceError ? 'border-red-400 focus:ring-red-500/50' : 'border-slate-200 dark:border-white/10 focus:ring-indigo-500/50'
            }`}
          />
        </div>
        {priceError && (
          <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {priceError}</p>
        )}
      </div>

      {/* Download Link */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Download Link</label>
        <input
          required
          value={projectData.downloadLink}
          onChange={(e) => setProjectData(prev => ({ ...prev, downloadLink: e.target.value }))}
          placeholder="GitHub URL or Google Drive link"
          className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Project Images <span className="font-normal normal-case">(up to 5, max 5MB each, first is thumbnail)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group w-28 h-28 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10">
              <img src={img.secure_url} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded">THUMB</span>
              )}
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all"
            >
              {uploadingImages ? <Loader2 size={24} className="animate-spin" /> : <><Upload size={20} /><span className="text-[10px] mt-1 font-medium">Upload</span></>}
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
      </div>

      {/* Tech Stack Bubbles */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tech Stack</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {TECH_OPTIONS.map(tech => {
            const isSelected = projectData.techStack.includes(tech);
            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-105'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500'
                }`}
              >
                {isSelected && <Check size={12} className="inline mr-1" />}{tech}
              </button>
            );
          })}
          <button
            onClick={() => setShowCustomTech(!showCustomTech)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all border border-dashed border-slate-300 dark:border-white/20"
          >
            <Plus size={12} className="inline mr-1" />Other
          </button>
        </div>
        {showCustomTech && (
          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="Type custom tech..."
              className="flex-1 p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button onClick={addTech} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Add</button>
          </div>
        )}
        {/* Selected custom techs (not in TECH_OPTIONS) */}
        {projectData.techStack.filter(t => !TECH_OPTIONS.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {projectData.techStack.filter(t => !TECH_OPTIONS.includes(t)).map(tech => (
              <span key={tech} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                {tech}
                <button onClick={() => removeTech(tech)} className="hover:text-red-400"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
