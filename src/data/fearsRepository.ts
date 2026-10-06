import { supabase } from '../lib/supabase';
import { Fear, FearStep } from '../types';
import { mapFearFromDb, mapFearToDb, mapFearStepFromDb, mapFearStepToDb } from './mappers';
import { FearSchema } from '../lib/validation';

export const fearsRepository = {
  async getFears(userId: string): Promise<Fear[]> {
    if (!supabase) return [];

    const { data: fearsData, error: fearsError } = await supabase
      .from('fears')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fearsError) {
      console.warn('Error al cargar miedos de Supabase:', fearsError.message);
      return [];
    }

    if (!fearsData || fearsData.length === 0) return [];

    // Fetch all fear_steps for this user
    const { data: stepsData, error: stepsError } = await supabase
      .from('fear_steps')
      .select('*')
      .eq('user_id', userId)
      .order('step_order', { ascending: true });

    if (stepsError) {
      console.warn('Error al cargar fear_steps de Supabase:', stepsError.message);
    }

    const stepsByFear = new Map<string, any[]>();
    (stepsData || []).forEach((st) => {
      const list = stepsByFear.get(st.fear_id) || [];
      list.push(st);
      stepsByFear.set(st.fear_id, list);
    });

    return fearsData.map((raw) => {
      const fearSteps = stepsByFear.get(raw.id) || [];
      return mapFearFromDb({
        ...raw,
        steps: fearSteps.length > 0 ? fearSteps : raw.actions
      });
    });
  },

  async createFear(fear: Fear): Promise<Fear> {
    if (!supabase) return fear;

    const validation = FearSchema.safeParse({
      title: fear.title,
      category: fear.category,
      steps: (fear.steps || []).map((s, idx) => ({
        title: s.title,
        braveryPoints: s.braveryPoints || 10,
        stepOrder: s.stepOrder || idx + 1
      }))
    });

    if (!validation.success) {
      console.warn('Validación de miedo fallida:', validation.error.issues[0]?.message);
    }

    const sanitizedFear: Fear = {
      ...fear,
      title: validation.success ? validation.data.title : fear.title
    };

    const payload = mapFearToDb(sanitizedFear);
    const { data, error } = await supabase
      .from('fears')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Error al registrar miedo en Supabase:', error.message);
      return fear;
    }

    const savedFear = mapFearFromDb(data);

    // Insert steps if any
    if (fear.steps && fear.steps.length > 0) {
      const stepsPayload = fear.steps.map((s, idx) =>
        mapFearStepToDb({ ...s, stepOrder: idx + 1 }, savedFear.id, fear.userId)
      );
      const { data: stepsData, error: stepsErr } = await supabase
        .from('fear_steps')
        .insert(stepsPayload)
        .select();

      if (!stepsErr && stepsData) {
        savedFear.steps = stepsData.map(mapFearStepFromDb);
      }
    }

    return savedFear;
  },

  async updateFear(id: string, updates: Partial<Fear>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.impactScore !== undefined) payload.impact_score = updates.impactScore;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.braveryScore !== undefined) payload.bravery_score = updates.braveryScore;
    if (updates.reflection !== undefined) payload.reflection = updates.reflection;
    if (updates.conqueredAt !== undefined) payload.conquered_at = updates.conqueredAt;

    const { error } = await supabase.from('fears').update(payload).eq('id', id);
    if (error) {
      console.warn('Error al actualizar miedo en Supabase:', error.message);
    }
  },

  async saveFearSteps(fearId: string, userId: string, steps: FearStep[]): Promise<void> {
    if (!supabase) return;

    // Delete existing steps and insert new ones
    await supabase.from('fear_steps').delete().eq('fear_id', fearId);

    if (steps.length > 0) {
      const payload = steps.map((s, idx) =>
        mapFearStepToDb({ ...s, stepOrder: idx + 1 }, fearId, userId)
      );
      await supabase.from('fear_steps').insert(payload);
    }
  },

  async updateFearStep(
    stepId: string,
    isCompleted: boolean,
    completedAt?: string
  ): Promise<void> {
    if (!supabase) return;

    await supabase
      .from('fear_steps')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? completedAt || new Date().toISOString() : null
      })
      .eq('id', stepId);
  },

  async deleteFear(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('fears').delete().eq('id', id);
    if (error) {
      console.warn('Error al eliminar miedo en Supabase:', error.message);
    }
  }
};
