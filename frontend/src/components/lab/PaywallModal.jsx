import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Sparkles, X, Coins, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLabStore from '../../store/useLabStore';
import useAuthStore from '../../store/useAuthStore';

export default function PaywallModal({
  projectName,
  currentMilestoneIndex,
  totalMilestones,
  price,
  messagesUsed,
  messageLimit,
  onContinueTrial,
  isTrialExpired = false,
  isMessageLimit = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { credits } = useLabStore();

  const handleBuyNow = () => {
    // Navigate to checkout with project ID
    navigate(`/checkout/${useLabStore.getState().projectId}`);
  };

  const handleBuyCredits = () => {
    navigate('/buy-credits');
  };

  return (
    <div className="lab-modal-overlay">
      <motion.div
        className="lab-paywall-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="paywall-header">
          <button
            onClick={onContinueTrial}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
            {isTrialExpired || isMessageLimit ? (
              <Lock size={32} />
            ) : (
              <Sparkles size={32} />
            )}
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {isTrialExpired
              ? "Trial Expired"
              : isMessageLimit
              ? "Message Limit Reached"
              : currentMilestoneIndex > 0
              ? "Great Progress! 🎉"
              : "Unlock Full Project"}
          </h2>
        </div>

        <div className="paywall-content space-y-4">
          {isTrialExpired ? (
            <p className="text-center text-slate-600 dark:text-slate-400">
              Your free trial has expired. Purchase full access to continue learning.
            </p>
          ) : isMessageLimit ? (
            <>
              <p className="text-center text-slate-600 dark:text-slate-400">
                You've used <strong>{messagesUsed} of {messageLimit} free messages</strong> for this milestone.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>What happens next?</strong><br/>
                  After your free limit, each message costs <strong>2 credits</strong>. 
                  You currently have <strong>{credits} credits</strong>.
                </p>
              </div>
            </>
          ) : currentMilestoneIndex > 0 ? (
            <>
              <p className="text-center text-slate-600 dark:text-slate-400">
                You've completed <strong>Milestone 1</strong> of {totalMilestones}!
              </p>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Unlock the remaining {totalMilestones - 1} milestones to master {projectName}.
              </p>
            </>
          ) : (
            <p className="text-center text-slate-600 dark:text-slate-400">
              Start your learning journey with full access to all features.
            </p>
          )}

          <div className="paywall-features bg-slate-50 dark:bg-white/5 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">What you'll get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Unlimited access to all {totalMilestones} milestones
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {messageLimit} AI messages per milestone before credits
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Quizzes & completion certificate
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Lifetime access with updates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  20 free credits monthly refresh
                </span>
              </li>
            </ul>
          </div>

          <div className="paywall-price text-center py-4 px-6 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                ₹{price}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              One-time payment • Lifetime access
            </p>
          </div>

          {!isMessageLimit && (
            <div className="paywall-credits text-center py-3 px-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Coins size={16} />
                <span>You have <strong>{credits} credits</strong></span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                20 free credits refresh every 30 days
              </p>
            </div>
          )}
        </div>

        <div className="paywall-actions space-y-3">
          {!isTrialExpired && !isMessageLimit && onContinueTrial && (
            <button
              className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium transition-all"
              onClick={onContinueTrial}
            >
              Continue Free Trial
            </button>
          )}

          {isMessageLimit ? (
            <>
              <button
                className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                onClick={handleBuyNow}
              >
                <ArrowRight size={18} />
                Unlock Project - ₹{price}
              </button>
              <button
                className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                onClick={handleBuyCredits}
              >
                <Coins size={18} />
                Buy Credits
              </button>
            </>
          ) : (
            <button
              className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
              onClick={handleBuyNow}
            >
              <Lock size={18} />
              Unlock Full Access - ₹{price}
            </button>
          )}
        </div>

        <div className="paywall-guarantee text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          <p>🔒 Secure payment • 7-day money-back guarantee</p>
        </div>
      </motion.div>
    </div>
  );
}
