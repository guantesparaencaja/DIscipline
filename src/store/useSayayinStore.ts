import { create } from 'zustand';
import confetti from 'canvas-confetti';
import {
  Profile,
  FinancialSettings,
  FixedDeduction,
  ExpenseCategory,
  Expense,
  Goal,
  Plan,
  DailyObjective,
  XPEvent,
  Achievement,
  UserAchievement,
  PartnerData,
  ToastMessage,
  TimeSlot,
  TransformationId
} from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_FIXED_DEDUCTIONS,
  INITIAL_ACHIEVEMENTS,
  TRANSFORMATIONS
} from '../lib/constants';
import {
  calculateAllPowers,
  formatCOP,
  getLevelFromXP,
  getTodayDateString,
  PowerBreakdown
} from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createGoogleCalendarEvent, createGoogleTask } from '../lib/workspace';

interface SayayinState {
  // Data
  profile: Profile;
  financialSettings: FinancialSettings;
  fixedDeductions: FixedDeduction[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  goals: Goal[];
  plans: Plan[];
  dailyObjectives: DailyObjective[];
  xpEvents: XPEvent[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  partner: PartnerData | null;
  toasts: ToastMessage[];

  // UI State
  selectedDate: string; // YYYY-MM-DD
  activeTimeSlotFilter: TimeSlot | 'todos';
  isPowerModalOpen: boolean;
  isQuickObjectiveModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isGoalModalOpen: boolean;
  isConfigModalOpen: boolean;

  // Computed & Getters
  getAvailableFunds: () => number;
  getPowerBreakdown: () => PowerBreakdown;

  // Actions
  setSelectedDate: (date: string) => void;
  setActiveTimeSlotFilter: (slot: TimeSlot | 'todos') => void;
  setIsPowerModalOpen: (open: boolean) => void;
  setIsQuickObjectiveModalOpen: (open: boolean) => void;
  setIsExpenseModalOpen: (open: boolean) => void;
  setIsGoalModalOpen: (open: boolean) => void;
  setIsConfigModalOpen: (open: boolean) => void;

  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;

  // Objectives
  completeObjective: (id: string) => Promise<void>;
  reopenObjective: (id: string) => void;
  skipObjective: (id: string) => void;
  addObjective: (data: Omit<DailyObjective, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  editObjective: (id: string, data: Partial<DailyObjective>) => void;
  deleteObjective: (id: string) => void;

  // Expenses & Savings
  addExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => void;
  editExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Goals & Plans
  addGoal: (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentSavings'>) => void;
  editGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addPlan: (data: Omit<Plan, 'id' | 'userId' | 'createdAt'>) => void;
  toggleMilestone: (planId: string, milestoneId: string) => void;

  // Financial Settings & Fixed Deductions
  updateFinancialSettings: (income: number, emergencyTarget: number) => void;
  addFixedDeduction: (data: Omit<FixedDeduction, 'id' | 'userId'>) => void;
  editFixedDeduction: (id: string, data: Partial<FixedDeduction>) => void;
  deleteFixedDeduction: (id: string) => void;

  // Partner
  connectPartner: (inviteCode: string) => Promise<{ success: boolean; message: string }>;
  disconnectPartner: () => void;

  // Google Workspace Sync
  syncObjectiveToCalendar: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;
  syncObjectiveToTasks: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;

  // Internal
  recalculatePowersAndSave: () => void;
  checkAchievements: () => void;
  resetToInitialDemo: () => void;
}

const STORAGE_KEY = 'sayayin_radar_state_v1';

const getInitialData = () => {
  const today = getTodayDateString();

  // Try to load from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  // Initial Seed
  const userId = 'user_sayayin_001';
  const initialProfile: Profile = {
    id: userId,
    email: 'guerrero@sayayin.app',
    displayName: 'Guerrero Saiyajin',
    currentXp: 420,
    currentLevel: 2,
    totalPower: 26,
    basePower: 28,
    evolutionPower: 22,
    financialPower: 30,
    habitsPower: 24,
    transformation: 'ssj',
    currentStreak: 4,
    bestStreak: 7,
    lastActiveDate: today,
    inviteCode: 'SAYAYIN-8X7K2',
    partnerId: null,
    createdAt: today
  };

  const initialFinancialSettings: FinancialSettings = {
    id: 'fin_001',
    userId,
    baseMonthlyIncome: 1250000,
    emergencyFundTarget: 3750000,
    updatedAt: today
  };

  const initialFixedDeductions: FixedDeduction[] = DEFAULT_FIXED_DEDUCTIONS.map((item, idx) => ({
    ...item,
    id: `fix_ded_${idx + 1}`,
    userId
  }));

  const initialGoals: Goal[] = [
    {
      id: 'goal_001',
      userId,
      title: 'Fondo de Emergencia Saiyajin (3 Meses)',
      description: 'Construir colchón de tranquilidad de 3 meses de gastos para entrenar sin estrés financiero.',
      category: 'Seguridad Financiera',
      startDate: '2026-09-01',
      targetDate: '2026-12-31',
      priority: 'maxima',
      status: 'activa',
      targetAmount: 1200000,
      currentSavings: 350000,
      motivation: 'Tener paz mental y nunca depender de deudas para sobrevivir ante imprevistos.',
      createdAt: '2026-09-01'
    },
    {
      id: 'goal_002',
      userId,
      title: 'Equipamiento de Entrenamiento & Salud',
      description: 'Calzado deportivo ergonómico y suscripción a centro de alto rendimiento.',
      category: 'Cuerpo & Mente',
      startDate: '2026-09-15',
      targetDate: '2026-11-15',
      priority: 'alta',
      status: 'activa',
      targetAmount: 450000,
      currentSavings: 150000,
      motivation: 'Mejorar mi rendimiento físico y cuidar las articulaciones para llegar a SSJ3.',
      createdAt: '2026-09-15'
    }
  ];

  const initialPlans: Plan[] = [
    {
      id: 'plan_001',
      goalId: 'goal_001',
      userId,
      title: 'Estrategia de Blindaje Financiero',
      description: 'Apartar cuotas fijas los días 10 y 25 de cada mes recortando compras hormiga.',
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      status: 'activo',
      milestones: [
        { id: 'm1', title: 'Completar primer $300.000 COP', targetDate: '2026-09-30', completed: true },
        { id: 'm2', title: 'Llegar a la mitad ($600.000 COP)', targetDate: '2026-10-31', completed: false },
        { id: 'm3', title: 'Alcanzar $900.000 COP', targetDate: '2026-11-30', completed: false },
        { id: 'm4', title: 'Meta completa $1.200.000 COP', targetDate: '2026-12-31', completed: false }
      ],
      createdAt: '2026-09-01'
    }
  ];

  const initialExpenses: Expense[] = [
    {
      id: 'exp_001',
      userId,
      description: 'Mercado de la semana y proteínas',
      amount: 145000,
      categoryId: 'cat_alimentacion',
      categoryName: 'Alimentación / Mercado',
      date: today,
      paymentMethod: 'tarjeta_debito',
      isSaving: false,
      createdAt: today
    },
    {
      id: 'exp_002',
      userId,
      description: 'Aporte al Fondo de Emergencia',
      amount: 100000,
      categoryId: 'cat_ahorro',
      categoryName: 'Ahorro para Metas',
      date: today,
      paymentMethod: 'transferencia',
      isSaving: true,
      goalId: 'goal_001',
      createdAt: today
    }
  ];

  const initialDailyObjectives: DailyObjective[] = [
    {
      id: 'obj_001',
      userId,
      goalId: 'goal_001',
      title: 'Apartar $20.000 para el Fondo de Emergencia',
      date: today,
      timeSlot: 'manana',
      customTime: '08:00',
      difficulty: 'normal',
      xpReward: 20,
      savingAmount: 20000,
      isPartnerVisible: true,
      recurrence: 'diaria',
      status: 'completado',
      completedAt: `${today}T08:30:00Z`,
      createdAt: today
    },
    {
      id: 'obj_002',
      userId,
      title: 'Entrenamiento de fuerza y resistencia (40 min)',
      date: today,
      timeSlot: 'manana',
      customTime: '09:30',
      difficulty: 'dificil',
      xpReward: 40,
      isPartnerVisible: true,
      recurrence: 'diaria',
      status: 'completado',
      completedAt: `${today}T10:15:00Z`,
      createdAt: today
    },
    {
      id: 'obj_003',
      userId,
      title: 'Cero gastos impulsivos o domicilios innecesarios',
      date: today,
      timeSlot: 'tarde',
      difficulty: 'normal',
      xpReward: 20,
      isPartnerVisible: true,
      recurrence: 'diaria',
      status: 'en_progreso',
      createdAt: today
    },
    {
      id: 'obj_004',
      userId,
      title: 'Registrar cada recibo y auditar fondo disponible',
      date: today,
      timeSlot: 'noche',
      customTime: '21:00',
      difficulty: 'facil',
      xpReward: 10,
      isPartnerVisible: true,
      recurrence: 'diaria',
      status: 'pendiente',
      createdAt: today
    }
  ];

  const initialXPEvents: XPEvent[] = [
    {
      id: 'xp_001',
      userId,
      sourceType: 'objective',
      description: 'Completado: Apartar $20.000 para el Fondo de Emergencia',
      xpAmount: 20,
      createdAt: today
    },
    {
      id: 'xp_002',
      userId,
      sourceType: 'objective',
      description: 'Completado: Entrenamiento de fuerza y resistencia (40 min)',
      xpAmount: 40,
      createdAt: today
    },
    {
      id: 'xp_003',
      userId,
      sourceType: 'streak_bonus',
      description: 'Bonus de Racha: 4 días consecutivos de entrenamiento',
      xpAmount: 60,
      createdAt: today
    }
  ];

  const initialUserAchievements: UserAchievement[] = [
    {
      id: 'uach_001',
      userId,
      achievementId: 'ach_first_step',
      unlockedAt: today
    },
    {
      id: 'uach_002',
      userId,
      achievementId: 'ach_streak_3',
      unlockedAt: today
    },
    {
      id: 'uach_003',
      userId,
      achievementId: 'ach_first_expense',
      unlockedAt: today
    },
    {
      id: 'uach_004',
      userId,
      achievementId: 'ach_first_saving',
      unlockedAt: today
    }
  ];

  return {
    profile: initialProfile,
    financialSettings: initialFinancialSettings,
    fixedDeductions: initialFixedDeductions,
    categories: DEFAULT_EXPENSE_CATEGORIES,
    expenses: initialExpenses,
    goals: initialGoals,
    plans: initialPlans,
    dailyObjectives: initialDailyObjectives,
    xpEvents: initialXPEvents,
    achievements: INITIAL_ACHIEVEMENTS,
    userAchievements: initialUserAchievements,
    partner: null,
    toasts: []
  };
};

export const useSayayinStore = create<SayayinState>((set, get) => {
  const initial = getInitialData();

  // Helper to persist state
  const saveState = (newState: Partial<SayayinState>) => {
    try {
      const state = { ...get(), ...newState };
      const toSave = {
        profile: state.profile,
        financialSettings: state.financialSettings,
        fixedDeductions: state.fixedDeductions,
        categories: state.categories,
        expenses: state.expenses,
        goals: state.goals,
        plans: state.plans,
        dailyObjectives: state.dailyObjectives,
        xpEvents: state.xpEvents,
        achievements: state.achievements,
        userAchievements: state.userAchievements,
        partner: state.partner
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  };

  return {
    ...initial,
    selectedDate: getTodayDateString(),
    activeTimeSlotFilter: 'todos',
    isPowerModalOpen: false,
    isQuickObjectiveModalOpen: false,
    isExpenseModalOpen: false,
    isGoalModalOpen: false,
    isConfigModalOpen: false,

    getAvailableFunds: () => {
      const { financialSettings, fixedDeductions, expenses } = get();
      const income = financialSettings.baseMonthlyIncome || 0;
      const totalFixed = fixedDeductions
        .filter((d) => d.isActive)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      return income - totalFixed - totalExpenses;
    },

    getPowerBreakdown: () => {
      const {
        financialSettings,
        fixedDeductions,
        expenses,
        goals,
        dailyObjectives,
        profile,
        userAchievements,
        achievements
      } = get();

      const monthlyIncome = financialSettings.baseMonthlyIncome || 0;
      const totalFixed = fixedDeductions
        .filter((d) => d.isActive)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const totalExpensesThisMonth = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const availableFunds = monthlyIncome - totalFixed - totalExpensesThisMonth;

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
        totalAchievementsCount: achievements.length
      });
    },

    recalculatePowersAndSave: () => {
      const breakdown = get().getPowerBreakdown();
      const currentTrans = get().profile.transformation;
      const newTrans = breakdown.transformationId;

      set((state) => {
        const updatedProfile: Profile = {
          ...state.profile,
          financialPower: breakdown.financialPower,
          habitsPower: breakdown.habitsPower,
          basePower: breakdown.basePower,
          evolutionPower: breakdown.evolutionPower,
          totalPower: breakdown.totalPower,
          transformation: newTrans
        };

        return { profile: updatedProfile };
      });

      if (currentTrans !== newTrans) {
        const transConfig = TRANSFORMATIONS[newTrans];
        get().addToast({
          type: 'transformation',
          title: `¡Evolución Saiyajin: ${transConfig.name}!`,
          description: transConfig.quote
        });
      }

      saveState({ profile: get().profile });
    },

    setSelectedDate: (date: string) => set({ selectedDate: date }),
    setActiveTimeSlotFilter: (slot: TimeSlot | 'todos') => set({ activeTimeSlotFilter: slot }),
    setIsPowerModalOpen: (open: boolean) => set({ isPowerModalOpen: open }),
    setIsQuickObjectiveModalOpen: (open: boolean) => set({ isQuickObjectiveModalOpen: open }),
    setIsExpenseModalOpen: (open: boolean) => set({ isExpenseModalOpen: open }),
    setIsGoalModalOpen: (open: boolean) => set({ isGoalModalOpen: open }),
    setIsConfigModalOpen: (open: boolean) => set({ isConfigModalOpen: open }),

    addToast: (toast) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = {
        ...toast,
        id,
        timestamp: Date.now()
      };
      set((state) => ({ toasts: [newToast, ...state.toasts.slice(0, 4)] }));
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, 4500);
    },

    dismissToast: (id: string) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    // Objectives Operations
    completeObjective: async (id: string) => {
      const objective = get().dailyObjectives.find((o) => o.id === id);
      if (!objective || objective.status === 'completado') return;

      const now = new Date().toISOString();
      const earnedXP = objective.xpReward;
      const oldTotalXP = get().profile.currentXp;
      const newTotalXP = oldTotalXP + earnedXP;
      const oldLevel = get().profile.currentLevel;
      const newLevel = getLevelFromXP(newTotalXP);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#FF6600', '#FACC15', '#10B981']
        });
      } catch (e) {
        // ignore
      }

      // Create XP event
      const xpEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: get().profile.id,
        sourceType: 'objective',
        description: `Objetivo: ${objective.title}`,
        xpAmount: earnedXP,
        createdAt: getTodayDateString()
      };

      // Check if saving amount was linked
      let updatedExpenses = get().expenses;
      let updatedGoals = get().goals;
      if (objective.savingAmount && objective.savingAmount > 0 && objective.goalId) {
        const savingExpense: Expense = {
          id: 'exp_saving_' + Date.now(),
          userId: get().profile.id,
          description: `Ahorro cumplimiento: ${objective.title}`,
          amount: objective.savingAmount,
          categoryId: 'cat_ahorro',
          categoryName: 'Ahorro para Metas',
          date: getTodayDateString(),
          paymentMethod: 'transferencia',
          isSaving: true,
          goalId: objective.goalId,
          createdAt: getTodayDateString()
        };
        updatedExpenses = [savingExpense, ...updatedExpenses];
        updatedGoals = updatedGoals.map((g) =>
          g.id === objective.goalId ? { ...g, currentSavings: g.currentSavings + objective.savingAmount! } : g
        );
      }

      // Update state
      set((state) => ({
        dailyObjectives: state.dailyObjectives.map((o) =>
          o.id === id ? { ...o, status: 'completado', completedAt: now } : o
        ),
        profile: {
          ...state.profile,
          currentXp: newTotalXP,
          currentLevel: newLevel
        },
        xpEvents: [xpEvent, ...state.xpEvents],
        expenses: updatedExpenses,
        goals: updatedGoals
      }));

      // Toasts
      get().addToast({
        type: 'xp',
        title: `¡Objetivo completado! +${earnedXP} XP`,
        description: objective.title,
        xpAmount: earnedXP
      });

      if (newLevel > oldLevel) {
        try {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        get().addToast({
          type: 'level_up',
          title: `¡HAS SUBIDO A NIVEL ${newLevel}!`,
          description: 'Tu ki se ha expandido. Tu entrenamiento está dando frutos reales.'
        });
      }

      // Supabase sync if connected
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase
            .from('daily_objectives')
            .update({ status: 'completado', completed_at: now })
            .eq('id', id);
        } catch (err) {
          console.warn('Supabase sync objective failed:', err);
        }
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveState({
        dailyObjectives: get().dailyObjectives,
        profile: get().profile,
        xpEvents: get().xpEvents,
        expenses: get().expenses,
        goals: get().goals
      });
    },

