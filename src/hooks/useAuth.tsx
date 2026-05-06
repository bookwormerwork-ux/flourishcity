import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

// Custom URL scheme registered in Info.plist for deep-link OAuth callback on iOS.
const APP_URL_SCHEME = 'app.lovable.b2585817a19049cf9b5a6ea76d62b529';
const OAUTH_CALLBACK_PATH = 'login-callback';
const NATIVE_REDIRECT = `${APP_URL_SCHEME}://${OAUTH_CALLBACK_PATH}`;

// Deployed web URL — used as emailRedirectTo on native (capacitor://localhost is not a valid email link target).
const WEB_APP_URL = 'https://b2585817-a190-49cf-9b5a-6ea76d62b529.lovableproject.com';

const isNative =
  typeof window !== 'undefined' && window.location.protocol === 'capacitor:';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth deep-link callback on native (e.g. after Google sign-in).
  useEffect(() => {
    if (!isNative) return;
    let cleanup: (() => void) | undefined;
    App.addListener('appUrlOpen', async ({ url }) => {
      if (!url.includes(OAUTH_CALLBACK_PATH)) return;
      try {
        const parsed = new URL(url);
        const code = parsed.searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // ignore malformed URLs
      } finally {
        await Browser.close();
      }
    }).then((handle) => {
      cleanup = () => handle.remove();
    });
    return () => cleanup?.();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const redirectTo = isNative ? `${WEB_APP_URL}/` : `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { display_name: displayName },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      if (isNative) {
        // PKCE flow: open system browser, redirect back via URL scheme.
        // Requires NATIVE_REDIRECT to be in Supabase → Auth → URL Configuration → Redirect URLs.
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: NATIVE_REDIRECT,
            skipBrowserRedirect: true,
            queryParams: { access_type: 'offline', prompt: 'consent' },
          },
        });
        if (error || !data.url) return;
        await Browser.open({ url: data.url, windowName: '_self' });
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/` },
        });
      }
    } catch {
      // non-fatal
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
