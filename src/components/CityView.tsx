import { CityStats } from '@/types/game';
import { cn } from '@/lib/utils';
import { Sun, Cloud, CloudRain, Sparkles, Users, Maximize2 } from 'lucide-react';

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

      {/* Buildings */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-end gap-2 px-4">
        {stats.buildings.slice(0, 8).map((building, index) => (
          <div
            key={building.id}
            className={cn(
              "flex flex-col items-center transition-all duration-500 animate-fade-in",
              onCelebrate && "animate-bounce-gentle"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="glass-subtle rounded-xl p-2 hover:scale-110 transition-transform cursor-pointer">
              <span className="text-2xl">
                {building.type === 'house' && '🏠'}
                {building.type === 'school' && '🏫'}
                {building.type === 'office' && '🏢'}
                {building.type === 'gym' && '🏋️'}
                {building.type === 'park' && '🌳'}
                {building.type === 'tower' && '🏙️'}
              </span>
            </div>
          </div>
        ))}
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
