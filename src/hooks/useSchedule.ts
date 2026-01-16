import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task } from '@/types/game';

export interface ScheduledTask {
  taskId: string;
  scheduledTime: string; // ISO datetime
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  notified?: boolean;
}

export interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  scheduledTime: string;
  reminderTime: string;
  dismissed: boolean;
}

export function useSchedule(tasks: Task[]) {
  const [scheduledTasks, setScheduledTasks] = useLocalStorage<ScheduledTask[]>(
    'flourish-schedule',
    []
  );

  const [dismissedReminders, setDismissedReminders] = useLocalStorage<string[]>(
    'flourish-dismissed-reminders',
    []
  );

  const scheduleTask = useCallback((
    taskId: string, 
    scheduledTime: string, 
    reminderEnabled: boolean = true,
    reminderMinutesBefore: number = 15
  ) => {
    setScheduledTasks(prev => {
      const filtered = prev.filter(s => s.taskId !== taskId);
      return [...filtered, { taskId, scheduledTime, reminderEnabled, reminderMinutesBefore }];
    });
  }, [setScheduledTasks]);

  const unscheduleTask = useCallback((taskId: string) => {
    setScheduledTasks(prev => prev.filter(s => s.taskId !== taskId));
  }, [setScheduledTasks]);

  const dismissReminder = useCallback((reminderId: string) => {
    setDismissedReminders(prev => [...prev, reminderId]);
  }, [setDismissedReminders]);

  const getScheduledTimeForTask = useCallback((taskId: string) => {
    return scheduledTasks.find(s => s.taskId === taskId);
  }, [scheduledTasks]);

  // Get tasks scheduled for today
  const todaysSchedule = useMemo(() => {
    const today = new Date().toDateString();
    
    return scheduledTasks
      .filter(scheduled => {
        const scheduleDate = new Date(scheduled.scheduledTime).toDateString();
        return scheduleDate === today;
      })
      .map(scheduled => {
        const task = tasks.find(t => t.id === scheduled.taskId);
        return task ? { ...task, scheduledTime: scheduled.scheduledTime, reminderEnabled: scheduled.reminderEnabled } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.scheduledTime!).getTime() - new Date(b!.scheduledTime!).getTime());
  }, [scheduledTasks, tasks]);

  // Get active reminders
  const activeReminders = useMemo((): Reminder[] => {
    const now = new Date();
    
    return scheduledTasks
      .filter(scheduled => {
        if (!scheduled.reminderEnabled) return false;
        
        const task = tasks.find(t => t.id === scheduled.taskId);
        if (!task || task.completed) return false;
        
        const scheduledTime = new Date(scheduled.scheduledTime);
        const reminderTime = new Date(scheduledTime.getTime() - scheduled.reminderMinutesBefore * 60000);
        
        // Show reminder if it's time and not dismissed
        const reminderId = `${scheduled.taskId}-${scheduled.scheduledTime}`;
        if (dismissedReminders.includes(reminderId)) return false;
        
        return now >= reminderTime && now < scheduledTime;
      })
      .map(scheduled => {
        const task = tasks.find(t => t.id === scheduled.taskId)!;
        const scheduledTime = new Date(scheduled.scheduledTime);
        const reminderTime = new Date(scheduledTime.getTime() - scheduled.reminderMinutesBefore * 60000);
        
        return {
          id: `${scheduled.taskId}-${scheduled.scheduledTime}`,
          taskId: scheduled.taskId,
          taskTitle: task.title,
          scheduledTime: scheduled.scheduledTime,
          reminderTime: reminderTime.toISOString(),
          dismissed: false
        };
      });
  }, [scheduledTasks, tasks, dismissedReminders]);

  // Group tasks by hour for timeline view
  const scheduleByHour = useMemo(() => {
    const hours: Record<number, typeof todaysSchedule> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = [];
    }
    
    todaysSchedule.forEach(task => {
      if (task) {
        const hour = new Date(task.scheduledTime!).getHours();
        hours[hour].push(task);
      }
    });
    
    return hours;
  }, [todaysSchedule]);

  return {
    scheduledTasks,
    todaysSchedule,
    activeReminders,
    scheduleByHour,
    scheduleTask,
    unscheduleTask,
    dismissReminder,
    getScheduledTimeForTask
  };
}
