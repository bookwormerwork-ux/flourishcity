import { useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  Task,
  CityStats,
  Building,
  BuildingType,
  TaskCategory,
  TaskDifficulty,
  TaskStatus,
  PRIORITY_IMPACT,
  DIFFICULTY_REWARDS,
  COOLDOWN_HOURS,
  DECAY_HOURS,
  DEBT_MULTIPLIER,
  BUILDING_INFO,
  buildingForCategory,
  landmarkForCategory,
  CitizenDemand,
  CouncilReport,
} from '@/types/game';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function makeBuilding(
  type: BuildingType,
  category: TaskCategory,
  state: Building['state'] = 'completed',
  taskId?: string,
): Building {
  const info = BUILDING_INFO[type];
  let members = 0;
  let shops: number | undefined;
  let floors: number | undefined;

  switch (type) {
    case 'house':         members = rand(2, 5); floors = 1; break;
    case 'apartment':     members = rand(20, 80); floors = rand(4, 9); break;
    case 'shop':          members = rand(3, 8); shops = 1; break;
    case 'cafe':          members = rand(2, 6); shops = 1; break;
    case 'office':        members = rand(15, 60); floors = rand(3, 8); break;
    case 'school':        members = rand(80, 250); floors = rand(2, 3); break;
    case 'library':       members = rand(10, 30); floors = 2; break;
    case 'gym':           members = rand(20, 60); floors = 1; break;
    case 'hospital':      members = rand(50, 150); floors = rand(3, 6); break;
    case 'park':          members = rand(10, 40); break;
    case 'tower':         members = rand(100, 400); floors = rand(15, 30); break;
    case 'town_hall':     members = rand(20, 50); floors = 3; break;
    case 'police':        members = rand(15, 35); floors = 2; break;
    case 'fire':          members = rand(10, 25); floors = 2; break;
    case 'factory':       members = rand(30, 90); shops = rand(2, 5); break;
    case 'statue':        members = 0; break;
    case 'studio':        members = rand(3, 12); floors = 2; break;
    case 'temple':        members = rand(20, 80); floors = 2; break;
    case 'meditation':    members = rand(5, 20); floors = 1; break;
    case 'bank':          members = rand(20, 60); floors = rand(3, 6); break;
    case 'cathedral':     members = rand(200, 600); floors = 4; break;
    case 'stadium':       members = rand(500, 2000); floors = 3; break;
    case 'grand_library': members = rand(100, 400); floors = 5; break;
  }

  return {
    id: generateId(),
    type,
    level: 1,
    category,
    unlockedAt: new Date().toISOString(),
    state,
    taskId,
    meta: { name: info.label, members, shops, floors },
  };
}

const DEFAULT_CITY_STATS: CityStats = {
  population: 10,
  happiness: 70,
  streak: 0,
  buildings: [
    makeBuilding('house', 'home'),
    makeBuilding('library', 'study'),
  ],
  lastActivityDate: new Date().toISOString(),
  totalTasksCompleted: 0,
  cityName: 'Flourish',
  cooldowns: {},
  citizenDemands: [],
  councilReports: [],
};

interface AddTaskOptions {
  estimatedDurationMinutes?: number;
  difficulty?: TaskDifficulty;
  isBigProject?: boolean;
  bigProjectTotalSessions?: number;
  startNow?: boolean;
}

