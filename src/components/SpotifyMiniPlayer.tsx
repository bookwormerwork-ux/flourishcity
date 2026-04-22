import { Play, Pause, SkipBack, SkipForward, Music, LogIn, AlertCircle, Heart, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { GlassPanel } from './GlassPanel';
import { cn } from '@/lib/utils';

const LOFI_PLAYLIST = 'spotify:playlist:0vvXsWCC9xrXsKd4FyS8kM'; // Lofi Beats (Spotify editorial)
const AUTOPLAY_KEY = 'spotify-autoplay-lofi';

interface LikedTrack {
  uri: string;
  name: string;
  artists: string;
  albumArt?: string;
}

interface SpotifyPlayerCardProps {
  variant?: 'full' | 'compact';
  autoplay?: boolean;
}

export function SpotifyPlayerCard({ variant = 'full', autoplay = false }: SpotifyPlayerCardProps) {
  const { isConnected, beginLogin, loading, logout, getAccessToken } = useSpotifyAuth();
  const { state, togglePlay, next, previous, transferAndPlay } = useSpotifyPlayer();

  const [liked, setLiked] = useState<LikedTrack[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [showLiked, setShowLiked] = useState(false);
  const autoplayedRef = useRef(false);

  // Autoplay lofi once when player becomes ready
  useEffect(() => {
    if (!autoplay) return;
    if (!state.ready || autoplayedRef.current) return;
    if (state.track) { autoplayedRef.current = true; return; }
    if (sessionStorage.getItem(AUTOPLAY_KEY) === 'done') return;
    autoplayedRef.current = true;
    sessionStorage.setItem(AUTOPLAY_KEY, 'done');
    transferAndPlay(LOFI_PLAYLIST).catch(() => {});
  }, [autoplay, state.ready, state.track, transferAndPlay]);

  const loadLiked = async () => {
    setShowLiked(true);
    if (liked.length || likedLoading) return;
    setLikedLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch('https://api.spotify.com/v1/me/tracks?limit=30', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(
        (data.items ?? []).map((it: any) => ({
          uri: it.track.uri,
          name: it.track.name,
          artists: it.track.artists.map((a: any) => a.name).join(', '),
          albumArt: it.track.album?.images?.[2]?.url ?? it.track.album?.images?.[0]?.url,
        })),
      );
    } finally {
      setLikedLoading(false);
    }
  };

  const playTrack = async (uri: string) => {
    const token = await getAccessToken();
    if (!token || !state.deviceId) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    });
  };

  if (!isConnected) {
    return (
      <GlassPanel variant="strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center">
            <Music className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-title text-foreground">Spotify</h2>
            <p className="text-caption">Chill lofi while you focus</p>
          </div>
          <button
            onClick={beginLogin}
            disabled={loading}
            className="pill-primary text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5" /> Connect
          </button>
        </div>
      </GlassPanel>
    );
  }

  if (state.premiumRequired) {
    return (
      <GlassPanel variant="strong">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-title text-foreground">Spotify Premium required</h2>
            <p className="text-caption">In-app playback only works with a Premium account.</p>
            <button onClick={logout} className="pill-secondary text-xs mt-2">Disconnect</button>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="strong">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-accent/40 flex items-center justify-center',
            !state.paused && 'animate-breathe',
          )}
        >
          {state.track?.albumArt ? (
            <img src={state.track.albumArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music className="w-6 h-6 text-[#1DB954]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {state.track?.name ?? (state.ready ? 'Ready · Lofi Beats' : 'Connecting…')}
          </p>
          <p className="text-caption truncate">
            {state.track?.artists ?? 'Tap play to start'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={previous}
          disabled={!state.ready}
          className="p-2 rounded-full bg-accent/30 hover:bg-accent/50 transition disabled:opacity-40 ios-press"
        >
          <SkipBack className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={async () => {
            if (!state.track && state.ready) await transferAndPlay(LOFI_PLAYLIST);
            else await togglePlay();
          }}
          disabled={!state.ready}
          className="p-3 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1AA34A] text-white shadow-button hover:scale-105 active:scale-95 transition disabled:opacity-40 spring-bounce-sm"
        >
          {state.paused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
        </button>
        <button
          onClick={next}
          disabled={!state.ready}
          className="p-2 rounded-full bg-accent/30 hover:bg-accent/50 transition disabled:opacity-40 ios-press"
        >
          <SkipForward className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {variant === 'full' && (
        <div className="mt-3">
          <button
            onClick={() => (showLiked ? setShowLiked(false) : loadLiked())}
            className="w-full flex items-center gap-2 p-2 rounded-xl bg-accent/30 hover:bg-accent/50 transition ios-press"
          >
            <Heart className="w-4 h-4 text-[#1DB954]" />
            <span className="text-xs font-semibold text-foreground flex-1 text-left">
              Liked Songs
            </span>
            <span className="text-micro">{showLiked ? '▼' : '▶'}</span>
          </button>

          {showLiked && (
            <div className="mt-2 max-h-56 overflow-y-auto scrollbar-hide space-y-1 animate-fade-in">
              {likedLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!likedLoading && liked.length === 0 && (
                <p className="text-caption text-center py-3">No liked songs found.</p>
              )}
              {liked.map((t) => (
                <button
                  key={t.uri}
                  onClick={() => playTrack(t.uri)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent/40 transition ios-press text-left"
                >
                  {t.albumArt && (
                    <img src={t.albumArt} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-micro truncate">{t.artists}</p>
                  </div>
                  <Play className="w-3 h-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {state.error && !state.premiumRequired && (
        <p className="text-micro text-destructive mt-2 text-center">{state.error}</p>
      )}
    </GlassPanel>
  );
}
