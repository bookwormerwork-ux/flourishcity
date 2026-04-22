import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSpotifyAuth, STATE_KEY } from '@/hooks/useSpotifyAuth';
import { Loader2, Check, AlertCircle } from 'lucide-react';

export default function SpotifyCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { exchangeCode } = useSpotifyAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Spotify…');

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const expectedState = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);

    if (error) {
      setStatus('error');
      setMessage(`Spotify denied access: ${error}`);
      return;
    }
    if (!code || !state || state !== expectedState) {
      setStatus('error');
      setMessage('Invalid OAuth response. Please try again.');
      return;
    }

    exchangeCode(code)
      .then(() => {
        setStatus('success');
        setMessage('Connected! Returning to your city…');
        setTimeout(() => navigate('/', { replace: true }), 900);
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e?.message ?? 'Failed to exchange token');
      });
  }, [params, exchangeCode, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-ultra rounded-[2rem] p-8 max-w-sm w-full text-center animate-scale-in">
        {status === 'loading' && (
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
        )}
        {status === 'success' && (
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
        )}
        {status === 'error' && (
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        )}
        <p className="text-body text-foreground">{message}</p>
        {status === 'error' && (
          <button
            onClick={() => navigate('/', { replace: true })}
            className="pill-primary mt-4"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
