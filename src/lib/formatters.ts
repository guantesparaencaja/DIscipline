import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from './constants';
import { TransformationId, Goal, DailyObjective, Achievement } from '../types';

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
 * Returns today's date formatted as YYYY-MM-DD in America/Bogota timezone
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
};

/**
 * Level progression formula matching level_for_xp:
 * Level n requires cumulative XP = 100 * n * (n + 1) / 2 = 50 * n * (n + 1)
 */
export const getLevelFromXP = (xp: number): number => {
  if (xp <= 0) return 1;
  // Solving 50 * n * (n + 1) <= xp
  // n^2 + n - xp/50 = 0 -> n = (-1 + sqrt(1 + 4*(xp/50))) / 2
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

/**
 * Calculates Required Pace for a savings goal:
 * Monthly, Weekly, and Daily required savings to meet targetDate
 */
export interface GoalPaceMetrics {
  targetAmount: number;
  currentSavings: number;
  remainingAmount: number;
  progressPercentage: number;
  daysRemaining: number;
  daysTotal: number;
  daysElapsed: number;
  dailyRequiredPace: number;
  weeklyRequiredPace: number;
  monthlyRequiredPace: number;
  currentDailyPace: number;
  paceStatus: 'completada' | 'por_encima' | 'en_ritmo' | 'por_debajo';
  statusMessage: string;
}

export const calculateGoalPace = (goal: Goal): GoalPaceMetrics => {
  const todayStr = getTodayDateString();
  const targetDate = new Date(goal.targetDate);
  const startDate = new Date(goal.startDate || goal.createdAt);
  const today = new Date(todayStr);

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((targetDate.getTime() - startDate.getTime()) / msPerDay));
  const remainingDays = Math.max(1, Math.round((targetDate.getTime() - today.getTime()) / msPerDay));
  const elapsedDays = Math.max(1, Math.round((today.getTime() - startDate.getTime()) / msPerDay));

  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentSavings);
  const progressPercentage = Math.min(100, Math.round((goal.currentSavings / (goal.targetAmount || 1)) * 100));

  const dailyRequiredPace = remainingAmount / remainingDays;
  const weeklyRequiredPace = dailyRequiredPace * 7;
  const monthlyRequiredPace = dailyRequiredPace * 30.416;

  const currentDailyPace = goal.currentSavings / elapsedDays;

  let paceStatus: GoalPaceMetrics['paceStatus'] = 'en_ritmo';
  let statusMessage = 'En ritmo esperado para alcanzar la meta';

  if (goal.currentSavings >= goal.targetAmount) {
    paceStatus = 'completada';
    statusMessage = '¡Meta completada con honores de guerrero!';
  } else if (currentDailyPace >= dailyRequiredPace * 1.05) {
    paceStatus = 'por_encima';
    statusMessage = 'Vas por encima del ritmo esperado (¡Excelente control de ki!)';
  } else if (currentDailyPace >= dailyRequiredPace * 0.8) {
    paceStatus = 'en_ritmo';
    statusMessage = 'En ritmo adecuado para completar a tiempo';
  } else {
    paceStatus = 'por_debajo';
    statusMessage = 'Por debajo del ritmo esperado (Aumenta la cuota de ahorro)';
  }

  return {
    targetAmount: goal.targetAmount,
    currentSavings: goal.currentSavings,
    remainingAmount,
    progressPercentage,
    daysRemaining: remainingDays,
    daysTotal: totalDays,
    daysElapsed: elapsedDays,
    dailyRequiredPace,
    weeklyRequiredPace,
    monthlyRequiredPace,
    currentDailyPace,
    paceStatus,
    statusMessage
  };
};

/**
 * Calculates Saiyajin Transformation from Total Power (0 - 100)
 * 0–10: Estado Base
 * 11–20: Ozaru
 * 21–35: Super Sayayin
 * 36–50: SSJ 2
 * 51–65: SSJ 3
 * 66–75: SSJ God
 * 76–85: SSJ Blue
 * 86–95: Ultra Instinto Sign
 * 96–100: Ultra Instinto
 */
export const getTransformationFromPower = (power: number): TransformationId => {
  const p = Math.max(0, Math.min(100, Math.round(power)));
  if (p <= 10) return 'base';
  if (p <= 20) return 'ozaru';
  if (p <= 35) return 'ssj';
  if (p <= 50) return 'ssj2';
  if (p <= 65) return 'ssj3';
  if (p <= 75) return 'ssj_god';
  if (p <= 85) return 'ssj_blue';
  if (p <= 95) return 'ultra_instinto_sign';
  return 'ultra_instinto';
};

export interface PowerBreakdown {
  financialPower: number;
  habitsPower: number;
  basePower: number;
  evolutionPower: number;
  totalPower: number;
  transformationId: TransformationId;
  nextTransformationId: TransformationId | null;
  powerNeededForNext: number;
  financialBreakdown: {
    savingsPaceCompliance: number;
    budgetControlScore: number;
    availableFundsRatio: number;
  };
  habitsBreakdown: {
    thirtyDayCompletionRate: number;
    streakBonus: number;
    totalObjectivesDone: number;
  };
  evolutionBreakdown: {
    goalsProgressScore: number;
    achievementsScore: number;
    streakMultiplier: number;
    levelScore: number;
  };
}

/**
 * Real calculation engine for Power Scores:
 * - Poder Financiero (0–100)
 * - Poder de Hábitos/Disciplina (0–100)
 * - Poder Base = 70% Financiero + 30% Hábitos
 * - Poder de Evolución (0–100)
 * - Poder Total = 70% Poder Base + 30% Poder de Evolución
 */
