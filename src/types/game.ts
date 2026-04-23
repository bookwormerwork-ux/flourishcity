/* ============================================================
 * Flourish City — game types (overhaul)
 * ============================================================ */

export type TaskCategory =
  | 'work'
  | 'study'
  | 'health'
  | 'home'
  | 'creative'
  | 'growth'
  | 'social'
  | 'finance'
  // legacy categories kept so existing localStorage tasks still work
  | 'habits'
  | 'personal';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskStatus =
  | 'pending_start'
  | 'in_progress'
  | 'completed'
  | 'debt'
  | 'abandoned';

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

  // ---- overhaul fields (all optional so legacy tasks load) ----
  estimatedDurationMinutes?: number;
  difficulty?: TaskDifficulty;
  startedAt?: string;
  status?: TaskStatus;
  verified?: boolean;
  isBigProject?: boolean;
  bigProjectTotalSessions?: number;
  bigProjectSessionsDone?: number;
  isDebt?: boolean;
  buildingType?: BuildingType;
}

export type BuildingType =
  // category-mapped buildings
  | 'office'
  | 'library'
  | 'gym'
  | 'park'
  | 'house'
  | 'studio'
  | 'temple'
  | 'meditation'
  | 'cafe'
  | 'bank'
  // big-project landmarks
  | 'cathedral'
  | 'stadium'
  | 'grand_library'
  // existing/legacy
  | 'apartment'
  | 'shop'
  | 'school'
  | 'hospital'
  | 'tower'
  | 'town_hall'
  | 'police'
  | 'fire'
  | 'factory'
  | 'statue';

export type BuildingState = 'completed' | 'debt' | 'big_project' | 'neglected';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  category: TaskCategory;
  unlockedAt: string;
  state?: BuildingState;
  taskId?: string; // link back to triggering task (debt / big project)
  meta: {
    name: string;
    members: number;
    shops?: number;
    floors?: number;
  };
}

export interface CitizenDemand {
  id: string;
  text: string;
  createdAt: string;
  dismissed?: boolean;
}

export interface CouncilReport {
  id: string;
  text: string;
  createdAt: string;
}

export interface CityStats {
  population: number;
  happiness: number;
  streak: number;
  buildings: Building[];
  lastActivityDate: string;
  totalTasksCompleted: number;
  // ---- overhaul fields ----
  cityName?: string;
  lastCompletionAt?: string;
  lastCouncilReportAt?: string;
  cooldowns?: Partial<Record<TaskCategory, string>>; // category -> ISO expiry
  citizenDemands?: CitizenDemand[];
  councilReports?: CouncilReport[];
  decayShownCrisis?: boolean;
}

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work: '💼',
  study: '📚',
  health: '🏃',
  home: '🏠',
  creative: '🎨',
  growth: '🌱',
  social: '☕',
  finance: '💰',
  habits: '🌱',
  personal: '✨',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Work',
  study: 'Study',
  health: 'Health & Fitness',
  home: 'Home & Chores',
  creative: 'Creative',
  growth: 'Personal Growth',
  social: 'Social',
  finance: 'Finance',
  habits: 'Habits',
  personal: 'Personal',
};

/** Categories shown in the new task creation form (legacy hidden). */
export const ACTIVE_CATEGORIES: TaskCategory[] = [
  'work',
  'study',
  'health',
  'home',
  'creative',
  'growth',
  'social',
  'finance',
];

export const PRIORITY_IMPACT = { low: 1, medium: 2, high: 3 } as const;

export const DIFFICULTY_REWARDS: Record<TaskDifficulty, { population: number; happiness: number }> = {
  easy:   { population: 10, happiness: 5 },
  medium: { population: 25, happiness: 15 },
  hard:   { population: 50, happiness: 30 },
};

export const COOLDOWN_HOURS = 24;
export const DECAY_HOURS = 48;
export const DEBT_MULTIPLIER = 3;
export const COMPLETE_UNLOCK_PCT = 0.8;

