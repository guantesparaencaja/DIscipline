import React from 'react';
import { WifiOff, RefreshCw, Trash2 } from 'lucide-react';
import { QueuedSyncAction } from '../../lib/offlineQueue';

interface OfflineSyncSectionProps {
  offlineCount: number;
  offlineItems: QueuedSyncAction[];
  isSyncingQueue: boolean;
  onSyncOffline: () => void;
  onClearOffline: () => void;
}

export const OfflineSyncSection: React.FC<OfflineSyncSectionProps> = ({
  offlineCount,
  offlineItems,
  isSyncingQueue,
  onSyncOffline,
  onClearOffline
}) => {
  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
              Motor Offline & Cola IndexedDB
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Las acciones realizadas sin conexión se persisten en IndexedDB y se sincronizan en orden estricto sin duplicados al reconectar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSyncOffline}
            disabled={isSyncingQueue || offlineCount === 0}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all min-h-[44px] ${
              offlineCount > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-spin' : ''}`} />
            <span>{isSyncingQueue ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>

          {offlineCount > 0 && (
            <button
              onClick={onClearOffline}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Limpiar cola"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              typeof navigator !== 'undefined' && navigator.onLine ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-zinc-300">
            Conexión actual: <strong className="text-white">{typeof navigator !== 'undefined' && navigator.onLine ? 'Conectado a Internet' : 'Sin conexión (Modo Offline)'}</strong>
          </span>
        </div>

        <span className="text-zinc-400">
          Acciones en cola: <strong className={offlineCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{offlineCount} pendientes</strong>
        </span>
      </div>

      {offlineItems.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {offlineItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-[#161616] border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono"
            >
              <span className="text-zinc-200">
                {idx + 1}. {item.type.replace(/_/g, ' ')}
              </span>
              <span className="text-zinc-500">
                {new Date(item.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
