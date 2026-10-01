import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  CheckSquare,
  Clock,
  Sun,
  Sunset,
  Moon,
  Zap,
  PiggyBank,
  Check,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { DIFFICULTY_CONFIG, TIME_SLOT_CONFIG } from '../../lib/constants';
import { formatCOP, formatDateSpanish, getTodayDateString } from '../../lib/formatters';
import { DailyObjective, TimeSlot } from '../../types';

interface TodayObjectivesCardProps {
  onAddObjective: () => void;
}

export const TodayObjectivesCard: React.FC<TodayObjectivesCardProps> = ({ onAddObjective }) => {
  const {
    dailyObjectives,
    selectedDate,
    completeObjective,
    undoCompleteObjective,
    undoableObjective,
    reopenObjective,
    skipObjective,
    syncObjectiveToCalendar,
    syncObjectiveToTasks,
    addToast
  } = useSayayinStore();

  const [syncingId, setSyncingId] = useState<string | null>(null);

  const todayStr = getTodayDateString();
  const isViewingToday = selectedDate === todayStr;

  const currentObjectives = (dailyObjectives || []).filter((o) => o && o.date === selectedDate);
  const completedCount = currentObjectives.filter((o) => o && o.status === 'completado').length;
  const totalCount = currentObjectives.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group by time slots
  const slots: TimeSlot[] = ['manana', 'tarde', 'noche', 'personalizada'];

  const handleCalendarSync = async (obj: DailyObjective) => {
    // User confirmation modal/prompt as required by Workspace integration guidelines
    const confirm = window.confirm(
      `¿Deseas agendar en tu Google Calendar el objetivo:\n"${obj.title}"?`
    );
    if (!confirm) return;

    setSyncingId(obj.id);
    const res = await syncObjectiveToCalendar(obj.id);
    setSyncingId(null);
    if (!res.success && res.error) {
      addToast({
        type: 'error',
        title: 'Error de Google Calendar',
        description: res.error
      });
    }
  };

  const handleTasksSync = async (obj: DailyObjective) => {
    const confirm = window.confirm(
      `¿Deseas agregar a Google Tasks el objetivo:\n"${obj.title}"?`
    );
    if (!confirm) return;

    setSyncingId(obj.id);
    const res = await syncObjectiveToTasks(obj.id);
    setSyncingId(null);
    if (!res.success && res.error) {
      addToast({
        type: 'error',
        title: 'Error de Google Tasks',
        description: res.error
      });
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Entrenamiento Diario
            </span>
            <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5 font-mono">
              Objetivos del Día
            </h3>
          </div>

          <button
            onClick={onAddObjective}
            className="flex items-center gap-1.5 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* Date & Progress Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>{formatDateSpanish(selectedDate, true)}</span>
          <span className="font-mono font-bold text-zinc-200">
            {completedCount}/{totalCount} ({completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-[#FF6600] to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Objectives Grouped by Slot */}
      <div className="space-y-4 my-1 max-h-[380px] overflow-y-auto pr-1">
        {totalCount === 0 ? (
          <div className="text-center py-8 px-4 bg-[#171717] rounded-2xl border border-dashed border-zinc-800">
            <Zap className="w-8 h-8 text-[#FF6600]/60 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-zinc-300">Sin objetivos programados</h5>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {isViewingToday
                ? 'El entrenamiento del guerrero no descansa. Añade tu primera disciplina de hoy.'
                : `No registraste objetivos para el ${formatDateSpanish(selectedDate)}.`}
            </p>
            <button
              onClick={onAddObjective}
              className="mt-3 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-[#FF6600] font-bold px-3 py-1.5 rounded-xl border border-[#FF6600]/40 transition-colors"
            >
              + Generar Objetivos Diarios
            </button>
          </div>
        ) : (
          slots.map((slot) => {
            const slotObjectives = currentObjectives.filter((o) => o.timeSlot === slot);
            if (slotObjectives.length === 0) return null;

            const slotConf = TIME_SLOT_CONFIG[slot];
            let SlotIcon = Sun;
            if (slot === 'tarde') SlotIcon = Sunset;
            if (slot === 'noche') SlotIcon = Moon;
            if (slot === 'personalizada') SlotIcon = Clock;

            return (
              <div key={slot} className="space-y-2">
                {/* Slot Subheader */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                  <SlotIcon className={`w-3.5 h-3.5 ${slotConf.color}`} />
                  <span className="capitalize">{slotConf.label}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({slotConf.timeRange})</span>
                </div>

                {/* Slot Objectives List */}
                <div className="space-y-2">
                  {slotObjectives.map((obj) => {
                    const diff = DIFFICULTY_CONFIG[obj.difficulty];
                    const isDone = obj.status === 'completado';
                    const isSkipped = obj.status === 'omitido';

                    return (
                      <div
                        key={obj.id}
                        className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                            : isSkipped
                            ? 'bg-zinc-900/40 border-zinc-800/40 opacity-60'
                            : 'bg-[#181818] border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        {/* Checkbox trigger */}
                        <button
                          onClick={() => {
                            if (isDone) reopenObjective(obj.id);
                            else completeObjective(obj.id);
                          }}
                          className="mt-0.5 shrink-0 text-zinc-400 hover:text-[#FF6600] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#FF6600]"
                          title={isDone ? 'Marcar como pendiente' : 'Completar objetivo (+XP)'}
                          aria-label={isDone ? 'Marcar como pendiente' : 'Completar objetivo (+XP)'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 hover:stroke-[#FF6600]" />
                          )}
                        </button>

                        {/* Title and details */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              isDone ? 'line-through text-zinc-400' : 'text-zinc-100'
                            }`}
                          >
                            {obj.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {/* Difficulty badge */}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${diff.badgeColor}`}
                            >
                              +{obj.xpReward} XP
                            </span>

                            {/* Custom time tag */}
                            {obj.customTime && (
                              <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                🕒 {obj.customTime}
                              </span>
                            )}

                            {/* Savings Amount linked */}
                            {obj.savingAmount && obj.savingAmount > 0 && (
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <PiggyBank className="w-3 h-3" />
                                {formatCOP(obj.savingAmount)}
                              </span>
                            )}

                            {/* Google Calendar synced tag */}
                            {obj.calendarEventId && (
                              <span className="text-[9px] font-medium text-blue-400 bg-blue-950/50 border border-blue-800/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" /> G-Calendar
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons (Sync & Skip & Undo) */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          {/* 10s Undo Button */}
                          {undoableObjective?.id === obj.id && (
                            <button
                              onClick={() => undoCompleteObjective(obj.id)}
                              className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-[10px] font-bold font-mono rounded-lg flex items-center gap-1 transition-all animate-pulse shadow-lg"
                              title="Deshacer completado dentro de los 10 segundos"
                            >
                              <RotateCcw className="w-3 h-3 text-[#FF6600]" />
                              <span>Deshacer</span>
                            </button>
                          )}

                          {/* Sync to Google Calendar */}
                          <button
                            onClick={() => handleCalendarSync(obj)}
                            disabled={syncingId === obj.id}
                            title="Agendar en Google Calendar"
                            className="p-1 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Sync to Google Tasks */}
                          <button
                            onClick={() => handleTasksSync(obj)}
                            disabled={syncingId === obj.id}
                            title="Guardar en Google Tasks"
                            className="p-1 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer advice */}
      <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>El progreso es fruto exclusivo de acciones reales.</span>
        <span className="font-mono text-[#FF6600]">SAYAYIN FASE 1</span>
      </div>
    </div>
  );
};
