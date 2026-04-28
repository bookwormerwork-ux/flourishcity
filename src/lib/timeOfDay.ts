/**
 * Map the current time of day to a sky gradient + window-glow intensity.
 * Pure function so it can be reused by CityView, DetailedCityView, etc.
 */
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface SkyState {
  phase: TimeOfDay;
  /** Tailwind-ready linear-gradient string for the sky. */
  gradient: string;
  /** 0..1 — how much building windows should glow. */
  windowGlow: number;
  /** show stars? */
  showStars: boolean;
  /** show sun/moon */
  showSun: boolean;
  showMoon: boolean;
}

export function getSkyState(date: Date = new Date()): SkyState {
  const h = date.getHours() + date.getMinutes() / 60;

  // 5–7 dawn, 7–18 day, 18–20 dusk, 20–5 night
  if (h >= 5 && h < 7) {
    return {
      phase: 'dawn',
      gradient:
        'linear-gradient(180deg, hsl(15 80% 70%) 0%, hsl(35 90% 78%) 45%, hsl(50 75% 85%) 100%)',
      windowGlow: 0.4,
      showStars: false,
      showSun: true,
      showMoon: false,
    };
  }
  if (h >= 7 && h < 17) {
    return {
      phase: 'day',
      gradient:
        'linear-gradient(180deg, hsl(205 85% 70%) 0%, hsl(200 80% 82%) 60%, hsl(190 70% 90%) 100%)',
      windowGlow: 0.05,
      showStars: false,
      showSun: true,
      showMoon: false,
    };
  }
  if (h >= 17 && h < 20) {
    return {
      phase: 'dusk',
      gradient:
        'linear-gradient(180deg, hsl(260 50% 35%) 0%, hsl(15 75% 60%) 50%, hsl(40 85% 70%) 100%)',
      windowGlow: 0.7,
      showStars: false,
      showSun: true,
      showMoon: false,
    };
  }
  return {
    phase: 'night',
    gradient:
      'linear-gradient(180deg, hsl(230 50% 10%) 0%, hsl(235 45% 18%) 60%, hsl(240 40% 25%) 100%)',
    windowGlow: 1,
    showStars: true,
    showSun: false,
    showMoon: true,
  };
}

/** Re-render every 5 min — the gradient doesn't change fast enough to need more. */
export const SKY_REFRESH_MS = 5 * 60 * 1000;
