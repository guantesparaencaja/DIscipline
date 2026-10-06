import { supabase } from '../lib/supabase';
import { FinancialSettings, FixedDeduction } from '../types';
import { mapSettingsFromDb, mapDeductionFromDb, mapDeductionToDb } from './mappers';
import { FinancialSettingsSchema, FixedDeductionSchema, sanitizeText } from '../lib/validation';

export const settingsRepository = {
  async getFinancialSettings(userId: string): Promise<FinancialSettings | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('financial_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return mapSettingsFromDb(data);
  },

  async upsertFinancialSettings(settings: FinancialSettings): Promise<void> {
    if (!supabase) return;

    const validation = FinancialSettingsSchema.safeParse({
      baseMonthlyIncome: settings.baseMonthlyIncome,
      emergencyFundTarget: settings.emergencyFundTarget
    });

    if (!validation.success) {
      throw new Error(`Validación financiera fallida: ${validation.error.issues[0]?.message}`);
    }

    const { error } = await supabase.from('financial_settings').upsert({
      user_id: settings.userId,
      base_monthly_income: validation.data.baseMonthlyIncome,
      emergency_fund_target: validation.data.emergencyFundTarget,
      updated_at: new Date().toISOString()
    });

    if (error) {
      throw new Error(`Error al guardar configuración financiera: ${error.message}`);
    }
  },

  async getFixedDeductions(userId: string): Promise<FixedDeduction[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('fixed_deductions')
      .select('*')
      .eq('user_id', userId)
      .order('due_day', { ascending: true });

    if (error) {
      throw new Error(`Error al cargar deducciones fijas: ${error.message}`);
    }

    return (data || []).map(mapDeductionFromDb);
  },

  async createFixedDeduction(deduction: FixedDeduction): Promise<FixedDeduction> {
    if (!supabase) return deduction;

    const validation = FixedDeductionSchema.safeParse({
      name: deduction.name,
      amount: deduction.amount,
      category: deduction.category
    });

    if (!validation.success) {
      throw new Error(`Validación de deducción fallida: ${validation.error.issues[0]?.message}`);
    }

    const sanitizedDeduction: FixedDeduction = {
      ...deduction,
      name: validation.data.name
    };

    const payload = mapDeductionToDb(sanitizedDeduction);
    const { data, error } = await supabase
      .from('fixed_deductions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear deducción fija: ${error.message}`);
    }

    return mapDeductionFromDb(data);
  },

  async updateFixedDeduction(id: string, updates: Partial<FixedDeduction>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.dueDay !== undefined) payload.due_day = updates.dueDay;

    const { error } = await supabase.from('fixed_deductions').update(payload).eq('id', id);
    if (error) {
      throw new Error(`Error al actualizar deducción fija: ${error.message}`);
    }
  },

  async deleteFixedDeduction(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('fixed_deductions').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar deducción fija: ${error.message}`);
    }
  }
};
