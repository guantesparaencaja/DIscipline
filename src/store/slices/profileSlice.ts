import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, ProfileSlice } from '../types';
import { Achievement, UserAchievement, XPEvent, Profile } from '../../types';
import { INITIAL_ACHIEVEMENTS, TRANSFORMATIONS } from '../../lib/constants';
import {
  calculateAllPowers,
  getLevelFromXP,
  getTodayDateString,
  isHabitDueOnDate,
  calculateHabitStreak
} from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { profileRepository, achievementsRepository } from '../../data';
import { getInitialData, saveCache, STORAGE_KEY, IMPORTED_FLAG_KEY } from '../initialData';

export const createProfileSlice: StateCreator<SayayinStore, [], [], ProfileSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    profile: initial.profile,
    xpEvents: initial.xpEvents,
    achievements: initial.achievements,
    userAchievements: initial.userAchievements,

    getPowerBreakdown: () => {
      const state = get();
      const financialSettings = state.financialSettings || { baseMonthlyIncome: 1250000 };
      const fixedDeductions = state.fixedDeductions || [];
      const expenses = state.expenses || [];
      const goals = state.goals || [];
      const dailyObjectives = state.dailyObjectives || [];
      const habits = state.habits || [];
      const habitLogs = state.habitLogs || [];
      const profile = state.profile || { currentStreak: 0, currentLevel: 1 };
      const userAchievements = state.userAchievements || [];
      const achievements = state.achievements || INITIAL_ACHIEVEMENTS;
      const fears = state.fears || [];

      const monthlyIncome = financialSettings.baseMonthlyIncome || 0;
      const totalFixed = fixedDeductions
        .filter((d) => d && d.isActive)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const totalExpensesThisMonth = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const availableFunds = monthlyIncome - totalFixed - totalExpensesThisMonth;
      const conqueredFearsCount = fears.filter((f) => f && f.status === 'superado').length;
      const totalBraveryPoints = fears.reduce((acc, f) => {
        const fearSteps = f.steps || [];
        return acc + fearSteps.filter((s) => s && s.isCompleted).reduce((sAcc, s) => sAcc + (s.braveryPoints || 0), 0);
      }, 0);

      return calculateAllPowers({
        monthlyIncome,
        totalFixedDeductions: totalFixed,
        totalExpensesThisMonth,
        availableFunds,
        goals,
        dailyObjectives,
        currentStreak: profile.currentStreak,
        currentLevel: profile.currentLevel,
        unlockedAchievementsCount: userAchievements.length,
        totalAchievementsCount: achievements.length,
        conqueredFearsCount,
        totalBraveryPoints,
        habits,
        habitLogs
      });
    },

    recalculatePowersAndSave: () => {
      const breakdown = get().getPowerBreakdown();
      const currentTrans = get().profile.transformation;
      const newTrans = breakdown.transformationId;
      const fears = get().fears || [];
      const totalBraveryPoints = fears.reduce((acc, f) => {
        const fearSteps = f.steps || [];
        return acc + fearSteps.filter((s) => s && s.isCompleted).reduce((sAcc, s) => sAcc + (s.braveryPoints || 0), 0);
      }, 0);

      set((state) => {
        const updatedProfile: Profile = {
          ...state.profile,
          totalPower: breakdown.totalPower,
          basePower: breakdown.basePower,
          evolutionPower: breakdown.evolutionPower,
          financialPower: breakdown.financialPower,
          habitsPower: breakdown.habitsPower,
          braveryScore: totalBraveryPoints,
          transformation: newTrans
        };
        return { profile: updatedProfile };
      });

      // Transformation Evolution Toast
      if (currentTrans !== newTrans) {
        const transConfig = TRANSFORMATIONS[newTrans];
        try {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        } catch {}

        get().addToast({
          type: 'transformation',
          title: `¡HAS ALCANZADO: ${transConfig.name.toUpperCase()}!`,
          description: transConfig.description
        });
      }

      saveCache(get());

      // Save to Supabase profiles table for partner sync
      const { authUser, profile } = get();
      if (authUser && isSupabaseConfigured()) {
        profileRepository.updateCalculatedPowers(authUser.id, {
          totalPower: breakdown.totalPower,
          basePower: breakdown.basePower,
          evolutionPower: breakdown.evolutionPower,
          financialPower: breakdown.financialPower,
          habitsPower: breakdown.habitsPower,
          transformation: newTrans,
          currentStreak: profile.currentStreak,
          bestStreak: profile.bestStreak
        }).catch((err) => console.warn('Supabase profile powers update failed:', err));
      }
    },

    checkAchievements: () => {
      const state = get();
      const dailyObjectives = state.dailyObjectives || [];
      const expenses = state.expenses || [];
      const goals = state.goals || [];
      const profile = state.profile || { currentStreak: 0, currentLevel: 1, currentXp: 0 };
      const partner = state.partner || null;
      const fears = state.fears || [];
      const financialSettings = state.financialSettings || { baseMonthlyIncome: 1250000 };
      const userAchievements = state.userAchievements || [];
      const achievements = state.achievements || INITIAL_ACHIEVEMENTS;
      const authUser = state.authUser;

      const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
      const newlyUnlocked: Achievement[] = [];

      // Calculate distinct dates with expenses
      const expenseDates = new Set(expenses.map((e) => e.date));
      const sortedExpenseDates = Array.from(expenseDates).sort();
      let maxExpenseStreak = 0;
      let curExpenseStreak = 0;
      let lastDateObj: Date | null = null;

      for (const dStr of sortedExpenseDates) {
        const d = new Date(dStr);
        if (!lastDateObj) {
          curExpenseStreak = 1;
        } else {
          const diffDays = Math.round((d.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            curExpenseStreak += 1;
          } else {
            curExpenseStreak = 1;
          }
        }
        if (curExpenseStreak > maxExpenseStreak) maxExpenseStreak = curExpenseStreak;
        lastDateObj = d;
      }

      // Total savings in current month vs base monthly income
      const nowMonth = new Date().toISOString().substring(0, 7);
      const monthlySavingsTotal = expenses
        .filter((e) => e.isSaving && e.date.startsWith(nowMonth))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const monthlyIncome = financialSettings.baseMonthlyIncome || 1250000;
      const savingsRatio = monthlyIncome > 0 ? monthlySavingsTotal / monthlyIncome : 0;

      const totalSavedInGoals = goals.reduce((acc, g) => acc + (Number(g.currentSavings) || 0), 0);
      const totalCompletedObjectives = dailyObjectives.filter((o) => o.status === 'completado').length;

      achievements.forEach((ach) => {
        if (unlockedIds.has(ach.id)) return;

        let shouldUnlock = false;

        switch (ach.code) {
          case 'first_step':
            shouldUnlock = totalCompletedObjectives >= 1;
            break;
          case 'first_habit':
            shouldUnlock = (state.habitLogs || []).some((l) => l && l.completed);
            break;
          case 'habit_streak_7':
            shouldUnlock = (state.habits || []).some(
              (h) => calculateHabitStreak(h, state.habitLogs || []).bestStreak >= 7
            );
            break;
          case 'habit_streak_21':
            shouldUnlock = (state.habits || []).some(
              (h) => calculateHabitStreak(h, state.habitLogs || []).bestStreak >= 21
            );
            break;
          case 'all_habits_today': {
            const todayStr = getTodayDateString();
            const dueToday = (state.habits || []).filter((h) => h.isActive && isHabitDueOnDate(h, todayStr));
            const completedToday = dueToday.filter((h) =>
              (state.habitLogs || []).some((l) => l.habitId === h.id && l.date === todayStr && l.completed)
            );
            shouldUnlock = dueToday.length > 0 && completedToday.length === dueToday.length;
            break;
          }
          case 'streak_3':
            shouldUnlock = profile.currentStreak >= 3;
            break;
          case 'streak_7':
            shouldUnlock = profile.currentStreak >= 7;
            break;
          case 'streak_21':
            shouldUnlock = profile.currentStreak >= 21;
            break;
          case 'streak_30':
            shouldUnlock = profile.currentStreak >= 30;
            break;
          case 'extreme_objective':
            shouldUnlock = dailyObjectives.some(
              (o) => o.status === 'completado' && o.difficulty === 'extremo'
            );
            break;
          case 'total_objectives_25':
            shouldUnlock = totalCompletedObjectives >= 25;
            break;
          case 'first_expense':
            shouldUnlock = expenses.length > 0;
            break;
          case 'expense_streak_7':
            shouldUnlock = maxExpenseStreak >= 7 || expenseDates.size >= 7;
            break;
          case 'first_saving':
            shouldUnlock = expenses.some((e) => e.isSaving) || totalSavedInGoals > 0;
            break;
          case 'savings_20_percent':
            shouldUnlock = savingsRatio >= 0.2 || (monthlyIncome > 0 && totalSavedInGoals >= monthlyIncome * 0.2);
            break;
          case 'savings_500k':
            shouldUnlock = totalSavedInGoals >= 500000;
            break;
          case 'savings_1m':
            shouldUnlock = totalSavedInGoals >= 1000000;
            break;
          case 'goal_completed':
            shouldUnlock = goals.some((g) => g.currentSavings >= g.targetAmount && g.targetAmount > 0);
            break;
          case 'power_50':
            shouldUnlock = profile.totalPower >= 50;
            break;
          case 'reach_ssj':
            shouldUnlock = ['ssj', 'ssj2', 'ssj3', 'ssj_god', 'ssj_blue', 'ultra_instinto_sign', 'ultra_instinto'].includes(
              profile.transformation
            );
            break;
          case 'reach_ssj2':
            shouldUnlock = ['ssj2', 'ssj3', 'ssj_god', 'ssj_blue', 'ultra_instinto_sign', 'ultra_instinto'].includes(
              profile.transformation
            );
            break;
          case 'fear_registered':
            shouldUnlock = fears.length > 0;
            break;
          case 'fear_conquered':
            shouldUnlock = fears.some((f) => f.status === 'superado');
            break;
          case 'valiente':
            shouldUnlock = fears.some((f) => f.status === 'superado');
            break;
          case 'partner_linked':
            shouldUnlock = partner !== null;
            break;
          default:
            break;
        }

        if (shouldUnlock) {
          newlyUnlocked.push(ach);
        }
      });

      if (newlyUnlocked.length > 0) {
        const todayStr = getTodayDateString();
        const newUAs: UserAchievement[] = newlyUnlocked.map((ach) => ({
          id: 'uach_' + Math.random().toString(36).substring(2, 9),
          userId: profile.id,
          achievementId: ach.id,
          unlockedAt: todayStr
        }));

        const totalEarnedXP = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
        const newTotalXP = profile.currentXp + totalEarnedXP;
        const newAvailableXP = (profile.availableXp ?? profile.currentXp) + totalEarnedXP;
        const newLevel = getLevelFromXP(newTotalXP);

        const newXpEvents: XPEvent[] = newlyUnlocked.map((ach) => ({
          id: 'xp_' + Math.random().toString(36).substring(2, 9),
          userId: profile.id,
          sourceType: 'achievement',
          description: `Logro Desbloqueado: ${ach.title}`,
          xpAmount: ach.xpReward,
          createdAt: todayStr
        }));

        set((state) => ({
          userAchievements: [...state.userAchievements, ...newUAs],
          xpEvents: [...newXpEvents, ...state.xpEvents],
          profile: {
            ...state.profile,
            currentXp: newTotalXP,
            availableXp: newAvailableXP,
            currentLevel: newLevel
          }
        }));

        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {}

        newlyUnlocked.forEach((ach) => {
          get().addToast({
            type: 'achievement',
            title: `🏆 ¡NUEVO LOGRO DESBLOQUEADO: ${ach.title}!`,
            description: `${ach.description} (+${ach.xpReward} XP)`,
            xpAmount: ach.xpReward
          });
        });

        // Supabase persistence for user achievements if connected
        if (isSupabaseConfigured() && authUser) {
          newlyUnlocked.forEach((ach) => {
            achievementsRepository.recordUserAchievement(
              authUser.id,
              ach.id,
              ach.xpReward,
              ach.title
            );
          });
          profileRepository.upsertProfile({
            id: authUser.id,
            currentXp: newTotalXP,
            currentLevel: newLevel
          });
        }

        get().recalculatePowersAndSave();

        saveCache(get());
      }
    },

    resetToInitialDemo: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMPORTED_FLAG_KEY);
      const initialData = getInitialData();
      set({
        profile: initialData.profile,
        financialSettings: initialData.financialSettings,
        fixedDeductions: initialData.fixedDeductions,
        categories: initialData.categories,
        expenses: initialData.expenses,
        goals: initialData.goals,
        plans: initialData.plans,
        dailyObjectives: initialData.dailyObjectives,
        actions: initialData.actions,
        personalRewards: initialData.personalRewards,
        rewardRedemptions: initialData.rewardRedemptions,
        xpEvents: initialData.xpEvents,
        achievements: initialData.achievements,
        userAchievements: initialData.userAchievements,
        fears: initialData.fears,
        habits: initialData.habits,
        habitLogs: initialData.habitLogs,
        partner: null,
        undoableObjective: null
      });
      get().recalculatePowersAndSave();
      get().addToast({
        type: 'info',
        title: 'Datos de entrenamiento restablecidos',
        description: 'Se cargaron los valores y metas iniciales de Fase 1.'
      });
    }
  };
};
