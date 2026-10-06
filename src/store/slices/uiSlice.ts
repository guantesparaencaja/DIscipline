import { StateCreator } from 'zustand';
import { SayayinStore, UISlice } from '../types';
import { ToastMessage } from '../../types';
import { getTodayDateString } from '../../lib/formatters';

export const createUISlice: StateCreator<SayayinStore, [], [], UISlice> = (set) => ({
  toasts: [],
  isNivelHistorialOpen: false,
  selectedDate: getTodayDateString(),
  activeTimeSlotFilter: 'todos',
  isPowerModalOpen: false,
  isQuickObjectiveModalOpen: false,
  isExpenseModalOpen: false,
  isGoalModalOpen: false,
  isConfigModalOpen: false,
  isHabitModalOpen: false,
  editingHabit: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveTimeSlotFilter: (slot) => set({ activeTimeSlotFilter: slot }),
  setIsPowerModalOpen: (open) => set({ isPowerModalOpen: open }),
  setIsQuickObjectiveModalOpen: (open) => set({ isQuickObjectiveModalOpen: open }),
  setIsExpenseModalOpen: (open) => set({ isExpenseModalOpen: open }),
  setIsGoalModalOpen: (open) => set({ isGoalModalOpen: open }),
  setIsConfigModalOpen: (open) => set({ isConfigModalOpen: open }),
  setIsHabitModalOpen: (open) => set({ isHabitModalOpen: open }),
  setEditingHabit: (habit) => set({ editingHabit: habit }),
  setIsNivelHistorialOpen: (open) => set({ isNivelHistorialOpen: open }),

  addToast: (toast) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id, timestamp: Date.now() };
    set((state) => ({ toasts: [newToast, ...state.toasts.slice(0, 4)] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 6000);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  }
});
