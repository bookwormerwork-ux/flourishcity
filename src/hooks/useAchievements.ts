import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { CityStats, Task } from '@/types/game';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  category: 'tasks' | 'streak' | 'city' | 'special';
  requirement: number;
  unlockedAt?: string;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  // Task achievements
  { id: 'first-task', title: 'First Step', description: 'Complete your first task', icon: '🌱', tier: 'bronze', category: 'tasks', requirement: 1 },
  { id: 'task-10', title: 'Getting Started', description: 'Complete 10 tasks', icon: '📋', tier: 'bronze', category: 'tasks', requirement: 10 },
  { id: 'task-50', title: 'Productive Soul', description: 'Complete 50 tasks', icon: '⚡', tier: 'silver', category: 'tasks', requirement: 50 },
  { id: 'task-100', title: 'Task Master', description: 'Complete 100 tasks', icon: '🏆', tier: 'gold', category: 'tasks', requirement: 100 },
  { id: 'task-500', title: 'Legendary', description: 'Complete 500 tasks', icon: '👑', tier: 'gold', category: 'tasks', requirement: 500 },
  
  // Streak achievements
  { id: 'streak-3', title: 'Warming Up', description: 'Maintain a 3-day streak', icon: '🔥', tier: 'bronze', category: 'streak', requirement: 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪', tier: 'silver', category: 'streak', requirement: 7 },
  { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🌟', tier: 'gold', category: 'streak', requirement: 30 },
  { id: 'streak-100', title: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '🚀', tier: 'gold', category: 'streak', requirement: 100 },
  
  // City achievements
  { id: 'pop-50', title: 'Small Town', description: 'Reach 50 population', icon: '🏘️', tier: 'bronze', category: 'city', requirement: 50 },
  { id: 'pop-200', title: 'Growing City', description: 'Reach 200 population', icon: '🌆', tier: 'silver', category: 'city', requirement: 200 },
  { id: 'pop-500', title: 'Metropolis', description: 'Reach 500 population', icon: '🏙️', tier: 'gold', category: 'city', requirement: 500 },
  { id: 'buildings-10', title: 'Builder', description: 'Build 10 buildings', icon: '🏗️', tier: 'silver', category: 'city', requirement: 10 },
  { id: 'buildings-25', title: 'Architect', description: 'Build 25 buildings', icon: '🏛️', tier: 'gold', category: 'city', requirement: 25 },
  
  // Special achievements
  { id: 'happiness-100', title: 'Utopia', description: 'Reach 100% happiness', icon: '😊', tier: 'gold', category: 'special', requirement: 100 },
  { id: 'early-bird', title: 'Early Bird', description: 'Complete a task before 7 AM', icon: '🌅', tier: 'silver', category: 'special', requirement: 1 },
  { id: 'night-owl', title: 'Night Owl', description: 'Complete a task after 11 PM', icon: '🦉', tier: 'silver', category: 'special', requirement: 1 },
];

interface UnlockedAchievements {
  [key: string]: string; // achievement id -> unlocked timestamp
}

export function useAchievements(cityStats: CityStats, tasks: Task[]) {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<UnlockedAchievements>(
    'flourish-achievements',
    {}
  );

  const checkAndUnlock = useCallback((achievementId: string) => {
    if (!unlockedAchievements[achievementId]) {
      setUnlockedAchievements(prev => ({
        ...prev,
        [achievementId]: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, [unlockedAchievements, setUnlockedAchievements]);

  const achievements: Achievement[] = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlockedAt: unlockedAchievements[def.id]
    }));
  }, [unlockedAchievements]);

  const unlockedCount = useMemo(() => 
    Object.keys(unlockedAchievements).length
  , [unlockedAchievements]);

  const totalCount = ACHIEVEMENT_DEFINITIONS.length;

  const checkAchievements = useCallback(() => {
    const newUnlocks: string[] = [];
    
    // Task achievements
    const totalCompleted = cityStats.totalTasksCompleted;
    if (totalCompleted >= 1 && checkAndUnlock('first-task')) newUnlocks.push('first-task');
    if (totalCompleted >= 10 && checkAndUnlock('task-10')) newUnlocks.push('task-10');
    if (totalCompleted >= 50 && checkAndUnlock('task-50')) newUnlocks.push('task-50');
    if (totalCompleted >= 100 && checkAndUnlock('task-100')) newUnlocks.push('task-100');
    if (totalCompleted >= 500 && checkAndUnlock('task-500')) newUnlocks.push('task-500');
    
    // Streak achievements
    if (cityStats.streak >= 3 && checkAndUnlock('streak-3')) newUnlocks.push('streak-3');
    if (cityStats.streak >= 7 && checkAndUnlock('streak-7')) newUnlocks.push('streak-7');
    if (cityStats.streak >= 30 && checkAndUnlock('streak-30')) newUnlocks.push('streak-30');
    if (cityStats.streak >= 100 && checkAndUnlock('streak-100')) newUnlocks.push('streak-100');
    
    // City achievements
    if (cityStats.population >= 50 && checkAndUnlock('pop-50')) newUnlocks.push('pop-50');
    if (cityStats.population >= 200 && checkAndUnlock('pop-200')) newUnlocks.push('pop-200');
    if (cityStats.population >= 500 && checkAndUnlock('pop-500')) newUnlocks.push('pop-500');
    if (cityStats.buildings.length >= 10 && checkAndUnlock('buildings-10')) newUnlocks.push('buildings-10');
    if (cityStats.buildings.length >= 25 && checkAndUnlock('buildings-25')) newUnlocks.push('buildings-25');
    
    // Special achievements
    if (cityStats.happiness >= 100 && checkAndUnlock('happiness-100')) newUnlocks.push('happiness-100');
    
    // Time-based achievements
    const hour = new Date().getHours();
    const completedRecently = tasks.filter(t => 
      t.completed && t.completedAt && 
      new Date(t.completedAt).getTime() > Date.now() - 60000
    );
    
    if (completedRecently.length > 0) {
      if (hour < 7 && checkAndUnlock('early-bird')) newUnlocks.push('early-bird');
      if (hour >= 23 && checkAndUnlock('night-owl')) newUnlocks.push('night-owl');
    }
    
    return newUnlocks;
  }, [cityStats, tasks, checkAndUnlock]);

  const getRecentAchievements = useCallback((count: number = 5) => {
    return achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, count);
  }, [achievements]);

  return {
    achievements,
    unlockedCount,
    totalCount,
    checkAchievements,
    getRecentAchievements
  };
}
