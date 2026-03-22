import React from 'react';
import { motion } from 'framer-motion';
import { Coins, X, Check, ArrowRight } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function UnlockConfirmationModal() {
  const { confirmationModalOpen, setConfirmationModalOpen, pendingUnlock, confirmUnlock, credits } = useLabStore();

  if (!confirmationModalOpen || !pendingUnlock) return null;

  return (
    <div className="lab-modal-overlay">
      <motion.div 
        className="lab-confirm-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Coins size={24} />
          </div>
          <button 
            onClick={() => setConfirmationModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold mb-2">Unlock Milestone</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Would you like to unlock this milestone for <span className="font-bold text-slate-900 dark:text-white">50 credits</span>?
          <br />
          <span className="text-sm mt-2 block">You have <span className="text-indigo-600 font-bold">{credits} credits</span> available.</span>
        </p>

        <div className="space-y-3">
          <button 
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            onClick={confirmUnlock}
          >
            <Check size={18} />
            Confirm Unlock
          </button>
          
          <button 
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium transition-all"
            onClick={() => setConfirmationModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
