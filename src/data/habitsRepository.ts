import { supabase } from '../lib/supabase';
import { Habit, HabitLog } from '../types';
import { mapHabitFromDb, mapHabitToDb, mapHabitLogFromDb, mapHabitLogToDb } from './mappers';
import { HabitSchema, sanitizeText } from '../lib/validation';

export const habitsRepository = {
  /**
   * Retrieves all habits for a user
   */
  async getHabits(userId: string): Promise<Habit[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error al cargar hábitos de Supabase:', error.message);
      return [];
    }

    return (data || []).map(mapHabitFromDb);
  },

  /**
   * Creates a new habit
   */
  async createHabit(habit: Habit): Promise<Habit> {
    if (!supabase) return habit;

    const validation = HabitSchema.safeParse({
      name: habit.name,
      frequency: habit.frequency,
      timeSlot: habit.timeSlot,
      customDays: habit.customDays,
      xpReward: habit.xpReward,
      description: habit.description
    });

    if (!validation.success) {
      throw new Error(`Validación de hábito fallida: ${validation.error.issues[0]?.message || 'Datos inválidos'}`);
    }

    const sanitizedHabit: Habit = {
      ...habit,
      name: validation.data.name,
      description: validation.data.description
    };

    const payload = mapHabitToDb(sanitizedHabit);
    const { data, error } = await supabase
      .from('habits')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Error al insertar hábito en Supabase:', error.message);
      return habit;
    }

    return mapHabitFromDb(data);
  },

  /**
   * Updates an existing habit
   */
  async updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = sanitizeText(updates.name);
    if (updates.description !== undefined) payload.description = sanitizeText(updates.description);
    if (updates.frequency !== undefined) payload.frequency = updates.frequency;
    if (updates.customDays !== undefined) payload.custom_days = updates.customDays;
    if (updates.optionalTime !== undefined) payload.optional_time = updates.optionalTime;
    if (updates.timeSlot !== undefined) payload.time_slot = updates.timeSlot;
    if (updates.xpReward !== undefined) payload.xp_reward = updates.xpReward;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { error } = await supabase.from('habits').update(payload).eq('id', id);
    if (error) {
      console.warn('Error al actualizar hábito en Supabase:', error.message);
    }
  },

  /**
   * Deletes a habit
   */
  async deleteHabit(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.warn('Error al eliminar hábito en Supabase:', error.message);
    }
  },

  /**
   * Retrieves habit completion logs (optionally starting from fromDate)
   */
  async getHabitLogs(userId: string, fromDate?: string): Promise<HabitLog[]> {
    if (!supabase) return [];

    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (fromDate) {
      query = query.gte('date', fromDate);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error al cargar habit_logs de Supabase:', error.message);
      return [];
    }

    return (data || []).map(mapHabitLogFromDb);
  },

  /**
   * Inserts or updates a habit log entry (upsert)
   */
  async setHabitLog(log: HabitLog): Promise<HabitLog | null> {
    if (!supabase) return log;

    const payload = mapHabitLogToDb(log);
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(payload, { onConflict: 'habit_id,date' })
      .select()
      .single();

    if (error) {
      console.warn('Error al guardar habit_log en Supabase:', error.message);
      return log;
    }

    return mapHabitLogFromDb(data);
  },

  /**
   * Removes a habit log (when unmarked)
   */
  async deleteHabitLog(habitId: string, date: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date);

    if (error) {
      console.warn('Error al eliminar habit_log en Supabase:', error.message);
    }
  }
};
