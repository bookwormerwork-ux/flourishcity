import { useState, useMemo } from 'react';
import { GlassPanel } from '@/components/GlassPanel';
import { Task, CATEGORY_ICONS } from '@/types/game';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Plus, 
  Bell, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ScheduleTabProps {
  tasks: Task[];
  scheduleByHour: Record<number, (Task & { scheduledTime?: string })[]>;
  onScheduleTask: (taskId: string, time: string) => void;
  onCompleteTask: (id: string) => void;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

export function ScheduleTab({ 
  tasks, 
  scheduleByHour, 
  onScheduleTask, 
  onCompleteTask,
  isPremium,
  onUpgradeClick
}: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const unscheduledTasks = useMemo(() => 
    tasks.filter(t => !t.completed && !Object.values(scheduleByHour).flat().find(s => s?.id === t.id))
  , [tasks, scheduleByHour]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const currentHour = new Date().getHours();
  
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Show working hours (6 AM - 11 PM)
  const visibleHours = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline text-foreground">Schedule</h1>
        {!isPremium && (
          <button 
            onClick={onUpgradeClick}
            className="badge-premium animate-pulse-soft"
          >
            ✨ PRO
          </button>
        )}
      </div>

      {/* Date selector */}
      <GlassPanel className="p-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={handlePrevDay}
            className="p-2 rounded-xl hover:bg-accent/50 transition-colors ios-press"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="text-center">
            <p className="text-title text-foreground">
              {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-caption">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <button 
            onClick={handleNextDay}
            className="p-2 rounded-xl hover:bg-accent/50 transition-colors ios-press"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </GlassPanel>

      {/* Premium lock for schedule editing */}
      {!isPremium && (
        <GlassPanel className="glass-premium p-4 text-center">
          <Bell className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-title text-foreground mb-1">Unlock Full Scheduling</p>
          <p className="text-caption mb-3">
            Set reminders, drag to reschedule, and sync with your calendar
          </p>
          <button 
            onClick={onUpgradeClick}
            className="pill-primary text-sm"
          >
            Upgrade to Pro
          </button>
        </GlassPanel>
      )}

      {/* Timeline */}
      <div className="space-y-1">
        {visibleHours.map(hour => {
          const tasksAtHour = scheduleByHour[hour] || [];
          const isNow = isToday && hour === currentHour;
          const isPast = isToday && hour < currentHour;
          
          return (
            <div 
              key={hour}
              className={cn(
                "flex gap-3 min-h-[60px] transition-all duration-300",
                isPast && "opacity-50"
              )}
            >
              {/* Time column */}
              <div className={cn(
                "w-16 shrink-0 text-right pr-3 py-2 border-r-2 transition-colors",
                isNow ? "border-primary" : "border-border/30"
              )}>
                <span className={cn(
                  "text-micro",
                  isNow && "text-primary font-semibold"
                )}>
                  {formatHour(hour)}
                </span>
                {isNow && (
                  <div className="mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Tasks column */}
              <div className="flex-1 py-1 space-y-1">
                {tasksAtHour.length > 0 ? (
                  tasksAtHour.map(task => task && (
                    <button
                      key={task.id}
                      onClick={() => onCompleteTask(task.id)}
                      className={cn(
                        "w-full glass-subtle rounded-xl p-3 text-left transition-all ios-press",
                        task.completed && "opacity-50 line-through"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CATEGORY_ICONS[task.category]}</span>
                        <span className="text-body text-foreground font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="h-full min-h-[40px] flex items-center">
                    <div className="w-full border-t border-dashed border-border/20" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick add unscheduled tasks */}
      {unscheduledTasks.length > 0 && (
        <GlassPanel>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-title text-foreground">Unscheduled Tasks</h2>
          </div>
          <div className="space-y-2">
            {unscheduledTasks.slice(0, 5).map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[task.category]}</span>
                  <span className="text-body text-foreground">{task.title}</span>
                </div>
                <button 
                  onClick={() => {
                    if (isPremium) {
                      const now = new Date();
                      now.setHours(now.getHours() + 1, 0, 0, 0);
                      onScheduleTask(task.id, now.toISOString());
                    } else {
                      onUpgradeClick();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
