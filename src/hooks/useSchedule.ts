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

  // Schedule a task to a specific time
  const scheduleTask = useCallback((
    taskId: string, 
    scheduledTime: string, 
    reminderEnabled: boolean = true,
    reminderMinutesBefore: number = 15
  ) => {
    // Parse the time - could be just "HH:MM" or full datetime
    let finalScheduledTime = scheduledTime;
    if (!scheduledTime.includes('T')) {
      // It's just a time, combine with today's date
      const today = new Date();
      finalScheduledTime = `${today.toISOString().split('T')[0]}T${scheduledTime}`;
    }

    setScheduledTasks(prev => {
      const filtered = prev.filter(s => s.taskId !== taskId);
      return [...filtered, { 
        taskId, 
        scheduledTime: finalScheduledTime, 
        reminderEnabled, 
        reminderMinutesBefore 
      }];
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

  // Combine tasks with their own scheduledTime + separately scheduled tasks
  const allScheduledTasks = useMemo(() => {
    const result: Array<Task & { fullScheduledTime: string }> = [];
    
    // Tasks with dueDate and scheduledTime set directly
    tasks.forEach(task => {
      if (task.dueDate && task.scheduledTime) {
        result.push({
          ...task,
          fullScheduledTime: `${task.dueDate}T${task.scheduledTime}`
        });
      }
    });
    
    // Tasks scheduled via the schedule system
    scheduledTasks.forEach(scheduled => {
      const task = tasks.find(t => t.id === scheduled.taskId);
      if (task && !result.find(r => r.id === task.id)) {
        result.push({
          ...task,
          fullScheduledTime: scheduled.scheduledTime
        });
      }
    });
    
    return result;
  }, [tasks, scheduledTasks]);

  // Get tasks scheduled for today
  const todaysSchedule = useMemo(() => {
    const today = new Date().toDateString();
    
    return allScheduledTasks
      .filter(task => {
        const scheduleDate = new Date(task.fullScheduledTime).toDateString();
        return scheduleDate === today;
      })
      .map(task => ({
        ...task,
        scheduledTime: task.fullScheduledTime
      }))
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [allScheduledTasks]);

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
        const hour = new Date(task.scheduledTime).getHours();
        hours[hour].push(task);
      }
    });
    
    return hours;
  }, [todaysSchedule]);

  return {
    scheduledTasks,
    allScheduledTasks,
    todaysSchedule,
    activeReminders,
    scheduleByHour,
    scheduleTask,
    unscheduleTask,
    dismissReminder,
    getScheduledTimeForTask
  };
}
