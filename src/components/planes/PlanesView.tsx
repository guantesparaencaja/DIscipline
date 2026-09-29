import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { FileText, Plus, CheckCircle2, Circle, Target, Calendar, ArrowRight } from 'lucide-react';
import { formatDateSpanish } from '../../lib/formatters';

interface PlanesViewProps {
  onNavigateToGoals: () => void;
}

export const PlanesView: React.FC<PlanesViewProps> = ({ onNavigateToGoals }) => {
  const store = useSayayinStore();
  const plans = store.plans || [];
  const goals = store.goals || [];
  const { toggleMilestone } = store;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Estrategia Táctica
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <FileText className="w-6 h-6 text-[#FF6600]" />
          Planes Tácticos de Metas
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Cada meta de ahorro cuenta con un plan de batalla dividido en hitos comprobables.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl">
          <FileText className="w-12 h-12 text-[#FF6600]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No tienes planes tácticos</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            Crea metas en el módulo de Metas para estructurar planes paso a paso.
          </p>
          <button
            onClick={onNavigateToGoals}
            className="bg-[#FF6600] text-black font-bold text-xs px-4 py-2 rounded-xl"
          >
            Ir a Metas
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const goal = goals.find((g) => g.id === plan.goalId);
            const milestones = plan.milestones || [];
            const completedCount = milestones.filter((m) => m && m.completed).length;
            const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={plan.id}
                className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6600] bg-[#FF6600]/15 px-2 py-0.5 rounded-full border border-[#FF6600]/30">
                      {goal ? `Meta: ${goal.title}` : 'Meta General'}
                    </span>
                    <h3 className="text-lg font-black text-white font-mono mt-1">{plan.title}</h3>
                    <p className="text-xs text-zinc-300 mt-0.5">{plan.description}</p>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-zinc-400">Progreso del Plan:</span>
                    <div className="text-base font-bold text-white">{completedCount} de {milestones.length} hitos ({progress}%)</div>
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Hitos del Plan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(plan.id, m.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          m.completed
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-zinc-300'
                            : 'bg-[#171717] border-zinc-800 hover:border-zinc-700 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                          )}
                          <span className={`text-xs font-semibold truncate ${m.completed ? 'line-through text-zinc-400' : ''}`}>
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                          {formatDateSpanish(m.targetDate)}
                        </span>
                      </div>
                    ))}
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
