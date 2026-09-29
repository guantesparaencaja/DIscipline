import {
  DailyObjective,
  Expense,
  Goal,
  Plan,
  Profile,
  FinancialSettings,
  FixedDeduction,
  ExpenseCategory,
  Fear,
  FearStep,
  Habit,
  HabitLog,
  HabitFrequency,
  TimeSlot,
  ObjectiveStatus,
  ObjectiveDifficulty,
  RecurrenceType,
  GoalStatus,
  GoalPriority,
  PaymentMethod,
  TransformationId
} from '../types';

// ==========================================
// 1. DAILY OBJECTIVES MAPPERS
// Frontend: 'manana' | 'tarde' | 'noche' | 'personalizada'
// DB:       'morning' | 'afternoon' | 'night' | 'custom'
// ==========================================
export const mapSlotToDb = (slot: TimeSlot): string => {
  switch (slot) {
    case 'manana':
      return 'morning';
    case 'tarde':
      return 'afternoon';
    case 'noche':
      return 'night';
    case 'personalizada':
      return 'custom';
    default:
      return 'morning';
  }
};

export const mapSlotFromDb = (dbSlot: string | null): TimeSlot => {
  switch (dbSlot) {
    case 'morning':
    case 'manana':
      return 'manana';
    case 'afternoon':
    case 'tarde':
      return 'tarde';
    case 'night':
    case 'noche':
      return 'noche';
    case 'custom':
    case 'personalizada':
      return 'personalizada';
    default:
      return 'manana';
  }
};

// Status: 'pendiente' | 'en_progreso' | 'completado' | 'omitido'
// DB:     'pending' | 'in_progress' | 'completed' | 'skipped'
export const mapStatusToDb = (status: ObjectiveStatus): string => {
  switch (status) {
    case 'pendiente':
      return 'pending';
    case 'en_progreso':
      return 'in_progress';
    case 'completado':
      return 'completed';
    case 'omitido':
      return 'skipped';
    default:
      return 'pending';
  }
};

export const mapStatusFromDb = (dbStatus: string | null): ObjectiveStatus => {
  switch (dbStatus) {
    case 'pending':
    case 'pendiente':
      return 'pendiente';
    case 'in_progress':
    case 'en_progreso':
      return 'en_progreso';
    case 'completed':
    case 'completado':
      return 'completado';
    case 'skipped':
    case 'omitido':
      return 'omitido';
    default:
      return 'pendiente';
  }
};

// Difficulty: 'facil' | 'normal' | 'dificil' | 'extremo'
// DB:         'easy' | 'normal' | 'hard' | 'extreme'
export const mapDifficultyToDb = (difficulty: ObjectiveDifficulty): string => {
  switch (difficulty) {
    case 'facil':
      return 'easy';
    case 'normal':
      return 'normal';
    case 'dificil':
      return 'hard';
    case 'extremo':
      return 'extreme';
    default:
      return 'normal';
  }
};

export const mapDifficultyFromDb = (dbDiff: string | null): ObjectiveDifficulty => {
  switch (dbDiff) {
    case 'easy':
    case 'facil':
      return 'facil';
    case 'normal':
      return 'normal';
    case 'hard':
    case 'dificil':
      return 'dificil';
    case 'extreme':
    case 'extremo':
      return 'extremo';
    default:
      return 'normal';
  }
};

// Recurrence: 'una_vez' | 'diaria' | 'dias_semana'
// DB:         'once' | 'daily' | 'weekdays'
export const mapRecurrenceToDb = (rec: RecurrenceType): string => {
  switch (rec) {
    case 'una_vez':
      return 'once';
    case 'diaria':
      return 'daily';
    case 'dias_semana':
      return 'weekdays';
    default:
      return 'once';
  }
};

export const mapRecurrenceFromDb = (dbRec: string | null): RecurrenceType => {
  switch (dbRec) {
    case 'once':
    case 'una_vez':
      return 'una_vez';
    case 'daily':
    case 'diaria':
      return 'diaria';
    case 'weekdays':
    case 'dias_semana':
      return 'dias_semana';
    default:
      return 'una_vez';
  }
};

