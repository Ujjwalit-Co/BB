import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, CreditCard, Shield, Sparkles, Zap } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';

const CREDIT_PACKS = [
  {
    id: 'pack1',
    name: 'Starter Spark',
    credits: 100,
    price: 100,
    note: 'For quick hints, bug checks, and small milestone pushes.',
    features: ['100 AI messages worth of help', 'Great for free milestones', 'Instant balance update'],
  },
  {
    id: 'pack2',
    name: 'Builder Boost',
    credits: 500,
    price: 450,
    note: 'For active learners working through multiple build courses.',
    features: ['500 AI credits', 'Best for weekly building', 'Includes bonus value'],
    popular: true,
  },
  {
    id: 'pack3',
    name: 'Project Sprint',
    credits: 1200,
    price: 1000,
    note: 'For deep debugging, advanced projects, and serious portfolio work.',
    features: ['1200 AI credits', 'Best value pack', 'Useful across all courses'],
  },
];

export default function BuyCredits() {
  const { user, getProfile } = useAuthStore();
  const { setCredits } = useLabStore();
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
      const { creditsApi } = await import('../api/express');
      const responseData = await creditsApi.createCreditOrder(packId);
      const orderData = responseData.order || responseData;
      const pack = CREDIT_PACKS.find((item) => item.id === packId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BrainBazaar',
        description: `Purchase ${pack?.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const result = await creditsApi.verifyCreditPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              packId,
            });

            if (result?.success) {
              toast.success(result.message || 'Credits added');
              setCredits(result.balance);
              await getProfile();
              if (sessionStorage.getItem('pendingProjectId')) window.location.href = '/lab';
            }
          } catch (verifyError) {
            console.error('Payment Verification Failed', verifyError);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || 'BrainBazaar learner',
          email: user?.email || 'learner@example.com',
        },
        theme: { color: '#1E3A2F' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => toast.error(response.error.description));
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to initiate purchase');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 py-10 text-[#1C1A17]">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-8 rounded-3xl border border-[#E2DDD4] bg-white p-6 shadow-[0_20px_60px_rgba(28,26,23,0.08)] md:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-[#1E3A2F] p-8 text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70">
              <Zap size={14} fill="currentColor" />
              AI credits
            </p>
            <h1 className="mt-5 font-headline text-4xl font-semibold leading-tight">
              Keep your build momentum when you get stuck.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Credits power extra AI help after your included milestone messages run out.
              Use them for hints, debugging, explanations, and sandbox questions.
            </p>
            <div className="mt-8 grid gap-3">
              {['1 user message = 1 tracked AI request', 'Credits work across build courses', 'Balance updates after payment'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/8 p-3">
                  <Check size={17} className="text-[#2A9D6F]" />
                  <span className="text-sm font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative flex flex-col rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(28,26,23,0.10)] ${
                  pack.popular ? 'border-[#D4840A] bg-[#FEF3DC]' : 'border-[#E2DDD4] bg-[#F6F4EF]'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-5 rounded-full bg-[#D4840A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1C1A17]">
                    Popular
                  </span>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1E3A2F]">
                  <Sparkles size={22} />
                </div>
                <h3 className="mt-5 font-headline text-2xl font-semibold">{pack.name}</h3>
                <p className="mt-2 min-h-20 text-sm leading-6 text-[#5C5851]">{pack.note}</p>

                <div className="mt-5">
                  <p className="font-headline text-3xl font-semibold text-[#1E3A2F]">Rs {pack.price}</p>
                  <p className="text-sm font-bold text-[#5C5851]">{pack.credits} credits</p>
                </div>

                <div className="mt-6 space-y-3">
                  {pack.features.map((feature) => (
                    <p key={feature} className="flex items-start gap-2 text-sm font-semibold text-[#5C5851]">
                      <Check size={15} className="mt-0.5 text-[#2A9D6F]" /> {feature}
                    </p>
                  ))}
                </div>

                <button
                  disabled={loading === pack.id}
                  onClick={() => handlePurchase(pack.id)}
                  className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                    pack.popular ? 'bg-[#D4840A] text-[#1C1A17] hover:brightness-105' : 'bg-[#1E3A2F] text-white hover:bg-[#2D5C42]'
                  }`}
                >
                  {loading === pack.id ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <CreditCard size={17} />}
                  Buy credits
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Shield, title: 'Secure payment', copy: 'Razorpay handles payment details securely.' },
            { icon: Sparkles, title: 'Instant delivery', copy: 'Credits are added to your account after verification.' },
            { icon: Zap, title: 'Lab-ready', copy: 'Use credits for project help and sandbox questions.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#E2DDD4] bg-white p-5">
              <item.icon className="text-[#1E3A2F]" size={22} />
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#5C5851]">{item.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
