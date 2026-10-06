import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from '../constants';
import { TransformationId, Goal, DailyObjective, Habit, HabitLog } from '../../types';
import { getTodayDateString } from './datesHelper';
import { isHabitDueOnDate, calculateHabitStreak } from './habitCalculations';

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
    const safeObjectives = dailyObjectives || [];
    const recentObjectives = safeObjectives.filter((obj) => obj && obj.date && obj.date >= thirtyDaysStr);
    const totalRecent = recentObjectives.length;
    const completedRecent = recentObjectives.filter((obj) => obj && obj.status === 'completado').length;
    completionRate = totalRecent > 0 ? (completedRecent / totalRecent) * 100 : 50;
    totalCompletions30d = completedRecent;
  }

  const streakBonus = Math.min(100, (habitStreak || 0) * 4.5);
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
  const levelScore = Math.min(100, currentLevel * 8);
  const streakMultiplier = Math.min(100, currentStreak * 4);
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
