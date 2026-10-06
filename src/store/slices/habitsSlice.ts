import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, HabitsSlice } from '../types';
import { Habit, HabitLog, XPEvent } from '../../types';
import {
  calculateHabitStreak,
  isHabitDueOnDate,
  getTodayDateString,
  getLevelFromXP,
  calculateStreakOnActivity
} from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { habitsRepository } from '../../data';
import { enqueueOfflineAction } from '../../lib/offlineQueue';
import { getInitialData, saveCache } from '../initialData';

export const createHabitsSlice: StateCreator<SayayinStore, [], [], HabitsSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    habits: initial.habits,
    habitLogs: initial.habitLogs,

    getHabitStats: (habitId: string) => {
      const state = get();
      const habit = (state.habits || []).find((h) => h.id === habitId);
      if (!habit) {
        return { currentStreak: 0, bestStreak: 0, thirtyDayRate: 0, totalCompletions: 0 };
      }
      return calculateHabitStreak(habit, state.habitLogs || [], getTodayDateString());
    },

    getHabitsForDate: (dateStr: string) => {
      const state = get();
      const activeHabits = (state.habits || []).filter((h) => h && h.isActive);
      const safeLogs = state.habitLogs || [];

      // Filter only habits scheduled for dateStr
      const scheduledHabits = activeHabits.filter((h) => isHabitDueOnDate(h, dateStr));

      return scheduledHabits.map((habit) => {
        const stats = calculateHabitStreak(habit, safeLogs, dateStr);
        const completed = safeLogs.some(
          (l) => l.habitId === habit.id && l.date === dateStr && l.completed
        );

        return {
          ...habit,
          currentStreak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          thirtyDayRate: stats.thirtyDayRate,
          totalCompletions: stats.totalCompletions,
          completedToday: completed,
          isDueToday: true
        };
      });
    },

    addHabit: async (data) => {
      const state = get();
      const userId = state.profile.id;
      const newHabit: Habit = {
        ...data,
        id: 'habit_' + Math.random().toString(36).substring(2, 9),
        userId,
        createdAt: new Date().toISOString()
      };

      const updatedHabits = [...state.habits, newHabit];
      set({ habits: updatedHabits, isHabitModalOpen: false, editingHabit: null });
      saveCache(get());
      get().recalculatePowersAndSave();

      if (isSupabaseConfigured() && state.authUser) {
        habitsRepository.createHabit(newHabit).catch(console.warn);
      }

      get().addToast({
        type: 'success',
        title: 'Hábito Creado',
        description: `Se incorporó "${newHabit.name}" a tu radar de entrenamiento.`
      });
    },

    updateHabit: async (id, updates) => {
      const state = get();
      const updatedHabits = state.habits.map((h) =>
        h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
      );

      set({ habits: updatedHabits, isHabitModalOpen: false, editingHabit: null });
      saveCache(get());
      get().recalculatePowersAndSave();

      if (isSupabaseConfigured() && state.authUser) {
        habitsRepository.updateHabit(id, updates).catch(console.warn);
      }

      get().addToast({
        type: 'info',
        title: 'Hábito Actualizado',
        description: 'Tus modificaciones fueron guardadas con éxito.'
      });
    },

    deleteHabit: async (id) => {
      const state = get();
      const habit = state.habits.find((h) => h.id === id);
      const updatedHabits = state.habits.filter((h) => h.id !== id);
      const updatedLogs = state.habitLogs.filter((l) => l.habitId !== id);

      set({ habits: updatedHabits, habitLogs: updatedLogs });
      saveCache(get());
      get().recalculatePowersAndSave();

      if (isSupabaseConfigured() && state.authUser) {
        habitsRepository.deleteHabit(id).catch(console.warn);
      }

      get().addToast({
        type: 'warning',
        title: 'Hábito Eliminado',
        description: habit ? `"${habit.name}" fue removido de tu radar.` : 'Hábito eliminado.'
      });
    },

    toggleHabitDay: async (habitId: string, dateStr: string) => {
      const state = get();
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existingLog = state.habitLogs.find(
        (l) => l.habitId === habitId && l.date === dateStr && l.completed
      );

      const userId = state.profile.id;
      const today = getTodayDateString();

      if (existingLog) {
        // UNMARKING HABIT
        const updatedLogs = state.habitLogs.filter(
          (l) => !(l.habitId === habitId && l.date === dateStr)
        );

        const xpDeduction = habit.xpReward || 15;
        const newXP = Math.max(0, state.profile.currentXp - xpDeduction);
        const newLevel = getLevelFromXP(newXP);

        const undoEvent: XPEvent = {
          id: 'xp_' + Math.random().toString(36).substring(2, 9),
          userId,
          sourceType: 'compensatory_undo',
          description: `Desmarcado: ${habit.name} (-${xpDeduction} XP)`,
          xpAmount: -xpDeduction,
          createdAt: dateStr
        };

        set((s) => ({
          habitLogs: updatedLogs,
          xpEvents: [undoEvent, ...s.xpEvents],
          profile: {
            ...s.profile,
            currentXp: newXP,
            currentLevel: newLevel
          }
        }));

        saveCache(get());
        get().recalculatePowersAndSave();

        if (isSupabaseConfigured() && state.authUser) {
          habitsRepository.deleteHabitLog(habitId, dateStr).catch(console.warn);
        }

        get().addToast({
          type: 'info',
          title: 'Hábito Desmarcado',
          description: `${habit.name} desmarcado para ${dateStr}`
        });
      } else {
        // MARKING HABIT AS COMPLETED
        const newLog: HabitLog = {
          id: 'hlog_' + Math.random().toString(36).substring(2, 9),
          habitId,
          userId,
          date: dateStr,
          completed: true,
          completedAt: new Date().toISOString()
        };

        const updatedLogs = [
          ...state.habitLogs.filter((l) => !(l.habitId === habitId && l.date === dateStr)),
          newLog
        ];

        const xpReward = habit.xpReward || 15;
        const newXP = state.profile.currentXp + xpReward;
        const newLevel = getLevelFromXP(newXP);

        const newXpEvent: XPEvent = {
          id: 'xp_' + Math.random().toString(36).substring(2, 9),
          userId,
          sourceType: 'habit',
          description: `Hábito cumplido: ${habit.name}`,
          xpAmount: xpReward,
          createdAt: dateStr
        };

        const streakUpdate = calculateStreakOnActivity(
          state.profile.currentStreak,
          state.profile.bestStreak,
          state.profile.lastActiveDate,
          today
        );

        set((s) => ({
          habitLogs: updatedLogs,
          xpEvents: [newXpEvent, ...s.xpEvents],
          profile: {
            ...s.profile,
            currentXp: newXP,
            availableXp: (s.profile.availableXp ?? s.profile.currentXp) + xpReward,
            currentLevel: newLevel,
            currentStreak: streakUpdate.newStreak,
            bestStreak: streakUpdate.newBestStreak,
            lastActiveDate: today
          }
        }));

        if (dateStr === today) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.7 }
            });
          } catch {}
        }

        saveCache(get());
        get().recalculatePowersAndSave();
        get().checkAchievements();

        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        if (isSupabaseConfigured() && state.authUser && isOnline) {
          habitsRepository.setHabitLog(newLog).catch(() => {
            enqueueOfflineAction({
              dedupKey: 'toggle_habit_' + habitId + '_' + dateStr,
              type: 'toggle_habit',
              payload: newLog
            });
          });
        } else {
          enqueueOfflineAction({
            dedupKey: 'toggle_habit_' + habitId + '_' + dateStr,
            type: 'toggle_habit',
            payload: newLog
          });
        }

        get().addToast({
          type: 'xp',
          title: `¡HÁBITO CUMPLIDO! +${xpReward} XP`,
          description: habit.name,
          xpAmount: xpReward
        });
      }
    }
  };
};
