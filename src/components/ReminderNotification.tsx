import { cn } from '@/lib/utils';
import { Bell, X, Clock } from 'lucide-react';
import { Reminder } from '@/hooks/useSchedule';

interface ReminderNotificationProps {
  reminder: Reminder;
  onDismiss: (id: string) => void;
  onComplete: (taskId: string) => void;
}

export function ReminderNotification({ reminder, onDismiss, onComplete }: ReminderNotificationProps) {
  const scheduledTime = new Date(reminder.scheduledTime);
  const timeString = scheduledTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const minutesUntil = Math.round(
    (scheduledTime.getTime() - Date.now()) / 60000
  );

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[360px] animate-slide-up">
      <div className="glass-strong rounded-3xl p-4 shadow-premium">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary animate-wiggle" />
            </div>
            <div>
              <p className="text-micro text-primary font-semibold uppercase tracking-wide">
                Reminder
              </p>
              <p className="text-body text-foreground font-semibold">
                {reminder.taskTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onDismiss(reminder.id)}
            className="p-1.5 rounded-full hover:bg-accent/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-2 mb-4 text-caption">
          <Clock className="w-4 h-4" />
          <span>
            {minutesUntil > 0 
              ? `Starts in ${minutesUntil} min at ${timeString}`
              : `Starting now at ${timeString}`
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onDismiss(reminder.id)}
            className="flex-1 pill-secondary"
          >
            Snooze
          </button>
          <button
            onClick={() => {
              onComplete(reminder.taskId);
              onDismiss(reminder.id);
            }}
            className="flex-1 pill-primary"
          >
            Complete
          </button>
        </div>

        {/* Citizen message */}
        <p className="text-center text-micro mt-3 animate-pulse-soft">
          🏙️ Your citizens are waiting for you!
        </p>
      </div>
    </div>
  );
}
