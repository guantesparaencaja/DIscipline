import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';
import { getTodayDateString } from '../../lib/formatters';

interface DashboardHabitsCardProps {
  onNavigateToHabits?: () => void;
  onOpenCreateHabit?: () => void;
}

export const DashboardHabitsCard: React.FC<DashboardHabitsCardProps> = ({
  onNavigateToHabits,
  onOpenCreateHabit
}) => {
  const store = useSayayinStore();
  const {
    habits = [],
    habitLogs = [],
    toggleHabitDay,
    getHabitsForDate,
    getPowerBreakdown,
    profile
  } = store;

  const todayStr = getTodayDateString();
  const todayHabits = getHabitsForDate(todayStr);
  const completedTodayCount = todayHabits.filter((h) => h.completedToday).length;

  const powerBreakdown = getPowerBreakdown();
  const habitsPower = powerBreakdown.habitsPower;

  // Active habit streak across active habits
  const currentStreak = todayHabits.reduce((max, h) => Math.max(max, h.currentStreak), 0) || profile.currentStreak || 0;

  const progressPct =
    todayHabits.length > 0 ? Math.round((completedTodayCount / todayHabits.length) * 100) : 0;

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Radar de Hábitos de Hoy
              </h4>
              <p className="text-[10px] text-zinc-400">
                Disciplina diaria para elevar tu poder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
            </span>
          </div>
        </div>

        {/* Progress bar and summary */}
        <div className="bg-[#141414] border border-zinc-800/80 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-zinc-200">
              {completedTodayCount} de {todayHabits.length} completados hoy
            </span>
            <span className="font-mono text-xs font-bold text-[#FF6600]">
              {progressPct}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-[#FF6600] h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Poder de Hábitos:</span>
            <span className="font-bold text-amber-400">+{habitsPower} / 100 Ki</span>
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-2">
          {todayHabits.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              <p>No tienes hábitos programados para hoy.</p>
              {onOpenCreateHabit && (
                <button
                  onClick={onOpenCreateHabit}
                  className="mt-2 text-xs font-bold text-[#FF6600] hover:underline"
                >
                  + Agregar nuevo hábito
                </button>
              )}
            </div>
          ) : (
            todayHabits.slice(0, 4).map((habit) => {
              const isDone = habit.completedToday;
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitDay(habit.id, todayStr)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isDone
                      ? 'bg-zinc-900/40 border-[#FF6600]/30 hover:border-[#FF6600]/60'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-[#FF6600] text-black shadow-sm'
                          : 'border border-zinc-600 hover:border-[#FF6600] text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <div className="min-w-0">
                      <span
                        className={`text-xs font-bold truncate block ${
                          isDone ? 'text-zinc-400 line-through decoration-[#FF6600]' : 'text-zinc-100'
                        }`}
                      >
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                        <span className="capitalize flex items-center gap-1">
                          {habit.timeSlot === 'manana' && <Sun className="w-2.5 h-2.5 text-amber-400" />}
                          {habit.timeSlot === 'tarde' && <Sunset className="w-2.5 h-2.5 text-orange-400" />}
                          {habit.timeSlot === 'noche' && <Moon className="w-2.5 h-2.5 text-indigo-400" />}
                          {habit.timeSlot}
                        </span>
                        {habit.optionalTime && (
                          <span className="font-mono text-zinc-400">· {habit.optionalTime}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                      +{habit.xpReward} XP
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Navigation Button */}
      <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-mono">
          {todayHabits.length > 4 ? `+${todayHabits.length - 4} más programados` : ''}
        </span>
        {onNavigateToHabits && (
          <button
            onClick={onNavigateToHabits}
            className="flex items-center gap-1 text-xs font-bold text-[#FF6600] hover:text-orange-400 transition-colors"
          >
            <span>Ver radar completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
