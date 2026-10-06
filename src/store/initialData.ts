import {
  Profile,
  FinancialSettings,
  FixedDeduction,
  Expense,
  Goal,
  Plan,
  DailyObjective,
  XPEvent,
  UserAchievement,
  Fear,
  FearStep,
  RewardRedemption
} from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_FIXED_DEDUCTIONS,
  DEFAULT_HABITS,
  DEFAULT_ACTIONS,
  DEFAULT_PERSONAL_REWARDS,
  INITIAL_ACHIEVEMENTS
} from '../lib/constants';
import { getTodayDateString } from '../lib/formatters';

export const STORAGE_KEY = 'sayayin_radar_state_v1';
export const IMPORTED_FLAG_KEY = 'sayayin_imported_to_supabase_v1';

export const getInitialData = () => {
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
        achievements: INITIAL_ACHIEVEMENTS,
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

export const saveCache = (state: any) => {
  try {
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
