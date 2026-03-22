import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      return;
    }

    handleCallback(code);
  }, []);

  const handleCallback = async (code) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ code }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => navigate('/seller/upload'), 1500);
      } else {
        setStatus('error');
        setError(data.message || 'Failed to connect GitHub');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connection failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 p-8">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold">Connecting GitHub...</h2>
            <p className="text-slate-500 dark:text-slate-400">Please wait while we connect your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="text-emerald-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold">GitHub Connected!</h2>
            <p className="text-slate-500 dark:text-slate-400">Redirecting to upload wizard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="text-red-500 mx-auto" size={48} />
            <h2 className="text-2xl font-bold">Connection Failed</h2>
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/seller')}
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
