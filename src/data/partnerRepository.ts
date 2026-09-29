import { supabase } from '../lib/supabase';
import { PartnerData, PartnerObjective } from '../types';
import { getTodayDateString } from '../lib/formatters';

export const partnerRepository = {
  /**
   * Calls SQL join_by_code function
   */
  async joinByCode(code: string): Promise<string> {
    if (!supabase) throw new Error('Supabase no está configurado.');

    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await supabase.rpc('join_by_code', { code: cleanCode });

    if (error) {
      throw new Error(error.message || 'Error al conectar con el código.');
    }

    if (!data) {
      throw new Error('No se recibió el identificador del compañero.');
    }

    return typeof data === 'string' ? data : (data as any).partner_id || String(data);
  },

  /**
   * Disconnects partner in database
   */
  async disconnect(partnerId: string): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.rpc('disconnect_partner', { target_partner_id: partnerId });
    } catch (e) {
      // Fallback direct delete
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from('connections')
          .delete()
          .or(`user_a.eq.${userData.user.id},user_b.eq.${userData.user.id}`);
      }
    }
  },

  /**
   * Finds the connected partner ID for a user
   */
  async getConnectedPartnerId(userId: string): Promise<string | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('connections')
      .select('user_a, user_b')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.user_a === userId ? data.user_b : data.user_a;
  },

  /**
   * Loads full partner data respecting privacy:
   * Only public profile and visible objectives for today are queried.
   * Personal expenses, financials, and goals are NEVER touched.
   */
  async loadPartnerData(partnerId: string): Promise<PartnerData | null> {
    if (!supabase) return null;

    // 1. Fetch partner public profile
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, xp, current_streak, total_power, transformation, created_at')
      .eq('id', partnerId)
      .maybeSingle();

    if (profileErr || !profileData) {
      return null;
    }

    const today = getTodayDateString();

    // 2. Fetch partner's visible objectives for today
    const { data: objectivesData } = await supabase
      .from('daily_objectives')
      .select('id, title, slot, custom_time, difficulty, status, completed_at')
      .eq('user_id', partnerId)
      .eq('date', today)
      .eq('is_partner_visible', true)
      .order('created_at', { ascending: true });

    // 3. Count partner achievements
    const { count: achievementsCount } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', partnerId);

    const partnerObjectives: PartnerObjective[] = (objectivesData || []).map((o: any) => ({
      id: o.id,
      title: o.title,
      timeSlot: o.slot || 'manana',
      customTime: o.custom_time,
      difficulty: o.difficulty || 'normal',
      status: o.status || 'pendiente',
      completedAt: o.completed_at
    }));

    return {
      id: profileData.id,
      displayName: profileData.display_name || 'Compañero Saiyajin',
      avatarUrl: profileData.avatar_url,
      currentLevel: profileData.level || 1,
      transformation: profileData.transformation || 'base',
      currentXp: profileData.xp || 0,
      currentStreak: profileData.current_streak || 0,
      totalPower: Number(profileData.total_power || 0),
      totalAchievements: achievementsCount || 0,
      connectedSince: profileData.created_at ? profileData.created_at.split('T')[0] : today,
      todayObjectives: partnerObjectives,
      weeklyXp: profileData.xp || 0,
      weeklyStreak: profileData.current_streak || 0
    };
  }
};
