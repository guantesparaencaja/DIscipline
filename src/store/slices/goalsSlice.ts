import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, GoalsSlice } from '../types';
import { ActionItem, Goal, Plan, XPEvent } from '../../types';
import {
  calculateGoalPace,
  formatCOP,
  getLevelFromXP,
  getTodayDateString
} from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  actionsRewardsRepository,
  goalsRepository,
  plansRepository
} from '../../data';
import { enqueueOfflineAction } from '../../lib/offlineQueue';
import { getInitialData, saveCache } from '../initialData';

export const createGoalsSlice: StateCreator<SayayinStore, [], [], GoalsSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    goals: initial.goals,
    plans: initial.plans,
    actions: initial.actions,

    addGoal: async (data) => {
      const prevGoals = get().goals;
      const { authUser, profile } = get();

      const newGoal: Goal = {
        ...data,
        id: 'goal_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        currentSavings: 0,
        createdAt: getTodayDateString()
      };

      set({ goals: [newGoal, ...prevGoals] });
      get().addToast({
        type: 'success',
        title: 'Nueva meta Saiyajin creada',
        description: `${newGoal.title} (${formatCOP(newGoal.targetAmount)})`
      });

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (authUser && isSupabaseConfigured() && isOnline) {
        try {
          const created = await goalsRepository.createGoal(newGoal);
          set((state) => ({
            goals: state.goals.map((g) => (g.id === newGoal.id ? created : g))
          }));
        } catch (err) {
          console.warn('Error al guardar meta en Supabase, encolando offline:', err);
          await enqueueOfflineAction({
            dedupKey: 'add_goal_' + newGoal.id,
            type: 'add_goal',
            payload: newGoal
          });
        }
      } else {
        await enqueueOfflineAction({
          dedupKey: 'add_goal_' + newGoal.id,
          type: 'add_goal',
          payload: newGoal
        });
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editGoal: async (id, data) => {
      const prevGoals = get().goals;
      set({
        goals: prevGoals.map((g) => (g.id === id ? { ...g, ...data } : g))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await goalsRepository.updateGoal(id, data);
        } catch (err: any) {
          set({ goals: prevGoals });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar meta',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    deleteGoal: async (id) => {
      const prevGoals = get().goals;
      const prevPlans = get().plans;

      set({
        goals: prevGoals.filter((g) => g.id !== id),
        plans: prevPlans.filter((p) => p.goalId !== id)
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await goalsRepository.deleteGoal(id);
        } catch (err: any) {
          set({ goals: prevGoals, plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar meta',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    addPlan: async (data) => {
      const prevPlans = get().plans;
      const { authUser, profile } = get();

      const newPlan: Plan = {
        ...data,
        id: 'plan_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        createdAt: getTodayDateString()
      };

      set({ plans: [newPlan, ...prevPlans] });
      get().addToast({
        type: 'success',
        title: 'Plan táctico asignado a la meta',
        description: newPlan.title
      });

      if (authUser && isSupabaseConfigured()) {
        try {
          const created = await plansRepository.createPlan(newPlan);
          set((state) => ({
            plans: state.plans.map((p) => (p.id === newPlan.id ? created : p))
          }));
        } catch (err: any) {
          set({ plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al guardar plan en Supabase',
            description: err?.message
          });
          return;
        }
      }

      saveCache(get());
    },

    toggleMilestone: async (planId, milestoneId) => {
      const prevPlans = get().plans;
      let updatedMilestones: any[] = [];

      set((state) => ({
        plans: state.plans.map((p) => {
          if (p.id !== planId) return p;
          const nextM = p.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          updatedMilestones = nextM;
          return { ...p, milestones: nextM };
        })
      }));

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await plansRepository.updatePlan(planId, { milestones: updatedMilestones });
        } catch (err: any) {
          set({ plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar hito',
            description: err?.message
          });
          return;
        }
      }

      saveCache(get());
    },

    editPlan: async (id, data) => {
      const prevPlans = get().plans;
      set({
        plans: prevPlans.map((p) => (p.id === id ? { ...p, ...data } : p))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await plansRepository.updatePlan(id, data);
        } catch (err: any) {
          set({ plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar plan',
            description: err?.message
          });
          return;
        }
      }

      saveCache(get());
    },

    deletePlan: async (id) => {
      const prevPlans = get().plans;
      set({ plans: prevPlans.filter((p) => p.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await plansRepository.deletePlan(id);
        } catch (err: any) {
          set({ plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar plan',
            description: err?.message
          });
          return;
        }
      }

      saveCache(get());
    },

    updatePlanStatus: async (planId, status) => {
      const prevPlans = get().plans;
      set({
        plans: prevPlans.map((p) => (p.id === planId ? { ...p, status } : p))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await plansRepository.updatePlan(planId, { status });
        } catch (err: any) {
          set({ plans: prevPlans });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar estado del plan',
            description: err?.message
          });
          return;
        }
      }

      get().addToast({
        type: 'info',
        title: 'Estado del plan actualizado',
        description: `Plan marcado como: ${status.toUpperCase()}`
      });
      saveCache(get());
    },

    generateObjectivesFromPlan: async (planId) => {
      const plan = get().plans.find((p) => p.id === planId);
      if (!plan) return 0;
      const pendingMilestones = (plan.milestones || []).filter((m) => !m.completed);
      if (pendingMilestones.length === 0) {
        get().addToast({
          type: 'info',
          title: 'Plan al día',
          description: 'No hay hitos pendientes en este plan para generar objetivos.'
        });
        return 0;
      }

      const todayStr = getTodayDateString();
      let createdCount = 0;

      for (const m of pendingMilestones) {
        await get().addObjective({
          title: `[${plan.title}] Hito: ${m.title}`,
          date: m.targetDate || todayStr,
          timeSlot: 'manana',
          difficulty: 'normal',
          xpReward: 20,
          goalId: plan.goalId,
          isPartnerVisible: true,
          recurrence: 'una_vez'
        });
        createdCount++;
      }

      get().addToast({
        type: 'success',
        title: `${createdCount} Objetivos Diarios generados`,
        description: `Se han derivado del plan "${plan.title}" con éxito.`
      });

      return createdCount;
    },

    generateSmartObjectivesForGoal: async (goalId) => {
      const goal = get().goals.find((g) => g.id === goalId);
      if (!goal) return 0;
      const pace = calculateGoalPace(goal);
      const todayStr = getTodayDateString();
      const dailyAmount = Math.max(5000, Math.round(pace.dailyRequiredPace));

      await get().addObjective({
        title: `Separar cuota de ahorro para: ${goal.title}`,
        date: todayStr,
        timeSlot: 'manana',
        difficulty: dailyAmount > 50000 ? 'dificil' : 'normal',
        xpReward: dailyAmount > 50000 ? 40 : 20,
        savingAmount: dailyAmount,
        goalId: goal.id,
        isPartnerVisible: true,
        recurrence: 'diaria'
      });

      get().addToast({
        type: 'success',
        title: 'Objetivo inteligente generado',
        description: `Ritmo diario requerido: ${formatCOP(dailyAmount)} (${pace.statusMessage})`
      });

      return 1;
    },

    addAction: async (data) => {
      const prevActions = get().actions || [];
      const { authUser, profile } = get();

      const newAction: ActionItem = {
        ...data,
        id: 'act_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        isCompleted: false,
        createdAt: getTodayDateString()
      };

      set({ actions: [newAction, ...prevActions] });
      get().addToast({
        type: 'success',
        title: 'Acción táctica vinculada',
        description: `${newAction.title} (+${newAction.xpReward} XP)`
      });

      const { authUser: currentAuth } = get();
      if (currentAuth && isSupabaseConfigured()) {
        try {
          const created = await actionsRewardsRepository.createAction(newAction);
          set((state) => ({
            actions: state.actions.map((a) => (a.id === newAction.id ? created : a))
          }));
        } catch (err: any) {
          console.warn('Supabase createAction warning:', err);
        }
      }

      saveCache(get());
    },

    toggleAction: async (id) => {
      const prevActions = get().actions || [];
      const targetAction = prevActions.find((a) => a.id === id);
      if (!targetAction) return;

      const willBeCompleted = !targetAction.isCompleted;
      const now = new Date().toISOString();
      const prevProfile = get().profile;
      const earnedXP = willBeCompleted ? targetAction.xpReward : 0;

      const newTotalXP = (prevProfile.currentXp || 0) + earnedXP;
      const newAvailableXP = (prevProfile.availableXp ?? prevProfile.currentXp ?? 0) + earnedXP;
      const newLevel = getLevelFromXP(newTotalXP);

      set((state) => ({
        actions: state.actions.map((a) =>
          a.id === id ? { ...a, isCompleted: willBeCompleted, completedAt: willBeCompleted ? now : undefined } : a
        ),
        profile: earnedXP > 0
          ? { ...state.profile, currentXp: newTotalXP, availableXp: newAvailableXP, currentLevel: newLevel }
          : state.profile
      }));

      if (willBeCompleted && earnedXP > 0) {
        const newXpEvent: XPEvent = {
          id: 'xp_' + Date.now(),
          userId: prevProfile.id,
          sourceType: 'action',
          description: `Acción cumplida: ${targetAction.title}`,
          xpAmount: earnedXP,
          createdAt: getTodayDateString()
        };

        set((state) => ({
          xpEvents: [newXpEvent, ...state.xpEvents]
        }));

        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {}

        get().addToast({
          type: 'xp',
          title: `+${earnedXP} XP de Acción`,
          description: targetAction.title,
          xpAmount: earnedXP
        });

        // Avanzar la entidad ligada según su targetType
        if (targetAction.targetType === 'objetivo' && targetAction.targetId) {
          const matchObj = get().dailyObjectives.find((o) => o.id === targetAction.targetId);
          if (matchObj && matchObj.status !== 'completado') {
            get().completeObjective(matchObj.id);
          }
        } else if (targetAction.targetType === 'meta' && targetAction.targetId) {
          const matchObj = get().dailyObjectives.find(
            (o) => o.goalId === targetAction.targetId && o.status !== 'completado'
          );
          if (matchObj) {
            get().completeObjective(matchObj.id);
          } else {
            const matchPlan = get().plans.find((p) => p.goalId === targetAction.targetId);
            if (matchPlan && matchPlan.milestones.length > 0) {
              const firstPending = matchPlan.milestones.find((m) => !m.completed);
              if (firstPending) {
                get().toggleMilestone(matchPlan.id, firstPending.id);
              }
            }
          }
        } else if (targetAction.targetType === 'habito' && targetAction.targetId) {
          const todayStr = getTodayDateString();
          get().toggleHabitDay(targetAction.targetId, todayStr);
        } else if (targetAction.targetType === 'plan' && targetAction.targetId) {
          const matchPlan = get().plans.find((p) => p.id === targetAction.targetId);
          if (matchPlan && matchPlan.milestones.length > 0) {
            const firstPending = matchPlan.milestones.find((m) => !m.completed);
            if (firstPending) {
              get().toggleMilestone(matchPlan.id, firstPending.id);
            }
          }
        }
      }

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.updateAction(id, {
            isCompleted: willBeCompleted,
            completedAt: willBeCompleted ? now : undefined
          });
        } catch (err: any) {
          console.warn('Supabase updateAction warning:', err);
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editAction: async (id, data) => {
      const prevActions = get().actions || [];
      set({
        actions: prevActions.map((a) => (a.id === id ? { ...a, ...data } : a))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.updateAction(id, data);
        } catch (err: any) {
          console.warn('Supabase updateAction warning:', err);
        }
      }

      saveCache(get());
    },

    deleteAction: async (id) => {
      const prevActions = get().actions || [];
      set({ actions: prevActions.filter((a) => a.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.deleteAction(id);
        } catch (err: any) {
          console.warn('Supabase deleteAction warning:', err);
        }
      }

      saveCache(get());
    }
  };
};