export function useGameState() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('flourish-tasks', []);
  const [cityStats, setCityStats] = useLocalStorage<CityStats>('flourish-city', DEFAULT_CITY_STATS);

  /* --------------------------------------------------------------
   * DECAY: applied retroactively on app load + every minute
   * -------------------------------------------------------------- */
  useEffect(() => {
    const apply = () => {
      setCityStats((stats) => {
        const last = new Date(stats.lastCompletionAt || stats.lastActivityDate).getTime();
        const elapsedHours = (Date.now() - last) / 3600000;
        const decayCycles = Math.floor(elapsedHours / DECAY_HOURS);
        if (decayCycles <= 0) return stats;

        const happinessDrop = decayCycles * 10;
        const newHappiness = Math.max(0, stats.happiness - happinessDrop);
        const buildings = [...stats.buildings];
        // Apply neglected state to up to `decayCycles` random non-debt buildings
        const eligible = buildings.filter((b) => b.state !== 'debt' && b.state !== 'neglected');
        for (let i = 0; i < Math.min(decayCycles, eligible.length); i++) {
          const target = eligible[Math.floor(Math.random() * eligible.length)];
          const idx = buildings.findIndex((b) => b.id === target.id);
          if (idx >= 0) buildings[idx] = { ...buildings[idx], state: 'neglected' };
        }
        // Bump lastCompletionAt forward so we don't apply the same decay twice
        const newLast = new Date(last + decayCycles * DECAY_HOURS * 3600000).toISOString();
        return {
          ...stats,
          happiness: newHappiness,
          buildings,
          lastCompletionAt: newLast,
        };
      });
    };
    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------------------------------------
   * DEBT: tasks not finished within 3× duration become debts
   * -------------------------------------------------------------- */
  useEffect(() => {
    const tick = () => {
      setTasks((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (
            t.completed ||
            t.isDebt ||
            !t.startedAt ||
            !t.estimatedDurationMinutes
          ) return t;
          const elapsedMin = (Date.now() - new Date(t.startedAt).getTime()) / 60000;
          if (elapsedMin > t.estimatedDurationMinutes * DEBT_MULTIPLIER) {
            changed = true;
            return { ...t, isDebt: true, status: 'debt' as TaskStatus };
          }
          return t;
        });
        return changed ? next : prev;
      });
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------------------------------------
   * Add a debt building shadow whenever a task becomes a debt
   * -------------------------------------------------------------- */
  useEffect(() => {
    const debts = tasks.filter((t) => t.isDebt && !t.completed);
    setCityStats((stats) => {
      let changed = false;
      const buildings = [...stats.buildings];
      for (const d of debts) {
        const exists = buildings.some((b) => b.taskId === d.id && b.state === 'debt');
        if (!exists) {
          changed = true;
          const type = buildingForCategory(d.category, stats.totalTasksCompleted);
          buildings.push(makeBuilding(type, d.category, 'debt', d.id));
        }
      }
      return changed ? { ...stats, buildings } : stats;
    });
  }, [tasks, setCityStats]);

  /* -------------------------------------------------------------- */
  const addTask = useCallback(
    (
      title: string,
      category: TaskCategory,
      priority: Task['priority'] = 'medium',
      dueDate?: string,
      scheduledTime?: string,
      opts: AddTaskOptions = {},
    ) => {
      const newTask: Task = {
        id: generateId(),
        title,
        category,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
        scheduledTime,
        estimatedDurationMinutes: opts.estimatedDurationMinutes,
        difficulty: opts.difficulty,
        isBigProject: opts.isBigProject,
        bigProjectTotalSessions: opts.bigProjectTotalSessions,
        bigProjectSessionsDone: opts.isBigProject ? 0 : undefined,
        startedAt: opts.startNow !== false && opts.estimatedDurationMinutes
          ? new Date().toISOString()
          : undefined,
        status: opts.estimatedDurationMinutes
          ? (opts.startNow !== false ? 'in_progress' : 'pending_start')
          : undefined,
        verified: false,
      };

      // Big-project: drop a wireframe scaffolding building immediately
      if (newTask.isBigProject) {
        setCityStats((stats) => {
          const buildings = [
            ...stats.buildings,
            makeBuilding(
              buildingForCategory(category, stats.totalTasksCompleted),
              category,
              'big_project',
              newTask.id,
            ),
          ];
          return { ...stats, buildings };
        });
      }

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [setTasks, setCityStats],
  );

  const startTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, startedAt: t.startedAt || new Date().toISOString(), status: 'in_progress' }
          : t,
      ),
    );
  }, [setTasks]);

  /* -------------------------------------------------------------- */
  const isCategoryOnCooldown = useCallback(
    (category: TaskCategory): { onCooldown: boolean; remainingMs: number } => {
      const expiry = cityStats.cooldowns?.[category];
      if (!expiry) return { onCooldown: false, remainingMs: 0 };
      const ms = new Date(expiry).getTime() - Date.now();
      return { onCooldown: ms > 0, remainingMs: Math.max(0, ms) };
    },
    [cityStats.cooldowns],
  );

  /* -------------------------------------------------------------- */
  const completeTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      const difficulty: TaskDifficulty = task.difficulty || 'medium';
      const reward = DIFFICULTY_REWARDS[difficulty];
      const cooldown = isCategoryOnCooldown(task.category);
      const giveReward = !cooldown.onCooldown;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const isBig = !!t.isBigProject;
          const sessionsDone = (t.bigProjectSessionsDone || 0) + 1;
          const totalSessions = t.bigProjectTotalSessions || 1;
          const finished = !isBig || sessionsDone >= totalSessions;
          return {
            ...t,
            completed: finished,
            verified: true,
            completedAt: finished ? new Date().toISOString() : t.completedAt,
            bigProjectSessionsDone: isBig ? sessionsDone : t.bigProjectSessionsDone,
            status: finished ? 'completed' : 'in_progress',
            isDebt: finished ? false : t.isDebt,
          };
        }),
      );

      setCityStats((stats) => {
        const today = new Date().toDateString();
        const lastActivity = new Date(stats.lastActivityDate).toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let newStreak = stats.streak;
        if (lastActivity === yesterday) newStreak += 1;
        else if (lastActivity !== today) newStreak = 1;

        let buildings = [...stats.buildings];

        // If the task had a debt building, "repair" it -> completed
        const debtIdx = buildings.findIndex((b) => b.taskId === taskId && b.state === 'debt');
        if (debtIdx >= 0) buildings[debtIdx] = { ...buildings[debtIdx], state: 'completed' };

        const isBig = !!task.isBigProject;
        const sessionsDone = (task.bigProjectSessionsDone || 0) + 1;
        const totalSessions = task.bigProjectTotalSessions || 1;
        const finished = !isBig || sessionsDone >= totalSessions;

        if (giveReward) {
          if (isBig && !finished) {
            // Add another scaffold for the next session if not already present
            // (visual progress for the big project)
            buildings.push(
              makeBuilding(
                buildingForCategory(task.category, stats.totalTasksCompleted),
                task.category,
                'big_project',
                task.id,
              ),
            );
          } else if (isBig && finished) {
            // Collapse all scaffolds for this task and reveal landmark
            buildings = buildings.filter((b) => !(b.taskId === task.id && b.state === 'big_project'));
            buildings.push(
              makeBuilding(landmarkForCategory(task.category), task.category, 'completed', task.id),
            );
          } else {
            // Normal task → drop a fresh building
            const type = buildingForCategory(task.category, stats.totalTasksCompleted);
            buildings.push(makeBuilding(type, task.category, 'completed'));
          }
        }

        const newPopulation = stats.population + (giveReward ? reward.population : 0);
        const newHappiness = Math.min(100, stats.happiness + (giveReward ? reward.happiness : 0));

        const cooldowns = { ...(stats.cooldowns || {}) };
        if (giveReward) {
          cooldowns[task.category] = new Date(
            Date.now() + COOLDOWN_HOURS * 3600000,
          ).toISOString();
        }

        return {
          ...stats,
          population: newPopulation,
          happiness: newHappiness,
          streak: newStreak,
          buildings,
          lastActivityDate: new Date().toISOString(),
          lastCompletionAt: new Date().toISOString(),
          totalTasksCompleted: stats.totalTasksCompleted + 1,
          cooldowns,
          decayShownCrisis: newHappiness > 0 ? false : stats.decayShownCrisis,
        };
      });
    },
    [tasks, setTasks, setCityStats, isCategoryOnCooldown],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      // Remove any debt/scaffold buildings tied to this task
      setCityStats((stats) => ({
        ...stats,
        buildings: stats.buildings.filter(
          (b) => !(b.taskId === taskId && (b.state === 'debt' || b.state === 'big_project')),
        ),
      }));
    },
    [setTasks, setCityStats],
  );

  const uncompleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: false, completedAt: undefined } : t,
        ),
      );
    },
    [setTasks],
  );

  /* --------------------------------------------------------------
   * Citizen demands & council reports
   * -------------------------------------------------------------- */
  const addCitizenDemand = useCallback(
    (text: string) => {
      const demand: CitizenDemand = {
        id: generateId(),
        text,
        createdAt: new Date().toISOString(),
      };
      setCityStats((s) => ({
        ...s,
        citizenDemands: [demand, ...(s.citizenDemands || [])].slice(0, 30),
      }));
      return demand;
    },
    [setCityStats],
  );

  const dismissCitizenDemand = useCallback(
    (id: string) => {
      setCityStats((s) => ({
        ...s,
        citizenDemands: (s.citizenDemands || []).map((d) =>
          d.id === id ? { ...d, dismissed: true } : d,
        ),
      }));
    },
    [setCityStats],
  );

  const addCouncilReport = useCallback(
    (text: string) => {
      const report: CouncilReport = {
        id: generateId(),
        text,
        createdAt: new Date().toISOString(),
      };
      setCityStats((s) => ({
        ...s,
        lastCouncilReportAt: new Date().toISOString(),
        councilReports: [report, ...(s.councilReports || [])].slice(0, 50),
      }));
      return report;
    },
    [setCityStats],
  );

  const acknowledgeCrisis = useCallback(() => {
    setCityStats((s) => ({
      ...s,
      happiness: Math.max(s.happiness, 20),
      lastCompletionAt: new Date().toISOString(),
      decayShownCrisis: true,
    }));
  }, [setCityStats]);

  /* --------------------------------------------------------------
   * SANDBOX: unlock everything (dev mode)
   * -------------------------------------------------------------- */
  const unlockEverythingSandbox = useCallback(() => {
    const allTypes: BuildingType[] = [
      'house','apartment','shop','cafe','office','school','library','gym','park',
      'hospital','tower','town_hall','police','fire','factory','statue','studio',
      'temple','meditation','bank','cathedral','stadium','grand_library',
    ];
    const cats: TaskCategory[] = ['work','study','health','home','creative','growth','social','finance'];
    const buildings: Building[] = [];
    // 3 of every type for a full skyline
    for (let i = 0; i < 3; i++) {
      allTypes.forEach((t, idx) => {
        buildings.push(makeBuilding(t, cats[(idx + i) % cats.length], 'completed'));
      });
    }
    setCityStats((s) => ({
      ...s,
      population: Math.max(s.population, 25000),
      happiness: 100,
      streak: Math.max(s.streak, 30),
      totalTasksCompleted: Math.max(s.totalTasksCompleted, 250),
      buildings: [...s.buildings.filter((b) => b.state === 'completed'), ...buildings],
      lastActivityDate: new Date().toISOString(),
      lastCompletionAt: new Date().toISOString(),
      cooldowns: {},
      decayShownCrisis: true,
    }));
  }, [setCityStats]);

  const resetCity = useCallback(() => {
    setCityStats(DEFAULT_CITY_STATS);
    setTasks([]);
  }, [setCityStats, setTasks]);

  /* -------------------------------------------------------------- */
  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed && !t.isDebt), [tasks]);
  const debtTasks = useMemo(() => tasks.filter((t) => t.isDebt && !t.completed), [tasks]);
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
    debtTasks,
    completedTasks,
    todaysTasks,
    cityStats,
    weather,
    addTask,
    startTask,
    completeTask,
    deleteTask,
    uncompleteTask,
    isCategoryOnCooldown,
    addCitizenDemand,
    dismissCitizenDemand,
    addCouncilReport,
    acknowledgeCrisis,
    unlockEverythingSandbox,
    resetCity,
  };
}
