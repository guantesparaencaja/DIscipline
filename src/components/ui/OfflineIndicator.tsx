import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { getOfflineQueue, getOfflineQueueCount, QueuedSyncAction, clearOfflineQueue } from '../../lib/offlineQueue';
import { useSayayinStore } from '../../store/useSayayinStore';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncedSuccess, setShowSyncedSuccess] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [queuedItems, setQueuedItems] = useState<QueuedSyncAction[]>([]);

  const { syncOfflineQueueNow } = useSayayinStore();

  const refreshQueueStatus = async () => {
    const count = await getOfflineQueueCount();
    setPendingCount(count);
    if (isDetailsOpen) {
      const items = await getOfflineQueue();
      setQueuedItems(items);
    }
  };

  useEffect(() => {
    refreshQueueStatus();

    const handleOnline = async () => {
      setIsOnline(true);
      const count = await getOfflineQueueCount();
      if (count > 0) {
        setIsSyncing(true);
        try {
          await syncOfflineQueueNow();
          setShowSyncedSuccess(true);
          setTimeout(() => setShowSyncedSuccess(false), 4000);
        } finally {
          setIsSyncing(false);
          refreshQueueStatus();
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshQueueStatus();
    };

    const handleQueueChanged = () => {
      refreshQueueStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sayayin-offline-queue-changed', handleQueueChanged);

    // Periodic check every 10s
    const interval = setInterval(refreshQueueStatus, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sayayin-offline-queue-changed', handleQueueChanged);
      clearInterval(interval);
    };
  }, [isDetailsOpen]);

  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      setSyncNotice('Aún no tienes conexión a internet.');
      setTimeout(() => setSyncNotice(null), 3000);
      return;
    }
    setIsSyncing(true);
    try {
      await syncOfflineQueueNow();
      setShowSyncedSuccess(true);
      setTimeout(() => setShowSyncedSuccess(false), 3500);
    } finally {
      setIsSyncing(false);
      refreshQueueStatus();
    }
  };

  const handleClear = async () => {
    await clearOfflineQueue();
    refreshQueueStatus();
    setIsDetailsOpen(false);
  };

  // If online, no pending items, and not showing success message, hide component
  if (isOnline && pendingCount === 0 && !isSyncing && !showSyncedSuccess) {
    return null;
  }

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300 max-w-sm">
      <div
        className={`rounded-2xl border px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all font-mono text-xs ${
          !isOnline
            ? 'bg-[#22160d]/95 border-amber-600/70 text-amber-200'
            : isSyncing
            ? 'bg-[#181824]/95 border-blue-600/70 text-blue-200'
            : showSyncedSuccess
            ? 'bg-[#0f2418]/95 border-emerald-600/70 text-emerald-200'
            : 'bg-[#1e1e1e]/95 border-zinc-700 text-zinc-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            ) : isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}

            <div>
              <span className="font-black text-xs block">
                {syncNotice
                  ? syncNotice
                  : !isOnline
                  ? `Sin conexión · ${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`
                  : isSyncing
                  ? `Sincronizando ${pendingCount} pendientes...`
                  : 'Conectado · Todo sincronizado'}
              </span>
              {!isOnline && (
                <span className="text-[10px] text-amber-300/80 block">
                  Guardado en IndexedDB. Se enviará al volver la red.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOnline && pendingCount > 0 && !isSyncing && (
              <button
                onClick={handleManualSync}
                aria-label="Sincronizar ahora"
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Sincronizar ahora"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {pendingCount > 0 && (
              <button
                onClick={() => {
                  const nextState = !isDetailsOpen;
                  setIsDetailsOpen(nextState);
                  if (nextState) {
                    getOfflineQueue().then(setQueuedItems);
                  }
                }}
                aria-label={isDetailsOpen ? 'Ocultar detalles' : 'Ver detalles de cola'}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Detailed Queue Accordion */}
        {isDetailsOpen && pendingCount > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-700/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-zinc-400 font-bold">
              <span>Acciones en cola ({queuedItems.length}):</span>
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Limpiar
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-800">
              {queuedItems.map((item, idx) => (
                <div key={item.id} className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-zinc-300 truncate">
                    {idx + 1}. {item.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-zinc-500 shrink-0 text-[10px]">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
