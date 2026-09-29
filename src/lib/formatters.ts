import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from './constants';
import { TransformationId, Goal, DailyObjective, Achievement, Habit, HabitLog } from '../types';

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
 * Returns today's date formatted as YYYY-MM-DD in the given timezone (defaults to America/Bogota)
 */
export const getTodayDateString = (timeZone: string = 'America/Bogota'): string => {
  const now = new Date();
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timeZone || 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    return `${y}-${m}-${d}`;
  } catch (e) {
    // Fallback if timezone string is invalid
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    return `${y}-${m}-${d}`;
  }
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
    // Streak broken by skipping a day
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
    fearsScore: number;
  };
}

/**
 * Determines whether a habit is scheduled/due on a given YYYY-MM-DD date.
 * - Diaria: every day.
 * - Semanal / Personalizada: checks if habit.customDays includes day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 *   If customDays is empty or not set for semanal, defaults to Monday (1).
 */
export const isHabitDueOnDate = (habit: Habit, dateStr: string): boolean => {
  if (!habit || !habit.isActive) return false;
  if (habit.frequency === 'diaria') return true;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, (m || 1) - 1, d || 1);
  const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  if (habit.frequency === 'semanal' || habit.frequency === 'personalizada') {
    if (!habit.customDays || habit.customDays.length === 0) {
      return dayOfWeek === 1; // Default to Monday
    }
    return habit.customDays.includes(dayOfWeek);
  }

  return true;
};

/**
 * Calculates current streak, best streak, 30-day completion rate and total completions for a specific habit.
 */
