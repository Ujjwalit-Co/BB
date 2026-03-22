import React from 'react';
import { motion } from 'framer-motion';
import { Coins, X, ArrowRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLabStore from '../../store/useLabStore';

export default function CreditModal() {
  const { creditModalOpen, toggleCreditModal, requiredCredits, credits } = useLabStore();
  const navigate = useNavigate();

  if (!creditModalOpen) return null;

  const handleBuyCredits = () => {
    toggleCreditModal(false);
    navigate('/buy-credits');
  };

  return (
    <div className="lab-modal-overlay">
      <motion.div 
        className="lab-confirm-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins size={24} />
          </div>
          <button 
            onClick={() => toggleCreditModal(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold mb-2">Insufficient Credits</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You need <span className="font-bold text-slate-900 dark:text-white">{requiredCredits} credits</span> to unlock this milestone. 
          You currently have <span className="font-bold text-amber-600">{credits} credits</span>.
        </p>

        <div className="space-y-3">
          <button 
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            onClick={handleBuyCredits}
          >
            <ShoppingCart size={18} />
            Buy Credit Packs
            <ArrowRight size={16} />
          </button>
          
          <button 
            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium transition-all"
            onClick={() => toggleCreditModal(false)}
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
