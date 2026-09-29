import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  CheckSquare,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Sun,
  Sunset,
  Moon,
  Clock,
  Trash2,
  Zap,
  Sparkles,
  PiggyBank,
  RotateCcw
} from 'lucide-react';
import { DIFFICULTY_CONFIG, TIME_SLOT_CONFIG, SMART_OBJECTIVE_TEMPLATES } from '../../lib/constants';
import { formatCOP, formatDateSpanish, getTodayDateString } from '../../lib/formatters';
import { DailyObjective, TimeSlot } from '../../types';

interface ObjetivosViewProps {
  onOpenObjectiveModal: () => void;
}

export const ObjetivosView: React.FC<ObjetivosViewProps> = ({ onOpenObjectiveModal }) => {
  const {
    dailyObjectives,
    selectedDate,
    setSelectedDate,
    completeObjective,
    undoCompleteObjective,
    undoableObjective,
    reopenObjective,
    deleteObjective,
    syncObjectiveToCalendar,
    syncObjectiveToTasks,
    addToast
  } = useSayayinStore();

  const [activeSlotFilter, setActiveSlotFilter] = useState<TimeSlot | 'todos'>('todos');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'todos' | 'pendientes' | 'completados'>('todos');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Filter objectives
  const safeObjectives = dailyObjectives || [];
  const filteredObjectives = safeObjectives.filter((obj) => {
    if (!obj) return false;
    const matchesDate = obj.date === selectedDate;
    const matchesSlot = activeSlotFilter === 'todos' || obj.timeSlot === activeSlotFilter;
    const matchesStatus =
      activeStatusFilter === 'todos' ||
      (activeStatusFilter === 'pendientes' && obj.status !== 'completado') ||
      (activeStatusFilter === 'completados' && obj.status === 'completado');

    return matchesDate && matchesSlot && matchesStatus;
  });

  const handleCalendarSync = async (obj: DailyObjective) => {
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
      `¿Deseas sincronizar en Google Tasks el objetivo:\n"${obj.title}"?`
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
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Rutina & Horarios
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <CheckSquare className="w-6 h-6 text-[#FF6600]" />
            Objetivos Diarios & Hábitos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Programados por franja horaria (Mañana, Tarde, Noche). Otorga Ki (+XP) únicamente por hechos consumados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#222] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6600]"
          />

          <button
            onClick={onOpenObjectiveModal}
            className="flex items-center gap-2 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Objetivo</span>
          </button>
        </div>
      </div>

      {/* 2. Slot Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1e1e] p-2.5 rounded-2xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveSlotFilter('todos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSlotFilter === 'todos'
                ? 'bg-[#FF6600] text-black shadow-md'
                : 'bg-[#171717] text-zinc-400 hover:text-white'
            }`}
          >
            Todas las franjas
          </button>

          <button
            onClick={() => setActiveSlotFilter('manana')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSlotFilter === 'manana'
                ? 'bg-[#FF6600] text-black shadow-md'
                : 'bg-[#171717] text-zinc-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Mañana</span>
          </button>

          <button
            onClick={() => setActiveSlotFilter('tarde')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSlotFilter === 'tarde'
                ? 'bg-[#FF6600] text-black shadow-md'
                : 'bg-[#171717] text-zinc-400 hover:text-white'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-orange-400" />
            <span>Tarde</span>
          </button>

          <button
            onClick={() => setActiveSlotFilter('noche')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeSlotFilter === 'noche'
                ? 'bg-[#FF6600] text-black shadow-md'
                : 'bg-[#171717] text-zinc-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Noche</span>
          </button>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 text-xs bg-[#141414] p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveStatusFilter('todos')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              activeStatusFilter === 'todos' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveStatusFilter('pendientes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              activeStatusFilter === 'pendientes' ? 'bg-[#FF6600] text-black font-bold' : 'text-zinc-400'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveStatusFilter('completados')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              activeStatusFilter === 'completados' ? 'bg-emerald-600 text-white' : 'text-zinc-400'
            }`}
          >
            Completados
          </button>
        </div>
      </div>

      {/* 3. Objectives List */}
      <div className="space-y-3">
        {filteredObjectives.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl">
            <Zap className="w-12 h-12 text-[#FF6600]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">
              No hay objetivos para {formatDateSpanish(selectedDate)}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              Mantén el fuego de tu entrenamiento vivo. Agrega tus disciplinas matutinas o vespertinas.
            </p>
            <button
              onClick={onOpenObjectiveModal}
              className="bg-[#FF6600] text-black font-bold text-xs px-4 py-2 rounded-xl"
            >
              + Agregar Objetivo con Horario
            </button>
          </div>
        ) : (
          filteredObjectives.map((obj) => {
            const diff = DIFFICULTY_CONFIG[obj.difficulty];
            const slotConf = TIME_SLOT_CONFIG[obj.timeSlot];
            const isDone = obj.status === 'completado';

            return (
              <div
                key={obj.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
                  isDone
                    ? 'bg-[#18231c]/60 border-emerald-800/40 opacity-80'
                    : 'bg-[#1e1e1e] border-[#2b2b2b] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      if (isDone) reopenObjective(obj.id);
                      else completeObjective(obj.id);
                    }}
                    className="mt-1 shrink-0 text-zinc-400 hover:text-[#FF6600] transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6 hover:stroke-[#FF6600]" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        isDone ? 'line-through text-zinc-400' : 'text-white'
                      }`}
                    >
                      {obj.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                      {/* Franja tag */}
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        🕒 {slotConf.label} ({obj.customTime || slotConf.timeRange})
                      </span>

                      {/* Difficulty tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${diff.badgeColor}`}
                      >
                        +{obj.xpReward} XP
                      </span>

                      {/* Ahorro vinculado */}
                      {obj.savingAmount && obj.savingAmount > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <PiggyBank className="w-3 h-3" />
                          Ahorro: {formatCOP(obj.savingAmount)}
                        </span>
                      )}

                      {/* Recurrencia */}
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {obj.recurrence === 'diaria' ? '🔁 Diario' : '📌 Una vez'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Icons & Undo Button */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {undoableObjective?.id === obj.id && (
                    <button
                      onClick={() => undoCompleteObjective(obj.id)}
                      className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-[10px] font-bold font-mono rounded-lg flex items-center gap-1 transition-all animate-pulse shadow-lg"
                      title="Deshacer completado dentro de los 10 segundos"
                    >
                      <RotateCcw className="w-3 h-3 text-[#FF6600]" />
                      <span>Deshacer</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCalendarSync(obj)}
                    disabled={syncingId === obj.id}
                    title="Agendar en Google Calendar"
                    className="flex items-center gap-1 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-blue-400 border border-blue-900/50 px-2.5 py-1.5 rounded-xl transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Calendar</span>
                  </button>

                  <button
                    onClick={() => handleTasksSync(obj)}
                    disabled={syncingId === obj.id}
                    title="Sincronizar en Google Tasks"
                    className="flex items-center gap-1 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-emerald-400 border border-emerald-900/50 px-2.5 py-1.5 rounded-xl transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tasks</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar el objetivo: "${obj.title}"?`)) {
                        deleteObjective(obj.id);
                      }
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Eliminar objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
