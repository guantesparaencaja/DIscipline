import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { PowerRing } from './PowerRing';
import { TransformationStrip } from './TransformationStrip';
import { WeeklyCalendarStrip } from './WeeklyCalendarStrip';
import { TodayObjectivesCard } from './TodayObjectivesCard';
import { FinancialSummaryCard } from './FinancialSummaryCard';
import { MonthlyHabitCalendar } from './MonthlyHabitCalendar';
import { WeeklyCompletionChart } from './WeeklyCompletionChart';
import {
  Flame,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar
} from 'lucide-react';
import { formatCOP, getLevelProgress } from '../../lib/formatters';
import { TRANSFORMATIONS } from '../../lib/constants';

interface DashboardViewProps {
  onOpenPowerBreakdown: () => void;
  onOpenObjectiveModal: () => void;
  onOpenExpenseModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPowerBreakdown,
  onOpenObjectiveModal,
  onOpenExpenseModal,
  onNavigateTab
}) => {
  const { profile, goals, expenses, dailyObjectives } = useSayayinStore();
  const levelProgress = getLevelProgress(profile.currentXp);
  const currentTrans = TRANSFORMATIONS[profile.transformation];

  const totalSavedGoals = goals.reduce((acc, g) => acc + g.currentSavings, 0);
  const todayObjs = dailyObjectives.filter((o) => o.date === profile.lastActiveDate);
  const doneToday = todayObjs.filter((o) => o.status === 'completado').length;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Welcome & XP Progression Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1e1e1e] via-[#1a1a1a] to-[#251710] border border-[#30241b] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30">
                Guerrero Saiyajin
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Racha actual: 🔥 {profile.currentStreak} días
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              Bienvenido, {profile.displayName}
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl">
              Tu evolución depende de tus acciones reales. Cada gasto registrado y cada hábito cumplido eleva tu ki de combate.
            </p>
          </div>

          {/* XP Level Box */}
          <div className="bg-[#141414]/90 border border-zinc-700/60 rounded-2xl p-4 min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                <Zap className="w-3.5 h-3.5 text-[#FF6600]" />
                Nivel {profile.currentLevel} ({currentTrans.shortName})
              </span>
              <span className="font-mono font-bold text-[#FF6600]">
                {levelProgress.xpInCurrentLevel} / {levelProgress.xpNeededForNextLevel} XP
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-gradient-to-r from-[#FF6600] to-yellow-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>Total acumulado: {profile.currentXp} XP</span>
              <span>{levelProgress.progressPercentage}% para nivel {profile.currentLevel + 1}</span>
            </div>
          </div>
        </div>

        {/* Ambient Ki Glow behind banner */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Tu Transformación Actual (Power Gauge) */}
      <PowerRing onOpenBreakdown={onOpenPowerBreakdown} />

      {/* 3. Tira de las 8 Transformaciones Saiyajin */}
      <TransformationStrip />

      {/* 4. Weekly Calendar Selector */}
      <WeeklyCalendarStrip />

      {/* 5. Main Tactical Grid: Objetivos del Día + Radar Financiero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivos del Día */}
        <TodayObjectivesCard onAddObjective={onOpenObjectiveModal} />

        {/* Finanzas & Fondo Disponible */}
        <FinancialSummaryCard
          onOpenExpenseModal={onOpenExpenseModal}
          onNavigateToFinances={() => onNavigateTab('finanzas')}
        />
      </div>

      {/* 6. Charts & Monthly Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen Semanal con Barras */}
        <WeeklyCompletionChart />

        {/* Calendario de Progreso Mensual (con Leyenda) */}
        <MonthlyHabitCalendar />
      </div>

      {/* 7. Continue Training Banner Card */}
      <div className="bg-gradient-to-r from-[#1f1915] via-[#1c1c1c] to-[#171717] border border-[#FF6600]/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">
              "No luches para ser mejor que otros; lucha para superar tu versión de ayer."
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hoy llevas {doneToday} de {todayObjs.length} disciplinas cumplidas.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenObjectiveModal}
          className="shrink-0 flex items-center gap-2 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <span>Continuar mi entrenamiento</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
