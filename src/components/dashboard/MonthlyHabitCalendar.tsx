import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { getTodayDateString } from '../../lib/formatters';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const MonthlyHabitCalendar: React.FC = () => {
  const { dailyObjectives, selectedDate, setSelectedDate } = useSayayinStore();
  const todayStr = getTodayDateString();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const [y, m] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate days in month
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Build grid
  const days = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ empty: true, key: `empty-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayObjs = (dailyObjectives || []).filter((o) => o && o.date === dayStr);
    const total = dayObjs.length;
    const completed = dayObjs.filter((o) => o && o.status === 'completado').length;

    let status: 'completed' | 'partial' | 'unfulfilled' | 'none' = 'none';
    if (total > 0) {
      if (completed === total) status = 'completed';
      else if (completed > 0) status = 'partial';
      else status = 'unfulfilled';
    }

    const isToday = dayStr === todayStr;
    const isSelected = dayStr === selectedDate;

    days.push({
      empty: false,
      key: dayStr,
      dayNumber: d,
      dateStr: dayStr,
      status,
      isToday,
      isSelected,
      total,
      completed
    });
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#FF6600]" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Radar de Constancia Mensual
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-200 capitalize font-mono px-1">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 mb-1">
          <span>LUN</span>
          <span>MAR</span>
          <span>MIÉ</span>
          <span>JUE</span>
          <span>VIE</span>
          <span>SÁB</span>
          <span>DOM</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((item) => {
            if (item.empty) {
              return <div key={item.key} className="h-8 rounded-lg" />;
            }

            let bgStyle = 'bg-[#171717] text-zinc-400 border border-zinc-800/60';
            if (item.status === 'completed') {
              bgStyle = 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/70 font-bold';
            } else if (item.status === 'partial') {
              bgStyle = 'bg-amber-950/80 text-amber-300 border border-amber-600/70 font-bold';
            } else if (item.status === 'unfulfilled') {
              bgStyle = 'bg-rose-950/80 text-rose-300 border border-rose-600/70 font-bold';
            }

            if (item.isToday) {
              bgStyle += ' ring-2 ring-[#FF6600] font-black';
            }

            if (item.isSelected) {
              bgStyle += ' scale-105 z-10 shadow-md';
            }

            return (
              <button
                key={item.key}
                onClick={() => setSelectedDate(item.dateStr!)}
                title={
                  item.total! > 0
                    ? `${item.completed}/${item.total} objetivos cumplidos`
                    : 'Sin objetivos'
                }
                className={`h-8 rounded-xl flex items-center justify-center text-xs font-mono transition-transform hover:scale-105 ${bgStyle}`}
              >
                {item.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Parcial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Incumplido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6600]" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
};
