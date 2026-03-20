import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard } from 'lucide-react';
import usePaymentStore from '../store/usePaymentStore';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function CheckoutModal() {
  const { checkoutModalOpen, currentProduct, setCheckoutModalOpen, processPayment, isProcessing } = usePaymentStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  if (!checkoutModalOpen || !currentProduct) return null;

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
            <div className="flex gap-4 items-start">
              {currentProduct.thumbnail?.secure_url && (
                <img 
                  src={currentProduct.thumbnail.secure_url} 
                  alt={currentProduct.title} 
                  className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-white/5"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{currentProduct.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {currentProduct.description}
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
          <div className="p-6 pt-0">
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>Pay ₹{currentProduct.price}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
