import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from '@/components/GlassPanel';
import { CityStats } from '@/types/game';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLeaderboard, useSyncMyScore } from '@/hooks/useLeaderboard';
import { useFriends } from '@/hooks/useFriends';
import { 
  Trophy, 
  Crown, 
  Zap, 
  Flame, 
  Target,
  Medal,
  TrendingUp,
  Clock,
  Gift,
  Star,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface LeaderboardTabProps {
  cityStats: CityStats;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

interface LeaderboardPlayer {
  id: number;
  name: string;
  xp: number;
  streak: number;
  rank: number;
  isYou?: boolean;
  avatar: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xpReward: number;
  icon: typeof Trophy;
  endsIn: string;
}

const MOCK_LEADERBOARD: LeaderboardPlayer[] = [
  { id: 1, name: "Alex M.", xp: 2450, streak: 21, rank: 1, avatar: "🦊" },
  { id: 2, name: "Sarah K.", xp: 2180, streak: 14, rank: 2, avatar: "🐰" },
  { id: 3, name: "Mike R.", xp: 1920, streak: 18, rank: 3, avatar: "🐼" },
  { id: 4, name: "Emma L.", xp: 1650, streak: 9, rank: 4, avatar: "🦄" },
  { id: 5, name: "You", xp: 0, streak: 0, rank: 5, isYou: true, avatar: "⭐" },
  { id: 6, name: "Chris P.", xp: 1200, streak: 5, rank: 6, avatar: "🐱" },
  { id: 7, name: "Lisa W.", xp: 980, streak: 7, rank: 7, avatar: "🦋" },
];

export function LeaderboardTab({ cityStats, isPremium, onUpgradeClick }: LeaderboardTabProps) {
  const [activeSection, setActiveSection] = useState<'leaderboard' | 'challenges'>('leaderboard');
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rows: onlineRows } = useLeaderboard();
  const { friends } = useFriends();

  const yourXP = cityStats.totalTasksCompleted * 10;

  useSyncMyScore(yourXP, cityStats.streak, cityStats.totalTasksCompleted);

  const leaderboard = useMemo<LeaderboardPlayer[]>(() => {
    if (scope === 'friends') {
      const accepted = friends.filter((f) => f.status === 'accepted');
      const list: LeaderboardPlayer[] = accepted.map((f, i) => ({
        id: i + 1,
        name: f.display_name,
        xp: f.xp,
        streak: f.streak,
        rank: i + 1,
        avatar: f.avatar,
      }));
      if (user) {
        list.push({ id: 9999, name: 'You', xp: yourXP, streak: cityStats.streak, rank: 0, avatar: '⭐', isYou: true });
      }
      return list.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
    }
    if (onlineRows.length > 0) {
      const mapped = onlineRows.map((r, i) => ({
        id: i + 1,
        name: r.display_name,
        xp: r.xp,
        streak: r.streak,
        rank: i + 1,
        avatar: r.avatar,
        isYou: user?.id === r.user_id,
      }));
      if (user && !mapped.some(m => m.isYou)) {
        mapped.push({ id: 9999, name: 'You', xp: yourXP, streak: cityStats.streak, rank: mapped.length + 1, avatar: '⭐', isYou: true });
      }
      return mapped.sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
    }
    return MOCK_LEADERBOARD.map(p =>
      p.isYou ? { ...p, xp: yourXP, streak: cityStats.streak } : p
    ).sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));
  }, [scope, friends, yourXP, cityStats.streak, onlineRows, user]);

  const yourRank = leaderboard.find(p => p.isYou)?.rank ?? leaderboard.length + 1;

  const league = useMemo(() => {
    if (cityStats.totalTasksCompleted >= 100) return { name: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (cityStats.totalTasksCompleted >= 50) return { name: 'Platinum', color: 'text-gray-300', bg: 'bg-gray-400/20' };
    if (cityStats.totalTasksCompleted >= 25) return { name: 'Gold', color: 'text-achievement-gold', bg: 'bg-achievement-gold/20' };
    if (cityStats.totalTasksCompleted >= 10) return { name: 'Silver', color: 'text-achievement-silver', bg: 'bg-achievement-silver/20' };
    return { name: 'Bronze', color: 'text-achievement-bronze', bg: 'bg-achievement-bronze/20' };
  }, [cityStats.totalTasksCompleted]);

  const weeklyChallenges: WeeklyChallenge[] = useMemo(() => [
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      target: 7,
      current: Math.min(cityStats.streak, 7),
      xpReward: 100,
      icon: Flame,
      endsIn: '4d 12h'
    },
    {
      id: 'task-crusher',
      title: 'Task Crusher',
      description: 'Complete 20 tasks this week',
      target: 20,
      current: Math.min(cityStats.totalTasksCompleted % 20 || cityStats.totalTasksCompleted, 20),
      xpReward: 150,
      icon: Target,
      endsIn: '4d 12h'
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete 5 tasks before 9 AM',
      target: 5,
      current: 2,
      xpReward: 75,
      icon: Clock,
      endsIn: '4d 12h'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Complete all daily tasks for 3 days',
      target: 3,
      current: 1,
      xpReward: 200,
      icon: Star,
      endsIn: '4d 12h'
    }
  ], [cityStats.streak, cityStats.totalTasksCompleted]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline text-foreground">Compete</h1>
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", league.bg)}>
          <Crown className={cn("w-4 h-4", league.color)} />
          <span className={cn("text-sm font-semibold", league.color)}>{league.name}</span>
        </div>
      </div>

      {/* Your stats card */}
      <GlassPanel variant="strong" className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl">
            ⭐
          </div>
          <div className="flex-1">
            <p className="text-body text-muted-foreground">Your Stats</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{yourXP}</span>
              <span className="text-caption">XP</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-caption">Global Rank</p>
            <p className="text-xl font-bold text-primary">#{yourRank}</p>
          </div>
        </div>
      </GlassPanel>

      {/* Section toggle */}
      <div className="glass rounded-2xl p-1 flex">
        <button
          onClick={() => setActiveSection('leaderboard')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
            activeSection === 'leaderboard' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveSection('challenges')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
            activeSection === 'challenges' 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Challenges
        </button>
      </div>

      {/* Leaderboard */}
      {activeSection === 'leaderboard' && (
        <div className="space-y-2 animate-fade-in">
          {/* Global / Friends scope */}
          <div className="glass rounded-xl p-1 flex mb-2 relative z-0">
            {(['global', 'friends'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all',
                  scope === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {scope === 'friends' && leaderboard.length <= 1 && (
            <p className="text-caption text-center py-3">
              Add friends in Settings to compete privately.
            </p>
          )}
          {/* Top 3 podium */}
          <div className="flex items-end justify-center gap-2 mb-4 h-28 relative z-10">
            {/* Second place */}
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">{leaderboard[1]?.avatar}</span>
              <div className="glass rounded-xl px-3 py-2 text-center w-20">
                <Medal className="w-5 h-5 text-achievement-silver mx-auto" />
                <p className="text-micro truncate">{leaderboard[1]?.name}</p>
                <p className="text-xs font-bold text-foreground">{leaderboard[1]?.xp} XP</p>
              </div>
            </div>
            
            {/* First place */}
            <div className="flex flex-col items-center -mt-4">
              <span className="text-3xl mb-1">{leaderboard[0]?.avatar}</span>
              <div className="glass-strong rounded-xl px-4 py-3 text-center w-24 ring-2 ring-achievement-gold/50">
                <Crown className="w-6 h-6 text-achievement-gold mx-auto" />
                <p className="text-sm truncate font-medium">{leaderboard[0]?.name}</p>
                <p className="text-sm font-bold text-foreground">{leaderboard[0]?.xp} XP</p>
              </div>
            </div>
            
            {/* Third place */}
            <div className="flex flex-col items-center mt-2">
              <span className="text-2xl mb-1">{leaderboard[2]?.avatar}</span>
              <div className="glass rounded-xl px-3 py-2 text-center w-20">
                <Medal className="w-5 h-5 text-achievement-bronze mx-auto" />
                <p className="text-micro truncate">{leaderboard[2]?.name}</p>
                <p className="text-xs font-bold text-foreground">{leaderboard[2]?.xp} XP</p>
              </div>
            </div>
          </div>

          {/* Rest of leaderboard */}
          {leaderboard.slice(3).map(player => (
            <div 
              key={player.id}
              className={cn(
                "glass rounded-xl p-3 flex items-center gap-3 transition-all duration-300",
                player.isYou && "ring-2 ring-primary/50 glass-strong"
              )}
            >
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                {player.rank}
              </span>
              <span className="text-xl">{player.avatar}</span>
              <div className="flex-1">
                <p className={cn("text-body font-medium", player.isYou && "text-primary")}>
                  {player.name}
                </p>
                <div className="flex items-center gap-2">
                  <Flame className="w-3 h-3 text-category-personal" />
                  <span className="text-micro">{player.streak} day streak</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{player.xp}</p>
                <p className="text-micro">XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Challenges */}
      {activeSection === 'challenges' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-caption">Ends in {weeklyChallenges[0].endsIn}</p>
            <Gift className="w-4 h-4 text-primary" />
          </div>

          {weeklyChallenges.map(challenge => {
            const progress = (challenge.current / challenge.target) * 100;
            const isComplete = challenge.current >= challenge.target;
            const Icon = challenge.icon;

            return (
              <GlassPanel 
                key={challenge.id} 
                variant={isComplete ? "strong" : "subtle"}
                className={cn("p-4", isComplete && "ring-2 ring-success/30")}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isComplete ? "bg-success/20" : "bg-primary/10"
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : (
                      <Icon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-title text-foreground">{challenge.title}</h3>
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-bold">+{challenge.xpReward} XP</span>
                      </div>
                    </div>
                    <p className="text-caption mb-2">{challenge.description}</p>
                    
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isComplete ? "bg-success" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-micro w-12 text-right">
                        {challenge.current}/{challenge.target}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            );
          })}

          {/* Premium challenges unlock */}
          {!isPremium && (
            <button 
              onClick={onUpgradeClick}
              className="w-full glass-premium rounded-2xl p-4 flex items-center justify-between ios-press"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-title text-foreground">Unlock More Challenges</p>
                  <p className="text-caption">Get exclusive weekly & daily challenges</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
