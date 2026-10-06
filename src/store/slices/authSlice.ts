import { StateCreator } from 'zustand';
import { SayayinStore, AuthSlice } from '../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  achievementsRepository,
  categoriesRepository,
  expensesRepository,
  fearsRepository,
  goalsRepository,
  habitsRepository,
  objectivesRepository,
  partnerRepository,
  plansRepository,
  profileRepository,
  settingsRepository,
  actionsRewardsRepository
} from '../../data';
import { getTodayDateString } from '../../lib/formatters';
import { getOfflineQueue, removeOfflineAction } from '../../lib/offlineQueue';
import { getInitialData, IMPORTED_FLAG_KEY } from '../initialData';

export const createAuthSlice: StateCreator<SayayinStore, [], [], AuthSlice> = (set, get) => ({
  authUser: null,
  isAuthModalOpen: false,
  authLoading: false,
  authError: null,
  isSyncing: false,
  hasLocalDataToImport: false,

  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open, authError: null }),
  setAuthError: (error) => set({ authError: error }),
  dismissImportPrompt: () => {
    set({ hasLocalDataToImport: false });
    localStorage.setItem(IMPORTED_FLAG_KEY, 'dismissed');
  },

  signInWithSupabase: async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Supabase no está configurado. Ve a Configuración para ingresar URL y Anon Key.'
      };
    }

    set({ authLoading: true, authError: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        set({ authLoading: false, authError: error.message });
        return { success: false, error: error.message };
      }

      if (data?.user) {
        set({
          authUser: {
            id: data.user.id,
            email: data.user.email || email,
            displayName: data.user.user_metadata?.display_name || 'Guerrero Saiyajin'
          },
          authLoading: false,
          isAuthModalOpen: false
        });

        get().addToast({
          type: 'success',
          title: '¡Sesión iniciada con éxito!',
          description: `Bienvenido de nuevo, ${data.user.email}`
        });

        await get().syncFromSupabase();
        return { success: true };
      }

      set({ authLoading: false });
      return { success: false, error: 'No se obtuvo respuesta de usuario.' };
    } catch (err: any) {
      set({ authLoading: false, authError: err.message || 'Error al iniciar sesión' });
      return { success: false, error: err.message || 'Error de conexión' };
    }
  },

  signUpWithSupabase: async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Supabase no está configurado. Ve a Configuración para ingresar URL y Anon Key.'
      };
    }

    set({ authLoading: true, authError: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: 'Guerrero Saiyajin' }
        }
      });

      if (error) {
        set({ authLoading: false, authError: error.message });
        return { success: false, error: error.message };
      }

      if (data?.user) {
        set({
          authUser: {
            id: data.user.id,
            email: data.user.email || email,
            displayName: 'Guerrero Saiyajin'
          },
          authLoading: false,
          isAuthModalOpen: false
        });

        get().addToast({
          type: 'success',
          title: '¡Cuenta Saiyajin creada!',
          description: 'Bienvenido a la senda del entrenamiento financiero.'
        });

        try {
          await profileRepository.upsertProfile({
            id: data.user.id,
            email: data.user.email || email,
            displayName: 'Guerrero Saiyajin',
            currentXp: get().profile.currentXp,
            currentLevel: get().profile.currentLevel,
            transformation: get().profile.transformation,
            inviteCode: get().profile.inviteCode
          });

          await settingsRepository.upsertFinancialSettings({
            id: 'fin_' + data.user.id,
            userId: data.user.id,
            baseMonthlyIncome: get().financialSettings.baseMonthlyIncome,
            emergencyFundTarget: get().financialSettings.emergencyFundTarget,
            updatedAt: getTodayDateString()
          });
        } catch (e) {
          console.warn('Initial profile bootstrap in Supabase failed:', e);
        }

        return { success: true };
      }

      set({ authLoading: false });
      return { success: false, error: 'Revisa tu correo para confirmar la cuenta.' };
    } catch (err: any) {
      set({ authLoading: false, authError: err.message || 'Error al registrarse' });
      return { success: false, error: err.message || 'Error de conexión' };
    }
  },

  signOutFromSupabase: async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    set({ authUser: null, hasLocalDataToImport: false });
    get().addToast({
      type: 'info',
      title: 'Sesión cerrada',
      description: 'Ahora estás entrenando en modo local.'
    });
  },

  resetSupabasePassword: async (email) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return { success: false, error: error.message };
      get().addToast({
        type: 'info',
        title: 'Enlace de restablecimiento enviado',
        description: `Revisa la bandeja de entrada de ${email}`
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al enviar recuperación' };
    }
  },

  initAuthListener: () => {
    if (!isSupabaseConfigured() || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        set({
          authUser: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            displayName: data.session.user.user_metadata?.display_name || 'Guerrero Saiyajin'
          }
        });
        get().syncFromSupabase();
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          authUser: {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || 'Guerrero Saiyajin'
          }
        });
      } else {
        set({ authUser: null });
      }
    });
  },

  syncFromSupabase: async () => {
    const { authUser } = get();
    if (!isSupabaseConfigured() || !authUser) return;

    set({ isSyncing: true });
    try {
      const userId = authUser.id;

      const [
        remoteProfile,
        remoteGoals,
        remotePlans,
        remoteObjectives,
        remoteExpenses,
        remoteSettings,
        remoteDeductions,
        remoteCategories,
        remoteFears,
        remoteUserAchievements,
        remoteXpEvents,
        remoteHabits,
        remoteHabitLogs
      ] = await Promise.all([
        profileRepository.getProfile(userId),
        goalsRepository.getGoals(userId),
        plansRepository.getPlans(userId),
        objectivesRepository.getDailyObjectives(userId),
        expensesRepository.getExpenses(userId),
        settingsRepository.getFinancialSettings(userId),
        settingsRepository.getFixedDeductions(userId),
        categoriesRepository.getCategories(userId),
        fearsRepository.getFears(userId),
        achievementsRepository.getUserAchievements(userId),
        achievementsRepository.getXpEvents(userId),
        habitsRepository.getHabits(userId),
        habitsRepository.getHabitLogs(userId)
      ]);

      const alreadyImported = localStorage.getItem(IMPORTED_FLAG_KEY);
      const hasExistingLocalData =
        get().goals.length > 0 || get().dailyObjectives.length > 0 || get().expenses.length > 0 || get().habits.length > 0;

      if (
        !alreadyImported &&
        remoteGoals.length === 0 &&
        remoteObjectives.length === 0 &&
        hasExistingLocalData
      ) {
        set({ hasLocalDataToImport: true });
      }

      set((state) => ({
        profile: remoteProfile
          ? { ...state.profile, ...remoteProfile }
          : { ...state.profile, id: userId, email: authUser.email },
        goals: remoteGoals.length > 0 ? remoteGoals : state.goals,
        plans: remotePlans.length > 0 ? remotePlans : state.plans,
        dailyObjectives: remoteObjectives.length > 0 ? remoteObjectives : state.dailyObjectives,
        expenses: remoteExpenses.length > 0 ? remoteExpenses : state.expenses,
        financialSettings: remoteSettings || state.financialSettings,
        fixedDeductions: remoteDeductions.length > 0 ? remoteDeductions : state.fixedDeductions,
        categories: remoteCategories.length > 0 ? remoteCategories : state.categories,
        fears: remoteFears.length > 0 ? remoteFears : state.fears,
        userAchievements: remoteUserAchievements.length > 0 ? remoteUserAchievements : state.userAchievements,
        xpEvents: remoteXpEvents.length > 0 ? remoteXpEvents : state.xpEvents,
        habits: remoteHabits.length > 0 ? remoteHabits : state.habits,
        habitLogs: remoteHabitLogs.length > 0 ? remoteHabitLogs : state.habitLogs
      }));

      try {
        const connectedPartnerId = await partnerRepository.getConnectedPartnerId(userId);
        if (connectedPartnerId) {
          await get().loadPartnerData(connectedPartnerId);
          get().setupPartnerRealtime(connectedPartnerId);
        }
      } catch (e) {
        console.warn('Partner sync check failed:', e);
      }

      try {
        await get().generateRecurringObjectives();
      } catch {}

      get().recalculatePowersAndSave();
    } catch (e: any) {
      console.warn('Sync from Supabase failed:', e);
      get().addToast({
        type: 'warning',
        title: 'Aviso de Sincronización',
        description: 'Usando datos locales en caché mientras se restablece la conexión.'
      });
    } finally {
      set({ isSyncing: false });
    }
  },

  importLocalDataToSupabase: async () => {
    const {
      authUser,
      goals,
      plans,
      dailyObjectives,
      expenses,
      fixedDeductions,
      financialSettings,
      fears
    } = get();

    if (!authUser || !isSupabaseConfigured()) {
      return { success: false, error: 'Debes iniciar sesión con Supabase para importar tus datos.' };
    }

    set({ isSyncing: true });
    try {
      const userId = authUser.id;
      let count = 0;

      await settingsRepository.upsertFinancialSettings({
        ...financialSettings,
        userId
      });

      for (const d of fixedDeductions) {
        await settingsRepository.createFixedDeduction({ ...d, userId });
        count++;
      }

      for (const g of goals) {
        await goalsRepository.createGoal({ ...g, userId });
        count++;
      }

      for (const p of plans) {
        await plansRepository.createPlan({ ...p, userId });
        count++;
      }

      for (const obj of dailyObjectives) {
        await objectivesRepository.createObjective({ ...obj, userId });
        count++;
      }

      for (const exp of expenses) {
        await expensesRepository.createExpense({ ...exp, userId });
        count++;
      }

      for (const f of fears) {
        await fearsRepository.createFear({ ...f, userId });
        count++;
      }

      localStorage.setItem(IMPORTED_FLAG_KEY, 'imported');
      set({ hasLocalDataToImport: false });

      get().addToast({
        type: 'success',
        title: '¡Datos importados con éxito!',
        description: `Se subieron ${count} elementos a tu cuenta de Supabase.`
      });

      await get().syncFromSupabase();
      return { success: true, count };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error durante la importación' };
    } finally {
      set({ isSyncing: false });
    }
  },

  syncOfflineQueueNow: async () => {
    const items = await getOfflineQueue();
    if (items.length === 0) return { success: true, synced: 0, failed: 0 };
    let synced = 0;
    let failed = 0;

    for (const item of items) {
      try {
        if (item.type === 'complete_objective') {
          await objectivesRepository.updateObjective(item.payload.id, {
            status: item.payload.status,
            completedAt: item.payload.completedAt
          });
        } else if (item.type === 'add_objective') {
          await objectivesRepository.createObjective(item.payload);
        } else if (item.type === 'delete_objective') {
          await objectivesRepository.deleteObjective(item.payload.id);
        } else if (item.type === 'toggle_habit') {
          await habitsRepository.setHabitLog(item.payload);
        } else if (item.type === 'add_expense') {
          await expensesRepository.createExpense(item.payload);
        } else if (item.type === 'delete_expense') {
          await expensesRepository.deleteExpense(item.payload.id);
        } else if (item.type === 'add_goal') {
          await goalsRepository.createGoal(item.payload);
        } else if (item.type === 'delete_goal') {
          await goalsRepository.deleteGoal(item.payload.id);
        } else if (item.type === 'add_plan') {
          await plansRepository.createPlan(item.payload);
        } else if (item.type === 'add_action') {
          await actionsRewardsRepository.createAction(item.payload);
        } else if (item.type === 'toggle_action') {
          await actionsRewardsRepository.updateAction(item.payload.id, {
            isCompleted: item.payload.isCompleted,
            completedAt: item.payload.completedAt
          });
        } else if (item.type === 'complete_fear_step') {
          await fearsRepository.updateFearStep(item.payload.stepId, true, item.payload.completedAt);
        } else if (item.type === 'redeem_reward') {
          await actionsRewardsRepository.recordRedemption(item.payload.redemption);
        }
        await removeOfflineAction(item.id);
        synced++;
      } catch (err) {
        console.warn('[SyncQueue] Error al sincronizar acción individual:', item, err);
        failed++;
      }
    }

    if (synced > 0) {
      get().addToast({
        type: 'success',
        title: 'Sincronización Offline Completada',
        description: `Se sincronizaron ${synced} acciones en orden y sin duplicados.`
      });
      const { authUser } = get();
      if (authUser) {
        try {
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
        } catch {}
      }
    }

    return { success: failed === 0, synced, failed };
  },

  deleteAccountPermanently: async () => {
    const user = get().authUser;
    if (user && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error al eliminar datos en Supabase:', e);
      }
    }
    try {
      localStorage.clear();
    } catch {}

    const initial = getInitialData();
    set({
      ...initial,
      authUser: null,
      partner: null
    });
    get().recalculatePowersAndSave();
    get().addToast({
      type: 'warning',
      title: 'Cuenta eliminada permanentemente',
      description: 'Todos tus datos y registros de combate han sido destruidos.'
    });
  }
});
