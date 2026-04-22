import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  Task,
  CityStats,
  Building,
  BuildingType,
  TaskCategory,
  PRIORITY_IMPACT,
  BUILDING_INFO,
} from '@/types/game';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function makeBuilding(type: BuildingType, category: TaskCategory): Building {
  const info = BUILDING_INFO[type];
  let members = 0;
  let shops: number | undefined;
  let floors: number | undefined;

  switch (type) {
    case 'house':     members = rand(2, 5); floors = 1; break;
    case 'apartment': members = rand(20, 80); floors = rand(4, 9); break;
    case 'shop':      members = rand(3, 8); shops = 1; break;
    case 'cafe':      members = rand(2, 6); shops = 1; break;
    case 'office':    members = rand(15, 60); floors = rand(3, 8); break;
    case 'school':    members = rand(80, 250); floors = rand(2, 3); break;
    case 'library':   members = rand(10, 30); floors = 2; break;
    case 'gym':       members = rand(20, 60); floors = 1; break;
    case 'hospital':  members = rand(50, 150); floors = rand(3, 6); break;
    case 'park':      members = rand(10, 40); break;
    case 'tower':     members = rand(100, 400); floors = rand(15, 30); break;
    case 'town_hall': members = rand(20, 50); floors = 3; break;
    case 'police':    members = rand(15, 35); floors = 2; break;
    case 'fire':      members = rand(10, 25); floors = 2; break;
    case 'factory':   members = rand(30, 90); shops = rand(2, 5); break;
    case 'statue':    members = 0; break;
  }

  return {
    id: generateId(),
    type,
    level: 1,
    category,
    unlockedAt: new Date().toISOString(),
    meta: {
      name: info.label,
      members,
      shops,
      floors,
    },
  };
}

const DEFAULT_CITY_STATS: CityStats = {
  population: 10,
  happiness: 70,
  streak: 0,
  buildings: [
    makeBuilding('house', 'personal'),
    makeBuilding('school', 'study'),
  ],
  lastActivityDate: new Date().toISOString(),
  totalTasksCompleted: 0,
};

/**
 * Pick the next building type. Variety grows with city size and is
 * loosely themed by the task category that triggered the unlock.
 */
function pickNextBuildingType(category: TaskCategory, totalCount: number): BuildingType {
  const byCategory: Record<TaskCategory, BuildingType[]> = {
    study:    ['school', 'library', 'apartment', 'tower', 'office'],
    work:     ['office', 'factory', 'tower', 'shop', 'apartment'],
    habits:   ['gym', 'park', 'hospital', 'cafe', 'house'],
    personal: ['house', 'cafe', 'park', 'shop', 'apartment'],
  };

  // Inject civic / landmark buildings as the city matures
  const civic: { at: number; type: BuildingType }[] = [
    { at: 5,  type: 'town_hall' },
    { at: 10, type: 'police' },
    { at: 15, type: 'fire' },
    { at: 25, type: 'hospital' },
    { at: 40, type: 'statue' },
    { at: 60, type: 'tower' },
  ];
  const civicMatch = civic.find((c) => c.at === totalCount);
  if (civicMatch) return civicMatch.type;

  const pool = byCategory[category];
  return pool[Math.floor(Math.random() * pool.length)];
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
      scheduledTime,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const completeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId && !task.completed) {
        const impact = PRIORITY_IMPACT[task.priority];

        setCityStats((stats) => {
          const today = new Date().toDateString();
          const lastActivity = new Date(stats.lastActivityDate).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();

          let newStreak = stats.streak;
          if (lastActivity === yesterday) newStreak += 1;
          else if (lastActivity !== today) newStreak = 1;

          const newPopulation = stats.population + impact * 2;
          const newHappiness = Math.min(100, stats.happiness + impact * 2);

          // Grow city: unlock a new building every ~2 completed tasks,
          // doubled for high-priority tasks.
          const newBuildings = [...stats.buildings];
          const totalCompleted = stats.totalTasksCompleted + 1;
          const unlockEvery = 2;
          const unlockCount = totalCompleted % unlockEvery === 0 ? 1 : 0;
          const bonus = task.priority === 'high' && totalCompleted % 4 === 0 ? 1 : 0;
          const toAdd = unlockCount + bonus;
          for (let i = 0; i < toAdd; i++) {
            const type = pickNextBuildingType(task.category, totalCompleted + i);
            newBuildings.push(makeBuilding(type, task.category));
          }

          return {
            ...stats,
            population: newPopulation,
            happiness: newHappiness,
            streak: newStreak,
            buildings: newBuildings,
            lastActivityDate: new Date().toISOString(),
            totalTasksCompleted: totalCompleted,
          };
        });

        return { ...task, completed: true, completedAt: new Date().toISOString() };
      }
      return task;
    }));
  }, [setTasks, setCityStats]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, [setTasks]);

  const uncompleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((task) =>
      task.id === taskId ? { ...task, completed: false, completedAt: undefined } : task
    ));
  }, [setTasks]);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const todaysTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter((t) =>
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
    uncompleteTask,
  };
}
