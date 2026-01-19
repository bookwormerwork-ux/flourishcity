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
  ChevronRight,
  Target,
  X,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

type ZoomLevel = 'day' | 'month' | 'year';

interface ScheduleTabProps {
  tasks: Task[];
  scheduleByHour: Record<number, (Task & { scheduledTime?: string })[]>;
  onScheduleTask: (taskId: string, time: string) => void;
  onCompleteTask: (id: string) => void;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function ScheduleTab({ 
  tasks, 
  scheduleByHour, 
  onScheduleTask, 
  onCompleteTask,
  isPremium,
  onUpgradeClick
}: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const unscheduledTasks = useMemo(() => 
    tasks.filter(t => !t.completed && !Object.values(scheduleByHour).flat().find(s => s?.id === t.id))
  , [tasks, scheduleByHour]);

  // Get task count for a specific date
  const getTaskCountForDate = (date: Date) => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === date.toDateString();
    }).length;
  };

  // Get task count for a month
  const getTaskCountForMonth = (month: number, year: number) => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year;
    }).length;
  };

  // Get completed count for a month
  const getCompletedForMonth = (month: number, year: number) => {
    return tasks.filter(t => {
      if (!t.completedAt) return false;
      const taskDate = new Date(t.completedAt);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year && t.completed;
    }).length;
  };

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

  // Cycle zoom: day -> month -> year -> day
  const handleZoomCycle = () => {
    if (zoomLevel === 'day') {
      setZoomLevel('month');
    } else if (zoomLevel === 'month') {
      setZoomLevel('year');
    } else {
      setZoomLevel('day');
    }
  };

  // Handle date selection from month view
  const handleDaySelect = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(newDate);
    setZoomLevel('day');
  };

  // Handle month selection from year view
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setZoomLevel('month');
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setZoomLevel('month');
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Show working hours (6 AM - 11 PM)
  const visibleHours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Focus mode overlay
  if (focusTask) {
    return (
      <>
        <div className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in" onClick={() => setFocusTask(null)} />
        <div className="fixed inset-6 z-50 flex flex-col items-center justify-center animate-scale-in">
          <div className="glass-ultra rounded-[2rem] p-8 max-w-sm w-full text-center relative">
            <button 
              onClick={() => setFocusTask(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-accent/50 transition-all duration-300"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 animate-breathe">
              <Target className="w-10 h-10 text-primary" />
            </div>
            
            <p className="text-caption mb-2">Focus Mode</p>
            <h2 className="text-headline text-foreground mb-4">{focusTask.title}</h2>
            
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl">{CATEGORY_ICONS[focusTask.category]}</span>
              <span className="text-body text-muted-foreground capitalize">{focusTask.category}</span>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  onCompleteTask(focusTask.id);
                  setFocusTask(null);
                }}
                className="w-full pill-primary py-4 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Mark Complete
              </button>
              <button 
                onClick={() => setFocusTask(null)}
                className="w-full pill-ghost py-3 transition-all duration-300"
              >
                Back to Schedule
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Year View
  if (zoomLevel === 'year') {
    const years = [selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2];
    
    return (
      <div className="space-y-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-headline text-foreground">Calendar</h1>
          {!isPremium && (
            <button onClick={onUpgradeClick} className="badge-premium animate-pulse-soft">
              ✨ PRO
            </button>
          )}
        </div>

        {/* Date selector - clickable to cycle */}
        <GlassPanel className="p-4 cursor-pointer ios-press" variant="strong" onClick={handleZoomCycle}>
          <div className="flex items-center justify-center gap-3">
            <ZoomIn className="w-5 h-5 text-primary" />
            <p className="text-title text-foreground">Select Year</p>
          </div>
        </GlassPanel>

        {/* Years Grid */}
        <div className="grid grid-cols-2 gap-3">
          {years.map(year => {
            const isCurrentYear = year === new Date().getFullYear();
            const taskCount = tasks.filter(t => {
              if (!t.dueDate) return false;
              return new Date(t.dueDate).getFullYear() === year;
            }).length;
            
            return (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={cn(
                  "glass rounded-2xl p-6 text-center transition-all duration-500 ios-press hover:scale-[1.02]",
                  isCurrentYear && "ring-2 ring-primary/50"
                )}
              >
                <p className={cn(
                  "text-2xl font-bold mb-2 transition-colors",
                  isCurrentYear ? "text-primary" : "text-foreground"
                )}>
                  {year}
                </p>
                {taskCount > 0 && (
                  <p className="text-caption">{taskCount} tasks</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Month View
  if (zoomLevel === 'month') {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();
    
    return (
      <div className="space-y-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-headline text-foreground">Schedule</h1>
          {!isPremium && (
            <button onClick={onUpgradeClick} className="badge-premium animate-pulse-soft">
              ✨ PRO
            </button>
          )}
        </div>

        {/* Month selector - clickable to cycle */}
        <GlassPanel className="p-3" variant="strong">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300 ios-press"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button 
              onClick={handleZoomCycle}
              className="text-center ios-press px-4 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300"
            >
              <p className="text-title text-foreground">
                {MONTH_FULL[selectedMonth]} {selectedYear}
              </p>
              <p className="text-micro flex items-center justify-center gap-1">
                <ZoomOut className="w-3 h-3" /> Tap for years
              </p>
            </button>
            
            <button 
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300 ios-press"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </GlassPanel>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-micro py-2">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const date = new Date(selectedYear, selectedMonth, day);
            const isCurrentDay = date.toDateString() === today.toDateString();
            const taskCount = getTaskCountForDate(date);
            const hasCompleted = tasks.some(t => t.completedAt && new Date(t.completedAt).toDateString() === date.toDateString());
            
            return (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ios-press relative",
                  isCurrentDay ? "glass-strong ring-2 ring-primary" : "glass-subtle hover:bg-accent/30"
                )}
              >
                <span className={cn(
                  "text-sm font-semibold",
                  isCurrentDay ? "text-primary" : "text-foreground"
                )}>
                  {day}
                </span>
                {taskCount > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {taskCount > 1 && <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />}
                  </div>
                )}
                {hasCompleted && (
                  <Check className="absolute top-1 right-1 w-3 h-3 text-success" />
                )}
              </button>
            );
          })}
        </div>

        {/* Month summary */}
        <GlassPanel variant="subtle" className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{getTaskCountForMonth(selectedMonth, selectedYear)}</p>
              <p className="text-micro">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{getCompletedForMonth(selectedMonth, selectedYear)}</p>
              <p className="text-micro">Completed</p>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // Day View (default)
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

      {/* Date selector - clickable to zoom out */}
      <GlassPanel className="p-3" variant="strong">
        <div className="flex items-center justify-between">
          <button 
            onClick={handlePrevDay}
            className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300 ios-press"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={handleZoomCycle}
            className="text-center ios-press px-4 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300"
          >
            <p className="text-title text-foreground">
              {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-caption flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </button>
          
          <button 
            onClick={handleNextDay}
            className="p-2 rounded-xl hover:bg-accent/50 transition-all duration-300 ios-press"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </GlassPanel>

      {/* Premium lock for schedule editing */}
      {!isPremium && (
        <GlassPanel className="glass-premium p-4 text-center" variant="strong">
          <Bell className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-title text-foreground mb-1">Unlock Full Scheduling</p>
          <p className="text-caption mb-3">
            Set reminders, drag to reschedule, and sync with your calendar
          </p>
          <button 
            onClick={onUpgradeClick}
            className="pill-primary text-sm transition-all duration-300 hover:scale-[1.02]"
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
                "flex gap-3 min-h-[60px] transition-all duration-500",
                isPast && "opacity-40"
              )}
            >
              {/* Time column */}
              <div className={cn(
                "w-16 shrink-0 text-right pr-3 py-2 border-r-2 transition-all duration-500",
                isNow ? "border-primary" : "border-border/30"
              )}>
                <span className={cn(
                  "text-micro transition-all duration-300",
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
                      onClick={() => setFocusTask(task)}
                      className={cn(
                        "w-full glass-subtle rounded-xl p-3 text-left transition-all duration-300 ios-press hover:scale-[1.02]",
                        task.completed && "opacity-50 line-through"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CATEGORY_ICONS[task.category]}</span>
                        <span className="text-body text-foreground font-medium truncate">
                          {task.title}
                        </span>
                        <Target className="w-4 h-4 text-primary/50 ml-auto" />
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
        <GlassPanel variant="strong">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-title text-foreground">Unscheduled Tasks</h2>
          </div>
          <div className="space-y-2">
            {unscheduledTasks.slice(0, 5).map(task => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-300 cursor-pointer"
                onClick={() => setFocusTask(task)}
              >
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[task.category]}</span>
                  <span className="text-body text-foreground">{task.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPremium) {
                      const now = new Date();
                      now.setHours(now.getHours() + 1, 0, 0, 0);
                      onScheduleTask(task.id, now.toISOString());
                    } else {
                      onUpgradeClick();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-accent transition-all duration-300"
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