    reopenObjective: (id: string) => {
      set((state) => ({
        dailyObjectives: state.dailyObjectives.map((o) =>
          o.id === id ? { ...o, status: 'pendiente', completedAt: undefined } : o
        )
      }));
      get().recalculatePowersAndSave();
      saveState({ dailyObjectives: get().dailyObjectives });
    },

    skipObjective: (id: string) => {
      set((state) => ({
        dailyObjectives: state.dailyObjectives.map((o) =>
          o.id === id ? { ...o, status: 'omitido' } : o
        )
      }));
      get().recalculatePowersAndSave();
      saveState({ dailyObjectives: get().dailyObjectives });
    },

    addObjective: (data) => {
      const newObj: DailyObjective = {
        ...data,
        id: 'obj_' + Date.now(),
        userId: get().profile.id,
        status: 'pendiente',
        createdAt: getTodayDateString()
      };
      set((state) => ({ dailyObjectives: [newObj, ...state.dailyObjectives] }));
      get().addToast({
        type: 'success',
        title: 'Objetivo agregado a tu rutina',
        description: `${newObj.title} (+${newObj.xpReward} XP)`
      });
      get().recalculatePowersAndSave();
      saveState({ dailyObjectives: get().dailyObjectives });
    },

    editObjective: (id, data) => {
      set((state) => ({
        dailyObjectives: state.dailyObjectives.map((o) => (o.id === id ? { ...o, ...data } : o))
      }));
      get().recalculatePowersAndSave();
      saveState({ dailyObjectives: get().dailyObjectives });
    },

