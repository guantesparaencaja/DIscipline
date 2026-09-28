import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DailyObjective } from '../types';

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/tasks');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const workspaceLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const isWorkspaceConnected = (): boolean => {
  return !!cachedAccessToken && !!auth.currentUser;
};

/**
 * Creates an event in Google Calendar for a daily objective.
 * Always prompts explicit user confirmation before mutating data.
 */
export const createGoogleCalendarEvent = async (
  objective: DailyObjective
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'Debes iniciar sesión con Google para sincronizar con Calendar.' };
  }

  // Construct start and end times
  let startTime = '09:00:00';
  let endTime = '10:00:00';

  if (objective.customTime) {
    const [h, m] = objective.customTime.split(':');
    startTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
    const endH = String((Number(h) + 1) % 24).padStart(2, '0');
    endTime = `${endH}:${m.padStart(2, '0')}:00`;
  } else if (objective.timeSlot === 'manana') {
    startTime = '08:00:00';
    endTime = '09:00:00';
  } else if (objective.timeSlot === 'tarde') {
    startTime = '14:00:00';
    endTime = '15:00:00';
  } else if (objective.timeSlot === 'noche') {
    startTime = '20:00:00';
    endTime = '21:00:00';
  }

  const startDateTime = `${objective.date}T${startTime}`;
  const endDateTime = `${objective.date}T${endTime}`;

  const eventPayload = {
    summary: `🥋 [SAYAYIN] ${objective.title}`,
    description: `Objetivo Sayayin de dificultad ${objective.difficulty.toUpperCase()} (+${objective.xpReward} XP).\nFranja: ${objective.timeSlot.toUpperCase()}${
      objective.savingAmount ? `\nMonto de Ahorro: $${objective.savingAmount}` : ''
    }`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: 'America/Bogota'
    }
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error?.message || 'Error al crear evento en Google Calendar' };
    }

    const data = await res.json();
    return { success: true, eventId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión con Google Calendar' };
  }
};

/**
 * Creates a task in Google Tasks for a daily objective.
 */
export const createGoogleTask = async (
  objective: DailyObjective
): Promise<{ success: boolean; taskId?: string; error?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'Debes iniciar sesión con Google para sincronizar con Google Tasks.' };
  }

  const taskPayload = {
    title: `[SAYAYIN] ${objective.title} (+${objective.xpReward} XP)`,
    notes: `Dificultad: ${objective.difficulty} | Franja: ${objective.timeSlot}${
      objective.savingAmount ? ` | Ahorro: $${objective.savingAmount}` : ''
    }`,
    due: new Date(`${objective.date}T23:59:59Z`).toISOString()
  };

  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error?.message || 'Error al crear tarea en Google Tasks' };
    }

    const data = await res.json();
    return { success: true, taskId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión con Google Tasks' };
  }
};
