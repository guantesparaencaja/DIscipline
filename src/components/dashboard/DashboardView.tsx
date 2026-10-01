import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { PowerRing } from './PowerRing';
import { TransformationStrip } from './TransformationStrip';
import { WeeklyCalendarStrip } from './WeeklyCalendarStrip';
import { TodayObjectivesCard } from './TodayObjectivesCard';
import { FinancialSummaryCard } from './FinancialSummaryCard';
import { MonthlyHabitCalendar } from './MonthlyHabitCalendar';
import { WeeklyCompletionChart } from './WeeklyCompletionChart';
import { DashboardHabitsCard } from './DashboardHabitsCard';
import {
  Flame,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  ShieldAlert,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { formatCOP, getLevelProgress, getTodayDateString } from '../../lib/formatters';
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
  const store = useSayayinStore();
  const profile = store.profile || {
    id: 'usr',
    email: '',
    displayName: 'Guerrero Saiyajin',
    currentXp: 0,
    currentLevel: 1,
    transformation: 'base',
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: getTodayDateString(),
    totalPower: 0,
    basePower: 0,
    evolutionPower: 0,
    financialPower: 0,
    habitsPower: 0
  };
  const goals = store.goals || [];
  const expenses = store.expenses || [];
  const dailyObjectives = store.dailyObjectives || [];
  const fears = store.fears || [];
  const { completeFearStep } = store;

  // Bravery metrics & active fear challenge
  const totalBraveryPoints = fears.reduce((sum, f) => {
    const steps = f.steps || [];
    return sum + steps.filter((s) => s.isCompleted).reduce((stepSum, s) => stepSum + (s.braveryPoints || 0), 0);
  }, 0);
  const conqueredFearsCount = fears.filter((f) => f && f.status === 'superado').length;

  const activeFear = fears.find((f) => f && f.status === 'enfrentando') || fears[0];
  const activeSteps = activeFear?.steps || [];
  const nextStepIndex = activeSteps.findIndex((s) => !s.isCompleted);
  const nextFearStep = nextStepIndex !== -1 ? activeSteps[nextStepIndex] : null;
  const activeFearProgress = activeSteps.length > 0
    ? Math.round((activeSteps.filter((s) => s.isCompleted).length / activeSteps.length) * 100)
    : 0;

  const levelProgress = getLevelProgress(profile.currentXp);
  const currentTrans = TRANSFORMATIONS[profile.transformation] || TRANSFORMATIONS.base;

  const totalSavedGoals = goals.reduce((acc, g) => acc + (Number(g.currentSavings) || 0), 0);
  const todayObjs = dailyObjectives.filter((o) => o && o.date === (profile.lastActiveDate || getTodayDateString()));
  const doneToday = todayObjs.filter((o) => o && o.status === 'completado').length;

  return (
    <div className="flex flex-col space-y-6 pb-20 md:pb-8">
      {/* 1. ORDEN 1: Objetivos del Día */}
      <div className="order-1">
        <TodayObjectivesCard onAddObjective={onOpenObjectiveModal} />
      </div>

      {/* 2. ORDEN 2: Transformación y XP (Banner + Power Gauge + Strip) */}
      <div className="order-2 space-y-6">
        {/* Welcome & XP Progression Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1e1e1e] via-[#1a1a1a] to-[#251710] border border-[#30241b] rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30">
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
                  <Zap className="w-4 h-4 text-[#FF6600]" />
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
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Total: {profile.currentXp} XP</span>
                <span>{levelProgress.progressPercentage}% para Nivel {profile.currentLevel + 1}</span>
              </div>
            </div>
          </div>

          {/* Ambient Ki Glow behind banner */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Tu Transformación Actual (Power Gauge) */}
        <PowerRing onOpenBreakdown={onOpenPowerBreakdown} />

        {/* Tira de las 8 Transformaciones Saiyajin */}
        <TransformationStrip />
      </div>

      {/* 3. ORDEN 3: Fondo Disponible */}
      <div className="order-3">
        <FinancialSummaryCard
          onOpenExpenseModal={onOpenExpenseModal}
          onNavigateToFinances={() => onNavigateTab('finanzas')}
        />
      </div>

      {/* 4. ORDEN 4: Racha (Weekly Selector + Radar de Hábitos Diarios) */}
      <div className="order-4 space-y-6">
        <WeeklyCalendarStrip />
        <DashboardHabitsCard
          onNavigateToHabits={() => onNavigateTab('habitos')}
          onOpenCreateHabit={() => onNavigateTab('habitos')}
        />
      </div>

      {/* 5. ORDEN 5: Escalera de Miedos & Valentía Mental (Dominio Mental) */}
      <div className="order-5 bg-gradient-to-br from-[#1d1724] via-[#1a1a1a] to-[#1e1e1e] border border-purple-800/50 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">
              Dominio Mental & Escalera de Exposición
            </span>
            <h3 className="text-lg font-black text-white font-mono flex items-center gap-2 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              Valentía Saiyajin & Reto de Exposición
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Los puntos de valentía alimentan directamente tu <strong className="text-purple-300 font-bold">Poder de Evolución</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#141414] border border-purple-900/60 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 font-mono">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-zinc-300">
                Valentía: <strong className="text-white font-bold">{totalBraveryPoints} pts</strong>
              </span>
            </div>

            <div className="bg-[#141414] border border-amber-900/60 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 font-mono">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-zinc-300">
                Superados: <strong className="text-amber-400 font-bold">{conqueredFearsCount}</strong>
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('miedos')}
              aria-label="Ver todas las escaleras de miedo"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono transition-colors shrink-0 min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Ver Escaleras
            </button>
          </div>
        </div>

        {activeFear ? (
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 space-y-3">
            {/* Active Fear Header & Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider block">
                  Escalera Activa:
                </span>
                <h4 className="text-sm font-black text-white font-mono">
                  {activeFear.title}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-400">
                  {activeSteps.filter((s) => s.isCompleted).length} de {activeSteps.length} niveles ({activeFearProgress}%)
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeFearProgress}%` }}
              />
            </div>

            {/* Next real challenge */}
            {nextFearStep ? (
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-purple-300 bg-purple-950/80 border border-purple-800 px-2.5 py-0.5 rounded-full font-mono">
                      Próximo Reto Real: Nivel {nextStepIndex + 1}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      +{nextFearStep.xpReward} XP · +{nextFearStep.braveryPoints} Valentía
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white font-mono">
                    {nextFearStep.title}
                  </p>
                  {nextFearStep.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                      {nextFearStep.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => completeFearStep(activeFear.id, nextFearStep.id)}
                  aria-label={`Completar Nivel ${nextStepIndex + 1}`}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black text-xs uppercase font-mono rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completar Nivel</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-amber-400">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>¡Has superado todos los niveles de esta escalera! (+100 XP Bonus y Logro Valiente)</span>
                </div>
                <button
                  onClick={() => onNavigateTab('miedos')}
                  aria-label="Superar nuevo miedo"
                  className="px-3.5 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold min-h-[44px] flex items-center justify-center"
                >
                  Superar Nuevo Miedo
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400 text-xs font-mono space-y-2">
            <p>No tienes una escalera de miedos activa en este momento.</p>
            <button
              onClick={() => onNavigateTab('miedos')}
              aria-label="Crear escalera de exposición"
              className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold uppercase text-xs min-h-[44px]"
            >
              + Crear Escalera de Exposición
            </button>
          </div>
        )}
      </div>

      {/* 6. ORDEN 6: Resumen Semanal con Barras */}
      <div className="order-6">
        <WeeklyCompletionChart />
      </div>

      {/* 7. ORDEN 7: Calendario de Progreso Mensual */}
      <div className="order-7">
        <MonthlyHabitCalendar />
      </div>

      {/* 8. ORDEN 8: Continue Training Banner Card */}
      <div className="order-8 bg-gradient-to-r from-[#1f1915] via-[#1c1c1c] to-[#171717] border border-[#FF6600]/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
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
          aria-label="Continuar mi entrenamiento y agregar objetivo"
          className="shrink-0 flex items-center justify-center gap-2 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FF6600]"
        >
          <span>Continuar mi entrenamiento</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
