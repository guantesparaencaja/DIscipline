import { supabase } from '../lib/supabase';
import { Expense } from '../types';
import { mapExpenseFromDb, mapExpenseToDb, mapPaymentMethodToDb } from './mappers';
import { ExpenseSchema, sanitizeText } from '../lib/validation';

export const expensesRepository = {
  async getExpenses(userId: string): Promise<Expense[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Error al cargar gastos: ${error.message}`);
    }

    return (data || []).map(mapExpenseFromDb);
  },

  async createExpense(expense: Expense): Promise<Expense> {
    if (!supabase) return expense;

    // Validate with Zod before sending to Supabase
    const validation = ExpenseSchema.safeParse({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      categoryName: expense.categoryName,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      isSaving: expense.isSaving,
      goalId: expense.goalId,
      note: expense.note
    });

    if (!validation.success) {
      throw new Error(`Validación de gasto fallida: ${validation.error.issues[0]?.message || 'Datos inválidos'}`);
    }

    const sanitizedExpense: Expense = {
      ...expense,
      description: validation.data.description,
      note: validation.data.note
    };

    const payload = mapExpenseToDb(sanitizedExpense);
    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al registrar gasto: ${error.message}`);
    }

    return mapExpenseFromDb(data);
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {};
    if (updates.description !== undefined) payload.description = sanitizeText(updates.description);
    if (updates.amount !== undefined) {
      if (updates.amount <= 0) throw new Error('El monto debe ser mayor a 0 COP');
      payload.amount = updates.amount;
    }
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.categoryName !== undefined) payload.category_name = sanitizeText(updates.categoryName);
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.note !== undefined) payload.note = sanitizeText(updates.note);
    if (updates.paymentMethod !== undefined) payload.payment_method = mapPaymentMethodToDb(updates.paymentMethod);
    if (updates.isSaving !== undefined) payload.is_saving = updates.isSaving;
    if (updates.goalId !== undefined) payload.goal_id = updates.goalId;

    const { error } = await supabase.from('expenses').update(payload).eq('id', id);
    if (error) {
      throw new Error(`Error al actualizar gasto: ${error.message}`);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar gasto: ${error.message}`);
    }
  }
};
