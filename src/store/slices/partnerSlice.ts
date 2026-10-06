import { StateCreator } from 'zustand';
import { SayayinStore, PartnerSlice } from '../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { partnerRepository, profileRepository } from '../../data';
import { getInitialData, saveCache } from '../initialData';

let partnerRealtimeChannel: any = null;

export const createPartnerSlice: StateCreator<SayayinStore, [], [], PartnerSlice> = (set, get) => {
  const initial = getInitialData();

  return {
    partner: initial.partner,
    partnerLiveStatus: initial.partnerLiveStatus,

    connectPartner: async (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return { success: false, message: 'Ingresa un código de invitación válido.' };

      if (cleanCode === get().profile.inviteCode) {
        return { success: false, message: 'No puedes enlazarte con tu propio código de invitación.' };
      }

      if (!isSupabaseConfigured() || !supabase) {
        return {
          success: false,
          message: 'Configura Supabase en Configuración para vincular compañeros en tiempo real.'
        };
      }

      try {
        const partnerId = await partnerRepository.joinByCode(cleanCode);
        await get().loadPartnerData(partnerId);
        get().setupPartnerRealtime(partnerId);

        get().addToast({
          type: 'achievement',
          title: '¡Compañero Saiyajin enlazado!',
          description: 'Entrenando juntos en tiempo real.'
        });

        get().checkAchievements();
        get().recalculatePowersAndSave();
        return { success: true, message: '¡Conectado exitosamente con tu compañero!' };
      } catch (err: any) {
        return {
          success: false,
          message: err?.message || 'Código de invitación inválido o no encontrado.'
        };
      }
    },

    disconnectPartner: async () => {
      const currentPartner = get().partner;
      if (currentPartner) {
        try {
          await partnerRepository.disconnect(currentPartner.id);
        } catch {}
      }

      if (partnerRealtimeChannel && supabase) {
        try {
          supabase.removeChannel(partnerRealtimeChannel);
        } catch {}
        partnerRealtimeChannel = null;
      }

      set({ partner: null, partnerLiveStatus: 'disconnected' });
      get().addToast({
        type: 'info',
        title: 'Compañero desvinculado',
        description: 'Ahora estás entrenando en solitario.'
      });
      saveCache({ ...get(), partner: null });
    },

    loadPartnerData: async (partnerId: string) => {
      try {
        const data = await partnerRepository.loadPartnerData(partnerId);
        if (data) {
          set({ partner: data });
          saveCache(get());
        }
      } catch (e) {
        console.warn('Error al cargar datos del compañero:', e);
      }
    },

    setupPartnerRealtime: (partnerId: string) => {
      if (!supabase || !isSupabaseConfigured()) {
        set({ partnerLiveStatus: 'disconnected' });
        return;
      }

      if (partnerRealtimeChannel) {
        try {
          supabase.removeChannel(partnerRealtimeChannel);
        } catch {}
        partnerRealtimeChannel = null;
      }

      set({ partnerLiveStatus: 'connecting' });

      partnerRealtimeChannel = supabase
        .channel(`partner-realtime-${partnerId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${partnerId}`
          },
          (payload) => {
            const newProf = payload.new as any;
            if (newProf) {
              set((state) => {
                if (!state.partner) return state;
                return {
                  partner: {
                    ...state.partner,
                    displayName: newProf.display_name || state.partner.displayName,
                    avatarUrl: newProf.avatar_url || state.partner.avatarUrl,
                    currentLevel: newProf.level || state.partner.currentLevel,
                    currentXp: newProf.xp || state.partner.currentXp,
                    currentStreak: newProf.current_streak || state.partner.currentStreak,
                    totalPower: Number(newProf.total_power || state.partner.totalPower),
                    transformation: newProf.transformation || state.partner.transformation
                  }
                };
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_objectives',
            filter: `user_id=eq.${partnerId}`
          },
          (payload) => {
            const newObj = payload.new as any;
            const oldObj = payload.old as any;

            if (payload.eventType === 'UPDATE' && newObj) {
              if (newObj.status === 'completado' && oldObj?.status !== 'completado') {
                get().addToast({
                  type: 'achievement',
                  title: '¡Tu compañero/a completó un objetivo!',
                  description: newObj.title
                });
              }
            }

            get().loadPartnerData(partnerId);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ partnerLiveStatus: 'online' });
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            set({ partnerLiveStatus: 'connecting' });
          } else if (status === 'CLOSED') {
            set({ partnerLiveStatus: 'disconnected' });
          }
        });
    },

    updateGlobalPrivacySetting: async (shareGlobally: boolean) => {
      const prevProfile = get().profile;
      const updatedProfile = { ...prevProfile, shareObjectivesGlobally: shareGlobally };
      set({ profile: updatedProfile });
      get().addToast({
        type: 'info',
        title: shareGlobally ? 'Compartir objetivos activado' : 'Objetivos ocultos a compañeros',
        description: shareGlobally
          ? 'Tus objetivos marcados como visibles serán sincronizados con tu compañero.'
          : 'Tus objetivos diarios ahora son privados para tu compañero.'
      });

      const { authUser } = get();
      if (authUser && isSupabaseConfigured()) {
        try {
          await profileRepository.upsertProfile({
            id: authUser.id,
            shareObjectivesGlobally: shareGlobally
          });
        } catch (e) {
          console.warn('Error al actualizar privacidad en Supabase:', e);
        }
      }

      saveCache(get());
    }
  };
};
