import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { GlassPanel } from '@/components/GlassPanel';
import { Sparkles } from 'lucide-react';

export default function Auth() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } =
        mode === 'signin'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password, displayName || email.split('@')[0]);
      if (error) setError(error.message);
      else if (mode === 'signup') setError('Check your email to confirm your account (or sign in if confirmation is disabled).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-background to-accent/30 flex items-center justify-center p-6 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
      <GlassPanel variant="strong" className="w-full max-w-sm p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-xl font-bold text-foreground">Flourish</h1>
          </div>
          <p className="text-caption">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-xl bg-foreground text-background font-semibold text-sm ios-press"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-caption">
          <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-accent/40 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-accent/40 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-accent/40 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm ios-press disabled:opacity-50"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Continue offline →
        </button>
      </GlassPanel>
    </div>
  );
}
