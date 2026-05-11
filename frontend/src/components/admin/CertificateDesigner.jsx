import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Loader2, MousePointerClick, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsExpressApi } from '../../api/express';

export default function CertificateDesigner({ 
  template, 
  onSave, 
  title = "Certificate Layout",
  isCreator = false 
}) {
  const [formData, setFormData] = useState({
    backgroundImageUrl: template?.backgroundImageUrl || '',
    namePositionX: template?.namePositionX ?? 50,
    namePositionY: template?.namePositionY ?? 50,
    nameFontSize: template?.nameFontSize ?? 48,
    nameColor: template?.nameColor ?? '#1E3A2F',
    // Creator only
    countPositionX: template?.countPositionX ?? 50,
    countPositionY: template?.countPositionY ?? 65,
    countFontSize: template?.countFontSize ?? 36,
    countColor: template?.countColor ?? '#D4840A',
  });

  const [uploading, setUploading] = useState(false);
  const [activePin, setActivePin] = useState(null); // 'name' or 'count'
  const imageRef = useRef(null);

  // Sync state if template prop changes (e.g. initial load)
  useEffect(() => {
    if (template) {
      setFormData((prev) => ({
        ...prev,
        backgroundImageUrl: template.backgroundImageUrl || '',
        namePositionX: template.namePositionX ?? 50,
        namePositionY: template.namePositionY ?? 50,
        nameFontSize: template.nameFontSize ?? 48,
        nameColor: template.nameColor ?? '#1E3A2F',
        countPositionX: template.countPositionX ?? 50,
        countPositionY: template.countPositionY ?? 65,
        countFontSize: template.countFontSize ?? 36,
        countColor: template.countColor ?? '#D4840A',
      }));
    }
  }, [template]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await projectsExpressApi.uploadImages([file]);
      if (response.success && response.images && response.images.length > 0) {
        setFormData(prev => ({ ...prev, backgroundImageUrl: response.images[0].secure_url }));
        toast.success("Background uploaded!");
      } else {
        toast.error(response.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (e) => {
    if (!activePin || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activePin === 'name') {
      setFormData(prev => ({ ...prev, namePositionX: x, namePositionY: y }));
    } else if (activePin === 'count') {
      setFormData(prev => ({ ...prev, countPositionX: x, countPositionY: y }));
    }
    setActivePin(null);
  };

  const saveChanges = () => {
    onSave(formData);
  };

  return (
    <div className="rounded-xl border border-[#E2DDD4] bg-white p-5">
      <h3 className="font-headline text-lg font-semibold text-[#1E3A2F] mb-4">{title}</h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls Column */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#5C5851] mb-2">
              Background Image
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={formData.backgroundImageUrl} 
                onChange={(e) => setFormData(prev => ({ ...prev, backgroundImageUrl: e.target.value }))}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3 py-2 text-sm outline-none"
              />
              <label className="flex cursor-pointer items-center justify-center rounded-lg bg-[#E8F2EC] px-3 py-2 text-[#1E3A2F] transition hover:bg-[#DDFBE5]">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
              </label>
            </div>
          </div>

          <div className="rounded-lg bg-[#F6F4EF] p-4 border border-[#E2DDD4]">
            <h4 className="text-sm font-bold text-[#1C1A17] mb-3">Recipient Name Setup</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#5C5851] mb-1">Font Size (px)</label>
                <input 
                  type="number" 
                  value={formData.nameFontSize} 
                  onChange={(e) => setFormData(prev => ({ ...prev, nameFontSize: Number(e.target.value) }))}
                  className="w-full rounded-md border border-[#E2DDD4] px-2 py-1 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#5C5851] mb-1">Color (HEX)</label>
                <input 
                  type="text" 
                  value={formData.nameColor} 
                  onChange={(e) => setFormData(prev => ({ ...prev, nameColor: e.target.value }))}
                  className="w-full rounded-md border border-[#E2DDD4] px-2 py-1 text-sm outline-none"
                />
              </div>
            </div>
            <button 
              onClick={() => setActivePin(activePin === 'name' ? null : 'name')}
              className={`flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-bold transition ${activePin === 'name' ? 'bg-[#1E3A2F] text-white' : 'bg-white border border-[#E2DDD4] text-[#1E3A2F]'}`}
            >
              <MousePointerClick size={14} />
              {activePin === 'name' ? 'Click on image to place...' : 'Position Name'}
            </button>
          </div>

          {isCreator && (
            <div className="rounded-lg bg-[#FEF3DC] p-4 border border-[#F0C565]/40">
              <h4 className="text-sm font-bold text-[#92580A] mb-3">Project Count Setup</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#92580A] mb-1">Font Size (px)</label>
                  <input 
                    type="number" 
                    value={formData.countFontSize} 
                    onChange={(e) => setFormData(prev => ({ ...prev, countFontSize: Number(e.target.value) }))}
                    className="w-full rounded-md border border-[#E2DDD4] px-2 py-1 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#92580A] mb-1">Color (HEX)</label>
                  <input 
                    type="text" 
                    value={formData.countColor} 
                    onChange={(e) => setFormData(prev => ({ ...prev, countColor: e.target.value }))}
                    className="w-full rounded-md border border-[#E2DDD4] px-2 py-1 text-sm outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={() => setActivePin(activePin === 'count' ? null : 'count')}
                className={`flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-bold transition ${activePin === 'count' ? 'bg-[#D4840A] text-white' : 'bg-white border border-[#F0C565]/40 text-[#D4840A]'}`}
              >
                <MousePointerClick size={14} />
                {activePin === 'count' ? 'Click on image to place...' : 'Position Count'}
              </button>
            </div>
          )}

          <button 
            onClick={saveChanges}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-4 py-3 text-sm font-bold text-white hover:bg-[#2D5C42]"
          >
            <Save size={16} /> Save Template
          </button>
        </div>

        {/* Preview Column */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#5C5851] w-full mb-2">Live Preview</p>
          <div 
            ref={imageRef}
            onClick={handleImageClick}
            className={`relative w-full aspect-[1.414/1] bg-[#F6F4EF] border-2 overflow-hidden shadow-inner ${activePin ? 'border-dashed border-blue-500 cursor-crosshair' : 'border-[#E2DDD4]'}`}
            style={{
              backgroundImage: formData.backgroundImageUrl ? `url(${formData.backgroundImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!formData.backgroundImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-[#9B9589] text-sm font-semibold">
                No background image
              </div>
            )}
            
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 font-headline font-bold whitespace-nowrap px-1 border border-transparent hover:border-blue-400"
              style={{
                left: `${formData.namePositionX}%`,
                top: `${formData.namePositionY}%`,
                fontSize: `${Math.max(12, formData.nameFontSize * 0.4)}px`, // scale down for preview
                color: formData.nameColor,
              }}
            >
              [Student Name]
            </div>

            {isCreator && (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 font-headline font-bold whitespace-nowrap px-1 border border-transparent hover:border-blue-400"
                style={{
                  left: `${formData.countPositionX}%`,
                  top: `${formData.countPositionY}%`,
                  fontSize: `${Math.max(12, formData.countFontSize * 0.4)}px`, // scale down for preview
                  color: formData.countColor,
                }}
              >
                {template?.tier || 'XX'}
              </div>
            )}
          </div>
          {activePin && (
            <p className="mt-3 text-xs font-semibold text-blue-600">Click anywhere on the preview to place the text.</p>
          )}
        </div>
      </div>
    </div>
  );
}
