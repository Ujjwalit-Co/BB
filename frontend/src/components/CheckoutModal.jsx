import React from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Lock, PlayCircle, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePaymentStore from '../store/usePaymentStore';

export default function CheckoutModal() {
  const { checkoutModalOpen, currentProduct, setCheckoutModalOpen, processPayment, isProcessing } = usePaymentStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!checkoutModalOpen || !currentProduct) return null;

  const projectId = currentProduct._id || currentProduct.id;
  const price = Number(currentProduct.price || 0);
  const milestoneCount = currentProduct.milestones?.length || currentProduct.milestoneCount || 4;

  const handleDemoBypass = () => {
    setCheckoutModalOpen(false);
    navigate(`/project/${projectId}`);
  };

  const handleCheckout = () => {
    if (!user) {
      setCheckoutModalOpen(false);
      navigate('/auth');
      return;
    }

    processPayment(currentProduct, user, () => {
      setCheckoutModalOpen(false);
      navigate('/dashboard');
    });
  };

  return (
    <AnimatePresence>
      <Motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1A17]/60 p-3 backdrop-blur-sm dark:bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#E2DDD4] bg-[#F6F4EF] shadow-2xl dark:border-white/10 dark:bg-[#171B16]"
          initial={{ scale: 0.97, y: 14 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.97, y: 14 }}
        >
          <div className="flex items-center justify-between border-b border-[#E2DDD4] bg-white px-5 py-4 dark:border-white/10 dark:bg-[#121711]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4840A] dark:text-[#F0C565]">Full build unlock</p>
              <h2 className="mt-1 font-headline text-2xl font-semibold text-[#1C1A17] dark:text-[#F7F2E8]">Complete your access</h2>
            </div>
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="rounded-full p-2 text-[#5C5851] hover:bg-[#F0EDE6] hover:text-[#1C1A17] dark:text-[#B8C2B1] dark:hover:bg-white/10 dark:hover:text-[#F7F2E8]"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <div className="p-5">
              <div className="rounded-2xl bg-[#1E3A2F] p-5 text-white dark:bg-[#172319]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#1E3A2F] dark:bg-[#C8F7D4] dark:text-[#08140D]">
                    <Lock size={21} />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-semibold">{currentProduct.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/74">
                      {currentProduct.description || currentProduct.summary || 'Unlock all milestones, AI-guided learning, and source access.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Milestones', value: milestoneCount },
                  { label: 'AI messages', value: '20/task' },
                  { label: 'Access', value: 'Forever' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#E2DDD4] bg-white p-3 dark:border-white/10 dark:bg-[#10130F]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9589] dark:text-[#8F9A8A]">{item.label}</p>
                    <p className="mt-1 font-headline text-lg font-semibold text-[#1E3A2F] dark:text-[#9DE6B8]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E2DDD4] bg-white p-5 md:border-l md:border-t-0 dark:border-white/10 dark:bg-[#121711]">
              <div className="rounded-xl border border-[#E2DDD4] bg-[#F9F7F2] p-4 dark:border-white/10 dark:bg-[#10130F]">
                <div className="flex justify-between text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">
                  <span>Build course access</span>
                  <span>Rs {price}</span>
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-[#E2DDD4] pt-3 dark:border-white/10">
                  <span className="font-bold">Total</span>
                  <span className="font-headline text-3xl font-semibold text-[#1E3A2F] dark:text-[#9DE6B8]">Rs {price}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {['All milestones unlocked', 'Source access after purchase', 'Checkpoint-led progress'].map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">
                    <CheckCircle2 size={17} className="text-[#2A9D6F]" /> {item}
                  </p>
                ))}
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,58,47,0.18)] hover:bg-[#2D5C42] disabled:opacity-50 dark:!bg-[#C8F7D4] dark:!text-[#08140D] dark:hover:!bg-[#DDFBE5]"
                  type="button"
                >
                  {isProcessing ? 'Processing...' : <><CreditCard size={18} /> Pay Rs {price}</>}
                </button>
                <button
                  onClick={handleDemoBypass}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2DDD4] bg-white px-5 py-3 text-sm font-bold text-[#1E3A2F] hover:bg-[#F0EDE6] dark:border-white/10 dark:bg-[#171B16] dark:text-[#DDEBDD] dark:hover:bg-white/10"
                  type="button"
                >
                  <PlayCircle size={18} />
                  Preview course page
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#5C5851] dark:text-[#B8C2B1]">
                <ShieldCheck size={16} className="text-[#2A9D6F]" />
                Payments are secured by Razorpay
              </div>
            </div>
          </div>
        </motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}