export const mapObjectiveFromDb = (raw: any): DailyObjective => {
  return {
    id: raw.id,
    userId: raw.user_id,
    goalId: raw.goal_id || undefined,
    title: raw.title,
    date: raw.date?.split('T')[0] || raw.date,
    timeSlot: mapSlotFromDb(raw.slot || raw.time_slot),
    customTime: raw.custom_time || undefined,
    difficulty: mapDifficultyFromDb(raw.difficulty),
    xpReward: Number(raw.xp_reward) || 20,
    savingAmount: raw.saving_amount ? Number(raw.saving_amount) : undefined,
    isPartnerVisible: raw.is_partner_visible !== false,
    recurrence: mapRecurrenceFromDb(raw.recurrence),
    recurrenceDays: Array.isArray(raw.recurrence_days) ? raw.recurrence_days : undefined,
    status: mapStatusFromDb(raw.status),
    completedAt: raw.completed_at || undefined,
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

export const mapObjectiveToDb = (obj: DailyObjective) => {
  return {
    id: obj.id,
    user_id: obj.userId,
    goal_id: obj.goalId || null,
    title: obj.title,
    date: obj.date,
    slot: mapSlotToDb(obj.timeSlot),
    custom_time: obj.customTime || null,
    difficulty: mapDifficultyToDb(obj.difficulty),
    xp_reward: obj.xpReward,
    saving_amount: obj.savingAmount || 0,
    is_partner_visible: obj.isPartnerVisible,
    recurrence: mapRecurrenceToDb(obj.recurrence),
    recurrence_days: obj.recurrenceDays || [],
    status: mapStatusToDb(obj.status),
    completed_at: obj.completedAt || null
  };
};

// ==========================================
// 2. GOALS MAPPERS
// Priority: 'baja' | 'media' | 'alta' | 'maxima'
// DB:       'low' | 'medium' | 'high' | 'maximum'
// ==========================================
export const mapGoalPriorityToDb = (p: GoalPriority): string => {
  switch (p) {
    case 'baja':
      return 'low';
    case 'media':
      return 'medium';
    case 'alta':
      return 'high';
    case 'maxima':
      return 'maximum';
    default:
      return 'high';
  }
};

export const mapGoalPriorityFromDb = (dbP: string | null): GoalPriority => {
  switch (dbP) {
    case 'low':
    case 'baja':
      return 'baja';
    case 'medium':
    case 'media':
      return 'media';
    case 'high':
    case 'alta':
      return 'alta';
    case 'maximum':
    case 'maxima':
      return 'maxima';
    default:
      return 'alta';
  }
};

// Status: 'activa' | 'en_pausa' | 'completada' | 'cancelada'
// DB:     'active' | 'paused' | 'completed' | 'cancelled'
export const mapGoalStatusToDb = (s: GoalStatus): string => {
  switch (s) {
    case 'activa':
      return 'active';
    case 'en_pausa':
      return 'paused';
    case 'completada':
      return 'completed';
    case 'cancelada':
      return 'cancelled';
    default:
      return 'active';
  }
};

export const mapGoalStatusFromDb = (dbS: string | null): GoalStatus => {
  switch (dbS) {
    case 'active':
    case 'activa':
      return 'activa';
    case 'paused':
    case 'en_pausa':
      return 'en_pausa';
    case 'completed':
    case 'completada':
      return 'completada';
    case 'cancelled':
    case 'cancelada':
      return 'cancelada';
    default:
      return 'activa';
  }
};

export const mapGoalFromDb = (raw: any): Goal => {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description || '',
    category: raw.category || 'Financiera',
    startDate: raw.start_date?.split('T')[0] || raw.start_date,
    targetDate: raw.target_date?.split('T')[0] || raw.target_date,
    priority: mapGoalPriorityFromDb(raw.priority),
    status: mapGoalStatusFromDb(raw.status),
    targetAmount: Number(raw.target_amount) || 0,
    currentSavings: Number(raw.current_amount ?? raw.current_savings ?? 0),
    motivation: raw.motivation || '',
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

export const mapGoalToDb = (g: Goal) => {
  return {
    id: g.id,
    user_id: g.userId,
    title: g.title,
    description: g.description,
    category: g.category,
    start_date: g.startDate,
    target_date: g.targetDate,
    priority: mapGoalPriorityToDb(g.priority),
    status: mapGoalStatusToDb(g.status),
    target_amount: g.targetAmount,
    current_amount: g.currentSavings,
    motivation: g.motivation
  };
};

// ==========================================
// 3. EXPENSES MAPPERS
// Payment method: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia'
// DB:             'cash' | 'debit_card' | 'credit_card' | 'transfer'
// ==========================================
export const mapPaymentMethodToDb = (m: PaymentMethod): string => {
  switch (m) {
    case 'efectivo':
      return 'cash';
    case 'tarjeta_debito':
      return 'debit_card';
    case 'tarjeta_credito':
      return 'credit_card';
    case 'transferencia':
      return 'transfer';
    default:
      return 'cash';
  }
};

export const mapPaymentMethodFromDb = (dbM: string | null): PaymentMethod => {
  switch (dbM) {
    case 'cash':
    case 'efectivo':
      return 'efectivo';
    case 'debit_card':
    case 'tarjeta_debito':
      return 'tarjeta_debito';
    case 'credit_card':
    case 'tarjeta_credito':
      return 'tarjeta_credito';
    case 'transfer':
    case 'transferencia':
      return 'transferencia';
    default:
      return 'efectivo';
  }
};

export const mapExpenseFromDb = (raw: any): Expense => {
  return {
    id: raw.id,
    userId: raw.user_id,
    description: raw.description,
    amount: Number(raw.amount) || 0,
    categoryId: raw.category_id || '',
    categoryName: raw.category_name || 'Varios',
    date: raw.date?.split('T')[0] || raw.date,
    note: raw.note || undefined,
    paymentMethod: mapPaymentMethodFromDb(raw.payment_method),
    isSaving: Boolean(raw.is_saving),
    goalId: raw.goal_id || undefined,
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

export const mapExpenseToDb = (e: Expense) => {
  return {
    id: e.id,
    user_id: e.userId,
    description: e.description,
    amount: e.amount,
    category_id: e.categoryId || null,
    category_name: e.categoryName,
    date: e.date,
    note: e.note || null,
    payment_method: mapPaymentMethodToDb(e.paymentMethod),
    is_saving: e.isSaving,
    goal_id: e.goalId || null
  };
};

// ==========================================
// 4. PLANS MAPPERS
// ==========================================
export const mapPlanFromDb = (raw: any): Plan => {
  return {
    id: raw.id,
    goalId: raw.goal_id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description || '',
    startDate: raw.start_date?.split('T')[0] || raw.start_date,
    endDate: raw.end_date?.split('T')[0] || raw.end_date,
    status: raw.status === 'active' ? 'activo' : raw.status === 'completed' ? 'completado' : 'pausado',
    milestones: Array.isArray(raw.milestones) ? raw.milestones : [],
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

export const mapPlanToDb = (p: Plan) => {
  return {
    id: p.id,
    goal_id: p.goalId,
    user_id: p.userId,
    title: p.title,
    description: p.description,
    start_date: p.startDate,
    end_date: p.endDate,
    status: p.status === 'activo' ? 'active' : p.status === 'completado' ? 'completed' : 'paused',
    milestones: p.milestones
  };
};

// ==========================================
// 5. PROFILE MAPPERS
// ==========================================
export const mapProfileFromDb = (raw: any): Profile => {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.display_name || 'Guerrero Saiyajin',
    avatarUrl: raw.avatar_url || undefined,
    currentXp: Number(raw.xp ?? raw.current_xp ?? 0),
    currentLevel: Number(raw.level ?? raw.current_level ?? 1),
    totalPower: Number(raw.total_power ?? 0),
    basePower: Number(raw.base_power ?? 0),
    evolutionPower: Number(raw.evolution_power ?? 0),
    financialPower: Number(raw.financial_power ?? 0),
    habitsPower: Number(raw.habits_power ?? 0),
    transformation: (raw.transformation as TransformationId) || 'base',
    currentStreak: Number(raw.current_streak ?? 0),
    bestStreak: Number(raw.best_streak ?? 0),
    lastActiveDate: raw.last_active_date?.split('T')[0] || raw.last_active_date,
    inviteCode: raw.invite_code || 'SAYAYIN-CODE',
    partnerId: raw.partner_id || null,
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

// ==========================================
// 6. FINANCIAL SETTINGS & DEDUCTIONS MAPPERS
// ==========================================
export const mapSettingsFromDb = (raw: any): FinancialSettings => {
  return {
    id: raw.id,
    userId: raw.user_id,
    baseMonthlyIncome: Number(raw.base_monthly_income) || 1250000,
    emergencyFundTarget: Number(raw.emergency_fund_target) || 3750000,
    updatedAt: raw.updated_at?.split('T')[0] || raw.updated_at
  };
};

export const mapDeductionFromDb = (raw: any): FixedDeduction => {
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.name,
    amount: Number(raw.amount) || 0,
    category: raw.category || 'Varios',
    isActive: Boolean(raw.is_active),
    dueDay: Number(raw.due_day) || 1
  };
};

export const mapDeductionToDb = (d: FixedDeduction) => {
  return {
    id: d.id,
    user_id: d.userId,
    name: d.name,
    amount: d.amount,
    category: d.category,
    is_active: d.isActive,
    due_day: d.dueDay
  };
};

// ==========================================
// 7. FEARS & FEAR STEPS MAPPERS
// ==========================================
export const mapFearStepFromDb = (raw: any): FearStep => {
  return {
    id: raw.id,
    fearId: raw.fear_id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description || undefined,
    stepOrder: Number(raw.step_order) || 1,
    xpReward: Number(raw.xp_reward) || 25,
    braveryPoints: Number(raw.bravery_points) || 10,
    isCompleted: raw.is_completed === true,
    completedAt: raw.completed_at || undefined
  };
};

export const mapFearStepToDb = (s: FearStep, fearId: string, userId: string) => {
  return {
    id: s.id,
    fear_id: fearId,
    user_id: userId,
    title: s.title,
    description: s.description || null,
    step_order: s.stepOrder,
    xp_reward: s.xpReward || 25,
    bravery_points: s.braveryPoints || 10,
    is_completed: s.isCompleted,
    completed_at: s.completedAt || null
  };
};

export const mapFearFromDb = (raw: any): Fear => {
  const steps: FearStep[] = Array.isArray(raw.steps)
    ? raw.steps.map(mapFearStepFromDb)
    : Array.isArray(raw.actions)
    ? raw.actions.map((act: any, idx: number) => ({
        id: act.id || `fstep_${raw.id}_${idx + 1}`,
        fearId: raw.id,
        userId: raw.user_id,
        title: act.title,
        description: act.description || undefined,
        stepOrder: idx + 1,
        xpReward: 25,
        braveryPoints: 10,
        isCompleted: act.completed === true,
        completedAt: act.completedAt
      }))
    : [];

  // Sort steps by stepOrder
  steps.sort((a, b) => a.stepOrder - b.stepOrder);

  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description || '',
    category: raw.category || 'escasez',
    impactScore: Number(raw.impact_score) || 5,
    status: raw.status || 'enfrentando',
    steps,
    actions: steps.map((s) => ({ id: s.id, title: s.title, completed: s.isCompleted, completedAt: s.completedAt })),
    braveryScore: Number(raw.bravery_score) || steps.filter((s) => s.isCompleted).reduce((sum, s) => sum + s.braveryPoints, 0),
    reflection: raw.reflection || undefined,
    createdAt: raw.created_at?.split('T')[0] || raw.created_at,
    conqueredAt: raw.conquered_at || undefined
  };
};

export const mapFearToDb = (f: Fear) => {
  return {
    id: f.id,
    user_id: f.userId,
    title: f.title,
    description: f.description,
    category: f.category,
    impact_score: f.impactScore || 5,
    status: f.status,
    bravery_score: f.braveryScore || 0,
    actions: f.steps.map((s) => ({ id: s.id, title: s.title, completed: s.isCompleted, completedAt: s.completedAt })),
    reflection: f.reflection || null,
    conquered_at: f.conqueredAt || null
  };
};

// ==========================================
// 8. HABITS & HABIT LOGS MAPPERS
// ==========================================
export const mapHabitFromDb = (raw: any): Habit => {
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.name,
    description: raw.description || undefined,
    frequency: (raw.frequency || 'diaria') as HabitFrequency,
    customDays: Array.isArray(raw.custom_days) ? raw.custom_days : [],
    optionalTime: raw.optional_time || undefined,
    timeSlot: mapSlotFromDb(raw.time_slot),
    xpReward: Number(raw.xp_reward) || 15,
    isActive: raw.is_active !== false,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || undefined
  };
};

export const mapHabitToDb = (h: Habit) => {
  return {
    id: h.id,
    user_id: h.userId,
    name: h.name,
    description: h.description || null,
    frequency: h.frequency,
    custom_days: h.customDays || [],
    optional_time: h.optionalTime || null,
    time_slot: mapSlotToDb(h.timeSlot),
    xp_reward: h.xpReward || 15,
    is_active: h.isActive
  };
};

export const mapHabitLogFromDb = (raw: any): HabitLog => {
  return {
    id: raw.id,
    habitId: raw.habit_id,
    userId: raw.user_id,
    date: raw.date?.split('T')[0] || raw.date,
    completed: raw.completed !== false,
    completedAt: raw.completed_at || undefined
  };
};

export const mapHabitLogToDb = (l: HabitLog) => {
  return {
    id: l.id,
    habit_id: l.habitId,
    user_id: l.userId,
    date: l.date,
    completed: l.completed,
    completed_at: l.completedAt || new Date().toISOString()
  };
};

