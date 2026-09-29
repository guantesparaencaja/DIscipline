import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { mapProfileFromDb } from './mappers';

export const profileRepository = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfileFromDb(data);
  },

  async upsertProfile(profile: Partial<Profile> & { id: string; email?: string }): Promise<void> {
    if (!supabase) return;

    const toDb: Record<string, any> = { id: profile.id };
    if (profile.email) toDb.email = profile.email;
    if (profile.displayName) toDb.display_name = profile.displayName;
    if (profile.avatarUrl !== undefined) toDb.avatar_url = profile.avatarUrl;
    if (profile.currentXp !== undefined) toDb.xp = profile.currentXp;
    if (profile.currentLevel !== undefined) toDb.level = profile.currentLevel;
    if (profile.currentStreak !== undefined) toDb.current_streak = profile.currentStreak;
    if (profile.bestStreak !== undefined) toDb.best_streak = profile.bestStreak;
    if (profile.lastActiveDate) toDb.last_active_date = profile.lastActiveDate;
    if (profile.inviteCode) toDb.invite_code = profile.inviteCode;
    if (profile.totalPower !== undefined) toDb.total_power = profile.totalPower;
    if (profile.basePower !== undefined) toDb.base_power = profile.basePower;
    if (profile.evolutionPower !== undefined) toDb.evolution_power = profile.evolutionPower;
    if (profile.financialPower !== undefined) toDb.financial_power = profile.financialPower;
    if (profile.habitsPower !== undefined) toDb.habits_power = profile.habitsPower;
    if (profile.transformation) toDb.transformation = profile.transformation;

    const { error } = await supabase.from('profiles').upsert(toDb);
    if (error) {
      throw new Error(`Error al actualizar perfil en Supabase: ${error.message}`);
    }
  },

  async updateCalculatedPowers(
    userId: string,
    powers: {
      totalPower: number;
      basePower: number;
      evolutionPower: number;
      financialPower: number;
      habitsPower: number;
      transformation: string;
      currentStreak?: number;
      bestStreak?: number;
    }
  ): Promise<void> {
    if (!supabase) return;

    const payload: Record<string, any> = {
      total_power: powers.totalPower,
      base_power: powers.basePower,
      evolution_power: powers.evolutionPower,
      financial_power: powers.financialPower,
      habits_power: powers.habitsPower,
      transformation: powers.transformation,
      updated_at: new Date().toISOString()
    };

    if (powers.currentStreak !== undefined) payload.current_streak = powers.currentStreak;
    if (powers.bestStreak !== undefined) payload.best_streak = powers.bestStreak;

    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
    if (error) {
      console.warn('Supabase updateCalculatedPowers error:', error.message);
    }
  }
};