    deleteObjective: (id) => {
      set((state) => ({
        dailyObjectives: state.dailyObjectives.filter((o) => o.id !== id)
      }));
      get().recalculatePowersAndSave();
      saveState({ dailyObjectives: get().dailyObjectives });
    },

    // Expenses & Savings
    addExpense: (data) => {
      const newExpense: Expense = {
        ...data,
        id: 'exp_' + Date.now(),
        userId: get().profile.id,
        createdAt: getTodayDateString()
      };

      let updatedGoals = get().goals;
      if (newExpense.isSaving && newExpense.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === newExpense.goalId ? { ...g, currentSavings: g.currentSavings + newExpense.amount } : g
        );
      }

      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        goals: updatedGoals
      }));

      get().addToast({
        type: 'success',
        title: newExpense.isSaving ? '¡Ahorro registrado con éxito!' : 'Gasto registrado',
        description: `${newExpense.description}: ${formatCOP(newExpense.amount)}`
      });

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveState({ expenses: get().expenses, goals: get().goals });
    },

    editExpense: (id, data) => {
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e))
      }));
      get().recalculatePowersAndSave();
      saveState({ expenses: get().expenses });
    },

    deleteExpense: (id) => {
      const target = get().expenses.find((e) => e.id === id);
      let updatedGoals = get().goals;
      if (target?.isSaving && target.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === target.goalId ? { ...g, currentSavings: Math.max(0, g.currentSavings - target.amount) } : g
        );
      }
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        goals: updatedGoals
      }));
      get().recalculatePowersAndSave();
      saveState({ expenses: get().expenses, goals: get().goals });
    },

    // Goals & Plans
    addGoal: (data) => {
      const newGoal: Goal = {
        ...data,
        id: 'goal_' + Date.now(),
        userId: get().profile.id,
        currentSavings: 0,
        createdAt: getTodayDateString()
      };
      set((state) => ({ goals: [newGoal, ...state.goals] }));
      get().addToast({
        type: 'success',
        title: 'Nueva meta Saiyajin creada',
        description: `${newGoal.title} (${formatCOP(newGoal.targetAmount)})`
      });
      get().recalculatePowersAndSave();
      saveState({ goals: get().goals });
    },

    editGoal: (id, data) => {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g))
      }));
      get().recalculatePowersAndSave();
      saveState({ goals: get().goals });
    },

    deleteGoal: (id) => {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        plans: state.plans.filter((p) => p.goalId !== id)
      }));
      get().recalculatePowersAndSave();
      saveState({ goals: get().goals, plans: get().plans });
    },

    addPlan: (data) => {
      const newPlan: Plan = {
        ...data,
        id: 'plan_' + Date.now(),
        userId: get().profile.id,
        createdAt: getTodayDateString()
      };
      set((state) => ({ plans: [newPlan, ...state.plans] }));
      get().addToast({
        type: 'success',
        title: 'Plan táctico asignado a la meta',
        description: newPlan.title
      });
      saveState({ plans: get().plans });
    },

    toggleMilestone: (planId, milestoneId) => {
      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                milestones: p.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, completed: !m.completed } : m
                )
              }
            : p
        )
      }));
      saveState({ plans: get().plans });
    },

    // Financial Settings & Fixed Deductions
    updateFinancialSettings: (income, emergencyTarget) => {
      set((state) => ({
        financialSettings: {
          ...state.financialSettings,
          baseMonthlyIncome: income,
          emergencyFundTarget: emergencyTarget,
          updatedAt: getTodayDateString()
        }
      }));
      get().addToast({
        type: 'success',
        title: 'Finanzas base actualizadas',
        description: `Ingreso mensual: ${formatCOP(income)}`
      });
      get().recalculatePowersAndSave();
      saveState({ financialSettings: get().financialSettings });
    },

    addFixedDeduction: (data) => {
      const newDeduction: FixedDeduction = {
        ...data,
        id: 'fix_' + Date.now(),
        userId: get().profile.id
      };
      set((state) => ({ fixedDeductions: [...state.fixedDeductions, newDeduction] }));
      get().recalculatePowersAndSave();
      saveState({ fixedDeductions: get().fixedDeductions });
    },

    editFixedDeduction: (id, data) => {
      set((state) => ({
        fixedDeductions: state.fixedDeductions.map((d) => (d.id === id ? { ...d, ...data } : d))
      }));
      get().recalculatePowersAndSave();
      saveState({ fixedDeductions: get().fixedDeductions });
    },

    deleteFixedDeduction: (id) => {
      set((state) => ({
        fixedDeductions: state.fixedDeductions.filter((d) => d.id !== id)
      }));
      get().recalculatePowersAndSave();
      saveState({ fixedDeductions: get().fixedDeductions });
    },

    // Partner Connection
    connectPartner: async (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return { success: false, message: 'Ingresa un código válido.' };

      if (cleanCode === get().profile.inviteCode) {
        return { success: false, message: 'No puedes enlazarte con tu propio código.' };
      }

      // Check if Supabase RPC is ready
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.rpc('join_by_code', { target_invite_code: cleanCode });
          if (error || !data?.success) {
            // fallback to demo partner simulation
          } else {
            // success
          }
        } catch (e) {
          // fallback
        }
      }

      // Simulated Saiyajin Training Partner
      const simulatedPartner: PartnerData = {
        id: 'partner_vegeta_001',
        displayName: 'Vegeta (Príncipe)',
        currentLevel: 4,
        transformation: 'ssj2',
        currentXp: 850,
        currentStreak: 9,
        totalAchievements: 6,
        connectedSince: getTodayDateString(),
        todayObjectives: [
          {
            id: 'p_obj_1',
            title: 'Entrenamiento en Cámara de Gravedad x100',
            timeSlot: 'manana',
            customTime: '07:00',
            difficulty: 'extremo',
            status: 'completado',
            completedAt: `${getTodayDateString()}T08:00:00Z`
          },
          {
            id: 'p_obj_2',
            title: 'Auditar presupuesto de Corporación Cápsula',
            timeSlot: 'tarde',
            customTime: '15:30',
            difficulty: 'normal',
            status: 'pendiente'
          },
          {
            id: 'p_obj_3',
            title: 'Apartar cuota de fondo de contingencia',
            timeSlot: 'noche',
            customTime: '20:00',
            difficulty: 'normal',
            status: 'completado',
            completedAt: `${getTodayDateString()}T20:15:00Z`
          }
        ]
      };

      set({ partner: simulatedPartner });
      get().addToast({
        type: 'achievement',
        title: '¡Compañero de entrenamiento enlazado!',
        description: `Conectado con ${simulatedPartner.displayName} (${simulatedPartner.transformation.toUpperCase()})`
      });

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveState({ partner: simulatedPartner });
      return { success: true, message: `Conectado con éxito a ${simulatedPartner.displayName}` };
    },

    disconnectPartner: () => {
      set({ partner: null });
      get().addToast({
        type: 'info',
        title: 'Compañero desvinculado',
        description: 'Ahora estás entrenando en solitario.'
      });
      saveState({ partner: null });
    },

    // Workspace Sync
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
        saveState({ dailyObjectives: get().dailyObjectives });
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
        saveState({ dailyObjectives: get().dailyObjectives });
        return { success: true };
      }
      return { success: false, error: res.error };
    },

    // Achievements Check Engine
    checkAchievements: () => {
      const {
        dailyObjectives,
        expenses,
        goals,
        profile,
        partner,
        userAchievements,
        achievements
      } = get();

      const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
      const newlyUnlocked: Achievement[] = [];

      achievements.forEach((ach) => {
        if (unlockedIds.has(ach.id)) return;

        let shouldUnlock = false;

        if (ach.code === 'first_step') {
          shouldUnlock = dailyObjectives.some((o) => o.status === 'completado');
        } else if (ach.code === 'streak_3') {
          shouldUnlock = profile.currentStreak >= 3;
        } else if (ach.code === 'streak_7') {
          shouldUnlock = profile.currentStreak >= 7;
        } else if (ach.code === 'streak_21') {
          shouldUnlock = profile.currentStreak >= 21;
        } else if (ach.code === 'first_expense') {
          shouldUnlock = expenses.length > 0;
        } else if (ach.code === 'first_saving') {
          shouldUnlock = expenses.some((e) => e.isSaving);
        } else if (ach.code === 'savings_500k') {
          const totalSaved = goals.reduce((acc, g) => acc + g.currentSavings, 0);
          shouldUnlock = totalSaved >= 500000;
        } else if (ach.code === 'power_50') {
          shouldUnlock = profile.totalPower >= 50;
        } else if (ach.code === 'partner_linked') {
          shouldUnlock = partner !== null;
        }

        if (shouldUnlock) {
          newlyUnlocked.push(ach);
        }
      });

      if (newlyUnlocked.length > 0) {
        const newUAs: UserAchievement[] = newlyUnlocked.map((ach) => ({
          id: 'uach_' + Math.random().toString(36).substring(2, 9),
          userId: profile.id,
          achievementId: ach.id,
          unlockedAt: getTodayDateString()
        }));

        const totalEarnedXP = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
        const newTotalXP = profile.currentXp + totalEarnedXP;
        const newLevel = getLevelFromXP(newTotalXP);

        set((state) => ({
          userAchievements: [...state.userAchievements, ...newUAs],
          profile: {
            ...state.profile,
            currentXp: newTotalXP,
            currentLevel: newLevel
          }
        }));

        newlyUnlocked.forEach((ach) => {
          get().addToast({
            type: 'achievement',
            title: `¡Nuevo Logro: ${ach.title}!`,
            description: `${ach.description} (+${ach.xpReward} XP)`
          });
        });

        saveState({
          userAchievements: get().userAchievements,
          profile: get().profile
        });
      }
    },

    resetToInitialDemo: () => {
      localStorage.removeItem(STORAGE_KEY);
      const initial = getInitialData();
      set(initial);
      get().recalculatePowersAndSave();
      get().addToast({
        type: 'info',
        title: 'Datos de entrenamiento restablecidos',
        description: 'Se cargaron los valores y metas iniciales de Fase 1.'
      });
    }
  };
});
