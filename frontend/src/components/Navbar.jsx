import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, Coins, GraduationCap, LayoutDashboard, LogIn, Menu, Moon,
  Package, Shield, Sun, Upload, UserRound, X,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useLabStore from '../store/useLabStore';

function NavLink({ to, icon: LinkIcon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition sm:px-4 ${
        active
          ? 'border border-[#1E3A2F]/20 bg-[#E8F2EC] text-[#1E3A2F] shadow-[inset_0_0_0_1px_rgba(30,58,47,0.04)] dark:border-[#D9A441]/25 dark:bg-[#3A2A12] dark:text-[#F0C565]'
          : 'text-[#5C5851] hover:bg-[#E8F2EC] hover:text-[#1E3A2F] dark:text-[#B8C2B1] dark:hover:bg-[#223426] dark:hover:text-[#DDEBDD]'
      }`}
    >
      <LinkIcon size={16} />
      {label}
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { user, logout, getProfile } = useAuthStore();
  const { credits, setCredits } = useLabStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  useEffect(() => {
    if (user && user.credits !== undefined) setCredits(user.credits);
  }, [user, setCredits]);

  const hasFetchedProfile = React.useRef(false);

  useEffect(() => {
    if (user && !hasFetchedProfile.current) {
      getProfile();
      hasFetchedProfile.current = true;
    }
  }, [user, getProfile]);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    root.classList.toggle('dark', isDark);
  }, [isDark]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const homePath = user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/dashboard';
  const homeLabel = user?.role === 'seller' ? 'Studio' : user?.role === 'admin' ? 'Admin' : 'Desk';
  const HomeIcon = user?.role === 'seller' ? Package : user?.role === 'admin' ? Shield : LayoutDashboard;
  const homeActive = user?.role === 'seller'
    ? location.pathname === '/seller' || location.pathname === '/seller/github-callback'
    : isActive(homePath);
  const profilePath = '/profile';
  const profileLabel = user?.role === 'admin' ? 'Admin Profile' : 'Profile';
  const ProfileIcon = user?.role === 'admin' ? Shield : UserRound;

  const mobileClose = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full px-3 py-3 sm:px-5">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-[#E2DDD4] bg-white/88 px-2.5 shadow-[0_14px_44px_rgba(28,26,23,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#171916]/92 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 lg:gap-3">
            <Link to="/" className="group flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1.5 sm:px-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E3A2F] text-white shadow-[0_8px_20px_rgba(30,58,47,0.18)] sm:h-10 sm:w-10">
                <GraduationCap size={21} />
              </span>
              <span className="font-headline text-xl font-semibold tracking-tight text-[#1E3A2F] max-[420px]:hidden sm:text-2xl dark:text-[#DDEBDD]">
                BrainBazaar
              </span>
            </Link>

            <div className="hidden items-center rounded-full border border-[#E2DDD4] bg-[#F6F4EF] p-1 dark:border-white/10 dark:bg-[#10130F] md:flex">
              <NavLink to="/catalog" icon={BookOpen} label="Explore" active={isActive('/catalog') || isActive('/project')} />
              {user && <NavLink to={homePath} icon={HomeIcon} label={homeLabel} active={homeActive} />}
              {user?.role === 'seller' && <NavLink to="/seller/upload" icon={Upload} label="Publish" active={isActive('/seller/upload')} />}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsDark((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DDD4] bg-[#F6F4EF] text-[#5C5851] transition hover:border-[#1E3A2F] hover:text-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#B8C2B1] dark:hover:border-[#D9A441] dark:hover:text-[#F0C565]"
              aria-label="Toggle theme"
              type="button"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/buy-credits"
                  className="hidden h-10 items-center gap-2 rounded-full border border-[#E2DDD4] bg-[#F6F4EF] px-3 text-sm font-bold text-[#1E3A2F] transition hover:border-[#D4840A] hover:bg-[#FEF3DC] dark:border-white/10 dark:bg-[#10130F] dark:text-[#DDEBDD] dark:hover:border-[#D9A441] dark:hover:bg-[#3A2A12] sm:flex"
                >
                  <Coins size={16} />
                  {credits ?? user.credits ?? 0}
                </Link>

                <Link
                  to={profilePath}
                  className="hidden h-10 items-center gap-2 rounded-full border border-[#E2DDD4] bg-white px-3 text-sm font-bold text-[#5C5851] transition hover:border-[#1E3A2F] hover:bg-[#F6F4EF] hover:text-[#1E3A2F] dark:border-white/10 dark:bg-[#10130F] dark:text-[#B8C2B1] dark:hover:border-[#7FC79C] dark:hover:bg-[#223426] dark:hover:text-[#DDEBDD] lg:flex"
                  title={profileLabel}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F2EC] text-[#1E3A2F] dark:bg-[#223426] dark:text-[#DDEBDD]">
                    <ProfileIcon size={14} />
                  </span>
                  {user.name?.split(' ')[0] || homeLabel}
                </Link>

                <button
                  onClick={logout}
                  className="hidden h-10 rounded-full bg-[#1E3A2F] px-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(30,58,47,0.16)] transition hover:bg-[#2D5C42] dark:!bg-[#C8F7D4] dark:!text-[#08140D] dark:hover:!bg-[#DDFBE5] sm:block"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="hidden h-10 items-center gap-2 rounded-full bg-[#1E3A2F] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(30,58,47,0.16)] transition hover:bg-[#2D5C42] dark:!bg-[#C8F7D4] dark:!text-[#08140D] dark:hover:!bg-[#DDFBE5] sm:flex"
              >
                <LogIn size={16} />
                Sign in
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DDD4] bg-[#F6F4EF] text-[#5C5851] dark:border-white/10 dark:bg-[#10130F] dark:text-[#B8C2B1] md:hidden"
              type="button"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed left-3 right-3 top-[5.5rem] z-40 rounded-2xl border border-[#E2DDD4] bg-white p-3 shadow-[0_20px_60px_rgba(28,26,23,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-[#171916]/96 md:hidden">
          <div className="grid gap-2">
            <NavLink to="/catalog" icon={BookOpen} label="Explore builds" active={isActive('/catalog')} onClick={mobileClose} />
            {user && <NavLink to={homePath} icon={HomeIcon} label={homeLabel} active={homeActive} onClick={mobileClose} />}
            {user && <NavLink to={profilePath} icon={ProfileIcon} label={user.name?.split(' ')[0] || profileLabel} active={isActive(profilePath)} onClick={mobileClose} />}
            {user?.role === 'seller' && <NavLink to="/seller/upload" icon={Upload} label="Publish course" active={isActive('/seller/upload')} onClick={mobileClose} />}
            {user ? (
              <>
                <NavLink to="/buy-credits" icon={Coins} label={`${credits ?? user.credits ?? 0} AI credits`} active={isActive('/buy-credits')} onClick={mobileClose} />
                <button onClick={logout} className="rounded-full bg-[#1E3A2F] px-4 py-3 text-sm font-bold text-white dark:!bg-[#C8F7D4] dark:!text-[#08140D]" type="button">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={mobileClose} className="rounded-full bg-[#1E3A2F] px-4 py-3 text-center text-sm font-bold text-white dark:!bg-[#C8F7D4] dark:!text-[#08140D]">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
