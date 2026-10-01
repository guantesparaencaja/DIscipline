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
  TransformationId,
  Fear,
  FearStep,
  UndoableObjective,
  Habit,
  HabitLog,
  HabitWithStats,
  ActionItem,
  PersonalReward,
  RewardRedemption
} from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_FIXED_DEDUCTIONS,
  DEFAULT_HABITS,
  DEFAULT_ACTIONS,
  DEFAULT_PERSONAL_REWARDS,
  INITIAL_ACHIEVEMENTS,
  TRANSFORMATIONS
} from '../lib/constants';
import {
  calculateAllPowers,
  formatCOP,
  getLevelFromXP,
  getTodayDateString,
  calculateStreakOnActivity,
  isHabitDueOnDate,
  calculateHabitStreak,
  calculateGoalPace,
  PowerBreakdown
} from '../lib/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createGoogleCalendarEvent, createGoogleTask } from '../lib/workspace';
import {
  profileRepository,
  goalsRepository,
  plansRepository,
  objectivesRepository,
  expensesRepository,
  settingsRepository,
  categoriesRepository,
  fearsRepository,
  achievementsRepository,
  partnerRepository,
  habitsRepository,
  actionsRewardsRepository
} from '../data';
import { enqueueOfflineAction, getOfflineQueue, removeOfflineAction } from '../lib/offlineQueue';

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
  habits: Habit[];
  habitLogs: HabitLog[];
  actions: ActionItem[];
  personalRewards: PersonalReward[];
  rewardRedemptions: RewardRedemption[];
  xpEvents: XPEvent[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  fears: Fear[];
  partner: PartnerData | null;
  toasts: ToastMessage[];

  // Progress, Undo & Realtime state
  undoableObjective: UndoableObjective | null;
  isNivelHistorialOpen: boolean;
  partnerLiveStatus: 'online' | 'connecting' | 'disconnected';

  // Auth State
  authUser: { id: string; email: string; displayName?: string } | null;
  isAuthModalOpen: boolean;
  authLoading: boolean;
  authError: string | null;
  isSyncing: boolean;
  hasLocalDataToImport: boolean;

  // UI State
  selectedDate: string; // YYYY-MM-DD
  activeTimeSlotFilter: TimeSlot | 'todos';
  isPowerModalOpen: boolean;
  isQuickObjectiveModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isGoalModalOpen: boolean;
  isConfigModalOpen: boolean;
  isHabitModalOpen: boolean;
  editingHabit: Habit | null;

  // Computed & Getters
  getAvailableFunds: () => number;
  getPowerBreakdown: () => PowerBreakdown;
  getHabitStats: (habitId: string) => { currentStreak: number; bestStreak: number; thirtyDayRate: number; totalCompletions: number };
  getHabitsForDate: (dateStr: string) => HabitWithStats[];

  // Actions
  setSelectedDate: (date: string) => void;
  setActiveTimeSlotFilter: (slot: TimeSlot | 'todos') => void;
  setIsPowerModalOpen: (open: boolean) => void;
  setIsQuickObjectiveModalOpen: (open: boolean) => void;
  setIsExpenseModalOpen: (open: boolean) => void;
  setIsGoalModalOpen: (open: boolean) => void;
  setIsConfigModalOpen: (open: boolean) => void;
  setIsHabitModalOpen: (open: boolean) => void;
  setEditingHabit: (habit: Habit | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsNivelHistorialOpen: (open: boolean) => void;
  setAuthError: (error: string | null) => void;
  dismissImportPrompt: () => void;
  importLocalDataToSupabase: () => Promise<{ success: boolean; count?: number; error?: string }>;

  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;

  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDay: (habitId: string, dateStr: string) => Promise<void>;

  // Objectives
  completeObjective: (id: string) => Promise<void>;
  undoCompleteObjective: (id: string) => Promise<void>;
  reopenObjective: (id: string) => Promise<void>;
  skipObjective: (id: string) => Promise<void>;
  generateRecurringObjectives: () => Promise<void>;
  addObjective: (data: Omit<DailyObjective, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  editObjective: (id: string, data: Partial<DailyObjective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;

  // Expenses & Savings
  addExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Goals & Plans
  addGoal: (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentSavings'>) => Promise<void>;
  editGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addPlan: (data: Omit<Plan, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editPlan: (id: string, data: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  toggleMilestone: (planId: string, milestoneId: string) => Promise<void>;
  updatePlanStatus: (planId: string, status: Plan['status']) => Promise<void>;
  generateObjectivesFromPlan: (planId: string) => Promise<number>;
  generateSmartObjectivesForGoal: (goalId: string) => Promise<number>;

  // Acciones Tácticas
  addAction: (data: Omit<ActionItem, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => Promise<void>;
  toggleAction: (id: string) => Promise<void>;
  editAction: (id: string, data: Partial<ActionItem>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;

  // Recompensas Personales (XP Gastable)
  addReward: (data: Omit<PersonalReward, 'id' | 'userId' | 'createdAt' | 'timesRedeemed'>) => Promise<void>;
  editReward: (id: string, data: Partial<PersonalReward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; message: string }>;

  // Presupuesto por Categoría
  updateCategoryBudget: (categoryId: string, budgetLimit: number) => Promise<void>;

  // Miedos & Dominio Mental (Escalera de Exposición 3-10 niveles)
  addFear: (data: Omit<Fear, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  editFear: (fearId: string, data: Partial<Fear>) => Promise<void>;
  completeFearStep: (fearId: string, stepId: string) => Promise<void>;
  reorderFearSteps: (fearId: string, newSteps: FearStep[]) => Promise<void>;
  toggleFearAction: (fearId: string, actionId: string) => Promise<void>;
  conquerFear: (fearId: string, reflection?: string) => Promise<void>;
  deleteFear: (fearId: string) => Promise<void>;

  // Financial Settings & Fixed Deductions
  updateFinancialSettings: (income: number, emergencyTarget: number) => Promise<void>;
  addFixedDeduction: (data: Omit<FixedDeduction, 'id' | 'userId'>) => Promise<void>;
  editFixedDeduction: (id: string, data: Partial<FixedDeduction>) => Promise<void>;
  deleteFixedDeduction: (id: string) => Promise<void>;

  // Partner
  connectPartner: (inviteCode: string) => Promise<{ success: boolean; message: string }>;
  disconnectPartner: () => Promise<void>;
  loadPartnerData: (partnerId: string) => Promise<void>;
  setupPartnerRealtime: (partnerId: string) => void;
  updateGlobalPrivacySetting: (shareGlobally: boolean) => Promise<void>;

  // Google Workspace Sync
  syncObjectiveToCalendar: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;
  syncObjectiveToTasks: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;

  // Supabase Auth & Realtime Sync
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOutFromSupabase: () => Promise<void>;
  resetSupabasePassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  initAuthListener: () => void;
  syncFromSupabase: () => Promise<void>;
  syncOfflineQueueNow: () => Promise<{ success: boolean; synced: number; failed: number }>;

  // Internal
  recalculatePowersAndSave: () => void;
  checkAchievements: () => void;
  resetToInitialDemo: () => void;
}

const STORAGE_KEY = 'sayayin_radar_state_v1';
const IMPORTED_FLAG_KEY = 'sayayin_imported_to_supabase_v1';

const getInitialData = () => {
  const today = getTodayDateString();

  // Initial Demo Seed
  const userId = 'user_sayayin_001';
  const initialProfile: Profile = {
    id: userId,
    email: 'guerrero@sayayin.app',
    displayName: 'Guerrero Saiyajin',
    currentXp: 420,
    availableXp: 420,
    currentLevel: 2,
    totalPower: 26,
    basePower: 28,
    evolutionPower: 22,
    financialPower: 30,
    habitsPower: 24,
    braveryScore: 45,
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
        { id: 'm2', title: 'Llegar a la mitad ($600.000 COP)', targetDate: '2026-10-31', completed: false }
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
      title: 'Cero gastos impulsivos o compras hormiga hoy',
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
    }
  ];

  const initialFears: Fear[] = [
    {
      id: 'fear_001',
      userId,
      title: 'Miedo a quedarme sin dinero a fin de mes (Escasez)',
      description: 'Ansiedad constante al gastar o mirar el saldo bancario, creyendo que los recursos nunca alcanzarán.',
      category: 'escasez',
      impactScore: 8,
      status: 'enfrentando',
      braveryScore: 25,
      steps: [
        {
          id: 'step_1_1',
          fearId: 'fear_001',
          userId,
          title: 'Nivel 1: Mirar el extracto bancario con calma y respiración diafragmática',
          description: 'Aceptar los números reales sin juzgarse ni generar pánico.',
          stepOrder: 1,
          xpReward: 20,
          braveryPoints: 10,
          isCompleted: true,
          completedAt: today
        },
        {
          id: 'step_1_2',
          fearId: 'fear_001',
          userId,
          title: 'Nivel 2: Registrar cada gasto durante 7 días seguidos sin omitir nada',
          description: 'Tomar control visual del flujo diario de dinero en COP.',
          stepOrder: 2,
          xpReward: 25,
          braveryPoints: 15,
          isCompleted: true,
          completedAt: today
        },
        {
          id: 'step_1_3',
          fearId: 'fear_001',
          userId,
          title: 'Nivel 3: Construir colchón de $300.000 COP en Fondo de Emergencia',
          description: 'Apartar una reserva intocable de protección ante imprevistos.',
          stepOrder: 3,
          xpReward: 35,
          braveryPoints: 20,
          isCompleted: false
        },
        {
          id: 'step_1_4',
          fearId: 'fear_001',
          userId,
          title: 'Nivel 4: Realizar un gasto consciente de bienestar sin culpa',
          description: 'Comprar algo saludable o formativo reconociendo tu merecimiento.',
          stepOrder: 4,
          xpReward: 40,
          braveryPoints: 25,
          isCompleted: false
        },
        {
          id: 'step_1_5',
          fearId: 'fear_001',
          userId,
          title: 'Nivel 5: Invertir $50.000 COP en un instrumento de renta fija sin dudar',
          description: 'Dar el paso de ahorrador a inversor activo con disciplina.',
          stepOrder: 5,
          xpReward: 50,
          braveryPoints: 30,
          isCompleted: false
        }
      ],
      actions: [
        { id: 'fa_1', title: 'Mirar el extracto bancario con calma', completed: true, completedAt: today },
        { id: 'fa_2', title: 'Registrar cada gasto durante 7 días', completed: true, completedAt: today },
        { id: 'fa_3', title: 'Construir colchón de $300.000 COP', completed: false }
      ],
      createdAt: today
    }
  ];

  const defaultState = {
    profile: initialProfile,
    financialSettings: initialFinancialSettings,
    fixedDeductions: initialFixedDeductions,
    categories: DEFAULT_EXPENSE_CATEGORIES,
    expenses: initialExpenses,
    goals: initialGoals,
    plans: initialPlans,
    dailyObjectives: initialDailyObjectives,
    actions: DEFAULT_ACTIONS,
    personalRewards: DEFAULT_PERSONAL_REWARDS,
    rewardRedemptions: [] as RewardRedemption[],
    xpEvents: initialXPEvents,
    achievements: INITIAL_ACHIEVEMENTS,
    userAchievements: initialUserAchievements,
    fears: initialFears,
    habits: DEFAULT_HABITS,
    habitLogs: [],
    partner: null,
    toasts: [],
    undoableObjective: null,
    isNivelHistorialOpen: false,
    partnerLiveStatus: 'disconnected' as const,
    isHabitModalOpen: false,
    editingHabit: null
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean simulated partner if it was previously cached
      const safePartner =
        parsed.partner && parsed.partner.id !== 'partner_vegeta_001'
          ? {
              ...parsed.partner,
              todayObjectives: Array.isArray(parsed.partner.todayObjectives)
                ? parsed.partner.todayObjectives
                : []
            }
          : null;

      // Migrate fears ensuring ladder steps exist (3 to 10 levels)
      const safeFears: Fear[] = Array.isArray(parsed.fears) && parsed.fears.length > 0
        ? parsed.fears.map((f: Fear, fIdx: number) => {
            if (Array.isArray(f.steps) && f.steps.length >= 3) {
              return f;
            }
            // Generate steps if legacy actions or empty
            const existingActs = Array.isArray(f.actions) ? f.actions : [];
            const steps: FearStep[] = (existingActs.length >= 3 ? existingActs : [
              { id: 'act_1', title: `Nivel 1: Reconocer y observar ${f.title}`, completed: false },
              { id: 'act_2', title: `Nivel 2: Practicar acción preparatoria controlada`, completed: false },
              { id: 'act_3', title: `Nivel 3: Ejecutar reto en entorno seguro`, completed: false },
              { id: 'act_4', title: `Nivel 4: Consolidar victoria frente a testigos o números reales`, completed: false }
            ]).map((act: any, idx: number) => ({
              id: act.id || `fstep_${f.id || fIdx}_${idx + 1}`,
              fearId: f.id || `fear_${fIdx}`,
              userId: f.userId || userId,
              title: act.title || `Nivel ${idx + 1}: Enfrentamiento gradual`,
              description: act.description || 'Superar este escalón sin saltarse niveles.',
              stepOrder: idx + 1,
              xpReward: 20 + idx * 10,
              braveryPoints: 10 + idx * 5,
              isCompleted: !!act.completed,
              completedAt: act.completedAt
            }));

            const braveryScore = steps.filter((s) => s.isCompleted).reduce((sum, s) => sum + s.braveryPoints, 0);

            return {
              ...f,
              steps,
              braveryScore: f.braveryScore || braveryScore,
              status: steps.every((s) => s.isCompleted) ? 'superado' : (f.status || 'enfrentando')
            };
          })
        : initialFears;

      return {
        ...defaultState,
        ...parsed,
        profile: {
          ...defaultState.profile,
          ...(parsed.profile || {}),
          availableXp: parsed.profile?.availableXp ?? parsed.profile?.currentXp ?? defaultState.profile.currentXp,
          braveryScore: parsed.profile?.braveryScore ?? defaultState.profile.braveryScore
        },
        financialSettings: { ...defaultState.financialSettings, ...(parsed.financialSettings || {}) },
        fixedDeductions: Array.isArray(parsed.fixedDeductions) && parsed.fixedDeductions.length > 0 ? parsed.fixedDeductions : defaultState.fixedDeductions,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : defaultState.categories,
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : defaultState.expenses,
        goals: Array.isArray(parsed.goals) ? parsed.goals : defaultState.goals,
        plans: Array.isArray(parsed.plans) ? parsed.plans : defaultState.plans,
        dailyObjectives: Array.isArray(parsed.dailyObjectives) ? parsed.dailyObjectives : defaultState.dailyObjectives,
        actions: Array.isArray(parsed.actions) && parsed.actions.length > 0 ? parsed.actions : DEFAULT_ACTIONS,
        personalRewards: Array.isArray(parsed.personalRewards) && parsed.personalRewards.length > 0 ? parsed.personalRewards : DEFAULT_PERSONAL_REWARDS,
        rewardRedemptions: Array.isArray(parsed.rewardRedemptions) ? parsed.rewardRedemptions : [],
        habits: Array.isArray(parsed.habits) && parsed.habits.length > 0 ? parsed.habits : defaultState.habits,
        habitLogs: Array.isArray(parsed.habitLogs) ? parsed.habitLogs : defaultState.habitLogs,
        xpEvents: Array.isArray(parsed.xpEvents) ? parsed.xpEvents : defaultState.xpEvents,
        achievements: INITIAL_ACHIEVEMENTS, // Ensure latest complete catalog is always used
        userAchievements: Array.isArray(parsed.userAchievements) ? parsed.userAchievements : defaultState.userAchievements,
        fears: safeFears,
        partner: safePartner,
        toasts: [],
        undoableObjective: null,
        isNivelHistorialOpen: false,
        partnerLiveStatus: 'disconnected' as const,
        isHabitModalOpen: false,
        editingHabit: null
      };
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }

  return defaultState;
};

// Module-level timers and subscriptions to guarantee reliable async execution
let undoTimeoutId: any = null;
let partnerRealtimeChannel: any = null;
const inFlightObjectives = new Set<string>();

export const useSayayinStore = create<SayayinState>((set, get) => {
  const initial = getInitialData();

  // Helper to persist state to localStorage as offline cache
  const saveCache = (newState: Partial<SayayinState>) => {
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
        actions: state.actions,
        personalRewards: state.personalRewards,
        rewardRedemptions: state.rewardRedemptions,
        habits: state.habits,
        habitLogs: state.habitLogs,
        xpEvents: state.xpEvents,
        achievements: state.achievements,
        userAchievements: state.userAchievements,
        fears: state.fears,
        partner: state.partner
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save offline cache:', e);
    }
  };

  return {
    ...initial,
    authUser: null,
    isAuthModalOpen: false,
    authLoading: false,
    authError: null,
    isSyncing: false,
    hasLocalDataToImport: false,

    selectedDate: getTodayDateString(),
    activeTimeSlotFilter: 'todos',
    isPowerModalOpen: false,
    isQuickObjectiveModalOpen: false,
    isExpenseModalOpen: false,
    isGoalModalOpen: false,
    isConfigModalOpen: false,
    isHabitModalOpen: false,
    editingHabit: null,

    setIsAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open, authError: null }),
    setAuthError: (error: string | null) => set({ authError: error }),
    dismissImportPrompt: () => {
      set({ hasLocalDataToImport: false });
      localStorage.setItem(IMPORTED_FLAG_KEY, 'dismissed');
    },

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
        } catch (e) {}

        get().addToast({
          type: 'transformation',
          title: `¡HAS ALCANZADO: ${transConfig.name.toUpperCase()}!`,
          description: transConfig.description
        });
      }

      saveCache({ profile: get().profile });

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

    setSelectedDate: (date) => set({ selectedDate: date }),
    setActiveTimeSlotFilter: (slot) => set({ activeTimeSlotFilter: slot }),
    setIsPowerModalOpen: (open) => set({ isPowerModalOpen: open }),
    setIsQuickObjectiveModalOpen: (open) => set({ isQuickObjectiveModalOpen: open }),
    setIsExpenseModalOpen: (open) => set({ isExpenseModalOpen: open }),
    setIsGoalModalOpen: (open) => set({ isGoalModalOpen: open }),
    setIsConfigModalOpen: (open) => set({ isConfigModalOpen: open }),
    setIsHabitModalOpen: (open) => set({ isHabitModalOpen: open }),
    setEditingHabit: (habit) => set({ editingHabit: habit }),
    setIsNivelHistorialOpen: (open) => set({ isNivelHistorialOpen: open }),

    addToast: (toast) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id, timestamp: Date.now() };
      set((state) => ({ toasts: [newToast, ...state.toasts.slice(0, 4)] }));
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, 6000);
    },

    dismissToast: (id) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    // ==========================================
    // HABITS COMPUTED GETTERS & STATS
    // ==========================================
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

      // Filter only habits that are scheduled for dateStr ("los hábitos semanales solo aparecen los días que corresponden")
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

    // ==========================================
    // HABITS CRUD & COMPLETION ENGINE
    // ==========================================
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
      saveCache({ habits: updatedHabits });
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
      saveCache({ habits: updatedHabits });
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
      saveCache({ habits: updatedHabits, habitLogs: updatedLogs });
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

        saveCache({ habitLogs: updatedLogs, profile: get().profile });
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
          } catch (e) {}
        }

        saveCache({ habitLogs: updatedLogs, profile: get().profile });
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
    },


    // ==========================================
    // OBJECTIVES CRUD & PROGRESS MOTOR
    // ==========================================
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
        } catch (e) {}

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
          } catch (e) {}
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

            // Re-read remote profile to sync server trigger state
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
          } catch (err: any) {
            console.warn('Supabase offline/error, guardando en cola IndexedDB:', err);
            await enqueueOfflineAction({
              dedupKey: 'complete_obj_' + id,
              type: 'complete_objective',
              payload: { id, status: 'completado', completedAt: now }
            });
          }
        } else {
          // Sin conexión o sin Supabase directo: guardar en cola IndexedDB
          await enqueueOfflineAction({
            dedupKey: 'complete_obj_' + id,
            type: 'complete_objective',
            payload: { id, status: 'completado', completedAt: now }
          });
        }

        get().checkAchievements();
        get().recalculatePowersAndSave();
        saveCache({
          dailyObjectives: get().dailyObjectives,
          profile: get().profile,
          xpEvents: get().xpEvents,
          expenses: get().expenses,
          goals: get().goals
        });
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

      // Evento compensatorio de XP con monto negativo
      const compensatoryEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: 'compensatory_undo',
        description: `Compensación: Deshacer ${obj.title}`,
        xpAmount: -earnedXP,
        createdAt: today
      };

      // Revertir ahorro si existía
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

      // Reversión optimista: la racha se preserva intacta ("sin romper la racha")
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
        } catch (err: any) {
          console.warn('Error al revertir objetivo en Supabase:', err);
        }
      }

      get().recalculatePowersAndSave();
      saveCache({
        dailyObjectives: get().dailyObjectives,
        profile: get().profile,
        xpEvents: get().xpEvents,
        expenses: get().expenses,
        goals: get().goals
      });
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
      saveCache({ dailyObjectives: get().dailyObjectives });
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
      saveCache({ dailyObjectives: get().dailyObjectives });
    },

    generateRecurringObjectives: async () => {
      const { dailyObjectives, profile, authUser } = get();
      const today = getTodayDateString(profile?.timezone || 'America/Bogota');
      const [y, m, d] = today.split('-').map(Number);
      const todayDate = new Date(y, (m || 1) - 1, d || 1);
      const currentDayOfWeek = todayDate.getDay(); // 0 = Sun, 1 = Mon...

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

        saveCache({ dailyObjectives: get().dailyObjectives });
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
        } catch (err: any) {
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
      saveCache({ dailyObjectives: get().dailyObjectives });
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
      saveCache({ dailyObjectives: get().dailyObjectives });
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
      saveCache({ dailyObjectives: get().dailyObjectives });
    },

    // ==========================================
    // EXPENSES & SAVINGS CRUD
    // ==========================================
    addExpense: async (data) => {
      const prevExpenses = get().expenses;
      const prevGoals = get().goals;
      const { authUser, profile } = get();

      const newExpense: Expense = {
        ...data,
        id: 'exp_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        createdAt: getTodayDateString()
      };

      let updatedGoals = prevGoals;
      if (newExpense.isSaving && newExpense.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === newExpense.goalId ? { ...g, currentSavings: g.currentSavings + newExpense.amount } : g
        );
      }

      set({
        expenses: [newExpense, ...prevExpenses],
        goals: updatedGoals
      });

      get().addToast({
        type: 'success',
        title: newExpense.isSaving ? '¡Ahorro registrado con éxito!' : 'Gasto registrado',
        description: `${newExpense.description}: ${formatCOP(newExpense.amount)}`
      });

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (authUser && isSupabaseConfigured() && isOnline) {
        try {
          const created = await expensesRepository.createExpense(newExpense);
          if (newExpense.isSaving && newExpense.goalId) {
            const targetGoal = updatedGoals.find((g) => g.id === newExpense.goalId);
            if (targetGoal) {
              await goalsRepository.updateGoal(newExpense.goalId, {
                currentSavings: targetGoal.currentSavings
              });
            }
          }
          set((state) => ({
            expenses: state.expenses.map((e) => (e.id === newExpense.id ? created : e))
          }));
        } catch (err: any) {
          console.warn('Error al guardar gasto en Supabase, encolando offline:', err);
          await enqueueOfflineAction({
            dedupKey: 'add_expense_' + newExpense.id,
            type: 'add_expense',
            payload: newExpense
          });
        }
      } else {
        await enqueueOfflineAction({
          dedupKey: 'add_expense_' + newExpense.id,
          type: 'add_expense',
          payload: newExpense
        });
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache({ expenses: get().expenses, goals: get().goals });
    },

    editExpense: async (id, data) => {
      const prevExpenses = get().expenses;
      set({
        expenses: prevExpenses.map((e) => (e.id === id ? { ...e, ...data } : e))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await expensesRepository.updateExpense(id, data);
        } catch (err: any) {
          set({ expenses: prevExpenses });
          get().addToast({
            type: 'error',
            title: 'Error al editar gasto',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ expenses: get().expenses });
    },

    deleteExpense: async (id) => {
      const prevExpenses = get().expenses;
      const prevGoals = get().goals;
      const target = prevExpenses.find((e) => e.id === id);

      let updatedGoals = prevGoals;
      if (target?.isSaving && target.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === target.goalId
            ? { ...g, currentSavings: Math.max(0, g.currentSavings - target.amount) }
            : g
        );
      }

      set({
        expenses: prevExpenses.filter((e) => e.id !== id),
        goals: updatedGoals
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await expensesRepository.deleteExpense(id);
          if (target?.isSaving && target.goalId) {
            const targetGoal = updatedGoals.find((g) => g.id === target.goalId);
            if (targetGoal) {
              await goalsRepository.updateGoal(target.goalId, {
                currentSavings: targetGoal.currentSavings
              });
            }
          }
        } catch (err: any) {
          set({ expenses: prevExpenses, goals: prevGoals });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar gasto',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ expenses: get().expenses, goals: get().goals });
    },

    // ==========================================
    // GOALS & PLANS CRUD
    // ==========================================
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
        } catch (err: any) {
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
      saveCache({ goals: get().goals });
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
      saveCache({ goals: get().goals });
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
      saveCache({ goals: get().goals, plans: get().plans });
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

      saveCache({ plans: get().plans });
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

      saveCache({ plans: get().plans });
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

      saveCache({ plans: get().plans });
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

      saveCache({ plans: get().plans });
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
      saveCache({ plans: get().plans });
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

    // ==========================================
    // ACCIONES TÁCTICAS CRUD
    // ==========================================
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

      saveCache({ actions: get().actions });
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

      // Si se completó, otorgar feedback y avanzar entidad vinculada
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
        } catch (e) {}

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
          // Si está ligada a una meta, avanza el objetivo diario relacionado con esa meta
          const matchObj = get().dailyObjectives.find(
            (o) => o.goalId === targetAction.targetId && o.status !== 'completado'
          );
          if (matchObj) {
            get().completeObjective(matchObj.id);
          } else {
            // O avanza el plan táctico asociado a la meta
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
      saveCache({
        actions: get().actions,
        profile: get().profile,
        xpEvents: get().xpEvents
      });
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

      saveCache({ actions: get().actions });
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

      saveCache({ actions: get().actions });
    },

    // ==========================================
    // RECOMPENSAS PERSONALES (XP GASTABLE)
    // ==========================================
    addReward: async (data) => {
      const prevRewards = get().personalRewards || [];
      const { authUser, profile } = get();

      const newReward: PersonalReward = {
        ...data,
        id: 'rew_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        timesRedeemed: 0,
        createdAt: getTodayDateString()
      };

      set({ personalRewards: [...prevRewards, newReward] });
      get().addToast({
        type: 'success',
        title: 'Recompensa personal creada',
        description: `${newReward.title} (${newReward.costXp} XP)`
      });

      const { authUser: currentAuth } = get();
      if (currentAuth && isSupabaseConfigured()) {
        try {
          const created = await actionsRewardsRepository.createReward(newReward);
          set((state) => ({
            personalRewards: state.personalRewards.map((r) => (r.id === newReward.id ? created : r))
          }));
        } catch (err: any) {
          console.warn('Supabase createReward warning:', err);
        }
      }

      saveCache({ personalRewards: get().personalRewards });
    },

    editReward: async (id, data) => {
      const prevRewards = get().personalRewards || [];
      set({
        personalRewards: prevRewards.map((r) => (r.id === id ? { ...r, ...data } : r))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.updateReward(id, data);
        } catch (err: any) {
          console.warn('Supabase updateReward warning:', err);
        }
      }

      saveCache({ personalRewards: get().personalRewards });
    },

    deleteReward: async (id) => {
      const prevRewards = get().personalRewards || [];
      set({ personalRewards: prevRewards.filter((r) => r.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.deleteReward(id);
        } catch (err: any) {
          console.warn('Supabase deleteReward warning:', err);
        }
      }

      saveCache({ personalRewards: get().personalRewards });
    },

    redeemReward: async (rewardId) => {
      const prevProfile = get().profile;
      const rewards = get().personalRewards || [];
      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward) return { success: false, message: 'Recompensa no encontrada' };

      const available = prevProfile.availableXp ?? prevProfile.currentXp ?? 0;
      if (available < reward.costXp) {
        get().addToast({
          type: 'warning',
          title: 'XP Disponible Insuficiente',
          description: `Necesitas ${reward.costXp} XP disponible. Actualmente tienes ${available} XP.`
        });
        return { success: false, message: 'XP insuficiente' };
      }

      // IMPORTANTE: el canje descuenta XP disponible sin bajar el nivel (separar XP total de XP gastable)
      const newAvailable = available - reward.costXp;
      const now = new Date().toISOString();

      const redemption: RewardRedemption = {
        id: 'red_' + Date.now(),
        userId: prevProfile.id,
        rewardId: reward.id,
        rewardTitle: reward.title,
        costXp: reward.costXp,
        redeemedAt: now
      };

      const xpEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: 'reward_redemption',
        description: `Canje de recompensa: ${reward.title} (-${reward.costXp} XP disponible)`,
        xpAmount: -reward.costXp,
        createdAt: getTodayDateString()
      };

      set((state) => ({
        profile: { ...state.profile, availableXp: newAvailable },
        personalRewards: state.personalRewards.map((r) =>
          r.id === rewardId ? { ...r, timesRedeemed: (r.timesRedeemed || 0) + 1 } : r
        ),
        rewardRedemptions: [redemption, ...state.rewardRedemptions],
        xpEvents: [xpEvent, ...state.xpEvents]
      }));

      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      get().addToast({
        type: 'success',
        title: '¡Recompensa Canjeada!',
        description: `Disfruta: "${reward.title}". Tu Nivel ${prevProfile.currentLevel} se mantiene intacto.`
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.recordRedemption(redemption);
          await actionsRewardsRepository.updateReward(reward.id, {
            timesRedeemed: (reward.timesRedeemed || 0) + 1
          });
        } catch (err: any) {
          console.warn('Supabase recordRedemption warning:', err);
        }
      }

      saveCache({
        profile: get().profile,
        personalRewards: get().personalRewards,
        rewardRedemptions: get().rewardRedemptions,
        xpEvents: get().xpEvents
      });

      return { success: true, message: 'Canje exitoso' };
    },

    // ==========================================
    // PRESUPUESTO POR CATEGORÍA
    // ==========================================
    updateCategoryBudget: async (categoryId, budgetLimit) => {
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === categoryId ? { ...c, budgetLimit } : c
        )
      }));

      get().addToast({
        type: 'success',
        title: 'Presupuesto de categoría actualizado',
        description: `Nuevo límite mensual: ${formatCOP(budgetLimit)}`
      });

      saveCache({ categories: get().categories });
    },

    // ==========================================
    // MIEDOS & ESCALERA DE EXPOSICIÓN GRADUAL
    // ==========================================
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
      saveCache({ fears: get().fears });
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
      saveCache({ fears: get().fears });
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
      if (targetStep.isCompleted) return; // Ya completado

      // CRITERIO DE ACEPTACIÓN ESTRICTO: NO SE PUEDE SALTAR NIVELES
      // Solo se puede completar el siguiente en orden
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

      // Verificar si es el ÚLTIMO nivel de la escalera
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
      } catch (e) {}

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
      saveCache({
        fears: get().fears,
        profile: get().profile,
        xpEvents: get().xpEvents
      });
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

      saveCache({ fears: get().fears });
    },

    toggleFearAction: async (fearId, actionId) => {
      const prevFears = get().fears;
      const prevProfile = get().profile;
      const prevXpEvents = get().xpEvents;

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
        } catch (e) {}

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
      saveCache({ fears: get().fears, profile: get().profile, xpEvents: get().xpEvents });
    },

    conquerFear: async (fearId, reflection) => {
      const prevFears = get().fears;
      const prevProfile = get().profile;
      const prevXpEvents = get().xpEvents;

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
      } catch (e) {}

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
      saveCache({ fears: get().fears, profile: get().profile, xpEvents: get().xpEvents });
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
      saveCache({ fears: get().fears });
    },

    // ==========================================
    // FINANCIAL SETTINGS & FIXED DEDUCTIONS CRUD
    // ==========================================
    updateFinancialSettings: async (income, emergencyTarget) => {
      const prevSettings = get().financialSettings;
      const { authUser, profile } = get();

      const newSettings: FinancialSettings = {
        ...prevSettings,
        userId: authUser ? authUser.id : profile.id,
        baseMonthlyIncome: income,
        emergencyFundTarget: emergencyTarget,
        updatedAt: getTodayDateString()
      };

      set({ financialSettings: newSettings });
      get().addToast({
        type: 'success',
        title: 'Finanzas base actualizadas',
        description: `Ingreso mensual: ${formatCOP(income)}`
      });

      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.upsertFinancialSettings(newSettings);
        } catch (err: any) {
          set({ financialSettings: prevSettings });
          get().addToast({
            type: 'error',
            title: 'Error al guardar configuración en Supabase',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ financialSettings: get().financialSettings });
    },

    addFixedDeduction: async (data) => {
      const prevDeductions = get().fixedDeductions;
      const { authUser, profile } = get();

      const newDeduction: FixedDeduction = {
        ...data,
        id: 'fix_' + Date.now(),
        userId: authUser ? authUser.id : profile.id
      };

      set({ fixedDeductions: [...prevDeductions, newDeduction] });

      if (authUser && isSupabaseConfigured()) {
        try {
          const created = await settingsRepository.createFixedDeduction(newDeduction);
          set((state) => ({
            fixedDeductions: state.fixedDeductions.map((d) => (d.id === newDeduction.id ? created : d))
          }));
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al guardar deducción en Supabase',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ fixedDeductions: get().fixedDeductions });
    },

    editFixedDeduction: async (id, data) => {
      const prevDeductions = get().fixedDeductions;
      set({
        fixedDeductions: prevDeductions.map((d) => (d.id === id ? { ...d, ...data } : d))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.updateFixedDeduction(id, data);
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar deducción',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ fixedDeductions: get().fixedDeductions });
    },

    deleteFixedDeduction: async (id) => {
      const prevDeductions = get().fixedDeductions;
      set({ fixedDeductions: prevDeductions.filter((d) => d.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.deleteFixedDeduction(id);
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar deducción',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache({ fixedDeductions: get().fixedDeductions });
    },

    // ==========================================
    // PARTNER & REALTIME SYNC (REAL SUPABASE)
    // ==========================================
    connectPartner: async (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return { success: false, message: 'Ingresa un código de invitación válido.' };

      if (cleanCode === get().profile.inviteCode) {
        return { success: false, message: 'No puedes enlazarte con tu propio código de invitación.' };
      }

      if (!isSupabaseConfigured() || !supabase) {
        return {
          success: false,
          message: 'Configura Supabase en Configuración para vincular compañeros en tiempo real.'
        };
      }

      try {
        // Real RPC join_by_code which raises exception if invalid or self
        const partnerId = await partnerRepository.joinByCode(cleanCode);

        // Load real partner profile and visible objectives
        await get().loadPartnerData(partnerId);

        // Subscribe to real-time events on partner's profile and objectives
        get().setupPartnerRealtime(partnerId);

        get().addToast({
          type: 'achievement',
          title: '¡Compañero Saiyajin enlazado!',
          description: 'Entrenando juntos en tiempo real.'
        });

        get().checkAchievements();
        get().recalculatePowersAndSave();
        return { success: true, message: '¡Conectado exitosamente con tu compañero!' };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message || 'Código de invitación inválido o no encontrado.'
        };
      }
    },

    disconnectPartner: async () => {
      const currentPartner = get().partner;
      if (currentPartner) {
        try {
          await partnerRepository.disconnect(currentPartner.id);
        } catch (e) {}
      }

      if (partnerRealtimeChannel && supabase) {
        try {
          supabase.removeChannel(partnerRealtimeChannel);
        } catch (e) {}
        partnerRealtimeChannel = null;
      }

      set({ partner: null, partnerLiveStatus: 'disconnected' });
      get().addToast({
        type: 'info',
        title: 'Compañero desvinculado',
        description: 'Ahora estás entrenando en solitario.'
      });
      saveCache({ partner: null });
    },

    loadPartnerData: async (partnerId: string) => {
      try {
        const data = await partnerRepository.loadPartnerData(partnerId);
        if (data) {
          set({ partner: data });
          saveCache({ partner: data });
        }
      } catch (e) {
        console.warn('Error al cargar datos del compañero:', e);
      }
    },

    setupPartnerRealtime: (partnerId: string) => {
      if (!supabase || !isSupabaseConfigured()) {
        set({ partnerLiveStatus: 'disconnected' });
        return;
      }

      if (partnerRealtimeChannel) {
        try {
          supabase.removeChannel(partnerRealtimeChannel);
        } catch (e) {}
        partnerRealtimeChannel = null;
      }

      set({ partnerLiveStatus: 'connecting' });

      partnerRealtimeChannel = supabase
        .channel(`partner-realtime-${partnerId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${partnerId}`
          },
          (payload) => {
            const newProf = payload.new as any;
            if (newProf) {
              set((state) => {
                if (!state.partner) return state;
                return {
                  partner: {
                    ...state.partner,
                    displayName: newProf.display_name || state.partner.displayName,
                    avatarUrl: newProf.avatar_url || state.partner.avatarUrl,
                    currentLevel: newProf.level || state.partner.currentLevel,
                    currentXp: newProf.xp || state.partner.currentXp,
                    currentStreak: newProf.current_streak || state.partner.currentStreak,
                    totalPower: Number(newProf.total_power || state.partner.totalPower),
                    transformation: newProf.transformation || state.partner.transformation
                  }
                };
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_objectives',
            filter: `user_id=eq.${partnerId}`
          },
          (payload) => {
            const newObj = payload.new as any;
            const oldObj = payload.old as any;

            if (payload.eventType === 'UPDATE' && newObj) {
              if (newObj.status === 'completado' && oldObj?.status !== 'completado') {
                get().addToast({
                  type: 'achievement',
                  title: '¡Tu compañero/a completó un objetivo!',
                  description: newObj.title
                });
              }
            }

            // Realtime update: refresh partner objectives in UI
            get().loadPartnerData(partnerId);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ partnerLiveStatus: 'online' });
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            set({ partnerLiveStatus: 'connecting' });
          } else if (status === 'CLOSED') {
            set({ partnerLiveStatus: 'disconnected' });
          }
        });
    },

    updateGlobalPrivacySetting: async (shareGlobally: boolean) => {
      const prevProfile = get().profile;
      const updatedProfile = { ...prevProfile, shareObjectivesGlobally: shareGlobally };
      set({ profile: updatedProfile });
      get().addToast({
        type: 'info',
        title: shareGlobally ? 'Compartir objetivos activado' : 'Objetivos ocultos a compañeros',
        description: shareGlobally
          ? 'Tus objetivos marcados como visibles serán sincronizados con tu compañero.'
          : 'Tus objetivos diarios ahora son privados para tu compañero.'
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await profileRepository.upsertProfile({
            id: authUser.id,
            shareObjectivesGlobally: shareGlobally
          });
        } catch (e) {
          console.warn('Error al actualizar privacidad en Supabase:', e);
        }
      }

      saveCache({ profile: updatedProfile });
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
        saveCache({ dailyObjectives: get().dailyObjectives });
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
        saveCache({ dailyObjectives: get().dailyObjectives });
        return { success: true };
      }
      return { success: false, error: res.error };
    },

    // ==========================================
    // SUPABASE AUTH & DATA SYNC
    // ==========================================
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

          // Bootstrap profile in Supabase profiles table
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
        } catch (e) {}
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

        // Fetch all user collections in parallel from Supabase
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

        // Check if user is new in Supabase and has prior local data
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

        // Apply remote collections if available
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

        // Check for connected partner in Supabase
        try {
          const connectedPartnerId = await partnerRepository.getConnectedPartnerId(userId);
          if (connectedPartnerId) {
            await get().loadPartnerData(connectedPartnerId);
            get().setupPartnerRealtime(connectedPartnerId);
          }
        } catch (e) {
          console.warn('Partner sync check failed:', e);
        }

        // Generate recurring objectives for today
        try {
          await get().generateRecurringObjectives();
        } catch (e) {}

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

        // 1. Settings
        await settingsRepository.upsertFinancialSettings({
          ...financialSettings,
          userId
        });

        // 2. Fixed Deductions
        for (const d of fixedDeductions) {
          await settingsRepository.createFixedDeduction({ ...d, userId });
          count++;
        }

        // 3. Goals
        for (const g of goals) {
          await goalsRepository.createGoal({ ...g, userId });
          count++;
        }

        // 4. Plans
        for (const p of plans) {
          await plansRepository.createPlan({ ...p, userId });
          count++;
        }

        // 5. Daily Objectives
        for (const obj of dailyObjectives) {
          await objectivesRepository.createObjective({ ...obj, userId });
          count++;
        }

        // 6. Expenses
        for (const exp of expenses) {
          await expensesRepository.createExpense({ ...exp, userId });
          count++;
        }

        // 7. Fears
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
          } catch (e) {}
        }
      }

      return { success: failed === 0, synced, failed };
    },

    // ==========================================
    // ACHIEVEMENTS VERIFICATION ENGINE
    // ==========================================
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
        } catch (e) {}

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

        saveCache({
          userAchievements: get().userAchievements,
          xpEvents: get().xpEvents,
          profile: get().profile
        });
      }
    },

    resetToInitialDemo: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(IMPORTED_FLAG_KEY);
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
