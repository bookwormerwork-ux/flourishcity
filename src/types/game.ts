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

export type BuildingType =
  | 'house'
  | 'apartment'
  | 'shop'
  | 'cafe'
  | 'office'
  | 'school'
  | 'library'
  | 'gym'
  | 'hospital'
  | 'park'
  | 'tower'
  | 'town_hall'
  | 'police'
  | 'fire'
  | 'factory'
  | 'statue';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  category: TaskCategory;
  unlockedAt: string;
  /** Generated metadata shown in the info popup */
  meta: {
    name: string;
    members: number; // residents / staff / visitors
    shops?: number;
    floors?: number;
  };
}

export interface CityStats {
  population: number;
  happiness: number; // 0-100
  streak: number;
  buildings: Building[];
  lastActivityDate: string;
  totalTasksCompleted: number;
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

export const BUILDING_INFO: Record<BuildingType, { emoji: string; label: string; kind: string; description: string }> = {
  house:     { emoji: '🏠', label: 'Cozy House',      kind: 'Residential', description: 'A warm home for a small family.' },
  apartment: { emoji: '🏢', label: 'Apartment Block', kind: 'Residential', description: 'High-density housing for many citizens.' },
  shop:      { emoji: '🏬', label: 'Shop',            kind: 'Commercial',  description: 'Daily goods and friendly faces.' },
  cafe:      { emoji: '☕',  label: 'Café',            kind: 'Commercial',  description: 'Where citizens meet over coffee.' },
  office:    { emoji: '🏢', label: 'Office',          kind: 'Workplace',   description: 'Productive minds at work.' },
  school:    { emoji: '🏫', label: 'School',          kind: 'Education',   description: 'The future of your city learns here.' },
  library:   { emoji: '📚', label: 'Library',         kind: 'Education',   description: 'A quiet place full of stories.' },
  gym:       { emoji: '🏋️', label: 'Gym',             kind: 'Wellness',    description: 'Citizens stay strong and healthy.' },
  hospital:  { emoji: '🏥', label: 'Hospital',        kind: 'Wellness',    description: 'Caring for everyone in the city.' },
  park:      { emoji: '🌳', label: 'Park',            kind: 'Leisure',     description: 'Green space to relax and play.' },
  tower:     { emoji: '🏙️', label: 'Skyscraper',      kind: 'Landmark',    description: 'A symbol of your city’s ambition.' },
  town_hall: { emoji: '🏛️', label: 'Town Hall',       kind: 'Government',  description: 'The heart of city governance.' },
  police:    { emoji: '🚓', label: 'Police Station',  kind: 'Government',  description: 'Keeping the city safe.' },
  fire:      { emoji: '🚒', label: 'Fire Station',    kind: 'Government',  description: 'Always ready to respond.' },
  factory:   { emoji: '🏭', label: 'Factory',         kind: 'Industrial',  description: 'Powering the local economy.' },
  statue:    { emoji: '🗽', label: 'Monument',        kind: 'Landmark',    description: 'Commemorates a milestone you reached.' },
};
