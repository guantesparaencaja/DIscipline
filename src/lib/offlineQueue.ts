/**
 * Offline Sync Queue backed by IndexedDB
 * Persists offline actions and syncs in order without duplicates.
 */

export interface QueuedSyncAction {
  id: string;
  dedupKey: string;
  type:
    | 'complete_objective'
    | 'add_objective'
    | 'delete_objective'
    | 'toggle_habit'
    | 'add_habit'
    | 'add_expense'
    | 'delete_expense'
    | 'add_goal'
    | 'delete_goal'
    | 'add_plan'
    | 'update_plan_status'
    | 'add_action'
    | 'toggle_action'
    | 'complete_fear_step'
    | 'add_fear'
    | 'redeem_reward'
    | 'update_profile';
  payload: any;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = 'sayayin_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'sync_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('dedupKey', 'dedupKey', { unique: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function notifyQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sayayin-offline-queue-changed'));
  }
}

export async function enqueueOfflineAction(
  action: Omit<QueuedSyncAction, 'id' | 'createdAt' | 'retryCount'>
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Dedup check: query all to find if dedupKey already exists
    const allActions = await new Promise<QueuedSyncAction[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const existing = allActions.find((a) => a.dedupKey === action.dedupKey);

    const queuedItem: QueuedSyncAction = {
      id: existing ? existing.id : 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      dedupKey: action.dedupKey,
      type: action.type,
      payload: action.payload,
      createdAt: existing ? existing.createdAt : Date.now(),
      retryCount: existing ? existing.retryCount + 1 : 0
    };

    store.put(queuedItem);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    notifyQueueChange();
  } catch (err) {
    console.warn('[OfflineQueue] Error al encolar acción en IndexedDB:', err);
  }
}

export async function getOfflineQueue(): Promise<QueuedSyncAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const actions = await new Promise<QueuedSyncAction[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    // Chronological order
    return actions.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.warn('[OfflineQueue] Error al leer cola IndexedDB:', err);
    return [];
  }
}

export async function getOfflineQueueCount(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise<number>((resolve, reject) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return 0;
  }
}

export async function removeOfflineAction(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    notifyQueueChange();
  } catch (err) {
    console.warn('[OfflineQueue] Error al eliminar acción de cola:', err);
  }
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    notifyQueueChange();
  } catch (err) {
    console.warn('[OfflineQueue] Error al limpiar cola:', err);
  }
}
