import {
  DailyObjective,
  TimeSlot,
  ObjectiveStatus,
  ObjectiveDifficulty,
  RecurrenceType
} from '../../types';

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
