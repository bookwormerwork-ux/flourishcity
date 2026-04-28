/**
 * Lightweight haptic + SFX hook. Falls back to vibration API on web,
 * and is no-op when unavailable. On Capacitor iOS we'd add @capacitor/haptics.
 */

type HapticPattern = 'tap' | 'success' | 'rise' | 'warning';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [20, 40, 30],
  rise: [15, 25, 15, 25, 40],
  warning: [40, 60, 40],
};

export function haptic(pattern: HapticPattern = 'tap') {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* ignore */
  }
}
