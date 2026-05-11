import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Loader2, Sparkles, Upload } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const learnerPerks = ['Start milestone 1 free', 'Track your build journey', 'Use AI help inside labs'];
const creatorPerks = ['Turn GitHub repos into courses', 'Edit AI-generated milestones', 'Earn from real student builds'];

export default function Auth() {
  const navigate = useNavigate();
  const { user, login, register, registerSeller } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'seller' ? '/seller' : '/dashboard');
    }
  }, [user, navigate]);

  const perks = isSeller ? creatorPerks : learnerPerks;

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) result = await login({ email: formData.email, password: formData.password });
      else if (isSeller) result = await registerSeller(formData);
      else result = await register(formData);

      if (result.success) navigate(isSeller ? '/seller' : '/catalog');
      else setError(result.message || 'Authentication failed');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#F6F4EF] px-4 py-6 text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.82fr_1fr] lg:items-center">
        <section className="relative overflow-hidden rounded-2xl border border-[#E2DDD4] bg-[#1E3A2F] p-5 text-white shadow-[0_18px_46px_rgba(28,26,23,0.12)] md:p-6 dark:border-white/10 dark:bg-[#171B16]">
          <div className="absolute right-6 top-6 grid grid-cols-3 gap-1 opacity-20">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} className="h-2 w-2 rounded-full bg-white" />
            ))}
          </div>

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 font-headline text-2xl font-semibold">
              <GraduationCap className="text-[#D4840A]" />
              BrainBazaar
            </Link>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-white/60">
              {isLogin ? 'Welcome back' : isSeller ? 'Creator onboarding' : 'Learner onboarding'}
            </p>
            <h1 className="mt-2 font-headline text-3xl font-semibold leading-tight">
              {isLogin ? 'Continue your build streak.' : isSeller ? 'Give your project a second life.' : 'Start building like the seniors did.'}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/72">
              {isLogin
                ? 'Jump back into your milestones, AI credits, and unlocked build courses.'
                : isSeller
                  ? 'Upload a repository, shape it into milestones, and publish a learning journey.'
                  : 'Learn with real projects, free first milestones, checkpoints, and AI guidance.'}
            </p>

            <div className="mt-5 grid gap-2">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3 rounded-xl bg-white/8 p-2.5">
                  <CheckCircle2 size={18} className="text-[#2A9D6F]" />
                  <span className="text-sm font-bold">{perk}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Courses', value: '20+' },
                { label: 'Preview', value: 'Free' },
                { label: 'AI help', value: '10 msg' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-3 text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
                  <p className="font-headline text-xl font-semibold text-[#1E3A2F] dark:text-[#9DE6B8]">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#5C5851]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_14px_36px_rgba(28,26,23,0.07)] md:p-6 dark:border-white/10 dark:bg-[#171B16]">
          <div className="mb-5 flex rounded-xl bg-[#F0EDE6] p-1 dark:bg-[#10130F]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${isLogin ? 'bg-white text-[#1E3A2F] shadow-sm dark:bg-[#26352B] dark:text-[#DDEBDD]' : 'text-[#5C5851] dark:text-[#B8C2B1]'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${!isLogin ? 'bg-white text-[#1E3A2F] shadow-sm dark:bg-[#26352B] dark:text-[#DDEBDD]' : 'text-[#5C5851] dark:text-[#B8C2B1]'}`}
            >
              Create account
            </button>
          </div>

          {!isLogin && (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSeller(false)}
                className={`rounded-xl border p-3 text-left transition ${!isSeller ? 'border-[#1E3A2F] bg-[#E8F2EC] dark:border-[#7FC79C] dark:bg-[#223426]' : 'border-[#E2DDD4] bg-white dark:border-white/10 dark:bg-[#10130F]'}`}
              >
                <BookOpen size={21} className="text-[#1E3A2F]" />
                <p className="mt-3 font-bold">Learner</p>
                <p className="mt-1 text-xs leading-5 text-[#5C5851]">Build projects step by step.</p>
              </button>
              <button
                type="button"
                onClick={() => setIsSeller(true)}
                className={`rounded-xl border p-3 text-left transition ${isSeller ? 'border-[#D4840A] bg-[#FEF3DC] dark:border-[#F0C565] dark:bg-[#3A2A12]' : 'border-[#E2DDD4] bg-white dark:border-white/10 dark:bg-[#10130F]'}`}
              >
                <Upload size={21} className="text-[#D4840A]" />
                <p className="mt-3 font-bold">Creator</p>
                <p className="mt-1 text-xs leading-5 text-[#5C5851]">Publish project courses.</p>
              </button>
            </div>
          )}

          <div className="mb-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#FEF3DC] px-3 py-1 text-xs font-bold text-[#92580A] dark:bg-[#3A2A12] dark:text-[#FFD98A]">
              <Sparkles size={14} />
              {isLogin ? 'Your learning desk is waiting' : isSeller ? 'Creator Studio access' : 'Milestone 1 starts free'}
            </p>
            <h2 className="mt-3 font-headline text-2xl font-semibold">
              {isLogin ? 'Sign in to BrainBazaar' : isSeller ? 'Create creator account' : 'Create learner account'}
            </h2>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-[#C0392B]/20 bg-[#FCE8E8] p-4 text-sm font-semibold text-[#C0392B]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5C5851]">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1.5 h-10 w-full rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3 text-sm font-semibold outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F]"
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[#5C5851]">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1.5 h-10 w-full rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3 text-sm font-semibold outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[#5C5851]">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3 text-sm font-semibold outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F]"
                placeholder="At least 6 characters"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(30,58,47,0.18)] transition hover:bg-[#2D5C42] disabled:opacity-60 dark:bg-[#F0C565] dark:text-[#10130F] dark:hover:bg-[#FFD98A]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {isLogin ? 'Enter my learning desk' : isSeller ? 'Open Creator Studio' : 'Start learning'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
