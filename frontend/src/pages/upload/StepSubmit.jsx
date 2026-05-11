import React from 'react';
import { Check, Loader2, Shield, Upload } from 'lucide-react';

export default function StepSubmit({ agreedToTerms, setAgreedToTerms, onSubmit, loading, isEditing }) {
  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4840A]">Final check</p>
        <h2 className="mt-2 font-headline text-4xl font-semibold">Terms and submission</h2>
      </div>

      <div className="rounded-2xl border border-[#E2DDD4] bg-[#F6F4EF] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F2EC] text-[#1E3A2F]">
            <Shield size={21} />
          </div>
          <h3 className="font-bold text-lg">Creator agreement</h3>
        </div>
        <ul className="space-y-3 text-sm font-semibold leading-6 text-[#5C5851]">
          <li className="flex items-start gap-2.5"><Check size={16} className="mt-1 shrink-0 text-[#2A9D6F]" /> BrainBazaar charges a 20% platform fee on each sale.</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="mt-1 shrink-0 text-[#2A9D6F]" /> You retain 80% of revenue from your project-course sales.</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="mt-1 shrink-0 text-[#2A9D6F]" /> Your course is reviewed before publishing.</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="mt-1 shrink-0 text-[#2A9D6F]" /> You certify that this is your original work or that you have rights to share it.</li>
          <li className="flex items-start gap-2.5"><Check size={16} className="mt-1 shrink-0 text-[#2A9D6F]" /> Payouts are processed to your connected payment account.</li>
        </ul>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#E2DDD4] bg-white p-4 transition hover:bg-[#F0EDE6]">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(event) => setAgreedToTerms(event.target.checked)}
          className="h-5 w-5 rounded border-[#E2DDD4] text-[#1E3A2F] focus:ring-[#1E3A2F]"
        />
        <span className="text-sm font-bold text-[#5C5851]">I agree to the BrainBazaar Creator Terms and 20% platform fee.</span>
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!agreedToTerms || loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-8 py-4 text-lg font-bold text-white shadow-[0_12px_28px_rgba(30,58,47,0.18)] transition hover:bg-[#2D5C42] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
        {isEditing ? 'Update project course' : 'Submit for review'}
      </button>
    </div>
  );
}
