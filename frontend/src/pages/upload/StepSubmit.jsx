import React from 'react';
import { Check, Upload, Loader2, Shield } from 'lucide-react';

export default function StepSubmit({ agreedToTerms, setAgreedToTerms, onSubmit, loading, isEditing }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold">Terms & Submit</h2>

      <div className="p-6 bg-linear-to-br from-slate-50 to-indigo-50/30 dark:from-white/5 dark:to-indigo-500/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-indigo-500" />
          </div>
          <h3 className="font-bold text-lg">Creator Agreement</h3>
        </div>
        <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2.5"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> BrainBazaar charges a <strong className="text-white">20% platform fee</strong> on each sale</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> You retain 80% of all revenue from your project sales</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Your project will be reviewed by our team before publishing</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> You certify that this is your original work or you have rights to sell it</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Payouts are processed monthly to your connected payment account</li>
        </ul>
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium">I agree to the BrainBazaar Creator Terms & Conditions (20% platform fee)</span>
      </label>

      <button
        onClick={onSubmit}
        disabled={!agreedToTerms || loading}
        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] disabled:hover:scale-100"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
        {isEditing ? 'Update Project' : 'Submit for Review'}
      </button>
    </div>
  );
}
