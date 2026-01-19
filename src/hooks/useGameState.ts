import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, CityStats, Building, TaskCategory, PRIORITY_IMPACT } from '@/types/game';

const DEFAULT_CITY_STATS: CityStats = {
  population: 10,
  happiness: 70,
  streak: 0,
  buildings: [
    { id: 'house-1', type: 'house', level: 1, category: 'personal', unlockedAt: new Date().toISOString() },
    { id: 'school-1', type: 'school', level: 1, category: 'study', unlockedAt: new Date().toISOString() },
  ],
  lastActivityDate: new Date().toISOString(),
  totalTasksCompleted: 0
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useGameState() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('flourish-tasks', []);
  const [cityStats, setCityStats] = useLocalStorage<CityStats>('flourish-city', DEFAULT_CITY_STATS);

  const addTask = useCallback((title: string, category: TaskCategory, priority: Task['priority'] = 'medium', dueDate?: string, scheduledTime?: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      category,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate,
      scheduledTime
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        const impact = PRIORITY_IMPACT[task.priority];
        
        setCityStats(stats => {
          const today = new Date().toDateString();
          const lastActivity = new Date(stats.lastActivityDate).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          let newStreak = stats.streak;
          if (lastActivity === yesterday) {
            newStreak += 1;
          } else if (lastActivity !== today) {
            newStreak = 1;
          }

          const newPopulation = stats.population + impact;
          const newHappiness = Math.min(100, stats.happiness + impact * 2);
          
          // Unlock new building every 10 tasks
          const newBuildings = [...stats.buildings];
          const totalCompleted = stats.totalTasksCompleted + 1;
          if (totalCompleted % 10 === 0) {
            const buildingTypes = ['tower', 'park', 'gym', 'office'] as const;
            newBuildings.push({
              id: generateId(),
              type: buildingTypes[Math.floor(Math.random() * buildingTypes.length)],
              level: 1,
              category: task.category,
              unlockedAt: new Date().toISOString()
            });
          }

          return {
            ...stats,
            population: newPopulation,
            happiness: newHappiness,
            streak: newStreak,
            buildings: newBuildings,
            lastActivityDate: new Date().toISOString(),
            totalTasksCompleted: totalCompleted
          };
        });

        return { ...task, completed: true, completedAt: new Date().toISOString() };
      }
      return task;
    }));
  }, [setTasks, setCityStats]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, [setTasks]);

  const uncompleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: false, completedAt: undefined } : task
    ));
  }, [setTasks]);

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  
  const todaysTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => 
      new Date(t.createdAt).toDateString() === today || 
      (t.dueDate && new Date(t.dueDate).toDateString() === today)
    );
  }, [tasks]);

  const weather = useMemo(() => {
    if (cityStats.happiness >= 80) return 'sunny';
    if (cityStats.happiness >= 50) return 'partly-cloudy';
    if (cityStats.happiness >= 30) return 'cloudy';
    return 'rainy';
  }, [cityStats.happiness]);

  return {
    tasks,
    activeTasks,
    completedTasks,
    todaysTasks,
    cityStats,
    weather,
    addTask,
    completeTask,
    deleteTask,
    uncompleteTask
  };
}
