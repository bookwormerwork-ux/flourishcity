import { useState } from 'react';
import { TaskCategory, CATEGORY_ICONS, CATEGORY_LABELS, TaskPriority } from '@/types/game';
import { cn } from '@/lib/utils';
import { Plus, X, Calendar, Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface AddTaskSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, category: TaskCategory, priority: TaskPriority, scheduledDate?: string, scheduledTime?: string) => void;
}

export function AddTaskSheet({ isOpen, onClose, onAdd }: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    let scheduledDate: string | undefined;
    let scheduledTime: string | undefined;
    
    if (selectedDate) {
      scheduledDate = selectedDate.toISOString().split('T')[0];
      const hour24 = isAM ? (selectedHour === 12 ? 0 : selectedHour) : (selectedHour === 12 ? 12 : selectedHour + 12);
      scheduledTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    }
    
    onAdd(title.trim(), category, priority, scheduledDate, scheduledTime);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('personal');
    setPriority('medium');
    setShowDatePicker(false);
    setSelectedDate(null);
    setSelectedHour(9);
    setSelectedMinute(0);
    setIsAM(true);
  };

  const incrementHour = () => setSelectedHour(h => h >= 12 ? 1 : h + 1);
  const decrementHour = () => setSelectedHour(h => h <= 1 ? 12 : h - 1);
  const incrementMinute = () => setSelectedMinute(m => m >= 55 ? 0 : m + 5);
  const decrementMinute = () => setSelectedMinute(m => m <= 0 ? 55 : m - 5);

  // Generate next 14 days for quick date selection
  const getDateOptions = () => {
    const options: { label: string; date: Date }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label: string;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      options.push({ label, date });
    }
    return options;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 overlay-blur-strong z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="glass-ultra rounded-t-[2rem] p-6 pb-8">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline text-foreground">New Task</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-accent/50 transition-all duration-300 ios-press"
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
                  className="w-full glass-subtle border border-border/50 rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 text-lg"
                  autoFocus
                />
              </div>

              {/* Category selection */}
              <div>
                <p className="text-caption mb-2">Category</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CATEGORY_ICONS) as TaskCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-300 ios-press",
                        category === cat
                          ? "border-primary bg-primary/10"
                          : "border-transparent glass-subtle hover:bg-accent/50"
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
                <p className="text-caption mb-2">Priority</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all duration-300 ios-press",
                        priority === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent glass-subtle text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date/Time picker toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ios-press",
                    showDatePicker || selectedDate ? "glass-strong border border-primary/30" : "glass-subtle"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      selectedDate ? "bg-primary/20" : "bg-accent"
                    )}>
                      <Calendar className={cn("w-5 h-5", selectedDate ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="text-left">
                      <p className="text-body text-foreground font-medium">
                        {selectedDate 
                          ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Add date & time'
                        }
                      </p>
                      {selectedDate && (
                        <p className="text-caption">
                          {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {isAM ? 'AM' : 'PM'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    showDatePicker && "rotate-180"
                  )} />
                </button>
                
                {/* iOS-style Date/Time picker */}
                {showDatePicker && (
                  <div className="mt-3 glass rounded-2xl p-4 space-y-4 animate-fade-in">
                    {/* Quick date selection - horizontal scroll like iOS */}
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 pb-2">
                        {getDateOptions().map((option, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedDate(option.date)}
                            className={cn(
                              "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ios-press",
                              selectedDate?.toDateString() === option.date.toDateString()
                                ? "bg-primary text-primary-foreground"
                                : "glass-subtle text-foreground hover:bg-accent/50"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Time picker - iOS wheel style */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                      </div>
                      
                      {/* Hour */}
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={incrementHour}
                          className="p-1 rounded-lg hover:bg-accent/50 transition-all duration-200 ios-press"
                        >
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="glass-strong rounded-xl px-4 py-2 min-w-[3rem] text-center">
                          <span className="text-xl font-bold text-foreground">{selectedHour}</span>
                        </div>
                        <button
                          type="button"
                          onClick={decrementHour}
                          className="p-1 rounded-lg hover:bg-accent/50 transition-all duration-200 ios-press"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      
                      <span className="text-xl font-bold text-muted-foreground">:</span>
                      
                      {/* Minute */}
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={incrementMinute}
                          className="p-1 rounded-lg hover:bg-accent/50 transition-all duration-200 ios-press"
                        >
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <div className="glass-strong rounded-xl px-4 py-2 min-w-[3rem] text-center">
                          <span className="text-xl font-bold text-foreground">
                            {selectedMinute.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={decrementMinute}
                          className="p-1 rounded-lg hover:bg-accent/50 transition-all duration-200 ios-press"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      
                      {/* AM/PM toggle */}
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => setIsAM(true)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ios-press",
                            isAM ? "bg-primary text-primary-foreground" : "glass-subtle text-muted-foreground"
                          )}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAM(false)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ios-press",
                            !isAM ? "bg-primary text-primary-foreground" : "glass-subtle text-muted-foreground"
                          )}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                    
                    {/* Clear date button */}
                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="w-full text-center text-sm text-destructive py-2 transition-all duration-200"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ios-press",
                  title.trim()
                    ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-button"
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