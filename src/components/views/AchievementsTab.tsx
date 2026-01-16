import { GlassPanel } from '@/components/GlassPanel';
import { Achievement } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { Trophy, Lock, Sparkles } from 'lucide-react';

interface AchievementsTabProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  isPremium: boolean;
}

export function AchievementsTab({ 
  achievements, 
  unlockedCount, 
  totalCount,
  isPremium 
}: AchievementsTabProps) {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const tierColors = {
    bronze: 'from-achievement-bronze to-achievement-bronze/60',
    silver: 'from-achievement-silver to-achievement-silver/60',
    gold: 'from-achievement-gold to-achievement-gold/60'
  };

  const tierBg = {
    bronze: 'bg-achievement-bronze/10',
    silver: 'bg-achievement-silver/10',
    gold: 'bg-achievement-gold/10'
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline text-foreground">Achievements</h1>
        <div className="flex items-center gap-2 text-caption">
          <Trophy className="w-4 h-4 text-achievement-gold" />
          <span>{unlockedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Progress */}
      <GlassPanel>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-achievement-gold to-achievement-gold/60 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-title text-foreground mb-1">Overall Progress</p>
            <div className="h-3 bg-accent rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-achievement-gold to-achievement-gold/80 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-caption mt-1">{progressPercent}% Complete</p>
          </div>
        </div>
      </GlassPanel>

      {/* Unlocked achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="text-title text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-achievement-gold" />
            Unlocked
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {unlockedAchievements.map(achievement => (
              <GlassPanel 
                key={achievement.id}
                className={cn(
                  "relative overflow-hidden",
                  tierBg[achievement.tier]
                )}
              >
                {/* Tier indicator */}
                <div className={cn(
                  "absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-20",
                  `bg-gradient-to-br ${tierColors[achievement.tier]}`
                )} />
                
                <div className="relative">
                  <span className="text-3xl mb-2 block">{achievement.icon}</span>
                  <p className="text-body font-semibold text-foreground">
                    {achievement.title}
                  </p>
                  <p className="text-micro mt-1">
                    {achievement.description}
                  </p>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-title text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Locked
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {lockedAchievements.map(achievement => (
              <GlassPanel 
                key={achievement.id}
                className="opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-body font-medium text-foreground">
                      {achievement.title}
                    </p>
                    <p className="text-micro">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
