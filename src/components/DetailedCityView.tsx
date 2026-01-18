import { useState, useEffect, useRef } from 'react';
import { CityStats, Task, CATEGORY_ICONS } from '@/types/game';
import { cn } from '@/lib/utils';
import { X, Lock, User, Smile, Frown, Meh, Heart, Star, Sparkles } from 'lucide-react';

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
  mood: 'happy' | 'neutral' | 'sad';
  animation: 'walk-1' | 'walk-2' | 'walk-3' | 'walk-4';
  scale: number;
  delay: number;
}

interface FloatingEmoji {
  id: number;
  x: number;
  emoji: 'happy' | 'neutral' | 'sad';
  startTime: number;
}

const MOOD_ICONS = {
  happy: Smile,
  neutral: Meh,
  sad: Frown
};

const MOOD_COLORS = {
  happy: 'text-success',
  neutral: 'text-muted-foreground',
  sad: 'text-primary'
};

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
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const floatingInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate citizens based on population and happiness
  useEffect(() => {
    if (!isOpen) return;

    const getMood = (): 'happy' | 'neutral' | 'sad' => {
      const rand = Math.random() * 100;
      if (rand < stats.happiness) return 'happy';
      if (rand < stats.happiness + 20) return 'neutral';
      return 'sad';
    };

    const animations: ('walk-1' | 'walk-2' | 'walk-3' | 'walk-4')[] = ['walk-1', 'walk-2', 'walk-3', 'walk-4'];
    
    const newCitizens: Citizen[] = Array.from({ length: Math.min(stats.population, 15) }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 55 + Math.random() * 30,
      mood: getMood(),
      animation: animations[Math.floor(Math.random() * animations.length)],
      scale: 0.7 + Math.random() * 0.5,
      delay: Math.random() * 2
    }));

    setCitizens(newCitizens);
  }, [isOpen, stats.population, stats.happiness]);

  // Floating emojis effect
  useEffect(() => {
    if (!isOpen || !isPremium) return;

    const spawnFloatingEmoji = () => {
      const getMood = (): 'happy' | 'neutral' | 'sad' => {
        const rand = Math.random() * 100;
        if (rand < stats.happiness) return 'happy';
        if (rand < stats.happiness + 20) return 'neutral';
        return 'sad';
      };

      const newEmoji: FloatingEmoji = {
        id: Date.now(),
        x: 10 + Math.random() * 80,
        emoji: getMood(),
        startTime: Date.now()
      };

      setFloatingEmojis(prev => [...prev.slice(-8), newEmoji]);
    };

    // Spawn initial emoji
    spawnFloatingEmoji();
    
    floatingInterval.current = setInterval(spawnFloatingEmoji, 2500);

    return () => {
      if (floatingInterval.current) {
        clearInterval(floatingInterval.current);
      }
    };
  }, [isOpen, isPremium, stats.happiness]);

  // Cleanup old floating emojis
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFloatingEmojis(prev => prev.filter(e => now - e.startTime < 3000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  if (!isOpen) return null;

  // Non-premium users see a teaser
  if (!isPremium) {
    return (
      <>
        <div 
          className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in"
          onClick={onClose}
        />
        <div className="fixed inset-4 z-50 flex items-center justify-center">
          <div className="glass-ultra rounded-[2rem] p-8 max-w-sm text-center animate-scale-in">
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 animate-breathe">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-headline text-foreground mb-2">Unlock City View</h2>
            <p className="text-caption mb-6">
              Zoom into your city, see citizens walking around, and watch your world come alive!
            </p>
            <button 
              onClick={onUpgradeClick}
              className="pill-primary w-full mb-3 transition-all duration-300 hover:scale-[1.02]"
            >
              Upgrade to Pro
            </button>
            <button 
              onClick={onClose}
              className="pill-ghost w-full transition-all duration-300"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </>
    );
  }

  const MoodIcon = ({ mood, className }: { mood: 'happy' | 'neutral' | 'sad'; className?: string }) => {
    const Icon = MOOD_ICONS[mood];
    return <Icon className={cn('w-6 h-6', MOOD_COLORS[mood], className)} />;
  };

  return (
    <>
      {/* Fullscreen backdrop */}
      <div className="fixed inset-0 z-40 animate-fade-in overflow-hidden">
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
            <div className="absolute top-16 left-[10%] animate-float opacity-60">
              <div className="w-16 h-10 bg-glass/40 rounded-full blur-sm" />
            </div>
            <div className="absolute top-24 left-[40%] animate-float-slow opacity-40" style={{ animationDelay: '1s' }}>
              <div className="w-20 h-12 bg-glass/50 rounded-full blur-sm" />
            </div>
            <div className="absolute top-12 right-[20%] animate-float opacity-50" style={{ animationDelay: '2s' }}>
              <div className="w-24 h-14 bg-glass/45 rounded-full blur-sm" />
            </div>
          </>
        )}

        {/* Rain */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-primary/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animation: `bounce-gentle ${1.5 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-city-grass to-city-grass/60" />

        {/* Buildings in background */}
        <div className="absolute bottom-[40%] left-0 right-0 flex justify-center items-end gap-3 px-4">
          {stats.buildings.slice(0, 8).map((building, i) => (
            <div 
              key={building.id}
              className="flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={cn(
                "glass rounded-2xl p-3 transition-all duration-500 hover:scale-105",
                building.type === 'tower' && "p-4",
                building.type === 'park' && "bg-city-grass/30"
              )}>
                <div className={cn(
                  "flex items-center justify-center",
                  building.type === 'tower' ? "w-10 h-10" : "w-8 h-8"
                )}>
                  {building.type === 'house' && <User className="w-full h-full text-foreground/70" />}
                  {building.type === 'school' && <Star className="w-full h-full text-category-study" />}
                  {building.type === 'office' && <Sparkles className="w-full h-full text-category-work" />}
                  {building.type === 'gym' && <Heart className="w-full h-full text-category-habits" />}
                  {building.type === 'park' && <Smile className="w-full h-full text-success" />}
                  {building.type === 'tower' && <Star className="w-full h-full text-achievement-gold" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating mood emojis (from city to sky) */}
        {floatingEmojis.map(emoji => (
          <div
            key={emoji.id}
            className="absolute animate-float-up-fade pointer-events-none"
            style={{
              left: `${emoji.x}%`,
              bottom: '30%'
            }}
          >
            <div className="glass-subtle rounded-full p-2">
              <MoodIcon mood={emoji.emoji} className="w-5 h-5" />
            </div>
          </div>
        ))}

        {/* Walking citizens */}
        <div className="absolute bottom-[12%] left-0 right-0 h-[28%]">
          {citizens.map(citizen => (
            <div
              key={citizen.id}
              className={cn(
                "absolute transition-all duration-700",
                `animate-${citizen.animation}`
              )}
              style={{
                left: `${citizen.x}%`,
                top: `${citizen.y}%`,
                transform: `scale(${citizen.scale})`,
                animationDelay: `${citizen.delay}s`
              }}
            >
              <div className="glass-subtle rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-all duration-300">
                <MoodIcon mood={citizen.mood} className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Active tasks floating as signs */}
        {activeTasks.slice(0, 3).map((task, i) => (
          <div
            key={task.id}
            className="absolute glass rounded-2xl px-4 py-2 animate-float shadow-lg"
            style={{
              bottom: `${28 + i * 7}%`,
              left: `${12 + i * 28}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_ICONS[task.category]}</span>
              <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                {task.title}
              </span>
            </div>
          </div>
        ))}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 glass-strong p-3 rounded-2xl ios-press transition-all duration-300 hover:scale-105"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>

        {/* Stats overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-ultra rounded-[2rem] p-5">
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
