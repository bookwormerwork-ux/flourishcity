import { CityStats, Task, CATEGORY_LABELS, TaskCategory } from '@/types/game';
import { GlassPanel } from '@/components/GlassPanel';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  Flame, 
  CheckCircle2, 
  Building2,
  Calendar
} from 'lucide-react';

interface StatsTabProps {
  cityStats: CityStats;
  tasks: Task[];
}

export function StatsTab({ cityStats, tasks }: StatsTabProps) {
  const completedByCategory = tasks
    .filter(t => t.completed)
    .reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<TaskCategory, number>);

  const totalCompleted = cityStats.totalTasksCompleted;
  const activeTasks = tasks.filter(t => !t.completed).length;
  
  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekCompleted = tasks.filter(t => 
    t.completed && t.completedAt && new Date(t.completedAt) >= weekAgo
  ).length;

  const stats = [
    {
      icon: Users,
      label: 'Population',
      value: cityStats.population,
      color: 'text-primary'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${cityStats.streak} days`,
      color: 'text-category-personal'
    },
    {
      icon: CheckCircle2,
      label: 'Total Completed',
      value: totalCompleted,
      color: 'text-category-habits'
    },
    {
      icon: Building2,
      label: 'Buildings',
      value: cityStats.buildings.length,
      color: 'text-category-work'
    }
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Progress</h1>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassPanel key={stat.label} className="text-center">
              <Icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassPanel>
          );
        })}
      </div>

      {/* Weekly summary */}
      <GlassPanel>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">This Week</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{thisWeekCompleted}</p>
            <p className="text-sm text-muted-foreground">tasks completed</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">{activeTasks}</p>
            <p className="text-sm text-muted-foreground">still active</p>
          </div>
        </div>
      </GlassPanel>

      {/* Category breakdown */}
      <GlassPanel>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">By Category</h2>
        </div>
        <div className="space-y-3">
          {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((category) => {
            const count = completedByCategory[category] || 0;
            const maxCount = Math.max(...Object.values(completedByCategory), 1);
            const percentage = (count / maxCount) * 100;
            
            const colors = {
              study: 'bg-category-study',
              work: 'bg-category-work',
              habits: 'bg-category-habits',
              personal: 'bg-category-personal'
            };

            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{CATEGORY_LABELS[category]}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", colors[category])}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