/** Map a category → preferred building type. */
export function buildingForCategory(category: TaskCategory, completionIndex = 0): BuildingType {
  switch (category) {
    case 'work':     return 'office';
    case 'study':    return 'library';
    case 'health':   return completionIndex % 2 === 0 ? 'gym' : 'park';
    case 'home':     return 'house';
    case 'creative': return 'studio';
    case 'growth':   return completionIndex % 2 === 0 ? 'temple' : 'meditation';
    case 'social':   return 'cafe';
    case 'finance':  return 'bank';
    // legacy fallbacks
    case 'habits':   return 'gym';
    case 'personal': return 'house';
  }
}

/** Map a category → big-project landmark. */
export function landmarkForCategory(category: TaskCategory): BuildingType {
  switch (category) {
    case 'study':
    case 'growth':
      return 'grand_library';
    case 'health':
    case 'social':
      return 'stadium';
    default:
      return 'cathedral';
  }
}

export const BUILDING_INFO: Record<BuildingType, { emoji: string; label: string; kind: string; description: string }> = {
  office:        { emoji: '🏢', label: 'Office Tower',     kind: 'Workplace',   description: 'Where focused work shapes the city.' },
  library:       { emoji: '📚', label: 'Library',          kind: 'Education',   description: 'Knowledge gathered through study.' },
  gym:           { emoji: '🏋️', label: 'Gym',              kind: 'Wellness',    description: 'Built by sweat and discipline.' },
  park:          { emoji: '🌳', label: 'Park',             kind: 'Wellness',    description: 'A place to breathe and recover.' },
  house:         { emoji: '🏠', label: 'House',            kind: 'Residential', description: 'A home built from daily care.' },
  studio:        { emoji: '🎨', label: 'Creative Studio',  kind: 'Creative',    description: 'Where ideas become real things.' },
  temple:        { emoji: '🏛️', label: 'Temple',           kind: 'Growth',      description: 'A monument to inner work.' },
  meditation:    { emoji: '🧘', label: 'Meditation Center',kind: 'Growth',      description: 'Stillness made into stone.' },
  cafe:          { emoji: '☕', label: 'Café',             kind: 'Social',      description: 'A place where citizens connect.' },
  bank:          { emoji: '🏦', label: 'Bank',             kind: 'Finance',     description: 'Built on careful planning.' },
  cathedral:     { emoji: '🕌', label: 'Grand Cathedral',  kind: 'Landmark',    description: 'A landmark earned through long effort.' },
  stadium:       { emoji: '🏟️', label: 'Stadium',          kind: 'Landmark',    description: 'A monument to teamwork and grit.' },
  grand_library: { emoji: '📖', label: 'Grand Library',    kind: 'Landmark',    description: 'A masterwork of accumulated knowledge.' },
  apartment:     { emoji: '🏢', label: 'Apartment Block',  kind: 'Residential', description: 'High-density housing for many citizens.' },
  shop:          { emoji: '🏬', label: 'Shop',             kind: 'Commercial',  description: 'Daily goods and friendly faces.' },
  school:        { emoji: '🏫', label: 'School',           kind: 'Education',   description: 'The future of your city learns here.' },
  hospital:      { emoji: '🏥', label: 'Hospital',         kind: 'Wellness',    description: 'Caring for everyone in the city.' },
  tower:         { emoji: '🏙️', label: 'Skyscraper',       kind: 'Landmark',    description: 'A symbol of ambition.' },
  town_hall:     { emoji: '🏛️', label: 'Town Hall',        kind: 'Government',  description: 'The heart of city governance.' },
  police:        { emoji: '🚓', label: 'Police Station',   kind: 'Government',  description: 'Keeping the city safe.' },
  fire:          { emoji: '🚒', label: 'Fire Station',     kind: 'Government',  description: 'Always ready to respond.' },
  factory:       { emoji: '🏭', label: 'Factory',          kind: 'Industrial',  description: 'Powering the local economy.' },
  statue:        { emoji: '🗽', label: 'Monument',         kind: 'Landmark',    description: 'Commemorates a milestone.' },
};
