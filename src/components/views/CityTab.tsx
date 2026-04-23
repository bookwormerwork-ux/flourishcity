import { CityView } from '@/components/CityView';
import { HappinessMeter } from '@/components/HappinessMeter';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { TaskCard } from '@/components/TaskCard';
import { GlassPanel } from '@/components/GlassPanel';
import { SpotifyPlayerCard } from '@/components/SpotifyMiniPlayer';
import { CitizenDemandBubble } from '@/components/CitizenDemandBubble';
import { CityStats, Task } from '@/types/game';
import { Target, AlertTriangle } from 'lucide-react';

interface CityTabProps {
  cityStats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  todaysTasks: Task[];
  debtTasks: Task[];
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDismissDemand: (id: string) => void;
  celebrating: boolean;
  onZoomClick?: () => void;
}

export function CityTab({
  cityStats,
  weather,
  todaysTasks,
  debtTasks,
  onCompleteTask,
  onDeleteTask,
  onDismissDemand,
  celebrating,
  onZoomClick,
}: CityTabProps) {
  const activeTodayTasks = todaysTasks.filter((t) => !t.completed && !t.isDebt);
  const latestDemand = (cityStats.citizenDemands || []).find((d) => !d.dismissed);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, Mayor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {cityStats.cityName || 'Flourish'} awaits
          {debtTasks.length > 0 && (
            <span className="ml-2 text-destructive font-medium">
              ⚠️ {debtTasks.length} debt{debtTasks.length === 1 ? '' : 's'}
            </span>
          )}
        </p>
      </div>

      <div className="relative">
        <CityView
          stats={cityStats}
          weather={weather}
          onCelebrate={celebrating}
          onZoomClick={onZoomClick}
        />
        {latestDemand && (
          <CitizenDemandBubble demand={latestDemand} onDismiss={onDismissDemand} />
        )}
      </div>

      <HappinessMeter value={cityStats.happiness} />

      <MotivationalQuote />

      <SpotifyPlayerCard variant="full" autoplay />

      {activeTodayTasks.length > 0 && (
        <GlassPanel>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Today's Focus</h2>
          </div>
          <div className="space-y-2">
            {activeTodayTasks.slice(0, 3).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </GlassPanel>
      )}

      {debtTasks.length > 0 && (
        <GlassPanel className="border border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-semibold text-foreground">City Debts</h2>
          </div>
          <p className="text-micro mb-3">
            These tasks slipped past 3× their estimate. Finish them to repair the city.
          </p>
          <div className="space-y-2">
            {debtTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </GlassPanel>
      )}

      {activeTodayTasks.length === 0 && debtTasks.length === 0 && (
        <GlassPanel variant="subtle" className="text-center py-8">
          <p className="text-muted-foreground">
            🌟 No tasks for today — your citizens are at peace!
          </p>
        </GlassPanel>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
