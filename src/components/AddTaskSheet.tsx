import { useState } from 'react';
import { TaskCategory, CATEGORY_ICONS, CATEGORY_LABELS, TaskPriority } from '@/types/game';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, category: TaskCategory, priority: TaskPriority) => void;
}

export function AddTaskSheet({ isOpen, onClose, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd(title.trim(), category, priority);
    setTitle('');
    setCategory('personal');
    setPriority('medium');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="glass-strong rounded-t-3xl p-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">New Task</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/20 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-accent/50 border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                />
              </div>

              {/* Category selection */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Category</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CATEGORY_ICONS) as TaskCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all spring-bounce-sm",
                        category === cat
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-accent/30 hover:bg-accent/50"
                      )}
                    >
                      <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority selection */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-xl border-2 text-sm font-medium capitalize transition-all spring-bounce-sm",
                        priority === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent bg-accent/30 text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all spring-bounce-sm",
                  title.trim()
                    ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                )}
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
