import { StateCreator } from 'zustand';
import { SayayinStore, FinanceSlice } from '../types';
import { Expense, FinancialSettings, FixedDeduction } from '../../types';
import { formatCOP, getTodayDateString } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { expensesRepository, goalsRepository, settingsRepository } from '../../data';
import { enqueueOfflineAction } from '../../lib/offlineQueue';
import { getInitialData, saveCache } from '../initialData';

export const createFinanceSlice: StateCreator<SayayinStore, [], [], FinanceSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    financialSettings: initial.financialSettings,
    fixedDeductions: initial.fixedDeductions,
    categories: initial.categories,
    expenses: initial.expenses,

    getAvailableFunds: () => {
      const { financialSettings, fixedDeductions, expenses } = get();
      const income = financialSettings.baseMonthlyIncome || 0;
      const totalFixed = fixedDeductions
        .filter((d) => d.isActive)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      return income - totalFixed - totalExpenses;
    },

    addExpense: async (data) => {
      const prevExpenses = get().expenses;
      const prevGoals = get().goals;
      const { authUser, profile } = get();

      const newExpense: Expense = {
        ...data,
        id: 'exp_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        createdAt: getTodayDateString()
      };

      let updatedGoals = prevGoals;
      if (newExpense.isSaving && newExpense.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === newExpense.goalId ? { ...g, currentSavings: g.currentSavings + newExpense.amount } : g
        );
      }

      set({
        expenses: [newExpense, ...prevExpenses],
        goals: updatedGoals
      });

      get().addToast({
        type: 'success',
        title: newExpense.isSaving ? '¡Ahorro registrado con éxito!' : 'Gasto registrado',
        description: `${newExpense.description}: ${formatCOP(newExpense.amount)}`
      });

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (authUser && isSupabaseConfigured() && isOnline) {
        try {
          const created = await expensesRepository.createExpense(newExpense);
          if (newExpense.isSaving && newExpense.goalId) {
            const targetGoal = updatedGoals.find((g) => g.id === newExpense.goalId);
            if (targetGoal) {
              await goalsRepository.updateGoal(newExpense.goalId, {
                currentSavings: targetGoal.currentSavings
              });
            }
          }
          set((state) => ({
            expenses: state.expenses.map((e) => (e.id === newExpense.id ? created : e))
          }));
        } catch (err) {
          console.warn('Error al guardar gasto en Supabase, encolando offline:', err);
          await enqueueOfflineAction({
            dedupKey: 'add_expense_' + newExpense.id,
            type: 'add_expense',
            payload: newExpense
          });
        }
      } else {
        await enqueueOfflineAction({
          dedupKey: 'add_expense_' + newExpense.id,
          type: 'add_expense',
          payload: newExpense
        });
      }

      get().checkAchievements();
      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editExpense: async (id, data) => {
      const prevExpenses = get().expenses;
      set({
        expenses: prevExpenses.map((e) => (e.id === id ? { ...e, ...data } : e))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await expensesRepository.updateExpense(id, data);
        } catch (err: any) {
          set({ expenses: prevExpenses });
          get().addToast({
            type: 'error',
            title: 'Error al editar gasto',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    deleteExpense: async (id) => {
      const prevExpenses = get().expenses;
      const prevGoals = get().goals;
      const target = prevExpenses.find((e) => e.id === id);

      let updatedGoals = prevGoals;
      if (target?.isSaving && target.goalId) {
        updatedGoals = updatedGoals.map((g) =>
          g.id === target.goalId
            ? { ...g, currentSavings: Math.max(0, g.currentSavings - target.amount) }
            : g
        );
      }

      set({
        expenses: prevExpenses.filter((e) => e.id !== id),
        goals: updatedGoals
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await expensesRepository.deleteExpense(id);
          if (target?.isSaving && target.goalId) {
            const targetGoal = updatedGoals.find((g) => g.id === target.goalId);
            if (targetGoal) {
              await goalsRepository.updateGoal(target.goalId, {
                currentSavings: targetGoal.currentSavings
              });
            }
          }
        } catch (err: any) {
          set({ expenses: prevExpenses, goals: prevGoals });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar gasto',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    updateCategoryBudget: async (categoryId, budgetLimit) => {
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === categoryId ? { ...c, budgetLimit } : c
        )
      }));

      get().addToast({
        type: 'success',
        title: 'Presupuesto de categoría actualizado',
        description: `Nuevo límite mensual: ${formatCOP(budgetLimit)}`
      });

      saveCache(get());
    },

    updateFinancialSettings: async (income, emergencyTarget) => {
      const prevSettings = get().financialSettings;
      const { authUser, profile } = get();

      const newSettings: FinancialSettings = {
        ...prevSettings,
        userId: authUser ? authUser.id : profile.id,
        baseMonthlyIncome: income,
        emergencyFundTarget: emergencyTarget,
        updatedAt: getTodayDateString()
      };

      set({ financialSettings: newSettings });
      get().addToast({
        type: 'success',
        title: 'Finanzas base actualizadas',
        description: `Ingreso mensual: ${formatCOP(income)}`
      });

      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.upsertFinancialSettings(newSettings);
        } catch (err: any) {
          set({ financialSettings: prevSettings });
          get().addToast({
            type: 'error',
            title: 'Error al guardar configuración en Supabase',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    addFixedDeduction: async (data) => {
      const prevDeductions = get().fixedDeductions;
      const { authUser, profile } = get();

      const newDeduction: FixedDeduction = {
        ...data,
        id: 'fix_' + Date.now(),
        userId: authUser ? authUser.id : profile.id
      };

      set({ fixedDeductions: [...prevDeductions, newDeduction] });

      if (authUser && isSupabaseConfigured()) {
        try {
          const created = await settingsRepository.createFixedDeduction(newDeduction);
          set((state) => ({
            fixedDeductions: state.fixedDeductions.map((d) => (d.id === newDeduction.id ? created : d))
          }));
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al guardar deducción en Supabase',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    editFixedDeduction: async (id, data) => {
      const prevDeductions = get().fixedDeductions;
      set({
        fixedDeductions: prevDeductions.map((d) => (d.id === id ? { ...d, ...data } : d))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.updateFixedDeduction(id, data);
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al actualizar deducción',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    },

    deleteFixedDeduction: async (id) => {
      const prevDeductions = get().fixedDeductions;
      set({ fixedDeductions: prevDeductions.filter((d) => d.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await settingsRepository.deleteFixedDeduction(id);
        } catch (err: any) {
          set({ fixedDeductions: prevDeductions });
          get().addToast({
            type: 'error',
            title: 'Error al eliminar deducción',
            description: err?.message
          });
          return;
        }
      }

      get().recalculatePowersAndSave();
      saveCache(get());
    }
  };
};
