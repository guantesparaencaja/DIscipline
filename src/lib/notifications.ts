/**
 * Notification & Reminder Service
 * Handles Web Notifications, Web Push, slot-based reminders, and nightly summaries.
 */

import { DailyObjective } from '../types';
import { getTodayDateString } from './formatters';

export interface ReminderSettings {
  enabled: boolean;
  morningEnabled: boolean;
  morningTime: string; // e.g. "08:00"
  afternoonEnabled: boolean;
  afternoonTime: string; // e.g. "14:00"
  nightEnabled: boolean;
  nightTime: string; // e.g. "20:00"
  nightSummaryEnabled: boolean;
  nightSummaryTime: string; // e.g. "21:30"
}

const STORAGE_KEY = 'sayayin_reminder_settings';
const TRIGGERED_LOG_KEY = 'sayayin_triggered_reminders_log';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  morningEnabled: true,
  morningTime: '08:00',
  afternoonEnabled: true,
  afternoonTime: '14:00',
  nightEnabled: true,
  nightTime: '20:00',
  nightSummaryEnabled: true,
  nightSummaryTime: '21:30'
};

export function getReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading reminder settings:', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
}

export function saveReminderSettings(updates: Partial<ReminderSettings>): ReminderSettings {
  const current = getReminderSettings();
  const next = { ...current, ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function showAppNotification(title: string, options?: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    // If ServiceWorker registration is available, use showNotification
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          ...options
        } as NotificationOptions & { vibrate?: number[] });
        return true;
      }
    }

    // Standard Notification fallback
    new Notification(title, {
      icon: '/icon-192.png',
      ...options
    });
    return true;
  } catch (err) {
    console.warn('Error showing notification:', err);
    return false;
  }
}

/**
 * Checks current time and triggers reminders according to user settings and active daily objectives.
 */
export async function evaluateReminders(objectives: DailyObjective[]): Promise<void> {
  const settings = getReminderSettings();
  if (!settings.enabled || getNotificationPermissionStatus() !== 'granted') {
    return;
  }

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  const todayStr = getTodayDateString();

  // Read triggered log for today
  let triggeredToday: Record<string, boolean> = {};
  try {
    const raw = localStorage.getItem(TRIGGERED_LOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr) {
        triggeredToday = parsed.slots || {};
      }
    }
  } catch (e) {}

  const todayObjs = objectives.filter((o) => o.date === todayStr);

  // 1. Morning reminder
  if (settings.morningEnabled && settings.morningTime === currentTime && !triggeredToday['morning']) {
    const pendingMorning = todayObjs.filter((o) => o.timeSlot === 'manana' && o.status !== 'completado').length;
    triggeredToday['morning'] = true;
    localStorage.setItem(TRIGGERED_LOG_KEY, JSON.stringify({ date: todayStr, slots: triggeredToday }));

    await showAppNotification('⚡ Radar Saiyajin · Turno Mañana', {
      body: pendingMorning > 0
        ? `Tienes ${pendingMorning} ${pendingMorning === 1 ? 'objetivo pendiente' : 'objetivos pendientes'} para la mañana. ¡Inicia con fuerza de guerrero!`
        : '¡Tu mañana está en orden! Sigue concentrado en tu disciplina.',
      tag: 'sayayin-morning-reminder'
    });
  }

  // 2. Afternoon reminder
  if (settings.afternoonEnabled && settings.afternoonTime === currentTime && !triggeredToday['afternoon']) {
    const pendingAfternoon = todayObjs.filter((o) => o.timeSlot === 'tarde' && o.status !== 'completado').length;
    triggeredToday['afternoon'] = true;
    localStorage.setItem(TRIGGERED_LOG_KEY, JSON.stringify({ date: todayStr, slots: triggeredToday }));

    await showAppNotification('🔥 Radar Saiyajin · Turno Tarde', {
      body: pendingAfternoon > 0
        ? `Tienes ${pendingAfternoon} ${pendingAfternoon === 1 ? 'objetivo pendiente' : 'objetivos pendientes'} para la tarde. ¡No bajes la guardia!`
        : '¡Excelente progreso en la tarde! Tu ki se mantiene elevado.',
      tag: 'sayayin-afternoon-reminder'
    });
  }

  // 3. Night reminder
  if (settings.nightEnabled && settings.nightTime === currentTime && !triggeredToday['night']) {
    const pendingNight = todayObjs.filter((o) => o.timeSlot === 'noche' && o.status !== 'completado').length;
    triggeredToday['night'] = true;
    localStorage.setItem(TRIGGERED_LOG_KEY, JSON.stringify({ date: todayStr, slots: triggeredToday }));

    await showAppNotification('🛡️ Radar Saiyajin · Turno Noche', {
      body: pendingNight > 0
        ? `Quedan ${pendingNight} ${pendingNight === 1 ? 'objetivo pendiente' : 'objetivos pendientes'} para culminar tu día en victoria.`
        : '¡Todos los objetivos de la noche están listos!',
      tag: 'sayayin-night-reminder'
    });
  }

  // 4. Nightly Summary
  if (settings.nightSummaryEnabled && settings.nightSummaryTime === currentTime && !triggeredToday['summary']) {
    const completed = todayObjs.filter((o) => o.status === 'completado').length;
    const total = todayObjs.length;
    triggeredToday['summary'] = true;
    localStorage.setItem(TRIGGERED_LOG_KEY, JSON.stringify({ date: todayStr, slots: triggeredToday }));

    await showAppNotification('🏆 Resumen Nocturno de Batalla', {
      body: `Hoy completaste ${completed} de ${total} objetivos. ¡Tu constancia forja tu libertad!`,
      tag: 'sayayin-night-summary'
    });
  }
}

/**
 * Fires an immediate demonstration notification.
 */
export async function sendTestNotification(objectives: DailyObjective[]): Promise<boolean> {
  const todayStr = getTodayDateString();
  const todayObjs = objectives.filter((o) => o.date === todayStr);
  const pending = todayObjs.filter((o) => o.status !== 'completado').length;
  const completed = todayObjs.filter((o) => o.status === 'completado').length;

  return showAppNotification('🔥 Radar Saiyajin: Notificación de Prueba', {
    body: `Hoy llevas ${completed} de ${todayObjs.length} objetivos cumplidos (${pending} pendientes). ¡Recordatorios activos!`,
    tag: 'sayayin-test-notification'
  });
}
