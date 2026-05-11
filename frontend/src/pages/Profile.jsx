import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Coins,
  GraduationCap,
  Mail,
  PenLine,
  Shield,
  Sparkles,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import CertificateModal from '../components/CertificateModal';
import { AnimatePresence } from 'framer-motion';

const roleConfig = {
  admin: {
    icon: Shield,
    label: 'Admin',
    headline: 'Marketplace steward',
    copy: 'Review submissions, keep quality high, and shape the learning shelves.',
  },
  seller: {
    icon: Store,
    label: 'Creator',
    headline: 'Project-course creator',
    copy: 'Turn real builds into milestone-led courses that help juniors become independent.',
  },
  user: {
    icon: GraduationCap,
    label: 'Learner',
    headline: 'Independent builder',
    copy: 'Track your courses, credits, and the next project that will stretch your skills.',
  },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData({
      name: user?.name || user?.fullName || '',
      bio: user?.bio || '',
    });
  }, [user?.name, user?.fullName, user?.bio]);

  const normalizedRole = user?.role === 'learner' ? 'user' : user?.role;
  const meta = roleConfig[normalizedRole] || {
    icon: UserRound,
    label: 'Member',
    headline: 'BrainBazaar profile',
    copy: 'Your learning identity, credits, and account settings live here.',
  };
  const RoleIcon = meta.icon;
  const userId = user?._id || user?.id;
  const avatarUrl = typeof user?.avatar === 'string' ? user.avatar : user?.avatar?.secure_url;
  const certificates = user?.certificates || [];
  const achievements = user?.achievements || [];

  const actions = useMemo(() => {
    if (normalizedRole === 'admin') {
      return [
        { label: 'Open admin dashboard', to: '/admin', icon: Shield },
        { label: 'Browse marketplace', to: '/catalog', icon: BookOpen },
      ];
    }

    if (normalizedRole === 'seller') {
      return [
        { label: 'View public profile', to: `/seller/${userId}/profile`, icon: UserRound, disabled: !userId },
        { label: 'Creator studio', to: '/seller', icon: Store },
        { label: 'Upload project course', to: '/seller/upload', icon: Sparkles },
      ];
    }

    return [
      { label: 'Learning desk', to: '/dashboard', icon: GraduationCap },
      { label: 'Browse project courses', to: '/catalog', icon: BookOpen },
      { label: 'Buy credits', to: '/buy-credits', icon: Coins },
    ];
  }, [normalizedRole, userId]);

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] px-4 text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
        <div className="rounded-2xl border border-[#E2DDD4] bg-white p-8 text-center shadow-[0_18px_50px_rgba(28,26,23,0.08)] dark:border-white/10 dark:bg-[#171B16]">
          <UserRound className="mx-auto text-[#1E3A2F] dark:text-[#7FC79C]" size={40} />
          <h1 className="mt-4 font-headline text-3xl font-semibold">Sign in to view your profile</h1>
          <button onClick={() => navigate('/auth')} className="mt-6 rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42]">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      name: formData.name.trim(),
      bio: formData.bio.trim(),
    };

    if (!payload.name) {
      setMessage('Display name is required.');
      return;
    }

    setSaving(true);
    setMessage('');
    const result = await updateProfile(payload);
    setSaving(false);
    if (result?.success) {
      setMessage('Profile updated.');
    } else {
      setMessage(result?.message || 'Could not update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 py-6 text-[#1C1A17] sm:px-6 lg:px-8 dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white shadow-[0_18px_50px_rgba(28,26,23,0.07)] dark:border-white/10 dark:bg-[#171B16]">
          <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
            <div className="p-5 sm:p-6 lg:p-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E2DDD4] bg-[#F6F4EF] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#5C5851] dark:border-white/10 dark:bg-white/5 dark:text-[#B8C2B1]">
                <RoleIcon size={14} />
                {meta.label} profile
              </span>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E2DDD4] bg-[#F0EDE6] dark:border-white/10 dark:bg-white/5">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name || 'Profile avatar'} className="h-full w-full object-cover" />
                  ) : (
                    <RoleIcon size={40} className="text-[#1E3A2F] dark:text-[#7FC79C]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-headline text-3xl font-semibold leading-tight sm:text-4xl">
                    {user.name || user.fullName || 'BrainBazaar user'}
                  </h1>
                  <p className="mt-2 text-base font-semibold text-[#5C5851] dark:text-[#B8C2B1]">{meta.headline}</p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#5C5851] dark:text-[#D9D2C7]">
                {user.bio || meta.copy}
              </p>
              {message && !settingsOpen && (
                <p className="mt-4 inline-flex rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#1E3A2F] dark:bg-[#223426] dark:text-[#DDEBDD]">
                  {message}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2.5">
                {actions.map((action) => {
                  const ActionIcon = action.icon;
                  if (action.disabled) return null;
                  return (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#E2DDD4] bg-[#F6F4EF] px-3.5 py-2 text-sm font-bold text-[#1E3A2F] transition hover:-translate-y-0.5 hover:border-[#1E3A2F] hover:bg-[#E8F2EC] dark:border-white/10 dark:bg-white/5 dark:text-[#DDEBDD] dark:hover:border-[#7FC79C] dark:hover:bg-[#223426]"
                    >
                      <ActionIcon size={17} />
                      {action.label}
                      <ArrowRight size={15} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="border-t border-[#E2DDD4] bg-[#F9F7F2] p-5 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-[#121711]">
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#E2DDD4] bg-white p-4 dark:border-white/10 dark:bg-[#171B16]">
                  <Mail className="text-[#1E3A2F] dark:text-[#7FC79C]" size={21} />
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#9B9589] dark:text-[#8F9A8A]">Account email</p>
                  <p className="mt-1 break-all text-sm font-bold">{user.email}</p>
                </div>
                <div className="rounded-2xl border border-[#E2DDD4] bg-white p-4 dark:border-white/10 dark:bg-[#171B16]">
                  <Coins className="text-[#1E3A2F] dark:text-[#7FC79C]" size={21} />
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#9B9589] dark:text-[#8F9A8A]">AI credits</p>
                  <p className="mt-1 font-headline text-3xl font-semibold">{user.credits || 0}</p>
                </div>
                <button
                  onClick={() => {
                    setFormData({ name: user?.name || user?.fullName || '', bio: user?.bio || '' });
                    setSettingsOpen((open) => !open);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42] dark:bg-[#D9A441] dark:text-[#171B16] dark:hover:bg-[#F0C565]"
                >
                  <PenLine size={17} />
                  Settings
                </button>
              </div>
            </aside>
          </div>
        </section>

        {settingsOpen && (
          <section className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_18px_50px_rgba(28,26,23,0.06)] sm:p-6 dark:border-white/10 dark:bg-[#171B16]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4840A] dark:text-[#F0C565]">Settings</p>
                <h2 className="mt-2 font-headline text-2xl font-semibold">Edit profile</h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg border border-[#E2DDD4] p-2 text-[#5C5851] transition hover:bg-[#F0EDE6] dark:border-white/10 dark:text-[#B8C2B1] dark:hover:bg-white/10"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#B8C2B1]">Display name</span>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] px-3 text-sm font-semibold outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F] dark:focus:border-[#7FC79C]"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#B8C2B1]">Bio</span>
                <textarea
                  value={formData.bio}
                  onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell learners what you build, what you are learning, or what kind of projects you enjoy."
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-3 text-sm font-semibold leading-6 outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F] dark:focus:border-[#7FC79C]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                <button disabled={saving} className="rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42] disabled:opacity-60 dark:bg-[#D9A441] dark:text-[#171B16] dark:hover:bg-[#F0C565]">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {message && <p className="text-sm font-bold text-[#5C5851] dark:text-[#B8C2B1]">{message}</p>}
              </div>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_18px_50px_rgba(28,26,23,0.06)] sm:p-6 dark:border-white/10 dark:bg-[#171B16]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4840A] dark:text-[#F0C565]">Proof of work</p>
              <h2 className="mt-2 font-headline text-2xl font-semibold">Certificates & achievements</h2>
            </div>
            <span className="rounded-full border border-[#E2DDD4] bg-[#F6F4EF] px-3 py-1 text-xs font-bold text-[#5C5851] dark:border-white/10 dark:bg-white/5 dark:text-[#B8C2B1]">
              {certificates.length + achievements.length} earned
            </span>
          </div>

          {certificates.length === 0 && achievements.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#E2DDD4] bg-[#F9F7F2] p-6 text-center dark:border-white/10 dark:bg-[#121711]">
              <Award className="mx-auto text-[#9B9589] dark:text-[#8F9A8A]" size={36} />
              <h3 className="mt-3 font-headline text-xl font-semibold">No certificates yet</h3>
              <p className="mt-1 text-sm text-[#5C5851] dark:text-[#B8C2B1]">
                Complete a full project course to earn a Builder Certificate.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {certificates.map((certificate) => (
                <button
                  key={certificate._id || certificate.certificateId}
                  onClick={() => setSelectedCertificate(certificate)}
                  className="rounded-2xl border border-[#E2DDD4] bg-[#F9F7F2] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-[#121711]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F2EC] text-[#1E3A2F] dark:bg-[#223426] dark:text-[#7FC79C]">
                      <Award size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline text-xl font-semibold">{certificate.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#5C5851] dark:text-[#B8C2B1]">{certificate.projectTitle || certificate.project?.title}</p>
                      <p className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#5C5851] dark:bg-white/5 dark:text-[#D9D2C7]">
                        ID: {certificate.certificateId}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              {achievements.map((achievement) => (
                <div key={achievement.type} className="rounded-2xl border border-[#E2DDD4] bg-[#FEF3DC] p-4 dark:border-[#F0C565]/30 dark:bg-[#2A2114]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#D4840A] dark:bg-white/10 dark:text-[#F0C565]">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-semibold">{achievement.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {selectedCertificate && (
          <CertificateModal
            isOpen={true}
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
