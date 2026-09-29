import { supabase } from '../lib/supabase';
import { Goal } from '../types';
import { mapGoalFromDb, mapGoalToDb } from './mappers';

export const goalsRepository = {
  async getGoals(userId: string): Promise<Goal[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar metas: ${error.message}`);
    }

    return (data || []).map(mapGoalFromDb);
  },

  async createGoal(goal: Goal): Promise<Goal> {
    if (!supabase) return goal;

    const payload = mapGoalToDb(goal);
    const { data, error } = await supabase
      .from('goals')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear meta: ${error.message}`);
    }

    return mapGoalFromDb(data);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.currentSavings !== undefined) {
      payload.current_amount = updates.currentSavings;
      payload.current_savings = updates.currentSavings;
    }
    if (updates.priority !== undefined) {
      const p = updates.priority;
      payload.priority = p === 'baja' ? 'low' : p === 'media' ? 'medium' : p === 'alta' ? 'high' : 'maximum';
    }
    if (updates.status !== undefined) {
      const s = updates.status;
      payload.status = s === 'activa' ? 'active' : s === 'en_pausa' ? 'paused' : s === 'completada' ? 'completed' : 'cancelled';
    }
    if (updates.motivation !== undefined) payload.motivation = updates.motivation;

    const { error } = await supabase.from('goals').update(payload).eq('id', id);
    if (error) {
      throw new Error(`Error al actualizar meta: ${error.message}`);
    }
  },

  async deleteGoal(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar meta: ${error.message}`);
    }
  }
};
