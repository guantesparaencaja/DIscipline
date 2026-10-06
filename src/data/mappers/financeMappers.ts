import {
  Goal,
  GoalPriority,
  GoalStatus,
  Plan,
  Expense,
  PaymentMethod,
  Profile,
  TransformationId,
  FinancialSettings,
  FixedDeduction,
  ExpenseCategory
} from '../../types';

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
    category: raw.category || 'General',
    startDate: raw.start_date?.split('T')[0] || raw.start_date,
    targetDate: raw.target_date?.split('T')[0] || raw.target_date,
    priority: mapGoalPriorityFromDb(raw.priority),
    status: mapGoalStatusFromDb(raw.status),
    targetAmount: Number(raw.target_amount) || 0,
    currentSavings: Number(raw.current_savings) || 0,
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
    current_savings: g.currentSavings,
    motivation: g.motivation
  };
};

export const mapPlanFromDb = (raw: any): Plan => {
  return {
    id: raw.id,
    goalId: raw.goal_id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description || '',
    startDate: raw.start_date?.split('T')[0] || raw.start_date,
    endDate: raw.end_date?.split('T')[0] || raw.end_date,
    status: raw.status || 'activo',
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
    status: p.status,
    milestones: p.milestones
  };
};

export const mapPaymentMethodToDb = (pm: PaymentMethod): string => {
  switch (pm) {
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

export const mapPaymentMethodFromDb = (dbPm: string | null): PaymentMethod => {
  switch (dbPm) {
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
    categoryId: raw.category_id || 'cat_otros',
    categoryName: raw.category_name || 'Otros',
    date: raw.date?.split('T')[0] || raw.date,
    time: raw.time || undefined,
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
    category_id: e.categoryId,
    category_name: e.categoryName,
    date: e.date,
    time: e.time || null,
    note: e.note || null,
    payment_method: mapPaymentMethodToDb(e.paymentMethod),
    is_saving: e.isSaving,
    goal_id: e.goalId || null
  };
};

export const mapProfileFromDb = (raw: any): Profile => {
  return {
    id: raw.id,
    email: raw.email || '',
    displayName: raw.display_name || 'Guerrero Saiyajin',
    avatarUrl: raw.avatar_url || undefined,
    currentXp: Number(raw.current_xp) || 0,
    availableXp: Number(raw.available_xp ?? raw.current_xp) || 0,
    currentLevel: Number(raw.current_level) || 1,
    totalPower: Number(raw.total_power) || 0,
    basePower: Number(raw.base_power) || 0,
    evolutionPower: Number(raw.evolution_power) || 0,
    financialPower: Number(raw.financial_power) || 0,
    habitsPower: Number(raw.habits_power) || 0,
    braveryScore: Number(raw.bravery_score) || 0,
    transformation: (raw.transformation as TransformationId) || 'base',
    currentStreak: Number(raw.current_streak) || 0,
    bestStreak: Number(raw.best_streak) || 0,
    lastActiveDate: raw.last_active_date?.split('T')[0] || raw.last_active_date,
    inviteCode: raw.invite_code || 'SAYAYIN-CODE',
    partnerId: raw.partner_id || null,
    createdAt: raw.created_at?.split('T')[0] || raw.created_at
  };
};

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
