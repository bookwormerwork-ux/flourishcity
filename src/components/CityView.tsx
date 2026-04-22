import { CityStats } from '@/types/game';
import { cn } from '@/lib/utils';
import { Sun, Cloud, CloudRain, Sparkles, Users, Maximize2 } from 'lucide-react';
import { GlassyBuildings } from './GlassyBuildings';

interface CityViewProps {
  stats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  onCelebrate?: boolean;
  onZoomClick?: () => void;
}

export function CityView({ stats, weather, onCelebrate, onZoomClick }: CityViewProps) {
  const WeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-category-personal animate-pulse-soft" />;
      case 'partly-cloudy':
        return <Cloud className="w-8 h-8 text-muted-foreground" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-muted" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-muted" />;
    }
  };

  return (
    <div className={cn(
      "relative w-full h-56 rounded-3xl overflow-hidden glass",
      onCelebrate && "animate-celebrate"
    )}>
      {/* Sky gradient */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        weather === 'sunny' && "bg-gradient-to-b from-city-sky to-primary/20",
        weather === 'partly-cloudy' && "bg-gradient-to-b from-city-sky/80 to-muted/30",
        weather === 'cloudy' && "bg-gradient-to-b from-muted to-muted/50",
        weather === 'rainy' && "bg-gradient-to-b from-secondary/40 to-muted/60"
      )} />

      {/* Weather icon */}
      <div className="absolute top-4 right-4 z-10">
        <WeatherIcon />
      </div>

      {/* Zoom button */}
      {onZoomClick && (
        <button
          onClick={onZoomClick}
          className="absolute top-4 left-4 z-10 glass-subtle p-2 rounded-xl ios-press hover:bg-glass/60"
        >
          <Maximize2 className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Floating clouds */}
      {(weather === 'partly-cloudy' || weather === 'cloudy') && (
        <>
          <div className="absolute top-8 left-12 text-3xl animate-float opacity-60">☁️</div>
          <div className="absolute top-14 right-20 text-2xl animate-float opacity-40" style={{ animationDelay: '1s' }}>☁️</div>
        </>
      )}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-city-grass/70 to-city-grass/20" />

      {/* Buildings — clean glassy skyline */}
      <div className="absolute bottom-10 left-0 right-0">
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
