import { Play, Pause, SkipBack, SkipForward, Music, LogIn, AlertCircle } from 'lucide-react';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { GlassPanel } from './GlassPanel';
import { cn } from '@/lib/utils';

const FOCUS_PLAYLIST = 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ'; // Deep Focus

export function SpotifyMiniPlayer() {
  const { isConnected, beginLogin, loading, logout } = useSpotifyAuth();
  const { state, togglePlay, next, previous, transferAndPlay } = useSpotifyPlayer();

  if (!isConnected) {
    return (
      <GlassPanel variant="strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center">
            <Music className="w-5 h-5 text-[#1DB954]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-title text-foreground">Spotify</h2>
            <p className="text-caption">Play music while you flourish</p>
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
            {state.track?.name ?? (state.ready ? 'Ready to play' : 'Connecting…')}
          </p>
          <p className="text-caption truncate">
            {state.track?.artists ?? 'Tap play to start Deep Focus'}
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
            if (!state.track && state.ready) {
              await transferAndPlay(FOCUS_PLAYLIST);
            } else {
              await togglePlay();
            }
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

      {state.error && !state.premiumRequired && (
        <p className="text-micro text-destructive mt-2 text-center">{state.error}</p>
      )}
    </GlassPanel>
  );
}
