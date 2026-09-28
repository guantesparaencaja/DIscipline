import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { MonthlyHabitCalendar } from '../dashboard/MonthlyHabitCalendar';
import { WeeklyCompletionChart } from '../dashboard/WeeklyCompletionChart';
import { WeeklyCalendarStrip } from '../dashboard/WeeklyCalendarStrip';
import { TodayObjectivesCard } from '../dashboard/TodayObjectivesCard';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarioViewProps {
  onOpenObjectiveModal: () => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({ onOpenObjectiveModal }) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Línea Temporal
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <CalendarIcon className="w-6 h-6 text-[#FF6600]" />
          Calendario de Progreso & Auditoría
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Examina tu consistencia a lo largo de los días y audita las disciplinas cumplidas en cualquier fecha.
        </p>
      </div>

      <WeeklyCalendarStrip />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyHabitCalendar />
        <TodayObjectivesCard onAddObjective={onOpenObjectiveModal} />
      </div>

      <WeeklyCompletionChart />
    </div>
  );
};
