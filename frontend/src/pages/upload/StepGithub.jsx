import React, { useState } from 'react';
import { Check, Github, Globe, Lock } from 'lucide-react';

export default function StepGithub({ githubConnected, githubUsername, onConnect }) {
  const [accessLevel, setAccessLevel] = useState('public');

  return (
    <div className="animate-fadeIn py-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F0EDE6] text-[#1E3A2F]">
        <Github size={40} />
      </div>
      <h2 className="mt-6 font-headline text-4xl font-semibold">Connect GitHub</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-[#5C5851]">
        Choose how BrainBazaar can read your repositories for this project-course draft.
      </p>

      {githubConnected ? (
        <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#2A9D6F]/20 bg-[#E8F2EC] px-5 py-4 font-bold text-[#1E3A2F]">
          <Check size={20} /> Connected as @{githubUsername}
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-xl space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B9589]">Access level</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'public', title: 'Public repos', copy: 'Access only public repositories.', icon: Globe },
              { key: 'all', title: 'Public + private', copy: 'Access all repositories including private.', icon: Lock },
            ].map((option) => {
              const selected = accessLevel === option.key;
              return (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => setAccessLevel(option.key)}
                  className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                    selected ? 'border-[#1E3A2F] bg-[#E8F2EC] shadow-[0_12px_28px_rgba(30,58,47,0.12)]' : 'border-[#E2DDD4] bg-white hover:border-[#1E3A2F]/35'
                  }`}
                >
                  <option.icon size={24} className={selected ? 'text-[#1E3A2F]' : 'text-[#9B9589]'} />
                  <h4 className="mt-4 font-bold">{option.title}</h4>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#5C5851]">{option.copy}</p>
                  {selected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A2F] text-white">
                      <Check size={13} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onConnect(accessLevel)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-8 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(30,58,47,0.18)] transition hover:bg-[#2D5C42]"
          >
            <Github size={20} /> Connect GitHub
          </button>
        </div>
      )}
    </div>
  );
}
