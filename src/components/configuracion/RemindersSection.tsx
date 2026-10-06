import React from 'react';
import { Bell, Sun, Sunset, Moon, Clock } from 'lucide-react';
import { ReminderSettings } from '../../lib/notifications';

interface RemindersSectionProps {
  reminders: ReminderSettings;
  permStatus: NotificationPermission;
  testingNotification: boolean;
  onRequestPermission: () => void;
  onTestNotification: () => void;
  onUpdateReminders: (updates: Partial<ReminderSettings>) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  reminders,
  permStatus,
  testingNotification,
  onRequestPermission,
  onTestNotification,
  onUpdateReminders
}) => {
  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
              Recordatorios por Horario & Web Push
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Avisos locales y Web Push que te alertan cuántos objetivos restan por franja horaria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permStatus !== 'granted' && (
            <button
              type="button"
              onClick={onRequestPermission}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition-colors min-h-[44px]"
            >
              Solicitar Permiso Push
            </button>
          )}

          <button
            type="button"
            disabled={testingNotification}
            onClick={onTestNotification}
            className="px-3.5 py-2 bg-[#252525] hover:bg-[#303030] text-zinc-200 border border-zinc-700/60 font-bold text-xs rounded-xl font-mono transition-colors min-h-[44px]"
          >
            Probar Notificación
          </button>
        </div>
      </div>

      {/* Master Switch & Status */}
      <div className="bg-[#161616] p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-white block font-mono">
            Notificaciones del Radar Activas
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            Estado en navegador: <strong className={permStatus === 'granted' ? 'text-emerald-400' : 'text-amber-400'}>
              {permStatus === 'granted' ? 'Permiso Concedido' : permStatus === 'denied' ? 'Permiso Denegado' : 'Sin solicitar'}
            </strong>
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={reminders.enabled}
            onChange={(e) => onUpdateReminders({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6600]"></div>
        </label>
      </div>

      {/* Franjas Horarias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
        {/* Mañana */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" /> Turno Mañana
            </span>
            <input
              type="checkbox"
              checked={reminders.morningEnabled}
              onChange={(e) => onUpdateReminders({ morningEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#FF6600] rounded"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Notifica cuántos objetivos matutinos tienes pendientes.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="time"
              value={reminders.morningTime}
              onChange={(e) => onUpdateReminders({ morningTime: e.target.value })}
              className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
            />
          </div>
        </div>

        {/* Tarde */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sunset className="w-4 h-4 text-orange-400" /> Turno Tarde
            </span>
            <input
              type="checkbox"
              checked={reminders.afternoonEnabled}
              onChange={(e) => onUpdateReminders({ afternoonEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#FF6600] rounded"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Notifica cuántos objetivos vespertinos faltan por cumplir.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="time"
              value={reminders.afternoonTime}
              onChange={(e) => onUpdateReminders({ afternoonTime: e.target.value })}
              className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
            />
          </div>
        </div>

        {/* Noche */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-400" /> Turno Noche
            </span>
            <input
              type="checkbox"
              checked={reminders.nightEnabled}
              onChange={(e) => onUpdateReminders({ nightEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#FF6600] rounded"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Recordatorio final para cerrar las disciplinas nocturnas.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="time"
              value={reminders.nightTime}
              onChange={(e) => onUpdateReminders({ nightTime: e.target.value })}
              className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resumen Nocturno Opcional */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171720] to-[#161616] border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="space-y-1">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-purple-400" /> Resumen Nocturno de Cierre
          </span>
          <p className="text-[11px] text-zinc-400">
            Emite el reporte diario: <strong className="text-zinc-200">"Hoy completaste X de Y objetivos"</strong> al terminar tu día.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            type="time"
            value={reminders.nightSummaryTime}
            onChange={(e) => onUpdateReminders({ nightSummaryTime: e.target.value })}
            className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
          />
          <input
            type="checkbox"
            checked={reminders.nightSummaryEnabled}
            onChange={(e) => onUpdateReminders({ nightSummaryEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#FF6600] rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
