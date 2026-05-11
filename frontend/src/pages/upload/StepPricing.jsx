import React, { useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, Plus, Upload, X } from 'lucide-react';
import { getBadgeFromPrice, getPriceError, PRICE_TIERS, TECH_OPTIONS } from './constants';
import { projectsExpressApi } from '../../api/express';

export default function StepPricing({ projectData, setProjectData, techInput, setTechInput, addTech, removeTech }) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showCustomTech, setShowCustomTech] = useState(false);
  const fileInputRef = useRef(null);

  const priceError = getPriceError(projectData.price);
  const currentTier = getBadgeFromPrice(projectData.price);
  const images = projectData.uploadedImages || [];

  const handlePriceChange = (value) => {
    const price = parseInt(value, 10) || 0;
    setProjectData((prev) => ({ ...prev, price, badge: getBadgeFromPrice(price) }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const oversized = files.filter((file) => file.size > 5242880);
    if (oversized.length > 0) {
      alert('Images must be smaller than 5MB each.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxTotal = 5 - images.length;
    if (files.length > maxTotal) {
      alert(`You can upload up to ${maxTotal} more images.`);
      return;
    }

    setUploadingImages(true);
    try {
      const response = await projectsExpressApi.uploadImages(files);
      if (response.success) {
        setProjectData((prev) => ({
          ...prev,
          uploadedImages: [...(prev.uploadedImages || []), ...response.images],
          thumbnailUrl: prev.thumbnailUrl || response.images[0]?.secure_url || '',
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setProjectData((prev) => {
      const updated = [...(prev.uploadedImages || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        uploadedImages: updated,
        thumbnailUrl: updated[0]?.secure_url || '',
      };
    });
  };

  const toggleTech = (tech) => {
    if (projectData.techStack.includes(tech)) removeTech(tech);
    else setProjectData((prev) => ({ ...prev, techStack: [...prev.techStack, tech] }));
  };

  return (
    <div className="animate-fadeIn space-y-8 text-[#1C1A17]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4840A]">Course packaging</p>
        <h2 className="mt-2 font-headline text-3xl font-semibold">Set pricing and details</h2>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Pricing strategy</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Object.entries(PRICE_TIERS).map(([key, tier]) => (
            <div
              key={key}
              className={`rounded-2xl border-2 p-4 text-center transition-all ${
                currentTier === key
                  ? 'border-[#1E3A2F] bg-[#E8F2EC] shadow-lg shadow-[#1E3A2F]/10'
                  : 'border-[#E2DDD4] bg-white opacity-70'
              }`}
            >
              <div className="font-headline text-xl font-semibold text-[#1E3A2F]">{tier.label}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#5C5851]">Course tier</div>
              <div className="mt-2 text-xs font-bold text-[#D4840A]">Rs {tier.min}-{tier.max}</div>
            </div>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#9B9589]">Rs</span>
          <input
            type="number"
            value={projectData.price}
            onChange={(event) => handlePriceChange(event.target.value)}
            className={`w-full rounded-xl border bg-[#F6F4EF] p-4 pl-12 font-headline text-3xl font-semibold transition-all focus:outline-none ${
              priceError ? 'border-[#C0392B] focus:ring-4 focus:ring-[#C0392B]/10' : 'border-[#E2DDD4] focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10'
            }`}
          />
        </div>
        {priceError && (
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#C0392B]"><AlertCircle size={15} /> {priceError}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Build source link</label>
        <input
          required
          value={projectData.downloadLink}
          onChange={(event) => setProjectData((prev) => ({ ...prev, downloadLink: event.target.value }))}
          placeholder="GitHub repository URL or Google Drive link"
          className="w-full rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 text-sm font-semibold focus:border-[#1E3A2F] focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">
          Gallery <span className="font-medium normal-case">(up to 5 images, first is thumbnail)</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {images.map((image, index) => (
            <div key={`${image.secure_url}-${index}`} className="group relative h-28 w-28 overflow-hidden rounded-2xl border border-[#E2DDD4]">
              <img src={image.secure_url} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-lg bg-[#1E3A2F] px-2 py-1 text-[9px] font-bold tracking-widest text-white">COVER</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#C0392B] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E2DDD4] text-[#9B9589] transition-all hover:border-[#1E3A2F] hover:bg-[#E8F2EC] hover:text-[#1E3A2F]"
            >
              {uploadingImages ? <Loader2 size={24} className="animate-spin" /> : <><Upload size={20} /><span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Add</span></>}
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Tech stack tags</label>
        <div className="flex flex-wrap gap-2">
          {TECH_OPTIONS.map((tech) => {
            const isSelected = projectData.techStack.includes(tech);
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTech(tech)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'scale-105 bg-[#1E3A2F] text-white shadow-lg shadow-[#1E3A2F]/20'
                    : 'bg-[#F0EDE6] text-[#5C5851] hover:bg-[#E8F2EC] hover:text-[#1E3A2F]'
                }`}
              >
                {isSelected && <Check size={12} className="mr-1 inline" />}{tech}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowCustomTech(!showCustomTech)}
            className="rounded-lg border border-dashed border-[#E2DDD4] bg-[#F0EDE6] px-4 py-2 text-xs font-bold text-[#5C5851] transition-all hover:border-[#1E3A2F] hover:text-[#1E3A2F]"
          >
            <Plus size={12} className="mr-1 inline" />Other
          </button>
        </div>
        {showCustomTech && (
          <div className="flex gap-3">
            <input
              value={techInput}
              onChange={(event) => setTechInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTech())}
              placeholder="Enter custom technology..."
              className="flex-1 rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-4 text-sm font-semibold focus:border-[#1E3A2F] focus:outline-none"
            />
            <button type="button" onClick={addTech} className="rounded-xl bg-[#1E3A2F] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#2D5C42]">Add</button>
          </div>
        )}
        {projectData.techStack.filter((tech) => !TECH_OPTIONS.includes(tech)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {projectData.techStack.filter((tech) => !TECH_OPTIONS.includes(tech)).map((tech) => (
              <span key={tech} className="flex items-center gap-2 rounded-lg bg-[#E8F2EC] px-4 py-2 text-xs font-bold text-[#1E3A2F]">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} className="text-[#9B9589] hover:text-[#C0392B]"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
