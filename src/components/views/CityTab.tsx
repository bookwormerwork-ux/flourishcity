import { CityView } from '@/components/CityView';
import { HappinessMeter } from '@/components/HappinessMeter';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { TaskCard } from '@/components/TaskCard';
import { GlassPanel } from '@/components/GlassPanel';
import { CityStats, Task } from '@/types/game';
import { Target } from 'lucide-react';

interface CityTabProps {
  cityStats: CityStats;
  weather: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';
  todaysTasks: Task[];
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  celebrating: boolean;
}

export function CityTab({ 
  cityStats, 
  weather, 
  todaysTasks, 
  onCompleteTask, 
  onDeleteTask,
  celebrating 
}: CityTabProps) {
  const activeTodayTasks = todaysTasks.filter(t => !t.completed);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Greeting */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your city awaits
        </p>
      </div>

      {/* City View */}
      <CityView stats={cityStats} weather={weather} onCelebrate={celebrating} />

      {/* Happiness Meter */}
      <HappinessMeter value={cityStats.happiness} />

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Today's Focus */}
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

      {activeTodayTasks.length === 0 && (
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
