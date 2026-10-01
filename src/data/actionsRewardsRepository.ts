import { supabase } from '../lib/supabase';
import { ActionItem, PersonalReward, RewardRedemption } from '../types';

export const actionsRewardsRepository = {
  // 1. ACTIONS
  async getActions(userId: string): Promise<ActionItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error al cargar acciones de Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      targetType: row.target_type,
      targetId: row.target_id,
      targetTitle: row.target_title,
      xpReward: row.xp_reward,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      createdAt: row.created_at
    }));
  },

  async createAction(action: ActionItem): Promise<ActionItem> {
    if (!supabase) return action;
    const payload = {
      id: action.id.startsWith('act_') ? undefined : action.id,
      user_id: action.userId,
      title: action.title,
      description: action.description,
      target_type: action.targetType,
      target_id: action.targetId,
      target_title: action.targetTitle,
      xp_reward: action.xpReward,
      is_completed: action.isCompleted,
      completed_at: action.completedAt,
      created_at: action.createdAt
    };

    const { data, error } = await supabase.from('actions').insert(payload).select().single();
    if (error) {
      console.warn('Error al guardar acción en Supabase:', error.message);
      return action;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      targetType: data.target_type,
      targetId: data.target_id,
      targetTitle: data.target_title,
      xpReward: data.xp_reward,
      isCompleted: data.is_completed,
      completedAt: data.completed_at,
      createdAt: data.created_at
    };
  },

  async updateAction(id: string, updates: Partial<ActionItem>): Promise<void> {
    if (!supabase) return;
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.targetType !== undefined) payload.target_type = updates.targetType;
    if (updates.targetId !== undefined) payload.target_id = updates.targetId;
    if (updates.targetTitle !== undefined) payload.target_title = updates.targetTitle;
    if (updates.xpReward !== undefined) payload.xp_reward = updates.xpReward;
    if (updates.isCompleted !== undefined) payload.is_completed = updates.isCompleted;
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;

    await supabase.from('actions').update(payload).eq('id', id);
  },

  async deleteAction(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('actions').delete().eq('id', id);
  },

  // 2. REWARDS
  async getRewards(userId: string): Promise<PersonalReward[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('personal_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('cost_xp', { ascending: true });

    if (error) {
      console.warn('Error al cargar recompensas de Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      costXp: row.cost_xp,
      icon: row.icon,
      category: row.category,
      timesRedeemed: row.times_redeemed || 0,
      createdAt: row.created_at
    }));
  },

  async createReward(reward: PersonalReward): Promise<PersonalReward> {
    if (!supabase) return reward;
    const payload = {
      id: reward.id.startsWith('rew_') ? undefined : reward.id,
      user_id: reward.userId,
      title: reward.title,
      description: reward.description,
      cost_xp: reward.costXp,
      icon: reward.icon,
      category: reward.category,
      times_redeemed: reward.timesRedeemed,
      created_at: reward.createdAt
    };

    const { data, error } = await supabase.from('personal_rewards').insert(payload).select().single();
    if (error) {
      console.warn('Error al guardar recompensa en Supabase:', error.message);
      return reward;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      costXp: data.cost_xp,
      icon: data.icon,
      category: data.category,
      timesRedeemed: data.times_redeemed || 0,
      createdAt: data.created_at
    };
  },

  async updateReward(id: string, updates: Partial<PersonalReward>): Promise<void> {
    if (!supabase) return;
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.costXp !== undefined) payload.cost_xp = updates.costXp;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.timesRedeemed !== undefined) payload.times_redeemed = updates.timesRedeemed;

    await supabase.from('personal_rewards').update(payload).eq('id', id);
  },

  async deleteReward(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('personal_rewards').delete().eq('id', id);
  },

  // 3. REDEMPTIONS
  async getRedemptions(userId: string): Promise<RewardRedemption[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      rewardId: row.reward_id,
      rewardTitle: row.reward_title,
      costXp: row.cost_xp,
      redeemedAt: row.redeemed_at
    }));
  },

  async recordRedemption(redemption: RewardRedemption): Promise<RewardRedemption> {
    if (!supabase) return redemption;
    const payload = {
      user_id: redemption.userId,
      reward_id: redemption.rewardId.startsWith('rew_') ? undefined : redemption.rewardId,
      reward_title: redemption.rewardTitle,
      cost_xp: redemption.costXp,
      redeemed_at: redemption.redeemedAt
    };

    const { data, error } = await supabase.from('reward_redemptions').insert(payload).select().single();
    if (error) {
      console.warn('Error al registrar canje en Supabase:', error.message);
      return redemption;
    }

    return {
      id: data.id,
      userId: data.user_id,
      rewardId: data.reward_id,
      rewardTitle: data.reward_title,
      costXp: data.cost_xp,
      redeemedAt: data.redeemed_at
    };
  }
};
