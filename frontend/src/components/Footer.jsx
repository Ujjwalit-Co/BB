import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, GraduationCap, Upload } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E2DDD4] bg-white px-8 py-16 text-[#1C1A17] dark:border-white/10 dark:bg-[#121210] dark:text-[#EDE9E3]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="space-y-6 md:col-span-2">
          <Link to="/" className="font-headline text-3xl font-semibold text-[#1E3A2F] dark:text-[#EDE9E3]">
            BrainBazaar
          </Link>
          <p className="max-w-sm leading-7 text-[#5C5851] dark:text-[#9B9589]">
            Real student projects turned into milestone-based learning journeys.
            Learn by doing. Earn by building.
          </p>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DDD4] text-[#5C5851] transition-all hover:border-[#1E3A2F] hover:text-[#1E3A2F] dark:border-white/10 dark:text-[#9B9589]">
              <Github size={20} />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DDD4] text-[#5C5851] transition-all hover:border-[#1E3A2F] hover:text-[#1E3A2F] dark:border-white/10 dark:text-[#9B9589]">
              <GraduationCap size={20} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-widest text-[#1C1A17] dark:text-[#EDE9E3]">Learners</h5>
          <ul className="space-y-3 text-sm font-semibold text-[#5C5851] dark:text-[#9B9589]">
            <li>
              <Link to="/catalog" className="inline-flex items-center gap-2 hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">
                <BookOpen size={15} /> Explore builds
              </Link>
            </li>
            <li><Link to="/dashboard" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">My learning</Link></li>
            <li><Link to="/buy-credits" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">AI credits</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-widest text-[#1C1A17] dark:text-[#EDE9E3]">Creators</h5>
          <ul className="space-y-3 text-sm font-semibold text-[#5C5851] dark:text-[#9B9589]">
            <li><Link to="/seller" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">Creator Studio</Link></li>
            <li>
              <Link to="/seller/upload" className="inline-flex items-center gap-2 hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">
                <Upload size={15} /> Publish course
              </Link>
            </li>
            <li><Link to="/auth" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">Sign in</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#E2DDD4] pt-8 md:flex-row dark:border-white/10">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#9B9589]">
            © {new Date().getFullYear()} Ujjwalit Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#9B9589]">
            BrainBazaar is a proprietary platform developed by team <a href="https://ujjwalit.co.in" target="_blank" rel="noopener noreferrer" className="text-[#1E3A2F] hover:underline dark:text-[#EDE9E3]">Ujjwalit</a>.
          </p>
        </div>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#9B9589]">
          <Link to="/" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">Vision</Link>
          <Link to="/catalog" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">Marketplace</Link>
          <Link to="/auth" className="hover:text-[#1E3A2F] dark:hover:text-[#EDE9E3]">Account</Link>
        </div>
      </div>
    </footer>
  );
}
