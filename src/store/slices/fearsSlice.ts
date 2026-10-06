import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, FearsSlice } from '../types';
import { Fear, FearStep, XPEvent } from '../../types';
import { getLevelFromXP, getTodayDateString } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fearsRepository } from '../../data';
import { getInitialData, saveCache } from '../initialData';

export const createFearsSlice: StateCreator<SayayinStore, [], [], FearsSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    fears: initial.fears,

    addFear: async (data) => {
      const prevFears = get().fears;
      const { authUser, profile } = get();

      // Ensure 3 to 10 ladder steps exist
      let steps: FearStep[] = (data.steps && data.steps.length >= 3)
        ? data.steps.map((s, idx) => ({ ...s, stepOrder: idx + 1 }))
        : [
            {
              id: 'st_1_' + Date.now(),
              fearId: '',
              title: 'Nivel 1: Observar y registrar el temor sin juicio',
              description: 'Nombrar el obstáculo con honestidad.',
              stepOrder: 1,
              xpReward: 20,
              braveryPoints: 10,
              isCompleted: false
            },
            {
              id: 'st_2_' + Date.now(),
              fearId: '',
              title: 'Nivel 2: Acción preparatoria en entorno seguro',
              description: 'Dar un primer paso controlado.',
              stepOrder: 2,
              xpReward: 30,
              braveryPoints: 15,
              isCompleted: false
            },
            {
              id: 'st_3_' + Date.now(),
              fearId: '',
              title: 'Nivel 3: Enfrentamiento real decisivo',
              description: 'Consolidar la victoria y superar el bloqueo.',
              stepOrder: 3,
              xpReward: 50,
              braveryPoints: 25,
              isCompleted: false
            }
          ];

      const newFearId = 'fear_' + Date.now();
      steps = steps.map((s) => ({ ...s, fearId: newFearId, userId: authUser ? authUser.id : profile.id }));

      const newFear: Fear = {
        ...data,
        id: newFearId,
        userId: authUser ? authUser.id : profile.id,
        status: 'enfrentando',
        braveryScore: 0,
        steps,
        createdAt: getTodayDateString()
      };

      set({ fears: [newFear, ...prevFears] });
      get().addToast({
        type: 'info',
        title: 'Miedo identificado con escalera de exposición',
        description: `${newFear.title} (${newFear.steps.length} niveles)`
      });

      if (authUser && isSupabaseConfigured()) {
        try {
          const created = await fearsRepository.createFear(newFear);
          set((state) => ({
            fears: state.fears.map((f) => (f.id === newFear.id ? created : f))
          }));
        } catch (err: any) {
          set({ fears: prevFears });
          get().addToast({
            type: 'error',
            title: 'Error al registrar miedo en Supabase',
            description: err?.message
          });
          return;
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editFear: async (fearId, data) => {
      const prevFears = get().fears;
      const target = prevFears.find((f) => f.id === fearId);
      if (!target) return;

      const updatedFear: Fear = {
        ...target,
        ...data,
        steps: data.steps ? data.steps.map((s, idx) => ({ ...s, stepOrder: idx + 1 })) : target.steps
      };

      set({
        fears: prevFears.map((f) => (f.id === fearId ? updatedFear : f))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.updateFear(fearId, data);
          if (data.steps) {
            await fearsRepository.saveFearSteps(fearId, authUser.id, updatedFear.steps);
          }
        } catch (err: any) {
          console.warn('Supabase editFear warning:', err);
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    completeFearStep: async (fearId, stepId) => {
      const prevFears = get().fears;
      const prevProfile = get().profile;
      const targetFear = prevFears.find((f) => f.id === fearId);
      if (!targetFear) return;

      const steps = targetFear.steps || [];
      const stepIdx = steps.findIndex((s) => s.id === stepId);
      if (stepIdx === -1) return;

      const targetStep = steps[stepIdx];
      if (targetStep.isCompleted) return;

      // Orden estricto en escalera de exposición
      const canComplete = steps.slice(0, stepIdx).every((s) => s.isCompleted);
      if (!canComplete) {
        get().addToast({
          type: 'warning',
          title: 'Escalera de Exposición: Orden Estricto',
          description: `No puedes saltar al Nivel ${stepIdx + 1}. Debes completar los niveles anteriores en secuencia.`
        });
        return;
      }

      const earnedXP = targetStep.xpReward || 25;
      const bravery = targetStep.braveryPoints || 10;
      const now = new Date().toISOString();

      const isLastStep = stepIdx === steps.length - 1;
      const bonusConqueredXP = isLastStep ? 100 : 0;
      const totalEarnedXP = earnedXP + bonusConqueredXP;

      const newTotalXP = (prevProfile.currentXp || 0) + totalEarnedXP;
      const newAvailableXP = (prevProfile.availableXp ?? prevProfile.currentXp ?? 0) + totalEarnedXP;
      const newLevel = getLevelFromXP(newTotalXP);

      const nextSteps = steps.map((s, idx) =>
        idx === stepIdx ? { ...s, isCompleted: true, completedAt: now } : s
      );

      const updatedFear: Fear = {
        ...targetFear,
        status: isLastStep ? 'superado' : targetFear.status,
        conqueredAt: isLastStep ? now : targetFear.conqueredAt,
        braveryScore: (targetFear.braveryScore || 0) + bravery,
        steps: nextSteps
      };

      const newXpEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: isLastStep ? 'fear_conquered' : 'fear_step',
        description: isLastStep
          ? `🏆 ¡Miedo Superado (+100 XP Bonus): ${targetFear.title}!`
          : `Escalón de Valentía: ${targetStep.title} (+${bravery} valentía)`,
        xpAmount: totalEarnedXP,
        createdAt: getTodayDateString()
      };

      set((state) => ({
        fears: state.fears.map((f) => (f.id === fearId ? updatedFear : f)),
        profile: {
          ...state.profile,
          currentXp: newTotalXP,
          availableXp: newAvailableXP,
          currentLevel: newLevel,
          braveryScore: (state.profile.braveryScore || 0) + bravery
        },
        xpEvents: [newXpEvent, ...state.xpEvents]
      }));

      try {
        confetti({
          particleCount: isLastStep ? 140 : 60,
          spread: isLastStep ? 100 : 60,
          origin: { y: 0.6 }
        });
      } catch {}

      if (isLastStep) {
        get().addToast({
          type: 'achievement',
          title: '🏆 ¡MIEDO SUPERADO! (+100 XP)',
          description: `Has conquistado los ${steps.length} escalones de "${targetFear.title}". ¡Desbloqueaste el logro Valiente!`
        });
      } else {
        get().addToast({
          type: 'xp',
          title: `+${earnedXP} XP & +${bravery} Valentía`,
          description: targetStep.title,
          xpAmount: earnedXP
        });
      }

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.updateFearStep(stepId, true, now);
          await fearsRepository.updateFear(fearId, {
            status: updatedFear.status,
            conqueredAt: updatedFear.conqueredAt,
            braveryScore: updatedFear.braveryScore
          });
        } catch (err: any) {
          console.warn('Supabase step complete warning:', err);
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    reorderFearSteps: async (fearId, newSteps) => {
      const prevFears = get().fears;
      const targetFear = prevFears.find((f) => f.id === fearId);
      if (!targetFear) return;

      const orderedSteps = newSteps.map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
      set({
        fears: prevFears.map((f) => (f.id === fearId ? { ...f, steps: orderedSteps } : f))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.saveFearSteps(fearId, authUser.id, orderedSteps);
        } catch (err: any) {
          console.warn('Supabase reorder steps error:', err);
        }
      }

      saveCache(get());
    },

    toggleFearAction: async (fearId, actionId) => {
      const prevFears = get().fears;
      const prevProfile = get().profile;

      let earnedXP = 0;
      let actionTitle = '';
      let updatedActions: any[] = [];
      const now = new Date().toISOString();

      set((state) => {
        const nextFears = state.fears.map((f) => {
          if (f.id !== fearId) return f;
          const acts = f.actions || [];
          const nextActs = acts.map((act) => {
            if (act.id !== actionId) return act;
            const willBeCompleted = !act.completed;
            if (willBeCompleted) {
              earnedXP = 100;
              actionTitle = act.title;
            }
            return {
              ...act,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? now : undefined
            };
          });
          updatedActions = nextActs;
          return { ...f, actions: nextActs };
        });
        return { fears: nextFears };
      });

      if (earnedXP > 0) {
        const newTotalXP = (prevProfile.currentXp || 0) + earnedXP;
        const newAvailableXP = (prevProfile.availableXp ?? prevProfile.currentXp ?? 0) + earnedXP;
        const newLevel = getLevelFromXP(newTotalXP);
        const newXpEvent: XPEvent = {
          id: 'xp_' + Date.now(),
          userId: prevProfile.id,
          sourceType: 'fear_action',
          description: `Acción de combate mental: ${actionTitle}`,
          xpAmount: earnedXP,
          createdAt: getTodayDateString()
        };

        set((state) => ({
          profile: {
            ...state.profile,
            currentXp: newTotalXP,
            availableXp: newAvailableXP,
            currentLevel: newLevel
          },
          xpEvents: [newXpEvent, ...state.xpEvents]
        }));

        try {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        } catch {}

        get().addToast({
          type: 'xp',
          title: '+100 XP por avanzar contra tus miedos',
          description: actionTitle,
          xpAmount: 100
        });
      }

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.updateFear(fearId, { actions: updatedActions });
        } catch (err: any) {
          console.warn('Supabase toggleFearAction warning:', err);
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    conquerFear: async (fearId, reflection) => {
      const prevFears = get().fears;
      const prevProfile = get().profile;

      const targetFear = prevFears.find((f) => f.id === fearId);
      if (!targetFear || targetFear.status === 'superado') return;

      const earnedXP = 500;
      const newTotalXP = (prevProfile.currentXp || 0) + earnedXP;
      const newAvailableXP = (prevProfile.availableXp ?? prevProfile.currentXp ?? 0) + earnedXP;
      const newLevel = getLevelFromXP(newTotalXP);
      const todayStr = getTodayDateString();
      const conqueredAt = new Date().toISOString();

      const newXpEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: 'fear_conquered',
        description: `¡Miedo conquistado!: ${targetFear.title}`,
        xpAmount: earnedXP,
        createdAt: todayStr
      };

      set((state) => ({
        fears: state.fears.map((f) =>
          f.id === fearId
            ? {
                ...f,
                status: 'superado',
                conqueredAt,
                reflection: reflection || f.reflection,
                steps: (f.steps || []).map((s) => ({ ...s, isCompleted: true, completedAt: s.completedAt || conqueredAt })),
                actions: (f.actions || []).map((a) => ({ ...a, completed: true }))
              }
            : f
        ),
        profile: {
          ...state.profile,
          currentXp: newTotalXP,
          availableXp: newAvailableXP,
          currentLevel: newLevel
        },
        xpEvents: [newXpEvent, ...state.xpEvents]
      }));

      try {
        confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } });
      } catch {}

      get().addToast({
        type: 'achievement',
        title: '¡VICTORIA SOBRE EL MIEDO (+500 XP)!',
        description: `Has superado: ${targetFear.title}. Tu Poder de Evolución ha crecido.`,
        xpAmount: 500
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.updateFear(fearId, {
            status: 'superado',
            conqueredAt,
            reflection: reflection || targetFear.reflection
          });
        } catch (err: any) {
          console.warn('Supabase conquerFear warning:', err);
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    deleteFear: async (id) => {
      const prevFears = get().fears;
      set({ fears: prevFears.filter((f) => f.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await fearsRepository.deleteFear(id);
        } catch (err: any) {
          set({ fears: prevFears });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar miedo',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    }
  };
};
