import {
  Profile,
  FinancialSettings,
  FixedDeduction,
  ExpenseCategory,
  Expense,
  Goal,
  Plan,
  DailyObjective,
  XPEvent,
  Achievement,
  UserAchievement,
  PartnerData,
  ToastMessage,
  TimeSlot,
  Fear,
  FearStep,
  UndoableObjective,
  Habit,
  HabitLog,
  HabitWithStats,
  ActionItem,
  PersonalReward,
  RewardRedemption
} from '../types';
import { PowerBreakdown } from '../lib/formatters';

export interface AuthSlice {
  authUser: { id: string; email: string; displayName?: string } | null;
  isAuthModalOpen: boolean;
  authLoading: boolean;
  authError: string | null;
  isSyncing: boolean;
  hasLocalDataToImport: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthError: (error: string | null) => void;
  dismissImportPrompt: () => void;
  importLocalDataToSupabase: () => Promise<{ success: boolean; count?: number; error?: string }>;
  signInWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOutFromSupabase: () => Promise<void>;
  resetSupabasePassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  initAuthListener: () => void;
  syncFromSupabase: () => Promise<void>;
  syncOfflineQueueNow: () => Promise<{ success: boolean; synced: number; failed: number }>;
  deleteAccountPermanently: () => Promise<void>;
}

export interface ProfileSlice {
  profile: Profile;
  xpEvents: XPEvent[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  getPowerBreakdown: () => PowerBreakdown;
  recalculatePowersAndSave: () => void;
  checkAchievements: () => void;
  resetToInitialDemo: () => void;
}

export interface GoalsSlice {
  goals: Goal[];
  plans: Plan[];
  actions: ActionItem[];
  addGoal: (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentSavings'>) => Promise<void>;
  editGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addPlan: (data: Omit<Plan, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editPlan: (id: string, data: Partial<Plan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  toggleMilestone: (planId: string, milestoneId: string) => Promise<void>;
  updatePlanStatus: (planId: string, status: Plan['status']) => Promise<void>;
  generateObjectivesFromPlan: (planId: string) => Promise<number>;
  generateSmartObjectivesForGoal: (goalId: string) => Promise<number>;
  addAction: (data: Omit<ActionItem, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => Promise<void>;
  toggleAction: (id: string) => Promise<void>;
  editAction: (id: string, data: Partial<ActionItem>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export interface ObjectivesSlice {
  dailyObjectives: DailyObjective[];
  undoableObjective: UndoableObjective | null;
  completeObjective: (id: string) => Promise<void>;
  undoCompleteObjective: (id: string) => Promise<void>;
  reopenObjective: (id: string) => Promise<void>;
  skipObjective: (id: string) => Promise<void>;
  generateRecurringObjectives: () => Promise<void>;
  addObjective: (data: Omit<DailyObjective, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  editObjective: (id: string, data: Partial<DailyObjective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  syncObjectiveToCalendar: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;
  syncObjectiveToTasks: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;
}

export interface FinanceSlice {
  financialSettings: FinancialSettings;
  fixedDeductions: FixedDeduction[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  getAvailableFunds: () => number;
  addExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  editExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateCategoryBudget: (categoryId: string, budgetLimit: number) => Promise<void>;
  updateFinancialSettings: (income: number, emergencyTarget: number) => Promise<void>;
  addFixedDeduction: (data: Omit<FixedDeduction, 'id' | 'userId'>) => Promise<void>;
  editFixedDeduction: (id: string, data: Partial<FixedDeduction>) => Promise<void>;
  deleteFixedDeduction: (id: string) => Promise<void>;
}

export interface HabitsSlice {
  habits: Habit[];
  habitLogs: HabitLog[];
  getHabitStats: (habitId: string) => { currentStreak: number; bestStreak: number; thirtyDayRate: number; totalCompletions: number };
  getHabitsForDate: (dateStr: string) => HabitWithStats[];
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDay: (habitId: string, dateStr: string) => Promise<void>;
}

export interface FearsSlice {
  fears: Fear[];
  addFear: (data: Omit<Fear, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<void>;
  editFear: (fearId: string, data: Partial<Fear>) => Promise<void>;
  completeFearStep: (fearId: string, stepId: string) => Promise<void>;
  reorderFearSteps: (fearId: string, newSteps: FearStep[]) => Promise<void>;
  toggleFearAction: (fearId: string, actionId: string) => Promise<void>;
  conquerFear: (fearId: string, reflection?: string) => Promise<void>;
  deleteFear: (fearId: string) => Promise<void>;
}

export interface RewardsSlice {
  personalRewards: PersonalReward[];
  rewardRedemptions: RewardRedemption[];
  addReward: (data: Omit<PersonalReward, 'id' | 'userId' | 'createdAt' | 'timesRedeemed'>) => Promise<void>;
  editReward: (id: string, data: Partial<PersonalReward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; message: string }>;
}

export interface PartnerSlice {
  partner: PartnerData | null;
  partnerLiveStatus: 'online' | 'connecting' | 'disconnected';
  connectPartner: (inviteCode: string) => Promise<{ success: boolean; message: string }>;
  disconnectPartner: () => Promise<void>;
  loadPartnerData: (partnerId: string) => Promise<void>;
  setupPartnerRealtime: (partnerId: string) => void;
  updateGlobalPrivacySetting: (shareGlobally: boolean) => Promise<void>;
}

export interface UISlice {
  toasts: ToastMessage[];
  isNivelHistorialOpen: boolean;
  selectedDate: string;
  activeTimeSlotFilter: TimeSlot | 'todos';
  isPowerModalOpen: boolean;
  isQuickObjectiveModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isGoalModalOpen: boolean;
  isConfigModalOpen: boolean;
  isHabitModalOpen: boolean;
  editingHabit: Habit | null;
  setSelectedDate: (date: string) => void;
  setActiveTimeSlotFilter: (slot: TimeSlot | 'todos') => void;
  setIsPowerModalOpen: (open: boolean) => void;
  setIsQuickObjectiveModalOpen: (open: boolean) => void;
  setIsExpenseModalOpen: (open: boolean) => void;
  setIsGoalModalOpen: (open: boolean) => void;
  setIsConfigModalOpen: (open: boolean) => void;
  setIsHabitModalOpen: (open: boolean) => void;
  setEditingHabit: (habit: Habit | null) => void;
  setIsNivelHistorialOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
}

export type SayayinStore = AuthSlice &
  ProfileSlice &
  GoalsSlice &
  ObjectivesSlice &
  FinanceSlice &
  HabitsSlice &
  FearsSlice &
  RewardsSlice &
  PartnerSlice &
  UISlice;
