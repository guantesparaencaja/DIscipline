import { Fear, FearStep, Habit, HabitLog, HabitFrequency } from '../../types';
import { mapSlotFromDb, mapSlotToDb } from './objectiveMappers';

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
