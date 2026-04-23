import { Task, CATEGORY_ICONS, CATEGORY_LABELS, COMPLETE_UNLOCK_PCT } from '@/types/game';
import { cn } from '@/lib/utils';
import { Trash2, Lock, Check, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  /** Called when the user requests completion (after timer unlock).
   *  Parent should open the photo verification modal. */
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function pct(task: Task) {
  if (!task.startedAt || !task.estimatedDurationMinutes) return 1;
  const elapsed = (Date.now() - new Date(task.startedAt).getTime()) / 60000;
  return Math.min(1, elapsed / task.estimatedDurationMinutes);
}

function remainingToUnlock(task: Task) {
  if (!task.startedAt || !task.estimatedDurationMinutes) return 0;
  const target =
    new Date(task.startedAt).getTime() +
    task.estimatedDurationMinutes * COMPLETE_UNLOCK_PCT * 60000;
  return Math.max(0, target - Date.now());
}

function fmtMs(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [, force] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tick once per second while there's a timer
  useEffect(() => {
    if (!task.startedAt || !task.estimatedDurationMinutes || task.completed) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [task.startedAt, task.estimatedDurationMinutes, task.completed]);

  const hasTimer = !!task.startedAt && !!task.estimatedDurationMinutes;
  const progress = hasTimer ? pct(task) : 1;
  const unlockMs = hasTimer ? remainingToUnlock(task) : 0;
  const unlocked = !hasTimer || unlockMs <= 0;

  const handleComplete = () => {
    if (task.completed) return;
    if (!unlocked) {
      toast({
        title: "Not yet, mayor.",
        description: `Your city can tell when you're rushing. Come back in ${Math.ceil(unlockMs / 60000)} min.`,
      });
      return;
    }
    onComplete(task.id);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 200);
  };

  const cat = task.category as keyof typeof CATEGORY_ICONS;
  const tokenMap: Record<string, string> = {
    work: 'border-l-category-work',
    study: 'border-l-category-study',
    health: 'border-l-category-habits',
    home: 'border-l-category-personal',
    creative: 'border-l-category-personal',
    growth: 'border-l-category-habits',
    social: 'border-l-category-personal',
    finance: 'border-l-category-work',
    habits: 'border-l-category-habits',
    personal: 'border-l-category-personal',
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn(
        'glass rounded-2xl p-4 border-l-4 transition-all duration-300',
        tokenMap[cat] || 'border-l-primary',
        task.completed && 'opacity-60',
        task.isDebt && 'ring-1 ring-destructive/40 bg-destructive/5',
        isDeleting && 'translate-x-full opacity-0',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Timer ring or simple checkbox */}
        {hasTimer && !task.completed ? (
          <button
            onClick={handleComplete}
            className={cn(
              'flex-shrink-0 relative w-12 h-12 rounded-full flex items-center justify-center transition-all',
              unlocked && 'animate-pulse',
            )}
            aria-label={unlocked ? 'Complete task' : 'Locked'}
          >
            <svg width={48} height={48} className="absolute inset-0 -rotate-90">
              <circle cx={24} cy={24} r={radius} stroke="hsl(var(--muted))" strokeWidth={3} fill="none" />
              <circle
                cx={24}
                cy={24}
                r={radius}
                stroke={unlocked ? 'hsl(var(--success, 142 70% 45%))' : 'hsl(var(--primary))'}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span className="relative text-[9px] font-bold text-foreground leading-none text-center">
              {unlocked ? <Check className="w-4 h-4 text-success" /> : fmtMs(unlockMs)}
            </span>
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={task.completed}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 spring-bounce-sm',
              task.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary hover:bg-primary/10',
            )}
          >
            {task.completed && <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-foreground leading-snug', task.completed && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-sm">{CATEGORY_ICONS[cat]}</span>
            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
            {task.difficulty && (
              <span className="text-xs glass-subtle px-1.5 py-0.5 rounded-full capitalize text-muted-foreground">
                {task.difficulty}
              </span>
            )}
            {task.estimatedDurationMinutes && (
              <span className="text-xs text-muted-foreground">{task.estimatedDurationMinutes} min</span>
            )}
            {task.isBigProject && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                Big · {task.bigProjectSessionsDone || 0}/{task.bigProjectTotalSessions}
              </span>
            )}
            {task.isDebt && (
              <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Debt
              </span>
            )}
          </div>

          {hasTimer && !task.completed && (
            <div className="mt-2">
              {!unlocked ? (
                <button
                  onClick={handleComplete}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3" /> Locked
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="text-xs px-3 py-1.5 rounded-full bg-success text-success-foreground font-semibold flex items-center gap-1 animate-pulse"
                  style={{ background: 'hsl(142 70% 45%)', color: 'white' }}
                >
                  Complete Task ✓
                </button>
              )}
            </div>
          )}
        </div>

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
