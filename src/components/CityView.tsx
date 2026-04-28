import { CityStats } from '@/types/game';
import { cn } from '@/lib/utils';
import { Sparkles, Users, Maximize2, Image as ImageIcon } from 'lucide-react';
import { GlassyBuildings } from './GlassyBuildings';
import { SkyLayer } from './SkyLayer';
import { useSkyState } from '@/hooks/useSkyState';

interface CityViewProps {
  stats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  onCelebrate?: boolean;
  onZoomClick?: () => void;
  onPostcardClick?: () => void;
}

export function CityView({ stats, weather, onCelebrate, onZoomClick, onPostcardClick }: CityViewProps) {
  const sky = useSkyState();

  return (
    <div
      className={cn(
        'relative w-full h-56 rounded-3xl overflow-hidden glass',
        onCelebrate && 'animate-celebrate',
      )}
    >
      <SkyLayer />

      {/* Rain layer when happiness is low */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-px h-4 bg-white/40"
              style={{
                left: `${(i * 13) % 100}%`,
                top: `${(i * 7) % 60}%`,
                animation: `bounce-gentle ${0.8 + (i % 5) * 0.15}s linear infinite`,
                animationDelay: `${(i % 7) * 0.12}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top-right action cluster */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {onPostcardClick && (
          <button
            onClick={onPostcardClick}
            className="glass-subtle p-2 rounded-xl ios-press hover:bg-white/40"
            aria-label="Share postcard"
          >
            <ImageIcon className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Zoom button */}
      {onZoomClick && (
        <button
          onClick={onZoomClick}
          className="absolute top-3 left-3 z-10 glass-subtle p-2 rounded-xl ios-press hover:bg-white/40"
        >
          <Maximize2 className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background:
            sky.phase === 'night'
              ? 'linear-gradient(to top, hsl(145 30% 22%), hsl(145 30% 22% / 0))'
              : 'linear-gradient(to top, hsl(145 45% 48% / 0.7), hsl(145 45% 48% / 0.2))',
        }}
      />

      {/* Buildings — clean glassy skyline, with night-glow hint via CSS var */}
      <div
        className="absolute bottom-10 left-0 right-0"
        style={{ ['--window-glow' as string]: sky.windowGlow }}
      >
        <GlassyBuildings buildings={stats.buildings} max={14} scale="sm" />
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center">
        <div className="glass-subtle rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{stats.population}</span>
        </div>

        {stats.streak > 0 && (
          <div className="glass-subtle rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-category-personal" />
            <span className="text-sm font-bold text-foreground">{stats.streak}🔥</span>
          </div>
        )}
      </div>
    </div>
  );
}
