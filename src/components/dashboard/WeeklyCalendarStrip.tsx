import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { getTodayDateString } from '../../lib/formatters';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const WeeklyCalendarStrip: React.FC = () => {
  const { selectedDate, setSelectedDate, dailyObjectives } = useSayayinStore();
  const todayStr = getTodayDateString();

  // Compute 7 days around today or the current week
  const todayDate = new Date(todayStr + 'T12:00:00');
  const currentDayOfWeek = (todayDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  // Monday of this week
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() - currentDayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const dayName = d.toLocaleDateString('es-CO', { weekday: 'short' });
    const dayNumber = d.getDate();

    // Check objectives for this day
    const dayObjectives = dailyObjectives.filter((o) => o.date === dateStr);
    const total = dayObjectives.length;
    const completed = dayObjectives.filter((o) => o.status === 'completado').length;

    let status: 'completed' | 'partial' | 'empty' | 'none' = 'none';
    if (total > 0) {
      if (completed === total) status = 'completed';
      else if (completed > 0) status = 'partial';
      else status = 'empty';
    }

    return {
      dateStr,
      dayName: dayName.toUpperCase().replace('.', ''),
      dayNumber,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      total,
      completed,
      status
    };
  });

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#FF6600]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Semana de Entrenamiento
          </h4>
        </div>

        <button
          onClick={() => setSelectedDate(todayStr)}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
            selectedDate === todayStr
              ? 'bg-[#FF6600] text-black border-[#FF6600]'
              : 'bg-[#252525] text-zinc-300 border-zinc-700/60 hover:text-white'
          }`}
        >
          Hoy
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex flex-col items-center justify-between py-2 sm:py-3 px-1 rounded-2xl border transition-all duration-200 ${
                day.isSelected
                  ? 'bg-gradient-to-b from-[#2a1d15] to-[#1e1e1e] border-[#FF6600] ring-2 ring-[#FF6600]/30 shadow-md'
                  : 'bg-[#171717] border-zinc-800/80 hover:bg-[#202020] hover:border-zinc-700'
              }`}
            >
              <span
                className={`text-[10px] font-bold tracking-wider ${
                  day.isToday ? 'text-[#FF6600]' : 'text-zinc-400'
                }`}
              >
                {day.dayName}
              </span>

              <span
                className={`text-sm sm:text-base font-black my-0.5 font-mono ${
                  day.isSelected ? 'text-white' : 'text-zinc-200'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Status indicator dot */}
              <div className="h-2 flex items-center justify-center">
                {day.status === 'completed' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500" />
                ) : day.status === 'partial' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                ) : day.status === 'empty' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