export const calculateAllPowers = ({
  monthlyIncome,
  totalFixedDeductions,
  totalExpensesThisMonth,
  availableFunds,
  goals,
  dailyObjectives,
  currentStreak,
  currentLevel,
  unlockedAchievementsCount,
  totalAchievementsCount
}: {
  monthlyIncome: number;
  totalFixedDeductions: number;
  totalExpensesThisMonth: number;
  availableFunds: number;
  goals: Goal[];
  dailyObjectives: DailyObjective[];
  currentStreak: number;
  currentLevel: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
}): PowerBreakdown => {
  // 1. Financial Power (0 - 100)
  // Combines savings pace compliance and budget control (positive available funds ratio)
  let savingsCompliance = 50; // default baseline
  if (goals.length > 0) {
    const paces = goals.map((g) => {
      const p = calculateGoalPace(g);
      if (p.paceStatus === 'completada') return 100;
      if (p.paceStatus === 'por_encima') return 95;
      if (p.paceStatus === 'en_ritmo') return 80;
      return Math.max(10, Math.min(60, (p.currentDailyPace / (p.dailyRequiredPace || 1)) * 80));
    });
    savingsCompliance = Math.round(paces.reduce((a, b) => a + b, 0) / paces.length);
  }

  // Budget control score: how well income covers deductions and expenses
  const totalCommitments = totalFixedDeductions + totalExpensesThisMonth;
  let budgetControlScore = 50;
  if (monthlyIncome > 0) {
    const remainingRatio = availableFunds / monthlyIncome;
    if (remainingRatio >= 0.2) budgetControlScore = 95;
    else if (remainingRatio >= 0.1) budgetControlScore = 80;
    else if (remainingRatio >= 0.0) budgetControlScore = 65;
    else if (remainingRatio >= -0.1) budgetControlScore = 35;
    else budgetControlScore = 15;
  }
  const financialPower = Math.min(100, Math.max(0, Math.round(savingsCompliance * 0.6 + budgetControlScore * 0.4)));

  // 2. Habits / Discipline Power (0 - 100)
  // Objectives completed in the last 30 days and current active streak
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

  const recentObjectives = dailyObjectives.filter((obj) => obj.date >= thirtyDaysStr);
  const totalRecent = recentObjectives.length;
  const completedRecent = recentObjectives.filter((obj) => obj.status === 'completado').length;

  const completionRate = totalRecent > 0 ? (completedRecent / totalRecent) * 100 : 50;
  const streakBonus = Math.min(100, currentStreak * 4.5); // 21 days = ~95%
  const habitsPower = Math.min(100, Math.max(0, Math.round(completionRate * 0.65 + streakBonus * 0.35)));

  // 3. Poder Base = 70% Financiero + 30% Hábitos
  const basePower = Math.min(100, Math.max(0, Math.round(financialPower * 0.7 + habitsPower * 0.3)));

  // 4. Evolution Power (0 - 100)
  // Goals progress, completed objectives, achievements, streaks and level
  let goalsProgressScore = 20;
  if (goals.length > 0) {
    const avgProgress = goals.reduce((acc, g) => acc + (g.currentSavings / (g.targetAmount || 1)) * 100, 0) / goals.length;
    goalsProgressScore = Math.min(100, avgProgress);
  }
  const achievementsScore =
    totalAchievementsCount > 0 ? Math.min(100, (unlockedAchievementsCount / totalAchievementsCount) * 100) : 0;
  const levelScore = Math.min(100, currentLevel * 8); // Level 12 = ~96
  const streakMultiplier = Math.min(100, currentStreak * 4);

  const evolutionPower = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        goalsProgressScore * 0.3 +
          achievementsScore * 0.25 +
          levelScore * 0.25 +
          streakMultiplier * 0.2
      )
    )
  );

  // 5. Poder Total = 70% Poder Base + 30% Poder de Evolución
  const totalPower = Math.min(100, Math.max(0, Math.round(basePower * 0.7 + evolutionPower * 0.3)));

  const transformationId = getTransformationFromPower(totalPower);
  const currentIdx = TRANSFORMATION_ORDER.indexOf(transformationId);
  const nextTransformationId = currentIdx < TRANSFORMATION_ORDER.length - 1 ? TRANSFORMATION_ORDER[currentIdx + 1] : null;

  let powerNeededForNext = 0;
  if (nextTransformationId) {
    const nextConfig = TRANSFORMATIONS[nextTransformationId];
    powerNeededForNext = Math.max(0, nextConfig.minPower - totalPower);
  }

  return {
    financialPower,
    habitsPower,
    basePower,
    evolutionPower,
    totalPower,
    transformationId,
    nextTransformationId,
    powerNeededForNext,
    financialBreakdown: {
      savingsPaceCompliance: savingsCompliance,
      budgetControlScore,
      availableFundsRatio: monthlyIncome > 0 ? availableFunds / monthlyIncome : 0
    },
    habitsBreakdown: {
      thirtyDayCompletionRate: Math.round(completionRate),
      streakBonus: Math.round(streakBonus),
      totalObjectivesDone: completedRecent
    },
    evolutionBreakdown: {
      goalsProgressScore: Math.round(goalsProgressScore),
      achievementsScore: Math.round(achievementsScore),
      streakMultiplier: Math.round(streakMultiplier),
      levelScore: Math.round(levelScore)
    }
  };
};
