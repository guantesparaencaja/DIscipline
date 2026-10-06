import { getTodayDateString } from './formatters/datesHelper';

export * from './formatters/datesHelper';
export * from './formatters/habitCalculations';
export * from './formatters/powerCalculations';

/**
 * Formats a numeric value to Colombian Peso (COP) with standard es-CO format:
 * $ 1.250.000 (no cents)
 */
export const formatCOP = (amount: number): string => {
  const rounded = Math.round(amount || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(rounded);
};

/**
 * Formats a plain number with dot thousands separator:
 * 1.250.000
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  }).format(Math.round(num || 0));
};

/**
 * Formats a date string (YYYY-MM-DD) into readable Spanish format:
 * '28 sep, 2026' or 'Lunes, 28 de septiembre'
 */
export const formatDateSpanish = (dateStr: string, full = false): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  if (full) {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Computes difference in calendar days between two YYYY-MM-DD dates (d2 - d1).
 */
export const getCalendarDaysDifference = (dateStr1?: string, dateStr2?: string): number => {
  if (!dateStr1 || !dateStr2) return 999;
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
  const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
};

/**
 * Calculates new streak according to gamification rules:
 * - Same day: streak does not increment again
 * - Exactly 1 day after lastActiveDate: streak increments by 1
 * - Skipped 1 or more days (diff > 1) or no previous date: streak resets to 1
 */
export const calculateStreakOnActivity = (
  currentStreak: number,
  bestStreak: number,
  lastActiveDate: string | undefined,
  today: string
): { newStreak: number; newBestStreak: number; isNewDay: boolean } => {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newBestStreak: Math.max(bestStreak || 0, 1),
      isNewDay: true
    };
  }

  if (lastActiveDate === today) {
    return {
      newStreak: currentStreak || 1,
      newBestStreak: Math.max(bestStreak || 0, currentStreak || 1),
      isNewDay: false
    };
  }

  const diff = getCalendarDaysDifference(lastActiveDate, today);
  let newStreak = 1;
  if (diff === 1) {
    newStreak = (currentStreak || 0) + 1;
  } else {
    newStreak = 1;
  }

  const newBestStreak = Math.max(bestStreak || 0, newStreak);
  return { newStreak, newBestStreak, isNewDay: true };
};

/**
 * Level progression formula matching level_for_xp:
 * Level n requires cumulative XP = 100 * n * (n + 1) / 2 = 50 * n * (n + 1)
 */
export const getLevelFromXP = (xp: number): number => {
  if (xp <= 0) return 1;
  const n = Math.floor((-1 + Math.sqrt(1 + (8 * xp) / 100)) / 2);
  return Math.max(1, n);
};

export const getCumulativeXPForLevel = (level: number): number => {
  if (level <= 0) return 0;
  return (100 * level * (level + 1)) / 2;
};

export interface LevelProgressInfo {
  level: number;
  totalXp: number;
  currentLevelXpStart: number;
  nextLevelXpRequirement: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

export const getLevelProgress = (totalXp: number): LevelProgressInfo => {
  const level = getLevelFromXP(totalXp);
  const currentLevelXpStart = getCumulativeXPForLevel(level);
  const nextLevelXpRequirement = getCumulativeXPForLevel(level + 1);
  const xpNeededForNextLevel = nextLevelXpRequirement - currentLevelXpStart;
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelXpStart);
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / (xpNeededForNextLevel || 1)) * 100))
  );

  return {
    level,
    totalXp,
    currentLevelXpStart,
    nextLevelXpRequirement,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage
  };
};
