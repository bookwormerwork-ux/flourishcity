import { useState, useEffect, useRef } from 'react';
import { CityStats, Task, CATEGORY_ICONS } from '@/types/game';
import { cn } from '@/lib/utils';
import { GlassyBuildings } from './GlassyBuildings';
import { SkyLayer } from './SkyLayer';
import { PinchZoom } from './PinchZoom';
import { useSkyState } from '@/hooks/useSkyState';
import {
  X,
  Lock,
  Smile,
  Frown,
  Meh,
  Users,
  TrendingUp,
  Flame,
  Building2,
  Target,
  Trophy,
  Crown,
  Zap,
} from 'lucide-react';

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

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const MOOD_ICONS = {
  happy: Smile,
  neutral: Meh,
  sad: Frown
};

const MOOD_COLORS = {
  happy: 'text-success',
  neutral: 'text-muted-foreground',
  sad: 'text-destructive'
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
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [showPeopleStats, setShowPeopleStats] = useState(false);
  const floatingInterval = useRef<NodeJS.Timeout | null>(null);
  const cloudAnimationRef = useRef<number | null>(null);

  // Generate clouds
  useEffect(() => {
    if (!isOpen) return;

    const initialClouds: Cloud[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 120 - 10,
      y: 5 + Math.random() * 25,
      size: 60 + Math.random() * 80,
      speed: 0.02 + Math.random() * 0.03,
      opacity: 0.3 + Math.random() * 0.4
    }));
    setClouds(initialClouds);

    const animateClouds = () => {
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: cloud.x > 110 ? -20 : cloud.x + cloud.speed
      })));
      cloudAnimationRef.current = requestAnimationFrame(animateClouds);
    };
    
    cloudAnimationRef.current = requestAnimationFrame(animateClouds);

    return () => {
      if (cloudAnimationRef.current) {
        cancelAnimationFrame(cloudAnimationRef.current);
      }
    };
  }, [isOpen]);

  // Generate citizens
  useEffect(() => {
    if (!isOpen) return;

    const getMood = (): 'happy' | 'neutral' | 'sad' => {
      const rand = Math.random() * 100;
      if (rand < stats.happiness) return 'happy';
      if (rand < stats.happiness + 20) return 'neutral';
      return 'sad';
    };

    const animations: ('walk-1' | 'walk-2' | 'walk-3' | 'walk-4')[] = ['walk-1', 'walk-2', 'walk-3', 'walk-4'];
    
    const newCitizens: Citizen[] = Array.from({ length: Math.min(stats.population, 12) }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 15 + Math.random() * 50,
      mood: getMood(),
      animation: animations[Math.floor(Math.random() * animations.length)],
      scale: 0.8 + Math.random() * 0.4,
      delay: Math.random() * 2
    }));

    setCitizens(newCitizens);
  }, [isOpen, stats.population, stats.happiness]);

  // Floating emojis
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

      setFloatingEmojis(prev => [...prev.slice(-6), newEmoji]);
    };

    spawnFloatingEmoji();
    floatingInterval.current = setInterval(spawnFloatingEmoji, 3000);

    return () => {
      if (floatingInterval.current) {
        clearInterval(floatingInterval.current);
      }
    };
  }, [isOpen, isPremium, stats.happiness]);

  // Cleanup old emojis
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFloatingEmojis(prev => prev.filter(e => now - e.startTime < 4000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  if (!isOpen) return null;

  // Non-premium teaser
  if (!isPremium) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background animate-fade-in">
        <div className="glass-ultra rounded-[2rem] p-8 max-w-sm text-center animate-scale-in mx-4">
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
    );
  }

  const MoodIcon = ({ mood, className }: { mood: 'happy' | 'neutral' | 'sad'; className?: string }) => {
    const Icon = MOOD_ICONS[mood];
    return <Icon className={cn('w-6 h-6', MOOD_COLORS[mood], className)} />;
  };

  const happyCitizens = citizens.filter(c => c.mood === 'happy').length;
  const neutralCitizens = citizens.filter(c => c.mood === 'neutral').length;
  const sadCitizens = citizens.filter(c => c.mood === 'sad').length;
  const citizenCount = citizens.length || 1;

  return (
    <div className="absolute inset-0 z-[100] animate-fade-in overflow-hidden">
      {/* Full sky background - SOLID, no blur */}
      <div className={cn(
        "absolute inset-0",
        weather === 'sunny' && "bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#87CEEB]",
        weather === 'partly-cloudy' && "bg-gradient-to-b from-[#87CEEB] via-[#D3D3D3] to-[#87CEEB]",
        weather === 'cloudy' && "bg-gradient-to-b from-[#778899] via-[#B0C4DE] to-[#778899]",
        weather === 'rainy' && "bg-gradient-to-b from-[#4A5568] via-[#718096] to-[#4A5568]"
      )} />

      {/* Sun */}
      {weather === 'sunny' && (
        <div className="absolute top-16 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 animate-pulse-soft shadow-[0_0_60px_30px_rgba(255,200,0,0.3)]" />
      )}

      {/* Animated clouds */}
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          className="absolute"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            opacity: cloud.opacity
          }}
        >
          <div 
            className="bg-white rounded-full blur-sm"
            style={{
              width: cloud.size,
              height: cloud.size * 0.5
            }}
          />
        </div>
      ))}

      {/* Rain */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-6 bg-white/30 rounded-full"
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
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#228B22] via-[#32CD32]/80 to-transparent" />

      {/* Buildings — full glassy skyline */}
      <div className="absolute bottom-[30%] left-0 right-0">
        <GlassyBuildings buildings={stats.buildings} max={30} scale="md" />
      </div>

      {/* Floating mood icons */}
      {floatingEmojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute animate-float-up-fade pointer-events-none"
          style={{
            left: `${emoji.x}%`,
            bottom: '35%'
          }}
        >
          <div className="glass-subtle rounded-full p-2">
            <MoodIcon mood={emoji.emoji} className="w-5 h-5" />
          </div>
        </div>
      ))}

      {/* Walking citizens */}
      <div className="absolute bottom-[8%] left-0 right-0 h-[27%]">
        {citizens.map(citizen => (
          <button
            key={citizen.id}
            onClick={() => setShowPeopleStats(true)}
            className={cn(
              "absolute transition-all duration-700 ios-press",
              `animate-${citizen.animation}`
            )}
            style={{
              left: `${citizen.x}%`,
              top: `${citizen.y}%`,
              transform: `scale(${citizen.scale})`,
              animationDelay: `${citizen.delay}s`
            }}
          >
            <div className="glass-strong rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-300">
              <MoodIcon mood={citizen.mood} className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>

      {/* Task signs */}
      {activeTasks.slice(0, 2).map((task, i) => (
        <div
          key={task.id}
          className="absolute glass rounded-xl px-3 py-2 animate-float shadow-lg"
          style={{
            bottom: `${40 + i * 8}%`,
            left: `${10 + i * 35}%`,
            animationDelay: `${i * 0.5}s`
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{CATEGORY_ICONS[task.category]}</span>
            <span className="text-xs font-medium text-foreground max-w-[80px] truncate">
              {task.title}
            </span>
          </div>
        </div>
      ))}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 glass-strong p-3 rounded-2xl ios-press transition-all duration-300 hover:scale-105 z-10"
      >
        <X className="w-6 h-6 text-foreground" />
      </button>

      {/* People stats button */}
      <button
        onClick={() => setShowPeopleStats(true)}
        className="absolute top-4 left-4 glass-strong p-3 rounded-2xl ios-press transition-all duration-300 hover:scale-105 z-10"
      >
        <Users className="w-6 h-6 text-foreground" />
      </button>

      {/* Bottom stats */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="glass-ultra rounded-2xl p-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.population}</p>
              <p className="text-micro">Citizens</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.happiness}%</p>
              <p className="text-micro">Happiness</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-micro">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{stats.buildings.length}</p>
              <p className="text-micro">Buildings</p>
            </div>
          </div>
        </div>
      </div>

      {/* People Stats Panel */}
      {showPeopleStats && (
        <>
          <div 
            className="absolute inset-0 z-[110] bg-black/50"
            onClick={() => setShowPeopleStats(false)}
          />
          <div className="absolute inset-x-4 top-16 bottom-16 z-[120] flex items-center justify-center animate-scale-in">
            <div className="glass-ultra rounded-[2rem] p-6 max-w-sm w-full max-h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-headline text-foreground flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  City Population
                </h2>
                <button 
                  onClick={() => setShowPeopleStats(false)}
                  className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300 ios-press"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* Population overview */}
              <div className="glass rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stats.population}</p>
                    <p className="text-caption">Total Citizens</p>
                  </div>
                </div>
                
                {/* Mood breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="w-5 h-5 text-success" />
                      <span className="text-body">Happy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-title text-foreground">{happyCitizens}</span>
                      <div className="w-20 h-2 bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${(happyCitizens / citizenCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Meh className="w-5 h-5 text-muted-foreground" />
                      <span className="text-body">Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-title text-foreground">{neutralCitizens}</span>
                      <div className="w-20 h-2 bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-muted-foreground rounded-full transition-all duration-500"
                          style={{ width: `${(neutralCitizens / citizenCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Frown className="w-5 h-5 text-destructive" />
                      <span className="text-body">Sad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-title text-foreground">{sadCitizens}</span>
                      <div className="w-20 h-2 bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive rounded-full transition-all duration-500"
                          style={{ width: `${(sadCitizens / citizenCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass rounded-xl p-3 text-center">
                  <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{stats.happiness}%</p>
                  <p className="text-micro">Happiness</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Flame className="w-6 h-6 text-category-personal mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
                  <p className="text-micro">Day Streak</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Building2 className="w-6 h-6 text-category-work mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{stats.buildings.length}</p>
                  <p className="text-micro">Buildings</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <Target className="w-6 h-6 text-success mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalTasksCompleted}</p>
                  <p className="text-micro">Tasks Done</p>
                </div>
              </div>
              
              {/* Ranking */}
              <div className="glass-premium rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-achievement-gold" />
                  <h3 className="text-title text-foreground">Your Ranking</h3>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-achievement-gold" />
                    <span className="text-body">League</span>
                  </div>
                  <span className="badge-premium">
                    {stats.totalTasksCompleted >= 100 ? 'Diamond' :
                     stats.totalTasksCompleted >= 50 ? 'Platinum' :
                     stats.totalTasksCompleted >= 25 ? 'Gold' :
                     stats.totalTasksCompleted >= 10 ? 'Silver' : 'Bronze'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-body">Weekly XP</span>
                  </div>
                  <span className="text-title text-foreground">{stats.totalTasksCompleted * 10} XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <span className="text-body">Global Rank</span>
                  </div>
                  <span className="text-title text-foreground">#{Math.max(1, 1000 - stats.totalTasksCompleted * 5)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
