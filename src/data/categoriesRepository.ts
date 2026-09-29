import { supabase } from '../lib/supabase';
import { ExpenseCategory } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES } from '../lib/constants';

export const categoriesRepository = {
  async getCategories(userId: string): Promise<ExpenseCategory[]> {
    if (!supabase) return DEFAULT_EXPENSE_CATEGORIES;

    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`);

    if (error || !data || data.length === 0) {
      return DEFAULT_EXPENSE_CATEGORIES;
    }

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      icon: d.icon || 'Tag',
      color: d.color || '#FF6600',
      isDefault: Boolean(d.is_default)
    }));
  },

  async createCategory(category: ExpenseCategory, userId: string): Promise<ExpenseCategory> {
    if (!supabase) return category;

    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        id: category.id,
        user_id: userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        is_default: false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: false
    };
  },

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase.from('expense_categories').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }
};
