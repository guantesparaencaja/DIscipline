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
  braveryScore?: number;
  transformation: TransformationId;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  inviteCode: string;
  partnerId: string | null;
  timezone?: string;
  shareObjectivesGlobally?: boolean;
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

export type AchievementCategory = 'disciplina' | 'finanzas' | 'poder' | 'social' | 'mental';

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  xpReward: number;
  category: AchievementCategory;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export type FearCategory =
  | 'escasez'
  | 'inversion'
  | 'fracaso'
  | 'deuda'
  | 'juicio_social'
  | 'merecimiento'
  | 'social'
  | 'personal'
  | 'profesional';

export type FearStatus = 'enfrentando' | 'superado';

export interface FearStep {
  id: string;
  fearId: string;
  userId?: string;
  title: string;
  description?: string;
  stepOrder: number; // 1 to 10
  xpReward: number; // e.g. 25
  braveryPoints: number; // e.g. 10
  isCompleted: boolean;
  completedAt?: string;
}

// Legacy alias for compatibility
export interface FearAction {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Fear {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: FearCategory;
  impactScore?: number; // 1 - 10
  status: FearStatus;
  steps: FearStep[];
  actions?: FearAction[]; // legacy fallback
  braveryScore: number;
  reflection?: string;
  createdAt: string;
  conqueredAt?: string;
}

export type HabitFrequency = 'diaria' | 'semanal' | 'personalizada';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // [0, 1, 2, 3, 4, 5, 6] (0 = Domingo, 1 = Lunes, ...)
  optionalTime?: string; // HH:mm
  timeSlot: TimeSlot; // 'manana' | 'tarde' | 'noche' | 'personalizada'
  xpReward: number; // e.g. 15
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  bestStreak: number;
  thirtyDayRate: number; // 0 - 100%
  completedToday: boolean;
  isDueToday: boolean;
  totalCompletions: number;
}

export interface XPEvent {
  id: string;
  userId: string;
  sourceType:
    | 'objective'
    | 'saving'
    | 'achievement'
    | 'streak_bonus'
    | 'fear_action'
    | 'fear_step'
    | 'fear_conquered'
    | 'habit'
    | 'compensatory_undo';
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
  totalPower: number;
  totalAchievements: number;
  connectedSince: string;
  todayObjectives: PartnerObjective[];
  weeklyXp?: number;
  weeklyStreak?: number;
}

export interface UndoableObjective {
  id: string;
  title: string;
  xpReward: number;
  savingAmount?: number;
  goalId?: string;
  expiresAt: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'xp' | 'level_up' | 'transformation' | 'achievement';
  title: string;
  description?: string;
  xpAmount?: number;
  timestamp: number;
  undoId?: string;
}
