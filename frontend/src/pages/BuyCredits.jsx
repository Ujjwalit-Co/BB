import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, CreditCard, Sparkles, Layout } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';
import { useNavigate } from 'react-router-dom';

const CREDIT_PACKS = [
  {
    id: 'pack1',
    name: 'Starter Spark',
    credits: 100,
    price: 100,
    description: 'Perfect for small fixes and quick AI help.',
    features: ['100 AI Credits', 'Basic AI Guidance', '7-day validity'],
    color: 'blue'
  },
  {
    id: 'pack2',
    name: 'Pro Pulse',
    credits: 500,
    price: 450,
    description: 'The sweet spot for active learners and builders.',
    features: ['500 AI Credits', 'Priority AI Analysis', '30-day validity', '10% Discount included'],
    color: 'purple',
    popular: true
  },
  {
    id: 'pack3',
    name: 'Expert Energy',
    credits: 1200,
    price: 1000,
    description: 'Unleash full potential for complex projects.',
    features: ['1200 AI Credits', 'Advanced Debugging', 'Unlimited validity', 'Best Value (17% Off)'],
    color: 'amber'
  }
];

export default function BuyCredits() {
  const { user, token, getProfile } = useAuthStore();
  const { credits, setCredits } = useLabStore();
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handlePurchase = async (packId) => {
    if (!user) {
      toast.error('Please sign in to buy credits');
      navigate('/auth');
      return;
    }

    setLoading(packId);
    try {
      if (!token) {
        toast.error('Token missing, please login again');
        return;
      }
      
      const { data: orderData } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payments/create-order`, 
        { type: 'credit', packId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: { key } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payments/razorpay-key`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BrainBazaar Credits",
        description: `Purchase ${CREDIT_PACKS.find(p => p.id === packId).name}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payments/verify-payment`, 
              {
                ...response,
                type: 'credit',
                packId
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyData.success) {
              toast.success(`Successfully added credits!`);
              // Refresh full profile to sync all stores
              await getProfile();
              navigate('/lab/demo');
            }
          } catch (err) {
            toast.error("Verification failed");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6"
          >
            <Sparkles size={16} />
            <span>AI LAB CREDITS</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold text-slate-900 dark:text-white mb-6"
          >
            Power up your <span className="text-blue-600">learning journey</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Get instant access to AI-powered debugging, code analysis, and interactive guidance within the BrainBazaar Labs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CREDIT_PACKS.map((pack, idx) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`relative group rounded-3xl p-8 bg-white dark:bg-[#111] border ${
                pack.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-slate-200 dark:border-white/5'
              } transition-all duration-300 hover:scale-[1.02]`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Best Value
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl bg-${pack.color}-500/10 flex items-center justify-center mb-6`}>
                <Zap className={`text-${pack.color}-500`} size={28} fill="currentColor" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pack.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">{pack.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹{pack.price}</span>
                <span className="text-slate-500 text-sm">/ {pack.credits} credits</span>
              </div>

              <div className="space-y-4 mb-10">
                {pack.features.map(feat => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="text-emerald-500" size={12} strokeWidth={3} />
                    </div>
                    {feat}
                  </div>
                ))}
              </div>

              <button
                disabled={loading === pack.id}
                onClick={() => handlePurchase(pack.id)}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  pack.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                } disabled:opacity-50`}
              >
                {loading === pack.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    Purchase Now
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-12">
           <div className="flex items-center gap-3">
              <Shield className="text-blue-500" size={24} />
              <div className="text-left">
                <div className="text-slate-900 dark:text-white font-bold text-sm">Secure Payment</div>
                <div className="text-xs">256-bit SSL encrypted</div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Sparkles className="text-blue-500" size={24} />
              <div className="text-left">
                <div className="text-slate-900 dark:text-white font-bold text-sm">Instant Delivery</div>
                <div className="text-xs">Credits added automatically</div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Layout className="text-blue-500" size={24} />
              <div className="text-left">
                <div className="text-slate-900 dark:text-white font-bold text-sm">Lab Integration</div>
                <div className="text-xs">Syncs with your projects</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
