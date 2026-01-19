export type TaskCategory = 'study' | 'work' | 'habits' | 'personal';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
  scheduledTime?: string;
}

export interface CityStats {
  population: number;
  happiness: number; // 0-100
  streak: number;
  buildings: Building[];
  lastActivityDate: string;
  totalTasksCompleted: number;
}

export interface Building {
  id: string;
  type: 'school' | 'office' | 'gym' | 'park' | 'house' | 'tower';
  level: number;
  category: TaskCategory;
  unlockedAt: string;
}

export const CATEGORY_ICONS = {
  study: '📚',
  work: '💼',
  habits: '🌱',
  personal: '✨'
} as const;

export const CATEGORY_LABELS = {
  study: 'Study',
  work: 'Work',
  habits: 'Habits',
  personal: 'Personal'
} as const;

export const PRIORITY_IMPACT = {
  low: 1,
  medium: 2,
  high: 3
} as const;