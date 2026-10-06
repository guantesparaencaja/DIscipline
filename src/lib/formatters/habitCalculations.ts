import { Habit, HabitLog } from '../../types';
import { getTodayDateString } from './datesHelper';

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
