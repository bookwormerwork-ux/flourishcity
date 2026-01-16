import { useState, useEffect } from 'react';
import { CityStats, Task, CATEGORY_ICONS } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Maximize2, Lock } from 'lucide-react';

interface DetailedCityViewProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  activeTasks: Task[];
  isPremium: boolean;
  onUpgradeClick: () => void;
}

interface Citizen {
  id: number;
  x: number;
  y: number;
  emoji: string;
  animation: 'walk-1' | 'walk-2' | 'walk-3';
  scale: number;
}

const HAPPY_EMOJIS = ['😊', '😄', '🥰', '😎', '🤩', '😋', '🙂', '😌'];
const NEUTRAL_EMOJIS = ['😐', '🙂', '😶', '🤔', '😑'];
const SAD_EMOJIS = ['😢', '😔', '😟', '🥺', '😞'];

export function DetailedCityView({ 
  isOpen, 
  onClose, 
  stats, 
  weather, 
  activeTasks,
  isPremium,
  onUpgradeClick
}: DetailedCityViewProps) {
  const [citizens, setCitizens] = useState<Citizen[]>([]);

  // Generate citizens based on population and happiness
  useEffect(() => {
    if (!isOpen) return;

    const getEmoji = () => {
      if (stats.happiness >= 70) {
        return HAPPY_EMOJIS[Math.floor(Math.random() * HAPPY_EMOJIS.length)];
      } else if (stats.happiness >= 40) {
        return NEUTRAL_EMOJIS[Math.floor(Math.random() * NEUTRAL_EMOJIS.length)];
      }
      return SAD_EMOJIS[Math.floor(Math.random() * SAD_EMOJIS.length)];
    };

    const animations: ('walk-1' | 'walk-2' | 'walk-3')[] = ['walk-1', 'walk-2', 'walk-3'];
    
    const newCitizens: Citizen[] = Array.from({ length: Math.min(stats.population, 20) }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 50 + Math.random() * 35,
      emoji: getEmoji(),
      animation: animations[Math.floor(Math.random() * animations.length)],
      scale: 0.8 + Math.random() * 0.4
    }));

    setCitizens(newCitizens);
  }, [isOpen, stats.population, stats.happiness]);

  if (!isOpen) return null;

  // Non-premium users see a teaser
  if (!isPremium) {
    return (
      <>
        <div 
          className="fixed inset-0 overlay-blur z-40 animate-fade-in"
          onClick={onClose}
        />
        <div className="fixed inset-4 z-50 flex items-center justify-center">
          <div className="glass-strong rounded-3xl p-8 max-w-sm text-center animate-scale-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-headline text-foreground mb-2">Unlock City View</h2>
            <p className="text-caption mb-6">
              Zoom into your city, see citizens walking around, and watch your world come alive!
            </p>
            <button 
              onClick={onUpgradeClick}
              className="pill-primary w-full mb-3"
            >
              Upgrade to Pro
            </button>
            <button 
              onClick={onClose}
              className="pill-ghost w-full"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Fullscreen backdrop */}
      <div className="fixed inset-0 z-40 animate-fade-in">
        {/* Sky */}
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          weather === 'sunny' && "bg-gradient-to-b from-city-sky via-city-sky/80 to-city-grass/30",
          weather === 'partly-cloudy' && "bg-gradient-to-b from-city-sky/80 via-muted/40 to-city-grass/30",
          weather === 'cloudy' && "bg-gradient-to-b from-muted via-muted/60 to-city-grass/30",
          weather === 'rainy' && "bg-gradient-to-b from-secondary/60 via-muted/50 to-city-grass/30"
        )} />

        {/* Sun/Moon */}
        {weather === 'sunny' && (
          <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-achievement-gold to-category-personal animate-pulse-soft shadow-glow" />
        )}

        {/* Floating clouds */}
        {(weather === 'partly-cloudy' || weather === 'cloudy' || weather === 'rainy') && (
          <>
            <div className="absolute top-16 left-[10%] text-6xl animate-float opacity-60">☁️</div>
            <div className="absolute top-24 left-[40%] text-5xl animate-float-slow opacity-40" style={{ animationDelay: '1s' }}>☁️</div>
            <div className="absolute top-12 right-[20%] text-7xl animate-float opacity-50" style={{ animationDelay: '2s' }}>☁️</div>
          </>
        )}

        {/* Rain */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-6 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animation: `bounce-gentle ${1 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-city-grass to-city-grass/60" />

        {/* Buildings in background */}
        <div className="absolute bottom-[40%] left-0 right-0 flex justify-center items-end gap-4 px-8">
          {stats.buildings.slice(0, 10).map((building, i) => (
            <div 
              key={building.id}
              className="flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={cn(
                "glass rounded-xl p-4 transition-all hover:scale-105",
                building.type === 'tower' && "p-6",
                building.type === 'park' && "bg-city-grass/30"
              )}>
                <span className={cn(
                  "text-4xl",
                  building.type === 'tower' && "text-5xl"
                )}>
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

        {/* Walking citizens */}
        <div className="absolute bottom-[15%] left-0 right-0 h-[25%]">
          {citizens.map(citizen => (
            <div
              key={citizen.id}
              className={cn(
                "absolute transition-all duration-300",
                `animate-${citizen.animation}`
              )}
              style={{
                left: `${citizen.x}%`,
                top: `${citizen.y}%`,
                transform: `scale(${citizen.scale})`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              <span className="text-3xl filter drop-shadow-lg cursor-pointer hover:scale-125 transition-transform">
                {citizen.emoji}
              </span>
            </div>
          ))}
        </div>

        {/* Active tasks floating as signs */}
        {activeTasks.slice(0, 3).map((task, i) => (
          <div
            key={task.id}
            className="absolute glass-subtle rounded-2xl px-4 py-2 animate-float"
            style={{
              bottom: `${25 + i * 8}%`,
              left: `${15 + i * 25}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_ICONS[task.category]}</span>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                {task.title}
              </span>
            </div>
          </div>
        ))}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 glass-strong p-3 rounded-2xl ios-press"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        {/* Stats overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-strong rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.population}</p>
                <p className="text-micro">Citizens</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.happiness}%</p>
                <p className="text-micro">Happiness</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
                <p className="text-micro">Day Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.buildings.length}</p>
                <p className="text-micro">Buildings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
