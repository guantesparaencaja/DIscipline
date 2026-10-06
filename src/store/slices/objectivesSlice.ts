import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, ObjectivesSlice } from '../types';
import { DailyObjective, XPEvent, Expense } from '../../types';
import {
  calculateStreakOnActivity,
  getLevelFromXP,
  getTodayDateString
} from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { objectivesRepository, profileRepository } from '../../data';
import { createGoogleCalendarEvent, createGoogleTask } from '../../lib/workspace';
import { enqueueOfflineAction } from '../../lib/offlineQueue';
import { getInitialData, saveCache } from '../initialData';

let undoTimeoutId: any = null;
const inFlightObjectives = new Set<string>();

export const createObjectivesSlice: StateCreator<SayayinStore, [], [], ObjectivesSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    dailyObjectives: initial.dailyObjectives,
    undoableObjective: null,

    completeObjective: async (id: string) => {
      // 1. Double-click & in-flight protection (Idempotency)
      if (inFlightObjectives.has(id)) return;
      const prevObjectives = get().dailyObjectives || [];
      const obj = prevObjectives.find((o) => o.id === id);
      if (!obj || obj.status === 'completado') return;

      inFlightObjectives.add(id);

      try {
        const prevProfile = get().profile;
        const prevXpEvents = get().xpEvents || [];
        const prevExpenses = get().expenses || [];
        const prevGoals = get().goals || [];

        const now = new Date().toISOString();
        const today = getTodayDateString(prevProfile?.timezone || 'America/Bogota');

        // 2. Reliable streak calculation: breaks if skipping a day, increments if consecutive
        const { newStreak, newBestStreak } = calculateStreakOnActivity(
          prevProfile.currentStreak,
          prevProfile.bestStreak,
          prevProfile.lastActiveDate,
          today
        );

        const totalEarnedXP = obj.xpReward || 20;
        const newTotalXP = (prevProfile.currentXp || 0) + totalEarnedXP;
        const newLevel = getLevelFromXP(newTotalXP);

        const newXpEvent: XPEvent = {
          id: 'xp_' + Date.now(),
          userId: prevProfile.id,
          sourceType: 'objective',
          description: `Completado: ${obj.title}`,
          xpAmount: totalEarnedXP,
          createdAt: today
        };

        // 3. Optional savings execution
        let updatedExpenses = prevExpenses;
        let updatedGoals = prevGoals;
        if (obj.savingAmount && obj.savingAmount > 0 && obj.goalId) {
          const autoExpense: Expense = {
            id: 'exp_' + Date.now(),
            userId: prevProfile.id,
            description: `Ahorro objetivo: ${obj.title}`,
            amount: obj.savingAmount,
            categoryId: 'cat_ahorro',
            categoryName: 'Ahorro para Metas',
            date: today,
            paymentMethod: 'transferencia',
            isSaving: true,
            goalId: obj.goalId,
            createdAt: today
          };
          updatedExpenses = [autoExpense, ...prevExpenses];
          updatedGoals = prevGoals.map((g) =>
            g.id === obj.goalId
              ? { ...g, currentSavings: (g.currentSavings || 0) + (obj.savingAmount || 0) }
              : g
          );
        }

        // 4. Optimistic UI state
        set({
          dailyObjectives: prevObjectives.map((o) =>
            o.id === id ? { ...o, status: 'completado', completedAt: now } : o
          ),
          profile: {
            ...prevProfile,
            currentXp: newTotalXP,
            availableXp: (prevProfile.availableXp ?? prevProfile.currentXp) + totalEarnedXP,
            currentLevel: newLevel,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            lastActiveDate: today
          },
          xpEvents: [newXpEvent, ...prevXpEvents],
          expenses: updatedExpenses,
          goals: updatedGoals
        });

        // 5. 10-second undo window setup
        if (undoTimeoutId) clearTimeout(undoTimeoutId);
        set({
          undoableObjective: {
            id: obj.id,
            title: obj.title,
            xpReward: totalEarnedXP,
            savingAmount: obj.savingAmount,
            goalId: obj.goalId,
            expiresAt: Date.now() + 10000
          }
        });

        undoTimeoutId = setTimeout(() => {
          if (get().undoableObjective?.id === id) {
            set({ undoableObjective: null });
          }
        }, 10000);

        // 6. Confetti & notifications
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        } catch {}

        get().addToast({
          type: 'xp',
          title: `+${totalEarnedXP} XP de Entrenamiento`,
          description: `${obj.title} (Deshacer disponible 10s)`,
          xpAmount: totalEarnedXP,
          undoId: id
        });

        if (newLevel > prevProfile.currentLevel) {
          try {
            confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
          } catch {}
          get().addToast({
            type: 'level_up',
            title: `¡SUBIDA DE NIVEL! Nivel ${newLevel}`,
            description: 'Tus poderes de Guerrero Saiyajin se han incrementado.'
          });
        }

        if (newStreak > prevProfile.currentStreak) {
          get().addToast({
            type: 'success',
            title: `¡Racha aumentada a ${newStreak} días!`,
            description: 'Mantén la disciplina diaria sin interrupción.'
          });
        }

        // 7. Supabase persistence or Offline Queue
        const { authUser } = get();
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (authUser && isSupabaseConfigured() && isOnline) {
          try {
            await objectivesRepository.updateObjective(id, {
              status: 'completado',
              completedAt: now
            });

            const remoteProfile = await profileRepository.getProfile(authUser.id);
            if (remoteProfile) {
              set((state) => ({
                profile: {
                  ...state.profile,
                  currentXp: remoteProfile.currentXp,
                  currentLevel: remoteProfile.currentLevel,
                  currentStreak: remoteProfile.currentStreak,
                  bestStreak: remoteProfile.bestStreak,
                  lastActiveDate: remoteProfile.lastActiveDate
                }
              }));
            }
          } catch (err) {
            console.warn('Supabase offline/error, guardando en cola IndexedDB:', err);
            await enqueueOfflineAction({
              dedupKey: 'complete_obj_' + id,
              type: 'complete_objective',
              payload: { id, status: 'completado', completedAt: now }
            });
          }
        } else {
          await enqueueOfflineAction({
            dedupKey: 'complete_obj_' + id,
            type: 'complete_objective',
            payload: { id, status: 'completado', completedAt: now }
          });
        }

        get().checkAchievements();
        get().recalculatePowersAndSave();
        saveCache(get());
      } finally {
        inFlightObjectives.delete(id);
      }
    },

    undoCompleteObjective: async (id: string) => {
      const prevObjectives = get().dailyObjectives || [];
      const obj = prevObjectives.find((o) => o.id === id);
      if (!obj || obj.status !== 'completado') return;

      if (undoTimeoutId) clearTimeout(undoTimeoutId);
      set({ undoableObjective: null });

      const prevProfile = get().profile;
      const prevXpEvents = get().xpEvents || [];
      const prevExpenses = get().expenses || [];
      const prevGoals = get().goals || [];

      const earnedXP = obj.xpReward || 20;
      const revertedXP = Math.max(0, (prevProfile.currentXp || 0) - earnedXP);
      const revertedLevel = getLevelFromXP(revertedXP);
      const today = getTodayDateString(prevProfile?.timezone || 'America/Bogota');

      const compensatoryEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: 'compensatory_undo',
        description: `Compensación: Deshacer ${obj.title}`,
        xpAmount: -earnedXP,
        createdAt: today
      };

      let updatedExpenses = prevExpenses;
      let updatedGoals = prevGoals;
      if (obj.savingAmount && obj.savingAmount > 0 && obj.goalId) {
        const matchIdx = prevExpenses.findIndex(
          (e) => e.isSaving && e.goalId === obj.goalId && e.description.includes(obj.title)
        );
        if (matchIdx !== -1) {
          updatedExpenses = prevExpenses.filter((_, idx) => idx !== matchIdx);
        }
        updatedGoals = prevGoals.map((g) =>
          g.id === obj.goalId
            ? { ...g, currentSavings: Math.max(0, (g.currentSavings || 0) - (obj.savingAmount || 0)) }
            : g
        );
      }

      set({
        dailyObjectives: prevObjectives.map((o) =>
          o.id === id ? { ...o, status: 'pendiente', completedAt: undefined } : o
        ),
        profile: {
          ...prevProfile,
          currentXp: revertedXP,
          availableXp: Math.max(0, (prevProfile.availableXp ?? prevProfile.currentXp) - earnedXP),
          currentLevel: revertedLevel
        },
        xpEvents: [compensatoryEvent, ...prevXpEvents],
        expenses: updatedExpenses,
        goals: updatedGoals
      });

      get().addToast({
        type: 'info',
        title: 'Completado revertido',
        description: `Se compensaron -${earnedXP} XP. Tu racha se mantiene intacta.`
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await objectivesRepository.updateObjective(id, {
            status: 'pendiente',
            completedAt: undefined
          });
          const remoteProfile = await profileRepository.getProfile(authUser.id);
          if (remoteProfile) {
            set((state) => ({
              profile: {
                ...state.profile,
                currentXp: remoteProfile.currentXp,
                currentLevel: remoteProfile.currentLevel
              }
            }));
          }
        } catch (err) {
          console.warn('Error al revertir objetivo en Supabase:', err);
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    reopenObjective: async (id: string) => {
      const prevObjectives = get().dailyObjectives;
      set({
        dailyObjectives: prevObjectives.map((o) =>
          o.id === id ? { ...o, status: 'pendiente', completedAt: undefined } : o
        )
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await objectivesRepository.updateObjective(id, {
            status: 'pendiente',
            completedAt: undefined
          });
        } catch (err: any) {
          set({ dailyObjectives: prevObjectives });
          get().addToast({
            type: 'error',
            title: 'Error al reabrir objetivo',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    skipObjective: async (id: string) => {
      const prevObjectives = get().dailyObjectives;
      set({
        dailyObjectives: prevObjectives.map((o) =>
          o.id === id ? { ...o, status: 'omitido' } : o
        )
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await objectivesRepository.updateObjective(id, { status: 'omitido' });
        } catch (err: any) {
          set({ dailyObjectives: prevObjectives });
          get().addToast({
            type: 'error',
            title: 'Error al omitir objetivo',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    generateRecurringObjectives: async () => {
      const { dailyObjectives, profile, authUser } = get();
      const today = getTodayDateString(profile?.timezone || 'America/Bogota');
      const [y, m, d] = today.split('-').map(Number);
      const todayDate = new Date(y, (m || 1) - 1, d || 1);
      const currentDayOfWeek = todayDate.getDay();

      const todayObjectives = (dailyObjectives || []).filter((o) => o && o.date === today);
      const todayTitles = new Set(todayObjectives.map((o) => o.title.toLowerCase().trim()));

      const recurringCandidates = (dailyObjectives || []).filter(
        (o) => o && (o.recurrence === 'diaria' || o.recurrence === 'dias_semana')
      );

      const seenTitles = new Set<string>();
      const newObjectivesToCreate: DailyObjective[] = [];

      for (const template of recurringCandidates) {
        const key = template.title.toLowerCase().trim();
        if (seenTitles.has(key)) continue;
        seenTitles.add(key);

        if (todayTitles.has(key)) continue;

        if (template.recurrence === 'dias_semana') {
          const allowedDays = template.recurrenceDays || [1, 2, 3, 4, 5];
          if (!allowedDays.includes(currentDayOfWeek)) continue;
        }

        const newObj: DailyObjective = {
          ...template,
          id: 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          date: today,
          status: 'pendiente',
          completedAt: undefined,
          createdAt: today
        };
        newObjectivesToCreate.push(newObj);
      }

      if (newObjectivesToCreate.length > 0) {
        set((state) => ({
          dailyObjectives: [...newObjectivesToCreate, ...state.dailyObjectives]
        }));

        if (authUser && isSupabaseConfigured()) {
          for (const obj of newObjectivesToCreate) {
            try {
              await objectivesRepository.createObjective({
                ...obj,
                userId: authUser.id
              });
            } catch (e) {
              console.warn('Error al persistir objetivo recurrente en Supabase:', e);
            }
          }
        }

        saveCache(get());
      }
    },

    addObjective: async (data) => {
      const prevObjectives = get().dailyObjectives;
      const { authUser, profile } = get();
      const newObj: DailyObjective = {
        ...data,
        id: 'obj_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        status: 'pendiente',
        createdAt: getTodayDateString()
      };

      set({ dailyObjectives: [newObj, ...prevObjectives] });
      get().addToast({
        type: 'success',
        title: 'Objetivo agregado a tu rutina',
        description: `${newObj.title} (+${newObj.xpReward} XP)`
      });

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (authUser && isSupabaseConfigured() && isOnline) {
        try {
          const created = await objectivesRepository.createObjective(newObj);
          set((state) => ({
            dailyObjectives: state.dailyObjectives.map((o) => (o.id === newObj.id ? created : o))
          }));
        } catch (err) {
          console.warn('Error al guardar objetivo en Supabase, encolando offline:', err);
          await enqueueOfflineAction({
            dedupKey: 'add_obj_' + newObj.id,
            type: 'add_objective',
            payload: newObj
          });
        }
      } else {
        await enqueueOfflineAction({
          dedupKey: 'add_obj_' + newObj.id,
          type: 'add_objective',
          payload: newObj
        });
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editObjective: async (id, data) => {
      const prevObjectives = get().dailyObjectives;
      set({
        dailyObjectives: prevObjectives.map((o) => (o.id === id ? { ...o, ...data } : o))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await objectivesRepository.updateObjective(id, data);
        } catch (err: any) {
          set({ dailyObjectives: prevObjectives });
          get().addToast({
            type: 'error',
            title: 'Error al editar objetivo',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    deleteObjective: async (id) => {
      const prevObjectives = get().dailyObjectives;
      set({
        dailyObjectives: prevObjectives.filter((o) => o.id !== id)
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await objectivesRepository.deleteObjective(id);
        } catch (err: any) {
          set({ dailyObjectives: prevObjectives });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar objetivo',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    syncObjectiveToCalendar: async (objectiveId: string) => {
      const obj = get().dailyObjectives.find((o) => o.id === objectiveId);
      if (!obj) return { success: false, error: 'Objetivo no encontrado' };

      const res = await createGoogleCalendarEvent(obj);
      if (res.success && res.eventId) {
        set((state) => ({
          dailyObjectives: state.dailyObjectives.map((o) =>
            o.id === objectiveId ? { ...o, calendarEventId: res.eventId } : o
          )
        }));
        get().addToast({
          type: 'success',
          title: 'Sincronizado con Google Calendar',
          description: `Se agendó: ${obj.title}`
        });
        saveCache(get());
        return { success: true };
      }
      return { success: false, error: res.error };
    },

    syncObjectiveToTasks: async (objectiveId: string) => {
      const obj = get().dailyObjectives.find((o) => o.id === objectiveId);
      if (!obj) return { success: false, error: 'Objetivo no encontrado' };

      const res = await createGoogleTask(obj);
      if (res.success && res.taskId) {
        set((state) => ({
          dailyObjectives: state.dailyObjectives.map((o) =>
            o.id === objectiveId ? { ...o, taskId: res.taskId } : o
          )
        }));
        get().addToast({
          type: 'success',
          title: 'Sincronizado con Google Tasks',
          description: `Añadido a tus tareas: ${obj.title}`
        });
        saveCache(get());
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };
};
