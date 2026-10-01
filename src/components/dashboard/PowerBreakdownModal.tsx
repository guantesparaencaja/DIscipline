import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from '../../lib/constants';
import {
  X,
  Shield,
  TrendingUp,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { formatCOP } from '../../lib/formatters';

interface PowerBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PowerBreakdownModal: React.FC<PowerBreakdownModalProps> = ({ isOpen, onClose }) => {
  const { getPowerBreakdown, profile, goals, expenses } = useSayayinStore();

  if (!isOpen) return null;

  const breakdown = getPowerBreakdown();
  const currentTrans = TRANSFORMATIONS[breakdown.transformationId];
  const nextTrans = breakdown.nextTransformationId ? TRANSFORMATIONS[breakdown.nextTransformationId] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border-t sm:border border-[#333] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar desglose de poder"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#FF6600]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 shrink-0 pb-3 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6600] to-amber-600 flex items-center justify-center shadow-lg shadow-[#FF6600]/25 shrink-0">
            <Flame className="w-7 h-7 text-black fill-black" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#FF6600] uppercase tracking-widest font-mono">
              Auditoría de Ki del Guerrero
            </span>
            <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
              ¿Por qué estoy en {currentTrans.name}?
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-5 pr-1 mt-3">

        {/* Formula Summary Hero Card */}
        <div className="bg-[#141414] border border-[#2d2d2d] rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-xs text-zinc-400">Poder Total Calculado</span>
              <div className="text-3xl font-black text-[#FF6600] font-mono">
                {breakdown.totalPower} / 100
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-400">Fórmula Maestra</span>
              <p className="text-xs font-mono font-bold text-zinc-300">
                70% [Poder Base] + 30% [Poder de Evolución]
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1c1c1c] p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block text-[11px]">Poder Base (70%)</span>
              <span className="text-lg font-bold text-white font-mono">{breakdown.basePower} pts</span>
              <p className="text-[10px] text-zinc-400 mt-1">
                = 70% Finanzas ({breakdown.financialPower}) + 30% Hábitos ({breakdown.habitsPower})
              </p>
            </div>

            <div className="bg-[#1c1c1c] p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block text-[11px]">Poder de Evolución (30%)</span>
              <span className="text-lg font-bold text-white font-mono">{breakdown.evolutionPower} pts</span>
              <p className="text-[10px] text-zinc-400 mt-1">
                Metas ({breakdown.evolutionBreakdown.goalsProgressScore}), Logros ({breakdown.evolutionBreakdown.achievementsScore}), Racha ({breakdown.evolutionBreakdown.streakMultiplier})
              </p>
            </div>
          </div>
        </div>

        {/* Deep Breakdown Sections */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF6600]" /> 1. Poder Financiero ({breakdown.financialPower}/100)
          </h3>
          <div className="bg-[#202020] rounded-2xl p-4 space-y-2 text-xs text-zinc-300 border border-zinc-800">
            <div className="flex justify-between">
              <span>Cumplimiento del ritmo de ahorro de metas:</span>
              <strong className="text-white font-mono">{breakdown.financialBreakdown.savingsPaceCompliance}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Control presupuestal (Fondo disponible vs Gastos):</span>
              <strong className="text-white font-mono">{breakdown.financialBreakdown.budgetControlScore}%</strong>
            </div>
            <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
              Tu control de dinero evalúa si apartas ahorros reales para tus metas según las fechas límite y si mantienes tu fondo disponible en terreno positivo.
            </p>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> 2. Poder de Hábitos & Disciplina ({breakdown.habitsPower}/100)
          </h3>
          <div className="bg-[#202020] rounded-2xl p-4 space-y-2 text-xs text-zinc-300 border border-zinc-800">
            <div className="flex justify-between">
              <span>Tasa de cumplimiento últimos 30 días:</span>
              <strong className="text-white font-mono">{breakdown.habitsBreakdown.thirtyDayCompletionRate}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Objetivos realizados recientemente:</span>
              <strong className="text-white font-mono">{breakdown.habitsBreakdown.totalObjectivesDone} completados</strong>
            </div>
            <div className="flex justify-between">
              <span>Bonus por racha activa ({profile.currentStreak} días):</span>
              <strong className="text-white font-mono">+{breakdown.habitsBreakdown.streakBonus} pts</strong>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> 3. Poder de Evolución ({breakdown.evolutionPower}/100)
          </h3>
          <div className="bg-[#202020] rounded-2xl p-4 space-y-2 text-xs text-zinc-300 border border-zinc-800">
            <div className="flex justify-between">
              <span>Avance de metas activas:</span>
              <strong className="text-white font-mono">{breakdown.evolutionBreakdown.goalsProgressScore}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Insignias de logros desbloqueados:</span>
              <strong className="text-white font-mono">{breakdown.evolutionBreakdown.achievementsScore}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Nivel alcanzado (Nivel {profile.currentLevel}):</span>
              <strong className="text-white font-mono">{breakdown.evolutionBreakdown.levelScore}%</strong>
            </div>
          </div>
        </div>

        {/* How to Evolve Next */}
        <div className="bg-gradient-to-r from-orange-950/70 to-[#1a1a1a] border border-[#FF6600]/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-[#FF6600] font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4" /> ¿Qué me falta para evolucionar?
          </div>
          {nextTrans ? (
            <div className="space-y-2 text-xs text-zinc-300">
              <p>
                Para alcanzar la fase de <strong className={nextTrans.textColor}>{nextTrans.name}</strong> ({nextTrans.minPower} pts), necesitas subir tu Poder Total en{' '}
                <strong className="text-[#FF6600] font-mono">+{breakdown.powerNeededForNext} puntos</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                <li>Completa todos los objetivos diarios de hoy (+XP y aumento de tasa de 30 días).</li>
                <li>Registra un ahorro vinculado a una meta de ahorro para disparar el poder financiero.</li>
                <li>Mantén tu racha de días consecutivos para multiplicar el bonus de constancia.</li>
              </ul>
            </div>
          ) : (
            <p className="text-xs text-emerald-400 font-bold">
              ¡Has dominado el estado final del Ultra Instinto! Mantén tus hábitos impecables para no descender.
            </p>
          )}
        </div>

        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-[#1a1a1a] pt-3 pb-1 border-t border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 min-h-[44px] flex items-center justify-center font-mono focus-visible:ring-2 focus-visible:ring-[#FF6600]"
          >
            Entendido, Volver al Entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
};
