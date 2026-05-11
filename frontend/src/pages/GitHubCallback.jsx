import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Github, Loader2, XCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  const { token: authToken } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      setStatus('error');
      setError('No authorization code received from GitHub.');
      return;
    }

    handleCallback(code);
  }, [authToken]);

  const handleCallback = async (code) => {
    try {
      const token = authToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => navigate('/seller/upload'), 1400);
      } else {
        setStatus('error');
        setError(data.message || 'Failed to connect GitHub.');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connection failed.');
    }
  };

  const statusView = {
    processing: {
      icon: <Loader2 className="animate-spin text-[#1E3A2F]" size={42} />,
      eyebrow: 'Connecting repository shelf',
      title: 'Linking your GitHub account',
      copy: 'BrainBazaar is checking the authorization code and preparing your upload studio.',
    },
    success: {
      icon: <CheckCircle2 className="text-[#2A9D6F]" size={42} />,
      eyebrow: 'GitHub connected',
      title: 'Repository shelf unlocked',
      copy: 'Redirecting you to the project-course upload wizard.',
    },
    error: {
      icon: <XCircle className="text-[#C0392B]" size={42} />,
      eyebrow: 'Connection failed',
      title: 'GitHub could not be connected',
      copy: error,
    },
  }[status];

  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-[#F6F4EF] px-4 py-12 text-[#1C1A17]">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#E2DDD4] bg-white shadow-[0_22px_60px_rgba(28,26,23,0.10)]">
        <div className="bg-[#1E3A2F] p-8 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Github size={28} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-white/60">{statusView.eyebrow}</p>
          <h1 className="mt-3 font-headline text-4xl font-semibold">{statusView.title}</h1>
        </div>

        <div className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F0EDE6]">
            {statusView.icon}
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm font-semibold leading-6 text-[#5C5851]">{statusView.copy}</p>

          {status === 'error' && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/seller')}
                className="rounded-lg bg-[#1E3A2F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2D5C42]"
              >
                Back to Creator Studio
              </button>
              <button
                type="button"
                onClick={() => navigate('/seller/upload')}
                className="rounded-lg border border-[#1E3A2F] px-5 py-3 text-sm font-bold text-[#1E3A2F] transition hover:bg-[#E8F2EC]"
              >
                Try upload again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
