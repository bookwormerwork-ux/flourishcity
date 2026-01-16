import { CityStats } from '@/types/game';
import { cn } from '@/lib/utils';
import { Sun, Cloud, CloudRain, Sparkles, Users, Building2, TreePine, Home } from 'lucide-react';

interface CityViewProps {
  stats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  onCelebrate?: boolean;
}

const BuildingIcon = ({ type, level }: { type: string; level: number }) => {
  const size = 24 + level * 4;
  const icons: Record<string, React.ReactNode> = {
    house: <Home size={size} className="text-category-personal" />,
    school: <Building2 size={size} className="text-category-study" />,
    office: <Building2 size={size} className="text-category-work" />,
    gym: <Building2 size={size} className="text-category-habits" />,
    park: <TreePine size={size} className="text-city-grass" />,
    tower: <Building2 size={size} className="text-primary" />
  };
  return icons[type] || <Building2 size={size} />;
};

export function CityView({ stats, weather, onCelebrate }: CityViewProps) {
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
      "relative w-full h-64 rounded-3xl overflow-hidden",
      onCelebrate && "animate-celebrate"
    )}>
      {/* Sky gradient */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        weather === 'sunny' && "bg-gradient-to-b from-city-sky to-primary/30",
        weather === 'partly-cloudy' && "bg-gradient-to-b from-city-sky/80 to-muted/30",
        weather === 'cloudy' && "bg-gradient-to-b from-muted to-muted/50",
        weather === 'rainy' && "bg-gradient-to-b from-secondary/40 to-muted/60"
      )} />

      {/* Weather icon */}
      <div className="absolute top-4 right-4 z-10">
        <WeatherIcon />
      </div>

      {/* Floating clouds */}
      {(weather === 'partly-cloudy' || weather === 'cloudy') && (
        <>
          <div className="absolute top-8 left-8 animate-float opacity-60">
            <Cloud className="w-12 h-8 text-card" />
          </div>
          <div className="absolute top-12 right-24 animate-float opacity-40" style={{ animationDelay: '1s' }}>
            <Cloud className="w-10 h-6 text-card" />
          </div>
        </>
      )}

      {/* Rain drops */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-4 bg-primary/30 rounded-full animate-bounce-gentle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-city-grass/60 to-city-grass/20" />

      {/* Buildings */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center items-end gap-3 px-4">
        {stats.buildings.slice(0, 8).map((building, index) => (
          <div
            key={building.id}
            className={cn(
              "flex flex-col items-center justify-end transition-all duration-500 animate-fade-in",
              onCelebrate && "animate-bounce-gentle"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="glass-subtle rounded-lg p-2 hover:scale-110 transition-transform cursor-pointer">
              <BuildingIcon type={building.type} level={building.level} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
        <div className="glass-subtle rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{stats.population}</span>
        </div>
        
        {stats.streak > 0 && (
          <div className="glass-subtle rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-category-personal" />
            <span className="text-sm font-semibold text-foreground">{stats.streak} day streak</span>
          </div>
        )}
      </div>
    </div>
  );
}
