import { supabase } from '../lib/supabase';
import { UserAchievement, XPEvent } from '../types';

export const achievementsRepository = {
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Error loading user achievements:', error.message);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      achievementId: d.achievement_id,
      unlockedAt: d.unlocked_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  },

  async recordUserAchievement(
    userId: string,
    achievementId: string,
    xpReward: number,
    title: string
  ): Promise<void> {
    if (!supabase) return;

    try {
      await supabase.from('user_achievements').upsert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      });

      await supabase.from('xp_events').insert({
        user_id: userId,
        source_type: 'achievement',
        description: `Logro Desbloqueado: ${title}`,
        xp_amount: xpReward,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error recording user achievement in Supabase:', e);
    }
  },

  async getXpEvents(userId: string): Promise<XPEvent[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('xp_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      sourceType: d.source_type,
      description: d.description,
      xpAmount: Number(d.xp_amount) || 0,
      createdAt: d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  }
};
