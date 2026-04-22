import { useEffect, useRef, useState, useCallback } from 'react';
import { useSpotifyAuth } from './useSpotifyAuth';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface PlayerTrack {
  name: string;
  artists: string;
  albumArt?: string;
  uri: string;
}

export interface PlayerState {
  ready: boolean;
  paused: boolean;
  track: PlayerTrack | null;
  position: number;
  duration: number;
  deviceId: string | null;
  premiumRequired: boolean;
  error: string | null;
}

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js';

let sdkPromise: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve) => {
    if (window.Spotify) return resolve();
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    document.body.appendChild(s);
  });
  return sdkPromise;
}

export function useSpotifyPlayer() {
  const { isConnected, getAccessToken } = useSpotifyAuth();
  const playerRef = useRef<any>(null);
  const [state, setState] = useState<PlayerState>({
    ready: false,
    paused: true,
    track: null,
    position: 0,
    duration: 0,
    deviceId: null,
    premiumRequired: false,
    error: null,
  });

  // Init player
  useEffect(() => {
    if (!isConnected) return;
    let cancelled = false;
    let player: any = null;

    (async () => {
      await loadSdk();
      if (cancelled) return;

      player = new window.Spotify.Player({
        name: 'Flourish City Player',
        getOAuthToken: async (cb: (t: string) => void) => {
          const t = await getAccessToken();
          if (t) cb(t);
        },
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setState((s) => ({ ...s, ready: true, deviceId: device_id, error: null }));
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        setState((s) => ({ ...s, ready: false, deviceId: device_id }));
      });

      player.addListener('initialization_error', ({ message }: any) =>
        setState((s) => ({ ...s, error: message })),
      );
      player.addListener('authentication_error', ({ message }: any) =>
        setState((s) => ({ ...s, error: message })),
      );
      player.addListener('account_error', ({ message }: any) =>
        setState((s) => ({ ...s, error: message, premiumRequired: true })),
      );
      player.addListener('playback_error', ({ message }: any) =>
        setState((s) => ({ ...s, error: message })),
      );

      player.addListener('player_state_changed', (ps: any) => {
        if (!ps) return;
        const cur = ps.track_window?.current_track;
        setState((s) => ({
          ...s,
          paused: ps.paused,
          position: ps.position,
          duration: ps.duration,
          track: cur
            ? {
                name: cur.name,
                artists: cur.artists?.map((a: any) => a.name).join(', ') ?? '',
                albumArt: cur.album?.images?.[0]?.url,
                uri: cur.uri,
              }
            : null,
        }));
      });

      await player.connect();
      playerRef.current = player;
    })();

    return () => {
      cancelled = true;
      if (player) player.disconnect();
      playerRef.current = null;
    };
  }, [isConnected, getAccessToken]);

  // Poll position while playing
  useEffect(() => {
    if (state.paused || !state.ready) return;
    const id = setInterval(() => {
      setState((s) => ({ ...s, position: Math.min(s.position + 1000, s.duration) }));
    }, 1000);
    return () => clearInterval(id);
  }, [state.paused, state.ready]);

  const togglePlay = useCallback(async () => {
    const p = playerRef.current;
    if (!p) return;
    await p.togglePlay();
  }, []);

  const next = useCallback(async () => {
    await playerRef.current?.nextTrack();
  }, []);

  const previous = useCallback(async () => {
    await playerRef.current?.previousTrack();
  }, []);

  const transferAndPlay = useCallback(
    async (contextUri?: string) => {
      const token = await getAccessToken();
      if (!token || !state.deviceId) return;
      // Transfer playback to our device
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [state.deviceId], play: !!contextUri }),
      });
      if (contextUri) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ context_uri: contextUri }),
        });
      }
    },
    [getAccessToken, state.deviceId],
  );

  return { state, togglePlay, next, previous, transferAndPlay };
}
