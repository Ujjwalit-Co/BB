import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/express';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateDesigner from './CertificateDesigner';

export default function CreatorCertTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await adminApi.getCreatorCertTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      toast.error('Failed to load creator certificate templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tier, formData) => {
    const titleObj = templates.find(t => t.tier === tier);
    try {
      const response = await adminApi.updateCreatorCertTemplate(tier, {
        ...formData,
        title: titleObj?.title || `Tier ${tier} Creator`
      });
      if (response.success) {
        toast.success(`Tier ${tier} template updated`);
        setTemplates(prev => prev.map(t => t.tier === tier ? response.template : t));
      }
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleTitleChange = (tier, newTitle) => {
    setTemplates(prev => prev.map(t => t.tier === tier ? { ...t, title: newTitle } : t));
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#1E3A2F]" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-2xl font-semibold text-[#1C1A17]">Creator Milestone Certificates</h2>
        <p className="mt-1 text-sm text-[#5C5851]">Design the certificates automatically issued when a seller publishes 5, 15, 30, or 50 projects.</p>
      </div>

      {templates.map(template => (
        <div key={template.tier} className="bg-white rounded-2xl border border-[#E2DDD4] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline text-xl font-semibold text-[#D4840A]">Tier: {template.tier} Published Projects</h3>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#5C5851]">Certificate Title</label>
              <input 
                type="text" 
                value={template.title} 
                onChange={(e) => handleTitleChange(template.tier, e.target.value)}
                placeholder={`e.g. Tier ${template.tier} Creator`}
                className="rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3 py-1.5 text-sm font-semibold outline-none w-64"
              />
            </div>
          </div>
          
          <CertificateDesigner 
            template={template} 
            isCreator={true} 
            onSave={(formData) => handleSave(template.tier, formData)} 
            title="Design & Coordinate Mapping"
          />
        </div>
      ))}
    </div>
  );
}
