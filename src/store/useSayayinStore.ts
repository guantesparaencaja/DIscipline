import { create } from 'zustand';
import { SayayinStore } from './types';
import { createAuthSlice } from './slices/authSlice';
import { createProfileSlice } from './slices/profileSlice';
import { createGoalsSlice } from './slices/goalsSlice';
import { createObjectivesSlice } from './slices/objectivesSlice';
import { createFinanceSlice } from './slices/financeSlice';
import { createHabitsSlice } from './slices/habitsSlice';
import { createFearsSlice } from './slices/fearsSlice';
import { createRewardsSlice } from './slices/rewardsSlice';
import { createPartnerSlice } from './slices/partnerSlice';
import { createUISlice } from './slices/uiSlice';

export const useSayayinStore = create<SayayinStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createProfileSlice(...a),
  ...createGoalsSlice(...a),
  ...createObjectivesSlice(...a),
  ...createFinanceSlice(...a),
  ...createHabitsSlice(...a),
  ...createFearsSlice(...a),
  ...createRewardsSlice(...a),
  ...createPartnerSlice(...a),
  ...createUISlice(...a)
}));

export * from './types';