export const calculateHabitStreak = (
  habit: Habit,
  allLogs: HabitLog[],
  todayStr: string = getTodayDateString()
): {
  currentStreak: number;
  bestStreak: number;
  thirtyDayRate: number;
  totalCompletions: number;
} => {
  if (!habit) {
    return { currentStreak: 0, bestStreak: 0, thirtyDayRate: 0, totalCompletions: 0 };
  }

  const habitLogs = (allLogs || []).filter((l) => l && l.habitId === habit.id && l.completed);
  const completedDates = new Set(habitLogs.map((l) => l.date));
  const totalCompletions = completedDates.size;

  // 1. Calculate 30-Day Rate
  let dueIn30 = 0;
  let doneIn30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    if (isHabitDueOnDate(habit, dStr)) {
      dueIn30++;
      if (completedDates.has(dStr)) {
        doneIn30++;
      }
    }
  }
  const thirtyDayRate = dueIn30 > 0 ? Math.min(100, Math.round((doneIn30 / dueIn30) * 100)) : 0;

  // 2. Calculate Current Streak
  let currentStreak = 0;
  const completedToday = completedDates.has(todayStr);

  if (completedToday) {
    currentStreak++;
    for (let i = 1; i <= 365; i++) {
      const prev = new Date();
      prev.setDate(prev.getDate() - i);
      const prevStr = prev.toISOString().split('T')[0];
      if (isHabitDueOnDate(habit, prevStr)) {
        if (completedDates.has(prevStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  } else {
    // Check backwards from yesterday
    let streakFromYesterday = 0;
    for (let i = 1; i <= 365; i++) {
      const prev = new Date();
      prev.setDate(prev.getDate() - i);
      const prevStr = prev.toISOString().split('T')[0];
      if (isHabitDueOnDate(habit, prevStr)) {
        if (completedDates.has(prevStr)) {
          streakFromYesterday++;
        } else {
          break;
        }
      }
    }
    currentStreak = streakFromYesterday;
  }

  // 3. Best streak calculation across history
  // Scan all past 180 days to find the longest uninterrupted streak of completed due days
  let bestStreak = currentStreak;
  let runningStreak = 0;
  for (let i = 180; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    if (isHabitDueOnDate(habit, dStr)) {
      if (completedDates.has(dStr)) {
        runningStreak++;
        if (runningStreak > bestStreak) bestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    thirtyDayRate,
    totalCompletions
  };
};

/**
 * Real calculation engine for Power Scores:
 * - Poder Financiero (0–100)
 * - Poder de Hábitos/Disciplina (0–100) usando habit_logs reales de los últimos 30 días
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
  totalAchievementsCount,
  conqueredFearsCount = 0,
  totalBraveryPoints = 0,
  habits = [],
  habitLogs = []
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
  conqueredFearsCount?: number;
  totalBraveryPoints?: number;
  habits?: Habit[];
  habitLogs?: HabitLog[];
}): PowerBreakdown => {
  // 1. Financial Power (0 - 100)
  let savingsCompliance = 50;
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
  // Calculates habitsPower using REAL habit_logs from the last 30 days
  const todayStr = getTodayDateString();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

  const activeHabits = (habits || []).filter((h) => h && h.isActive);
  const safeLogs = (habitLogs || []).filter((l) => l && l.completed);

  let completionRate = 50;
  let habitStreak = currentStreak || 0;
  let totalCompletions30d = 0;

  if (activeHabits.length > 0) {
    let totalDue = 0;
    let totalDone = 0;
    const loggedSet = new Set(safeLogs.map((l) => `${l.habitId}_${l.date}`));

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      activeHabits.forEach((habit) => {
        if (isHabitDueOnDate(habit, dStr)) {
          totalDue++;
          if (loggedSet.has(`${habit.id}_${dStr}`)) {
            totalDone++;
          }
        }
      });
    }

    totalCompletions30d = totalDone;
    completionRate = totalDue > 0 ? (totalDone / totalDue) * 100 : 50;

    const habitStreaks = activeHabits.map(
      (h) => calculateHabitStreak(h, safeLogs, todayStr).currentStreak
    );
    if (habitStreaks.length > 0) {
      habitStreak = Math.max(currentStreak || 0, ...habitStreaks);
    }
  } else {
    // Fallback if user has not registered any habits yet
    const safeObjectives = dailyObjectives || [];
    const recentObjectives = safeObjectives.filter((obj) => obj && obj.date && obj.date >= thirtyDaysStr);
    const totalRecent = recentObjectives.length;
    const completedRecent = recentObjectives.filter((obj) => obj && obj.status === 'completado').length;
    completionRate = totalRecent > 0 ? (completedRecent / totalRecent) * 100 : 50;
    totalCompletions30d = completedRecent;
  }

  const streakBonus = Math.min(100, (habitStreak || 0) * 4.5); // 21 days = ~95%
  const habitsPower = Math.min(100, Math.max(0, Math.round(completionRate * 0.65 + streakBonus * 0.35)));

  // 3. Poder Base = 70% Financiero + 30% Hábitos
  const basePower = Math.min(100, Math.max(0, Math.round(financialPower * 0.7 + habitsPower * 0.3)));

  // 4. Evolution Power (0 - 100)
  const safeGoals = goals || [];
  let goalsProgressScore = 20;
  if (safeGoals.length > 0) {
    const avgProgress =
      safeGoals.reduce((acc, g) => acc + ((Number(g.currentSavings) || 0) / (Number(g.targetAmount) || 1)) * 100, 0) /
      safeGoals.length;
    goalsProgressScore = Math.min(100, avgProgress);
  }
  const achievementsScore =
    totalAchievementsCount > 0 ? Math.min(100, (unlockedAchievementsCount / totalAchievementsCount) * 100) : 0;
  const levelScore = Math.min(100, currentLevel * 8); // Level 12 = ~96
  const streakMultiplier = Math.min(100, currentStreak * 4);
  // Bravery points and conquered fears feed the fearsScore of Evolution Power
  const fearsScore = Math.min(
    100,
    Math.round(Math.min(70, Math.round(totalBraveryPoints * 0.7)) + (conqueredFearsCount || 0) * 20)
  );

  const evolutionPower = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        goalsProgressScore * 0.25 +
          achievementsScore * 0.25 +
          levelScore * 0.2 +
          streakMultiplier * 0.15 +
          fearsScore * 0.15
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
      totalObjectivesDone: totalCompletions30d
    },
    evolutionBreakdown: {
      goalsProgressScore: Math.round(goalsProgressScore),
      achievementsScore: Math.round(achievementsScore),
      streakMultiplier: Math.round(streakMultiplier),
      levelScore: Math.round(levelScore),
      fearsScore: Math.round(fearsScore)
    }
  };
};

