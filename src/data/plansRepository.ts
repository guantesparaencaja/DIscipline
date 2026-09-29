import { supabase } from '../lib/supabase';
import { Plan } from '../types';
import { mapPlanFromDb, mapPlanToDb } from './mappers';

export const plansRepository = {
  async getPlans(userId: string): Promise<Plan[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar planes: ${error.message}`);
    }

    return (data || []).map(mapPlanFromDb);
  },

  async createPlan(plan: Plan): Promise<Plan> {
    if (!supabase) return plan;

    const payload = mapPlanToDb(plan);
    const { data, error } = await supabase
      .from('plans')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear plan: ${error.message}`);
    }

    return mapPlanFromDb(data);
  },

  async updatePlan(id: string, updates: Partial<Plan>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.startDate !== undefined) payload.start_date = updates.startDate;
    if (updates.endDate !== undefined) payload.end_date = updates.endDate;
    if (updates.status !== undefined) {
      payload.status = updates.status === 'activo' ? 'active' : updates.status === 'completado' ? 'completed' : 'paused';
    }
    if (updates.milestones !== undefined) payload.milestones = updates.milestones;

    const { error } = await supabase.from('plans').update(payload).eq('id', id);
    if (error) {
      throw new Error(`Error al actualizar plan: ${error.message}`);
    }
  },

  async deletePlan(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar plan: ${error.message}`);
    }
  }
};
