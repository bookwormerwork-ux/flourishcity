import { createContext, useContext, ReactNode } from 'react';
import { useSpotifyPlayer } from './useSpotifyPlayer';

type SpotifyPlayerContextValue = ReturnType<typeof useSpotifyPlayer>;

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(null);

/**
 * Mount this ONCE at the app root so the Spotify Web Playback SDK
 * stays connected even when the user switches tabs. Without this,
 * unmounting `useSpotifyPlayer` calls `player.disconnect()` and
 * playback stops.
 */
export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const value = useSpotifyPlayer();
  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayerCtx() {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) {
    throw new Error('useSpotifyPlayerCtx must be used inside <SpotifyPlayerProvider>');
  }
  return ctx;
}
