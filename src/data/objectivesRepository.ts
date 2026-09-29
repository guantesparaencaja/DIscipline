import { supabase } from '../lib/supabase';
import { DailyObjective } from '../types';
import {
  mapObjectiveFromDb,
  mapObjectiveToDb,
  mapSlotToDb,
  mapStatusToDb,
  mapDifficultyToDb,
  mapRecurrenceToDb
} from './mappers';

export const objectivesRepository = {
  async getDailyObjectives(userId: string): Promise<DailyObjective[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('daily_objectives')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar objetivos: ${error.message}`);
    }

    return (data || []).map(mapObjectiveFromDb);
  },

  async createObjective(objective: DailyObjective): Promise<DailyObjective> {
    if (!supabase) return objective;

    const payload = mapObjectiveToDb(objective);
    const { data, error } = await supabase
      .from('daily_objectives')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear objetivo: ${error.message}`);
    }

    return mapObjectiveFromDb(data);
  },

  async updateObjective(id: string, updates: Partial<DailyObjective>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.timeSlot !== undefined) payload.slot = mapSlotToDb(updates.timeSlot);
    if (updates.customTime !== undefined) payload.custom_time = updates.customTime;
    if (updates.difficulty !== undefined) payload.difficulty = mapDifficultyToDb(updates.difficulty);
    if (updates.xpReward !== undefined) payload.xp_reward = updates.xpReward;
    if (updates.savingAmount !== undefined) payload.saving_amount = updates.savingAmount;
    if (updates.isPartnerVisible !== undefined) payload.is_partner_visible = updates.isPartnerVisible;
    if (updates.recurrence !== undefined) payload.recurrence = mapRecurrenceToDb(updates.recurrence);
    if (updates.recurrenceDays !== undefined) payload.recurrence_days = updates.recurrenceDays;
    if (updates.status !== undefined) payload.status = mapStatusToDb(updates.status);
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;

    const { error } = await supabase.from('daily_objectives').update(payload).eq('id', id);
    if (error) {
      throw new Error(`Error al actualizar objetivo: ${error.message}`);
    }
  },

  async deleteObjective(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('daily_objectives').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar objetivo: ${error.message}`);
    }
  }
};
