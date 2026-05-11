import React, { useRef, useState } from 'react';
import { Download, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function CertificateModal({ isOpen, onClose, certificate }) {
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !certificate) return null;

  // Fallback styling if layout is missing
  const layout = certificate.layout || {
    backgroundImageUrl: '',
    namePositionX: 50,
    namePositionY: 50,
    nameFontSize: 48,
    nameColor: '#1E3A2F',
    countPositionX: 50,
    countPositionY: 65,
    countFontSize: 36,
    countColor: '#D4840A',
  };

  const handleDownload = async (type = 'pdf') => {
    if (!certificateRef.current) return;
    setDownloading(true);

    try {
      // Force high quality render
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
      });

      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `${certificate.title.replace(/\s+/g, '_')}_${certificate.recipientName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // PDF calculation (landscape A4)
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${certificate.title.replace(/\s+/g, '_')}_${certificate.recipientName.replace(/\s+/g, '_')}.pdf`);
      }
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to generate download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08140D]/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-[#F6F4EF] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DDD4] px-6 py-4">
          <div>
            <h2 className="font-headline text-2xl font-semibold text-[#1C1A17]">{certificate.title}</h2>
            <p className="text-sm text-[#5C5851]">Issued to {certificate.recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#5C5851] hover:bg-[#E2DDD4] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Certificate Preview Canvas */}
        <div className="flex-1 overflow-auto bg-[#E8F2EC] p-6 sm:p-10 flex items-center justify-center">
          <div 
            className="relative w-full max-w-[800px] aspect-[1.414/1] bg-white shadow-lg mx-auto overflow-hidden ring-1 ring-black/5"
            ref={certificateRef}
            style={{
              backgroundImage: layout.backgroundImageUrl ? `url(${layout.backgroundImageUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Fallback pattern if no background image */}
            {!layout.backgroundImageUrl && (
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#1E3A2F 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
            )}

            {/* Default text layout if no custom image is provided */}
            {!layout.backgroundImageUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <h1 className="font-headline text-5xl font-bold text-[#1E3A2F] mb-6">{certificate.title}</h1>
                <p className="text-[#5C5851] text-xl mb-4">This certifies that</p>
                <h2 className="font-headline text-4xl font-semibold text-[#D4840A] mb-8">{certificate.recipientName}</h2>
                {certificate.type === 'learner_project_completion' && (
                  <p className="text-[#1C1A17] text-lg max-w-2xl leading-relaxed">
                    has successfully completed the project <br/>
                    <span className="font-bold text-[#1E3A2F]">{certificate.projectTitle}</span>
                  </p>
                )}
                {certificate.type === 'creator_milestone' && (
                  <p className="text-[#1C1A17] text-lg max-w-2xl leading-relaxed">
                    has published <span className="font-bold text-[#1E3A2F]">{certificate.metadata?.projectCount || 0}</span> exceptional projects <br/>on the BrainBazaar platform.
                  </p>
                )}
              </div>
            )}

            {/* Custom Layout Elements (rendered only if there's a background image) */}
            {layout.backgroundImageUrl && (
              <>
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-headline font-bold whitespace-nowrap"
                  style={{
                    left: `${layout.namePositionX}%`,
                    top: `${layout.namePositionY}%`,
                    fontSize: `${layout.nameFontSize}px`,
                    color: layout.nameColor,
                  }}
                >
                  {certificate.recipientName}
                </div>

                {certificate.type === 'creator_milestone' && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 font-headline font-bold whitespace-nowrap"
                    style={{
                      left: `${layout.countPositionX}%`,
                      top: `${layout.countPositionY}%`,
                      fontSize: `${layout.countFontSize}px`,
                      color: layout.countColor,
                    }}
                  >
                    {certificate.metadata?.projectCount || 0}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E2DDD4] px-6 py-4 bg-white">
          <button
            onClick={() => handleDownload('image')}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2DDD4] px-5 py-2.5 text-sm font-bold text-[#1C1A17] hover:bg-[#F6F4EF] disabled:opacity-50 transition-colors"
          >
            {downloading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
            Save as Image
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2D5C42] disabled:opacity-50 shadow-md transition-colors"
          >
            {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Download PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}
