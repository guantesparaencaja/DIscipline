export type TransformationId =
  | 'base'
  | 'ozaru'
  | 'ssj'
  | 'ssj2'
  | 'ssj3'
  | 'ssj_god'
  | 'ssj_blue'
  | 'ultra_instinto_sign'
  | 'ultra_instinto';

export interface TransformationConfig {
  id: TransformationId;
  name: string;
  shortName: string;
  minPower: number;
  maxPower: number;
  color: string;
  auraGradient: string;
  textColor: string;
  description: string;
  lore: string;
  quote: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  currentXp: number;
  currentLevel: number;
  totalPower: number;
  basePower: number;
  evolutionPower: number;
  financialPower: number;
  habitsPower: number;
  transformation: TransformationId;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  inviteCode: string;
  partnerId: string | null;
  createdAt: string;
}

export interface FinancialSettings {
  id: string;
  userId: string;
  baseMonthlyIncome: number; // e.g. 1250000
  emergencyFundTarget: number; // e.g. 3750000
  updatedAt: string;
}

export interface FixedDeduction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  isActive: boolean;
  dueDay: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export type PaymentMethod = 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia';

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  time?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  isSaving: boolean;
  goalId?: string;
  createdAt: string;
}

export type GoalPriority = 'baja' | 'media' | 'alta' | 'maxima';
export type GoalStatus = 'activa' | 'en_pausa' | 'completada' | 'cancelada';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number; // COP
  currentSavings: number; // COP accumulated from expenses where isSaving = true
  motivation: string;
  createdAt: string;
}

export interface PlanMilestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'activo' | 'pausado' | 'completado' | 'cancelado';
  milestones: PlanMilestone[];
  createdAt: string;
}

export type TimeSlot = 'manana' | 'tarde' | 'noche' | 'personalizada';
export type ObjectiveDifficulty = 'facil' | 'normal' | 'dificil' | 'extremo';
export type ObjectiveStatus = 'pendiente' | 'en_progreso' | 'completado' | 'omitido';
export type RecurrenceType = 'una_vez' | 'diaria' | 'dias_semana';

export interface DailyObjective {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  customTime?: string; // HH:mm
  difficulty: ObjectiveDifficulty;
  xpReward: number; // +10, +20, +40, +75
  savingAmount?: number; // optional COP
  isPartnerVisible: boolean;
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // 0-6
  status: ObjectiveStatus;
  completedAt?: string;
  createdAt: string;
  calendarEventId?: string;
  taskId?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'disciplina' | 'finanzas' | 'poder' | 'social';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface XPEvent {
  id: string;
  userId: string;
  sourceType: 'objective' | 'saving' | 'achievement' | 'streak_bonus';
  description: string;
  xpAmount: number;
  createdAt: string;
}

export interface PartnerObjective {
  id: string;
  title: string;
  timeSlot: TimeSlot;
  customTime?: string;
  difficulty: ObjectiveDifficulty;
  status: ObjectiveStatus;
  completedAt?: string;
}

export interface PartnerData {
  id: string;
  displayName: string;
  avatarUrl?: string;
  currentLevel: number;
  transformation: TransformationId;
  currentXp: number;
  currentStreak: number;
  totalAchievements: number;
  connectedSince: string;
  todayObjectives: PartnerObjective[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'xp' | 'level_up' | 'transformation' | 'achievement';
  title: string;
  description?: string;
  xpAmount?: number;
  timestamp: number;
}
