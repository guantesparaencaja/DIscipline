import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { calculateGoalPace, formatCOP, formatDateSpanish } from '../../lib/formatters';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Goal } from '../../types';

interface MetasViewProps {
  onOpenGoalModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenObjectiveModal: () => void;
}

export const MetasView: React.FC<MetasViewProps> = ({
  onOpenGoalModal,
  onOpenExpenseModal,
  onOpenObjectiveModal
}) => {
  const store = useSayayinStore();
  const goals = store.goals || [];
  const dailyObjectives = store.dailyObjectives || [];
  const plans = store.plans || [];
  const { deleteGoal, generateSmartObjectivesForGoal } = store;

  const handleDeleteGoal = (id: string, title: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar la meta:\n"${title}"?\nEsto eliminará también los planes tácticos asociados.`);
    if (ok) {
      deleteGoal(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Evolución por Objetivos
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Target className="w-6 h-6 text-[#FF6600]" />
            Metas de Ahorro & Blindaje
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sin barras de progreso manuales. El avance se genera exclusivamente cuando apartas ahorro real en tus finanzas.
          </p>
        </div>

        <button
          onClick={onOpenGoalModal}
          className="flex items-center gap-2 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Fijar Nueva Meta</span>
        </button>
      </div>

      {/* 2. Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl">
          <Target className="w-12 h-12 text-[#FF6600]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No tienes metas activas</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            Un Saiyajin sin metas lucha a ciegas. Define tu primera meta de ahorro para calcular tu ritmo diario y mensual requerido.
          </p>
          <button
            onClick={onOpenGoalModal}
            className="bg-[#FF6600] text-black font-bold text-xs px-4 py-2 rounded-xl"
          >
            + Crear Mi Primera Meta
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const pace = calculateGoalPace(goal);
            const linkedObjectives = dailyObjectives.filter((o) => o.goalId === goal.id);
            const doneObjectives = linkedObjectives.filter((o) => o.status === 'completado').length;
            const linkedPlan = plans.find((p) => p.goalId === goal.id);

            let statusBadgeColor = 'bg-blue-950/80 text-blue-400 border-blue-800/60';
            if (pace.paceStatus === 'completada') {
              statusBadgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
            } else if (pace.paceStatus === 'por_encima') {
              statusBadgeColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
            } else if (pace.paceStatus === 'por_debajo') {
              statusBadgeColor = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
            }

            return (
              <div
                key={goal.id}
                className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-5 transition-all hover:border-[#FF6600]/40"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#FF6600]/15 text-[#FF6600] border border-[#FF6600]/30">
                        {goal.category}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Prioridad: <strong className="text-white capitalize">{goal.priority}</strong>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
                        {pace.statusMessage}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white font-mono">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.title)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-[#252525] hover:bg-[#303030] transition-colors"
                      title="Eliminar meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Real Amount Numbers */}
                <div className="bg-[#161616] p-4 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Ahorro Real Acumulado:</span>
                      <span className="font-mono font-black text-lg text-emerald-400">
                        {formatCOP(goal.currentSavings)}
                      </span>
                    </div>
                    <div className="text-zinc-400 font-mono text-xs">
                      Valor Objetivo: <strong className="text-white">{formatCOP(goal.targetAmount)}</strong> · Restante: <strong className="text-amber-400">{formatCOP(pace.remainingAmount)}</strong>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF6600] via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${pace.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Avance real: {pace.progressPercentage}%</span>
                    <span>Límite: {formatDateSpanish(goal.targetDate)} ({pace.daysRemaining} días restantes)</span>
                  </div>
                </div>

                {/* Smart Required Pace Breakdown Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#181818] border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
                      Ritmo Mensual Requerido
                    </span>
                    <span className="text-base font-black text-white font-mono mt-1 block">
                      {formatCOP(pace.monthlyRequiredPace)}
                    </span>
                    <span className="text-[9px] text-zinc-400">Para cumplir a tiempo</span>
                  </div>

                  <div className="bg-[#181818] border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
                      Ritmo Semanal Requerido
                    </span>
                    <span className="text-base font-black text-white font-mono mt-1 block">
                      {formatCOP(pace.weeklyRequiredPace)}
                    </span>
                    <span className="text-[9px] text-zinc-400">Por cada 7 días</span>
                  </div>

                  <div className="bg-[#181818] border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">
                      Ritmo Diario Requerido
                    </span>
                    <span className="text-base font-black text-[#FF6600] font-mono mt-1 block">
                      {formatCOP(pace.dailyRequiredPace)}
                    </span>
                    <span className="text-[9px] text-zinc-400">
                      Ritmo actual: {formatCOP(pace.currentDailyPace)}/día
                    </span>
                  </div>
                </div>

                {/* Motivation & Linked Actions Footer */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                    <span className="italic truncate">"{goal.motivation}"</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => generateSmartObjectivesForGoal(goal.id)}
                      className="px-3 py-1.5 bg-[#FF6600]/15 hover:bg-[#FF6600]/25 text-[#FF6600] border border-[#FF6600]/40 rounded-xl font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generar Objetivo Inteligente ({formatCOP(pace.dailyRequiredPace)}/día)</span>
                    </button>

                    <button
                      onClick={onOpenObjectiveModal}
                      className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-zinc-200 border border-zinc-700/60 rounded-xl font-bold transition-colors"
                    >
                      + Objetivo Manual
                    </button>

                    <button
                      onClick={onOpenExpenseModal}
                      className="px-3 py-1.5 bg-[#FF6600] hover:bg-orange-500 text-black rounded-xl font-black transition-colors"
                    >
                      + Apartar Ahorro Real
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
