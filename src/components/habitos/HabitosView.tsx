import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Clock,
  Zap,
  Edit2,
  Trash2,
  Trophy,
  Filter,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Habit, TimeSlot } from '../../types';
import { HabitModal } from './HabitModal';
import {
  formatDateSpanish,
  getTodayDateString,
  isHabitDueOnDate
} from '../../lib/formatters';

const DAYS_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const HabitosView: React.FC = () => {
  const store = useSayayinStore();
  const {
    habits = [],
    habitLogs = [],
    toggleHabitDay,
    deleteHabit,
    getHabitsForDate,
    getHabitStats,
    getPowerBreakdown
  } = store;

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [filterSlot, setFilterSlot] = useState<TimeSlot | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'dia' | 'todos'>('dia');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Delete Confirmation State
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const powerBreakdown = getPowerBreakdown();
  const habitsPower = powerBreakdown.habitsPower;

  // Active habits list
  const activeHabits = habits.filter((h) => h.isActive);

  // Habits scheduled for selected date
  const scheduledForSelectedDay = getHabitsForDate(selectedDate);
  const completedSelectedDayCount = scheduledForSelectedDay.filter((h) => h.completedToday).length;

  // Calculate highest current streak among all active habits
  const highestStreak = activeHabits.reduce((max, h) => {
    const stats = getHabitStats(h.id);
    return Math.max(max, stats.currentStreak);
  }, 0);

  // Filter list by time slot
  const displayedHabits = (viewMode === 'dia' ? scheduledForSelectedDay : activeHabits)
    .filter((h) => filterSlot === 'todos' || h.timeSlot === filterSlot);

  // Day navigation helpers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, (d || 1) - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, (d || 1) + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  const formatFrequencyLabel = (habit: Habit): string => {
    if (habit.frequency === 'diaria') return 'Todos los días';
    if (habit.frequency === 'semanal') {
      const day = habit.customDays?.[0] ?? 1;
      return `Semanal (${DAYS_NAMES[day]})`;
    }
    if (habit.frequency === 'personalizada') {
      const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return (habit.customDays || []).map((d) => shortDays[d]).join(', ');
    }
    return 'Diario';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Hero Banner: Ki de Hábitos & Métricas */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1c1815] via-[#1a1714] to-[#241a12] border border-[#3e2b1f] rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30 flex items-center gap-1 font-mono">
                <Flame className="w-3 h-3" />
                Disciplina Saiyajin
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {activeHabits.length} hábitos en entrenamiento
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              Radar de Hábitos Diarios
            </h1>
            <p className="text-xs text-zinc-300 max-w-xl">
              Completar tus hábitos eleva tu <span className="text-amber-400 font-bold">Poder de Hábitos</span>, impulsa tu Poder Total y acelera tu transformación hacia el Ultra Instinto.
            </p>
          </div>

          {/* Action Button & Power Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#121212]/90 border border-amber-500/30 rounded-2xl px-4 py-3 min-w-[150px]">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
                <span>Poder de Hábitos</span>
                <span className="text-amber-400 font-bold">{habitsPower} / 100</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#FF6600] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, habitsPower)}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF6600] to-orange-500 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Hábito</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Tactical Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-zinc-800 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#FF6600] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
              Cumplimiento Hoy
            </span>
            <div className="text-base font-black text-white font-mono">
              {completedSelectedDayCount} / {scheduledForSelectedDay.length}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-zinc-800 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
              Mayor Racha Activa
            </span>
            <div className="text-base font-black text-white font-mono">
              🔥 {highestStreak} {highestStreak === 1 ? 'día' : 'días'}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-zinc-800 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
              Tasa 30 Días
            </span>
            <div className="text-base font-black text-white font-mono">
              {powerBreakdown.habitsBreakdown?.thirtyDayCompletionRate ?? 0}%
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-zinc-800 flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
              Poder de Ki
            </span>
            <div className="text-base font-black text-amber-400 font-mono">
              +{habitsPower} Ki
            </div>
          </div>
        </div>
      </div>

      {/* 3. Date Navigator & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#181818] border border-zinc-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Day Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 font-mono text-xs text-white">
              <CalendarIcon className="w-3.5 h-3.5 text-[#FF6600]" />
              <span className="font-bold">
                {selectedDate === todayStr ? 'Hoy, ' : ''}
                {formatDateSpanish(selectedDate, true)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-bold text-[#FF6600] hover:underline px-2"
              >
                Volver a Hoy
              </button>
            )}
          </div>

          {/* Mode Switch: "Hábitos del Día" vs "Todos los Hábitos" */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dia'
                  ? 'bg-[#FF6600] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Programados Hoy ({scheduledForSelectedDay.length})
            </button>
            <button
              onClick={() => setViewMode('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'todos'
                  ? 'bg-[#FF6600] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({activeHabits.length})
            </button>
          </div>
        </div>

        {/* TimeSlot Filter Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            Franja:
          </span>
          {[
            { id: 'todos', label: 'Todas las Franjas' },
            { id: 'manana', label: 'Mañana' },
            { id: 'tarde', label: 'Tarde' },
            { id: 'noche', label: 'Noche' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterSlot(item.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                filterSlot === item.id
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Habits List */}
      {displayedHabits.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#181818] border border-dashed border-zinc-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Flame className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">
              {viewMode === 'dia'
                ? 'No hay hábitos programados para este día'
                : 'No tienes hábitos activos en esta franja'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {viewMode === 'dia'
                ? 'Los hábitos semanales y personalizados solo aparecen los días asignados en su configuración de combate.'
                : 'Crea tu primer hábito para comenzar a registrar disciplina y desbloquear transformaciones.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            {viewMode === 'dia' && (
              <button
                onClick={() => setViewMode('todos')}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
              >
                Ver todos los hábitos
              </button>
            )}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#FF6600] hover:bg-orange-500 text-black text-xs font-black uppercase tracking-wider transition-all"
            >
              Crear Nuevo Hábito
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedHabits.map((habit) => {
            const stats = getHabitStats(habit.id);
            const isCompleted = habitLogs.some(
              (l) => l.habitId === habit.id && l.date === selectedDate && l.completed
            );
            const isDueToday = isHabitDueOnDate(habit, selectedDate);

            return (
              <div
                key={habit.id}
                className={`relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between gap-4 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#1c1a17] to-[#151515] border-[#FF6600]/40 shadow-lg shadow-[#FF6600]/5'
                    : 'bg-[#181818] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Top: Checkbox + Title + Actions */}
                <div className="flex items-start gap-3.5">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleHabitDay(habit.id, selectedDate)}
                    className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-[#FF6600] text-black shadow-md shadow-[#FF6600]/40 hover:scale-105'
                        : 'border-2 border-zinc-600 hover:border-[#FF6600] text-transparent hover:text-zinc-500'
                    }`}
                    title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${isCompleted ? 'stroke-[2.5]' : ''}`}
                    />
                  </button>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold font-mono transition-all ${
                          isCompleted ? 'text-white line-through decoration-[#FF6600]' : 'text-zinc-100'
                        }`}
                      >
                        {habit.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        +{habit.xpReward} XP
                      </span>
                    </div>

                    {habit.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {habit.description}
                      </p>
                    )}

                    {/* Tags: Frequency, TimeSlot, Optional Time */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 font-medium">
                        {formatFrequencyLabel(habit)}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 capitalize flex items-center gap-1 font-medium">
                        {habit.timeSlot === 'manana' && <Sun className="w-3 h-3 text-amber-400" />}
                        {habit.timeSlot === 'tarde' && <Sunset className="w-3 h-3 text-orange-400" />}
                        {habit.timeSlot === 'noche' && <Moon className="w-3 h-3 text-indigo-400" />}
                        {habit.timeSlot}
                      </span>
                      {habit.optionalTime && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                          <Clock className="w-3 h-3" />
                          {habit.optionalTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Editar hábito"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setHabitToDelete(habit)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Eliminar hábito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom: Real Statistics Bar (Racha, Mejor Racha, 30-day rate) */}
                <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center bg-zinc-900/40 -mx-5 -mb-5 px-5 py-3 rounded-b-3xl">
                  {/* Racha actual */}
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                      Racha Actual
                    </span>
                    <div className="text-xs font-mono font-bold text-orange-400 flex items-center justify-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3" />
                      <span>{stats.currentStreak} d</span>
                    </div>
                  </div>

                  {/* Mejor racha */}
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                      Mejor Racha
                    </span>
                    <div className="text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                      <Trophy className="w-3 h-3" />
                      <span>{stats.bestStreak} d</span>
                    </div>
                  </div>

                  {/* 30-Day Completion Rate */}
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                      30 Días ({stats.thirtyDayRate}%)
                    </span>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-[#FF6600] h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.thirtyDayRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        habitToEdit={editingHabit}
      />

      {/* 6. Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-red-800/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white font-mono">
                ¿Eliminar este hábito?
              </h4>
              <p className="text-xs text-zinc-400">
                Se eliminará <span className="text-white font-bold">"{habitToDelete.name}"</span> y su historial de registros. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setHabitToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
