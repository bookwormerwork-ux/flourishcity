import { useState, useRef } from 'react';
import {
  TaskCategory,
  ACTIVE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  TaskPriority,
  TaskDifficulty,
} from '@/types/game';
import { cn } from '@/lib/utils';
import { Plus, X, Camera, Lock, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    category: TaskCategory,
    priority: TaskPriority,
    scheduledDate: string | undefined,
    scheduledTime: string | undefined,
    opts: {
      estimatedDurationMinutes: number;
      difficulty: TaskDifficulty;
      isBigProject: boolean;
      bigProjectTotalSessions?: number;
      beforePhoto?: string;
    },
  ) => void;
  isCategoryOnCooldown: (c: TaskCategory) => { onCooldown: boolean; remainingMs: number };
}

function fmtCooldown(ms: number) {
  const mins = Math.ceil(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

export function AddTaskSheet({ isOpen, onClose, onAdd, isCategoryOnCooldown }: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [isBig, setIsBig] = useState(false);
  const [sessions, setSessions] = useState(3);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle('');
    setCategory('work');
    setDuration(30);
    setDifficulty('medium');
    setIsBig(false);
    setSessions(3);
    setBeforePhoto(null);
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Photo too large', description: 'Please pick an image under 10 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBeforePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(
      title.trim(),
      category,
      'medium',
      undefined,
      undefined,
      {
        estimatedDurationMinutes: duration,
        difficulty,
        isBigProject: isBig,
        bigProjectTotalSessions: isBig ? sessions : undefined,
        beforePhoto,
      },
    );
    // discard the photo immediately
    setBeforePhoto(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="glass-ultra rounded-t-[2rem] p-6 pb-8 max-h-[85dvh] overflow-y-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline text-foreground">New Task</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent/50 transition-all duration-300 ios-press"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full glass-subtle border border-border/50 rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
              />

              {/* Category */}
              <div>
                <p className="text-caption mb-2">Category</p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full glass-subtle border border-border/50 rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {ACTIVE_CATEGORIES.map((c) => {
                    const cd = isCategoryOnCooldown(c);
                    return (
                      <option key={c} value={c}>
                        {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
                        {cd.onCooldown ? `  🔒 ${fmtCooldown(cd.remainingMs)}` : ''}
                      </option>
                    );
                  })}
                </select>
                {(() => {
                  const cd = isCategoryOnCooldown(category);
                  if (!cd.onCooldown) return null;
                  return (
                    <p className="text-micro mt-2 text-amber-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Cooldown: {fmtCooldown(cd.remainingMs)} — task can run, but no city reward.
                    </p>
                  );
                })()}
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption">Estimated duration</p>
                  <span className="text-sm font-semibold text-foreground">{duration} min</span>
                </div>
                <Slider
                  min={5}
                  max={480}
                  step={5}
                  value={[duration]}
                  onValueChange={(v) => setDuration(v[0])}
                />
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-caption mb-2">Difficulty</p>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as TaskDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'flex-1 py-3 rounded-xl border-2 text-sm font-semibold capitalize ios-press transition-all',
                        difficulty === d
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-transparent glass-subtle text-muted-foreground',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big project */}
              <div className="glass-subtle rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-medium text-foreground">Big Project?</p>
                    <p className="text-micro">Multi-session task that unlocks a landmark.</p>
                  </div>
                  <Switch checked={isBig} onCheckedChange={setIsBig} />
                </div>
                {isBig && (
                  <div className="flex items-center gap-3">
                    <p className="text-caption flex-1">Sessions</p>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={sessions}
                      onChange={(e) =>
                        setSessions(Math.max(2, Math.min(10, parseInt(e.target.value || '2'))))
                      }
                      className="w-20 glass border border-border/50 rounded-lg px-3 py-2 text-center text-foreground"
                    />
                  </div>
                )}
              </div>

              {/* Before photo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-caption">Before Photo <span className="text-micro text-muted-foreground">(optional)</span></p>
                  <span className="text-micro flex items-center gap-1 text-muted-foreground">
                    <Lock className="w-3 h-3" /> Never stored.
                  </span>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {beforePhoto ? (
                  <div className="relative">
                    <img
                      src={beforePhoto}
                      alt="Before"
                      className="w-full h-40 object-cover rounded-2xl border border-border/50"
                    />
                    <button
                      type="button"
                      onClick={() => setBeforePhoto(null)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-destructive/80 text-destructive-foreground"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border/60 glass-subtle ios-press"
                  >
                    <Camera className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">Take Before Photo</span>
                    <span
                      className="text-micro flex items-center gap-1"
                      title="Analyzed locally and immediately discarded. Never stored."
                    >
                      <Lock className="w-3 h-3" /> Analyzed locally and immediately discarded. Never stored.
                    </span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  'w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ios-press mb-6',
                  title.trim()
                    ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-button'
                    : 'bg-muted/30 text-muted-foreground cursor-not-allowed',
                )}
              >
                <Plus className="w-5 h-5" />
                Start Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
