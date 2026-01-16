import { Task, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types/game';
import { cn } from '@/lib/utils';
import { Check, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = () => {
    if (task.completed) return;
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 300);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 200);
  };

  const categoryColors = {
    study: 'border-l-category-study',
    work: 'border-l-category-work',
    habits: 'border-l-category-habits',
    personal: 'border-l-category-personal'
  };

  const priorityStyles = {
    low: 'opacity-80',
    medium: '',
    high: 'shadow-md'
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl p-4 border-l-4 transition-all duration-300",
        categoryColors[task.category],
        priorityStyles[task.priority],
        task.completed && "opacity-60",
        isCompleting && "scale-95 opacity-0",
        isDeleting && "translate-x-full opacity-0",
        !task.completed && "hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion button */}
        <button
          onClick={handleComplete}
          disabled={task.completed}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 spring-bounce-sm",
            task.completed 
              ? "bg-primary border-primary" 
              : "border-border hover:border-primary hover:bg-primary/10"
          )}
        >
          {task.completed && (
            <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-foreground leading-snug transition-all",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm">
              {CATEGORY_ICONS[task.category]}
            </span>
            <span className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[task.category]}
            </span>
            {task.priority === 'high' && (
              <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                High
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
