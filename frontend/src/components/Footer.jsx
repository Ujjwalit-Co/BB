import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fc] dark:bg-[#0a0a0a] py-20 px-8 border-t border-[#e2e0e7]/30 dark:border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <Link to="/" className="text-3xl font-headline font-bold bg-gradient-to-r from-[#5d21df] to-[#00e3fd] bg-clip-text text-transparent">
            BrainBazaar
          </Link>
          <p className="text-[#5a5665] dark:text-[#a3a3a3] font-light max-w-sm">
            Decentralizing intellectual advancement through curated AI integration and collaborative academic commerce.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border border-[#e2e0e7] dark:border-white/10 flex items-center justify-center text-[#5a5665] dark:text-[#a3a3a3] hover:text-[#5d21df] hover:border-[#5d21df] transition-all cursor-pointer">
              <Share2 size={20} />
            </div>
            <div className="w-10 h-10 rounded-full border border-[#e2e0e7] dark:border-white/10 flex items-center justify-center text-[#5a5665] dark:text-[#a3a3a3] hover:text-[#5d21df] hover:border-[#5d21df] transition-all cursor-pointer">
              <Globe size={20} />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h5 className="font-headline font-bold text-sm uppercase tracking-widest text-[#1a1c1e] dark:text-[#e5e5e5]">Resources</h5>
          <ul className="space-y-2 text-sm text-[#5a5665] dark:text-[#a3a3a3] font-light">
            <li><Link to="/catalog" className="hover:text-[#5d21df] transition-colors">Documentation</Link></li>
            <li><Link to="/lab/demo" className="hover:text-[#5d21df] transition-colors">API Reference</Link></li>
            <li><Link to="/catalog" className="hover:text-[#5d21df] transition-colors">Market Guidelines</Link></li>
            <li><a href="#" className="hover:text-[#5d21df] transition-colors">Whitepaper</a></li>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <h5 className="font-headline font-bold text-sm uppercase tracking-widest text-[#1a1c1e] dark:text-[#e5e5e5]">Company</h5>
          <ul className="space-y-2 text-sm text-[#5a5665] dark:text-[#a3a3a3] font-light">
            <li><Link to="/" className="hover:text-[#5d21df] transition-colors">Our Vision</Link></li>
            <li><a href="#" className="hover:text-[#5d21df] transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-[#5d21df] transition-colors">Ethics Board</a></li>
            <li><Link to="/auth" className="hover:text-[#5d21df] transition-colors">Privacy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#e2e0e7]/30 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold text-[#5a5665] dark:text-[#a3a3a3] uppercase tracking-widest">
          © {new Date().getFullYear()} BrainBazaar Intelligence Systems. All Rights Reserved.
        </p>
        <div className="flex gap-6 text-[10px] font-bold text-[#5a5665] dark:text-[#a3a3a3] uppercase tracking-widest">
          <a href="#" className="hover:text-[#5d21df]">Status</a>
          <a href="#" className="hover:text-[#5d21df]">Legal</a>
          <a href="#" className="hover:text-[#5d21df]">Contact</a>
        </div>
      </div>
    </footer>
  );
}
