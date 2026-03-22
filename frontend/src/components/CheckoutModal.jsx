import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Zap } from 'lucide-react';
import usePaymentStore from '../store/usePaymentStore';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function CheckoutModal() {
  const { checkoutModalOpen, currentProduct, setCheckoutModalOpen, processPayment, isProcessing } = usePaymentStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  if (!checkoutModalOpen || !currentProduct) return null;

  const handleDemoBypass = () => {
    // DEMO MODE: Skip payment and go to project details
    setCheckoutModalOpen(false);
    navigate(`/project/${currentProduct.id}`);
  };

  const handleCheckout = () => {
    if (!user) {
      setCheckoutModalOpen(false);
      navigate('/auth');
      return;
    }

    processPayment(currentProduct, user, (result) => {
      // Refresh user data if needed here, or navigate to dashboard
      alert("Payment Successful! Head to your dashboard.");
      navigate('/dashboard');
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="text-indigo-500" />
              Secure Checkout
            </h2>
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* DEMO MODE BANNER */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
              <Zap className="text-indigo-500 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-sm text-indigo-500">DEMO MODE</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Payment gateway not connected yet. Click "Skip & Continue to Project" to test the Lab and AI features.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              {currentProduct.image && (
                <img
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-white/5"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{currentProduct.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {currentProduct.summary}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Price</span>
                <span className="font-medium">₹{currentProduct.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg text-indigo-500">₹{currentProduct.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center">
              <ShieldCheck size={16} className="text-emerald-500" />
              Payments are secure and encrypted via Razorpay
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 space-y-3">
            {/* DEMO BYPASS BUTTON */}
            <button
              onClick={handleDemoBypass}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Zap size={18} />
              Skip & Continue to Project
            </button>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₹{currentProduct.price}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
