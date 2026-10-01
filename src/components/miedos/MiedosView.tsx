import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { FearModal } from './FearModal';
import { Fear, FearCategory, FearStatus, FearStep } from '../../types';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Lock,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Trash2,
  Award,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { formatDateSpanish } from '../../lib/formatters';

export const MiedosView: React.FC = () => {
  const store = useSayayinStore();
  const fears = store.fears || [];
  const { completeFearStep, deleteFear, profile } = store;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fearToEdit, setFearToEdit] = useState<Fear | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FearStatus | 'todos'>('todos');

  const filteredFears = fears.filter((f) => {
    if (!f) return false;
    if (selectedStatus === 'todos') return true;
    return f.status === selectedStatus;
  });

  const totalFears = fears.length;
  const inProgressFears = fears.filter((f) => f && f.status === 'enfrentando').length;
  const conqueredFears = fears.filter((f) => f && f.status === 'superado').length;

  // Calculate total bravery points from all completed steps across fears
  const totalBraveryPoints = fears.reduce((sum, f) => {
    const steps = f.steps || [];
    return sum + steps.filter((s) => s.isCompleted).reduce((stepSum, s) => stepSum + (s.braveryPoints || 0), 0);
  }, 0);

  const handleDeleteFear = (id: string, title: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar el miedo:\n"${title}"\ny todos sus escalones de exposición?`);
    if (ok) {
      deleteFear(id);
    }
  };

  const handleOpenEdit = (fear: Fear) => {
    setFearToEdit(fear);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFearToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest font-mono">
            Dominio Mental & Escalera de Exposición
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            Superar Miedos: Escalera de Exposición
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            La valentía no es ausencia de miedo, sino la voluntad de avanzar peldaño a peldaño.
            Cada nivel superado en estricto orden otorga XP y Puntos de Valentía que potencian directamente tu Poder de Evolución.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 shrink-0 font-mono"
        >
          <Plus className="w-4 h-4" /> Crear Escalera de Miedo
        </button>
      </div>

      {/* 2. Bravery Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Puntos de Valentía */}
        <div className="bg-gradient-to-br from-purple-950/40 to-[#1e1e1e] border border-purple-800/60 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 font-black font-mono text-2xl">
            🛡️
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
              Puntos de Valentía
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {totalBraveryPoints} <span className="text-xs text-purple-400 font-normal">pts</span>
            </div>
            <span className="text-[10px] text-purple-300">
              Alimentan tu Poder de Evolución
            </span>
          </div>
        </div>

        {/* Victorias / Miedos Superados */}
        <div className="bg-[#1e1e1e] border border-amber-900/40 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-black font-mono text-2xl">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
              Miedos Superados
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {conqueredFears} de {totalFears}
            </div>
            <span className="text-[10px] text-zinc-400">
              +{conqueredFears * 100} XP bonus acumulado
            </span>
          </div>
        </div>

        {/* En Combate Activo */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0 font-black font-mono text-2xl">
            ⚔️
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
              En Combate Activo
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {inProgressFears} Escaleras
            </div>
            <span className="text-[10px] text-purple-400">
              Progresión gradual sin atajos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setSelectedStatus('todos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
            selectedStatus === 'todos'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({totalFears})
        </button>
        <button
          onClick={() => setSelectedStatus('enfrentando')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
            selectedStatus === 'enfrentando'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          En Combate ({inProgressFears})
        </button>
        <button
          onClick={() => setSelectedStatus('superado')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
            selectedStatus === 'superado'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Superados ({conqueredFears})
        </button>
      </div>

      {/* 4. Fears Exposure Ladders List */}
      {filteredFears.length === 0 ? (
        <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">
            No hay escaleras en esta categoría
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Crea una escalera de 3 a 10 niveles de exposición gradual para superar tus bloqueos financieros y personales.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono uppercase"
          >
            + Forjar Escalera de Miedo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFears.map((fear) => {
            const isConquered = fear.status === 'superado';
            const fearSteps: FearStep[] = fear.steps && fear.steps.length > 0 ? fear.steps : [];
            const completedCount = fearSteps.filter((s) => s.isCompleted).length;
            const totalSteps = fearSteps.length;
            const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

            // Find next step in order
            const nextUnlockIndex = fearSteps.findIndex((s) => !s.isCompleted);

            return (
              <div
                key={fear.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  isConquered
                    ? 'bg-gradient-to-br from-[#241e17] to-[#1c1c1c] border-amber-500/40 shadow-xl shadow-amber-950/20'
                    : 'bg-[#1e1e1e] border-zinc-800 shadow-xl hover:border-purple-800/50'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badges & Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
                        {fear.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Impacto: {fear.impactScore}/10
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConquered ? (
                        <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <Trophy className="w-3 h-3 text-amber-400" /> Miedo Superado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <Flame className="w-3 h-3 text-purple-400 animate-pulse" /> Nivel {nextUnlockIndex + 1} de {totalSteps}
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenEdit(fear)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Editar miedo y escalera"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteFear(fear.id, fear.title)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Eliminar miedo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-black text-white font-mono leading-snug">
                      {fear.title}
                    </h3>
                    {fear.description && (
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {fear.description}
                      </p>
                    )}
                  </div>

                  {/* Conquered Victory Banner */}
                  {isConquered && (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                        <Award className="w-4 h-4" />
                        <span>¡Logro "Valiente" Desbloqueado (+100 XP)!</span>
                      </div>
                      <p className="text-xs text-amber-200/90 italic">
                        "Has templado tu mente completando todos los niveles de la escalera. El obstáculo se convirtió en poder."
                      </p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Progreso de Exposición:</span>
                      <span className="font-bold text-purple-300">
                        {completedCount} de {totalSteps} niveles ({progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isConquered
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-gradient-to-r from-purple-600 to-[#FF6600]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Graduated Exposure Ladder Steps List */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                      Escalones de Exposición (Orden Secuencial Estricto):
                    </span>

                    <div className="space-y-2">
                      {fearSteps.map((step, idx) => {
                        const isDone = step.isCompleted;
                        const isNext = idx === nextUnlockIndex && !isConquered;
                        const isLocked = idx > nextUnlockIndex && !isConquered;

                        return (
                          <div
                            key={step.id || idx}
                            className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-950/15 border-emerald-900/40 text-zinc-300'
                                : isNext
                                ? 'bg-purple-950/30 border-purple-600/80 shadow-md shadow-purple-950/30'
                                : 'bg-[#141414] border-zinc-850 opacity-60 text-zinc-500'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Step indicator */}
                              <div
                                className={`w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                                  isDone
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : isNext
                                    ? 'bg-purple-600 text-white font-black animate-pulse'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : isLocked ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  idx + 1
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className={`text-xs font-bold ${isDone ? 'line-through text-zinc-400' : 'text-white'}`}>
                                    {step.title}
                                  </h4>
                                </div>
                                {step.description && (
                                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                                    {step.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                                  <span className="text-purple-300 font-bold">+{step.xpReward} XP</span>
                                  <span className="text-zinc-600">·</span>
                                  <span className="text-amber-400 font-bold">+{step.braveryPoints} Valentía</span>
                                  {isDone && step.completedAt && (
                                    <>
                                      <span className="text-zinc-600">·</span>
                                      <span className="text-emerald-400">Superado el {formatDateSpanish(step.completedAt)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0 self-end sm:self-center">
                              {isDone ? (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Nivel Vencido
                                </span>
                              ) : isNext ? (
                                <button
                                  onClick={() => completeFearStep(fear.id, step.id)}
                                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all shadow-md shadow-purple-900/40 flex items-center gap-1.5"
                                >
                                  <span>¡Completar Nivel {idx + 1}!</span>
                                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded-xl flex items-center gap-1 border border-zinc-800">
                                  <Lock className="w-3 h-3 text-zinc-500" /> Bloqueado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer card info */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Valentía aportada: <strong className="text-purple-300">{fear.braveryScore || 0} pts</strong></span>
                  <span>Registrado el {formatDateSpanish(fear.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <FearModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFearToEdit(null);
        }}
        fearToEdit={fearToEdit}
      />
    </div>
  );
};
