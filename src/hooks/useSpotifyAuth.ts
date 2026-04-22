import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'spotify-tokens-v1';
const STATE_KEY = 'spotify-oauth-state';

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
  scope?: string;
}

function loadTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTokens(t: SpotifyTokens | null) {
  if (t) localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
  else localStorage.removeItem(TOKEN_KEY);
}

export function getRedirectUri() {
  return `${window.location.origin}/spotify-callback`;
}

export function useSpotifyAuth() {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(() => loadTokens());
  const [loading, setLoading] = useState(false);

  const persist = useCallback((t: SpotifyTokens | null) => {
    saveTokens(t);
    setTokens(t);
  }, []);

  const beginLogin = useCallback(async () => {
    setLoading(true);
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem(STATE_KEY, state);
      const { data, error } = await supabase.functions.invoke('spotify-auth-url', {
        body: { redirect_uri: getRedirectUri(), state },
      });
      if (error || !data?.url) throw error ?? new Error('Failed to build Spotify URL');
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }, []);

  const exchangeCode = useCallback(async (code: string) => {
    const { data, error } = await supabase.functions.invoke('spotify-token', {
      body: { action: 'exchange', code, redirect_uri: getRedirectUri() },
    });
    if (error || !data?.access_token) throw error ?? new Error('Token exchange failed');
    const t: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
      scope: data.scope,
    };
    persist(t);
    return t;
  }, [persist]);

  const refresh = useCallback(async (): Promise<string | null> => {
    const current = loadTokens();
    if (!current?.refresh_token) return null;
    const { data, error } = await supabase.functions.invoke('spotify-token', {
      body: { action: 'refresh', refresh_token: current.refresh_token },
    });
    if (error || !data?.access_token) {
      persist(null);
      return null;
    }
    const t: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? current.refresh_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
      scope: data.scope ?? current.scope,
    };
    persist(t);
    return t.access_token;
  }, [persist]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = loadTokens();
    if (!current) return null;
    if (Date.now() < current.expires_at) return current.access_token;
    return await refresh();
  }, [refresh]);

  const logout = useCallback(() => persist(null), [persist]);

  return {
    tokens,
    isConnected: !!tokens,
    loading,
    beginLogin,
    exchangeCode,
    getAccessToken,
    refresh,
    logout,
  };
}

export { STATE_KEY };
