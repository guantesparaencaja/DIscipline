import { StateCreator } from 'zustand';
import confetti from 'canvas-confetti';
import { SayayinStore, RewardsSlice } from '../types';
import { PersonalReward, RewardRedemption, XPEvent } from '../../types';
import { getTodayDateString } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { actionsRewardsRepository } from '../../data';
import { getInitialData, saveCache } from '../initialData';

export const createRewardsSlice: StateCreator<SayayinStore, [], [], RewardsSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    personalRewards: initial.personalRewards,
    rewardRedemptions: initial.rewardRedemptions,

    addReward: async (data) => {
      const prevRewards = get().personalRewards || [];
      const { authUser, profile } = get();

      const newReward: PersonalReward = {
        ...data,
        id: 'rew_' + Date.now(),
        userId: authUser ? authUser.id : profile.id,
        timesRedeemed: 0,
        createdAt: getTodayDateString()
      };

      set({ personalRewards: [...prevRewards, newReward] });
      get().addToast({
        type: 'success',
        title: 'Recompensa personal creada',
        description: `${newReward.title} (${newReward.costXp} XP)`
      });

      const { authUser: currentAuth } = get();
      if (currentAuth && isSupabaseConfigured()) {
        try {
          const created = await actionsRewardsRepository.createReward(newReward);
          set((state) => ({
            personalRewards: state.personalRewards.map((r) => (r.id === newReward.id ? created : r))
          }));
        } catch (err: any) {
          console.warn('Supabase createReward warning:', err);
        }
      }

      saveCache(get());
    },

    editReward: async (id, data) => {
      const prevRewards = get().personalRewards || [];
      set({
        personalRewards: prevRewards.map((r) => (r.id === id ? { ...r, ...data } : r))
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.updateReward(id, data);
        } catch (err: any) {
          console.warn('Supabase updateReward warning:', err);
        }
      }

      saveCache(get());
    },

    deleteReward: async (id) => {
      const prevRewards = get().personalRewards || [];
      set({ personalRewards: prevRewards.filter((r) => r.id !== id) });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.deleteReward(id);
        } catch (err: any) {
          console.warn('Supabase deleteReward warning:', err);
        }
      }

      saveCache(get());
    },

    redeemReward: async (rewardId) => {
      const prevProfile = get().profile;
      const rewards = get().personalRewards || [];
      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward) return { success: false, message: 'Recompensa no encontrada' };

      const available = prevProfile.availableXp ?? prevProfile.currentXp ?? 0;
      if (available < reward.costXp) {
        get().addToast({
          type: 'warning',
          title: 'XP Disponible Insuficiente',
          description: `Necesitas ${reward.costXp} XP disponible. Actualmente tienes ${available} XP.`
        });
        return { success: false, message: 'XP insuficiente' };
      }

      // IMPORTANTE: el canje descuenta XP disponible sin bajar el nivel
      const newAvailable = available - reward.costXp;
      const now = new Date().toISOString();

      const redemption: RewardRedemption = {
        id: 'red_' + Date.now(),
        userId: prevProfile.id,
        rewardId: reward.id,
        rewardTitle: reward.title,
        costXp: reward.costXp,
        redeemedAt: now
      };

      const xpEvent: XPEvent = {
        id: 'xp_' + Date.now(),
        userId: prevProfile.id,
        sourceType: 'reward_redemption',
        description: `Canje de recompensa: ${reward.title} (-${reward.costXp} XP disponible)`,
        xpAmount: -reward.costXp,
        createdAt: getTodayDateString()
      };

      set((state) => ({
        profile: { ...state.profile, availableXp: newAvailable },
        personalRewards: state.personalRewards.map((r) =>
          r.id === rewardId ? { ...r, timesRedeemed: (r.timesRedeemed || 0) + 1 } : r
        ),
        rewardRedemptions: [redemption, ...state.rewardRedemptions],
        xpEvents: [xpEvent, ...state.xpEvents]
      }));

      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      get().addToast({
        type: 'success',
        title: '¡Recompensa Canjeada!',
        description: `Disfruta: "${reward.title}". Tu Nivel ${prevProfile.currentLevel} se mantiene intacto.`
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await actionsRewardsRepository.recordRedemption(redemption);
          await actionsRewardsRepository.updateReward(reward.id, {
            timesRedeemed: (reward.timesRedeemed || 0) + 1
          });
        } catch (err: any) {
          console.warn('Supabase recordRedemption warning:', err);
        }
      }

      saveCache(get());

      return { success: true, message: 'Canje exitoso' };
    }
  };
};
