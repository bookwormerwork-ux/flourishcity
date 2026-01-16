import { useState } from 'react';
import { Task, TaskCategory, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types/game';
import { TaskCard } from '@/components/TaskCard';
import { GlassPanel } from '@/components/GlassPanel';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TasksTabProps {
  activeTasks: Task[];
  completedTasks: Task[];
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

type FilterType = 'all' | TaskCategory;

export function TasksTab({ 
  activeTasks, 
  completedTasks, 
  onCompleteTask, 
  onDeleteTask 
}: TasksTabProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const filters: { id: FilterType; label: string; icon?: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'study', label: CATEGORY_LABELS.study, icon: CATEGORY_ICONS.study },
    { id: 'work', label: CATEGORY_LABELS.work, icon: CATEGORY_ICONS.work },
    { id: 'habits', label: CATEGORY_LABELS.habits, icon: CATEGORY_ICONS.habits },
    { id: 'personal', label: CATEGORY_LABELS.personal, icon: CATEGORY_ICONS.personal },
  ];

  const filteredActive = filter === 'all' 
    ? activeTasks 
    : activeTasks.filter(t => t.category === filter);

  const filteredCompleted = filter === 'all'
    ? completedTasks
    : completedTasks.filter(t => t.category === filter);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Tasks</h1>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all spring-bounce-sm",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "glass hover:bg-accent/50 text-foreground"
            )}
          >
            {f.icon && <span className="mr-1">{f.icon}</span>}
            {f.label}
          </button>
        ))}
      </div>

      {/* Active tasks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Circle className="w-4 h-4" />
          <span className="text-sm font-medium">
            Active ({filteredActive.length})
          </span>
        </div>
        
        {filteredActive.length > 0 ? (
          <div className="space-y-2">
            {filteredActive.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        ) : (
          <GlassPanel variant="subtle" className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              No active tasks. Add one to grow your city! 🏙️
            </p>
          </GlassPanel>
        )}
      </div>

      {/* Completed tasks */}
      {filteredCompleted.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              Completed ({filteredCompleted.length})
            </span>
            <span className="text-xs">{showCompleted ? '▼' : '▶'}</span>
          </button>

          {showCompleted && (
            <div className="space-y-2 animate-fade-in">
              {filteredCompleted.slice(0, 10).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onCompleteTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
