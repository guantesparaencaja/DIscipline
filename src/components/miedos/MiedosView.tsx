import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { FearModal } from './FearModal';
import { FearCategory, FearStatus } from '../../types';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Circle,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Trash2,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDateSpanish } from '../../lib/formatters';

export const MiedosView: React.FC = () => {
  const store = useSayayinStore();
  const fears = store.fears || [];
  const { toggleFearAction, conquerFear, deleteFear } = store;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FearStatus | 'todos'>('todos');
  const [reflectionInput, setReflectionInput] = useState<{ [fearId: string]: string }>({});

  const filteredFears = fears.filter((f) => {
    if (!f) return false;
    if (selectedStatus === 'todos') return true;
    return f.status === selectedStatus;
  });

  const totalFears = fears.length;
  const inProgressFears = fears.filter((f) => f && f.status === 'enfrentando').length;
  const conqueredFears = fears.filter((f) => f && f.status === 'superado').length;

  const handleConquer = (fearId: string) => {
    const reflection = reflectionInput[fearId] || 'He forjado disciplina inquebrantable superando este obstáculo.';
    conquerFear(fearId, reflection);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Dominio Mental & Creencias
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            Módulo de Miedos & Bloqueos Financieros
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            La verdadera prueba del Guerrero Saiyajin: transformar el temor a la escasez, al fracaso y a la incertidumbre en disciplina inquebrantable. Cada victoria eleva tu Poder de Evolución.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2 shrink-0 font-mono"
        >
          <Plus className="w-4 h-4" /> Enfrentar Nuevo Miedo
        </button>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0 font-black font-mono text-2xl">
            {totalFears}
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Miedos Identificados
            </span>
            <div className="text-xl font-black text-white font-mono">
              {totalFears} Registrados
            </div>
            <span className="text-[10px] text-zinc-400">
              {inProgressFears} en combate activo
            </span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-amber-900/40 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-black font-mono text-2xl">
            {conqueredFears}
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Miedos Superados
            </span>
            <div className="text-xl font-black text-amber-400 font-mono">
              🏆 {conqueredFears} Victorias
            </div>
            <span className="text-[10px] text-zinc-400">
              +{conqueredFears * 500} XP & Ki de Evolución
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-950/40 to-[#1e1e1e] border border-purple-800/40 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Poder de Evolución
            </span>
            <div className="text-xl font-black text-white font-mono">
              +{conqueredFears * 33 > 100 ? 100 : conqueredFears * 33}%
            </div>
            <span className="text-[10px] text-purple-300">
              Multiplicador de transformación
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setSelectedStatus('todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'todos'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({totalFears})
        </button>
        <button
          onClick={() => setSelectedStatus('enfrentando')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'enfrentando'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Enfrentando ({inProgressFears})
        </button>
        <button
          onClick={() => setSelectedStatus('superado')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'superado'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Superados ({conqueredFears})
        </button>
      </div>

      {/* 4. Fears List */}
      {filteredFears.length === 0 ? (
        <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">
            No hay miedos en esta categoría
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Identifica tus creencias sobre el dinero, la inversión o el merecimiento para comenzar tu entrenamiento.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold font-mono uppercase"
          >
            + Registrar Miedo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFears.map((fear) => {
            const isConquered = fear.status === 'superado';
            const fearActions = fear.actions || [];
            const completedActionsCount = fearActions.filter((a) => a && a.completed).length;
            const totalActions = fearActions.length;
            const progress = totalActions > 0 ? (completedActionsCount / totalActions) * 100 : 0;
            const allActionsDone = totalActions > 0 && completedActionsCount === totalActions;

            return (
              <div
                key={fear.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isConquered
                    ? 'bg-gradient-to-br from-[#241e17] to-[#1e1e1e] border-amber-500/40 shadow-xl shadow-amber-950/20'
                    : 'bg-[#1e1e1e] border-zinc-800 shadow-xl hover:border-purple-800/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60">
                        {fear.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Impacto: {fear.impactScore}/10
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConquered ? (
                        <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <Trophy className="w-3 h-3 text-amber-400" /> Superado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <Flame className="w-3 h-3 text-purple-400 animate-pulse" /> En Combate
                        </span>
                      )}

                      <button
                        onClick={() => deleteFear(fear.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{fear.title}</h3>
                    {fear.description && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {fear.description}
                      </p>
                    )}
                  </div>

                  {/* Conquered Reflection Banner if superado */}
                  {isConquered && fear.reflection && (
                    <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block font-mono flex items-center gap-1">
                        <Award className="w-3 h-3" /> Sabiduría Forjada en el Combate:
                      </span>
                      <p className="italic text-zinc-300 font-serif">"{fear.reflection}"</p>
                      {fear.conqueredAt && (
                        <span className="text-[9px] text-zinc-500 block pt-1 font-mono">
                          Conquistado el {formatDateSpanish(fear.conqueredAt)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Progreso de Acciones</span>
                      <span className="text-purple-300 font-bold">
                        {completedActionsCount} / {totalActions} ({Math.round(progress)}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isConquered ? 'bg-amber-400' : 'bg-purple-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Checkbox List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Acciones para Vencer el Miedo (+100 XP c/u):
                    </span>
                    <div className="space-y-1.5">
                      {fear.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => toggleFearAction(fear.id, act.id)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                            act.completed
                              ? 'bg-purple-950/30 border-purple-800/40 text-zinc-300'
                              : 'bg-[#151515] border-zinc-800/80 text-white hover:border-purple-800/60'
                          }`}
                        >
                          {act.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={act.completed ? 'line-through text-zinc-400' : ''}>
                              {act.title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40 shrink-0">
                            +100 XP
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Victory Trigger if not yet conquered */}
                {!isConquered && (
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Reflexión de victoria (¿qué aprendiste?)"
                        value={reflectionInput[fear.id] || ''}
                        onChange={(e) =>
                          setReflectionInput({ ...reflectionInput, [fear.id]: e.target.value })
                        }
                        className="flex-1 bg-[#141414] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleConquer(fear.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono transition-all flex items-center gap-1 shrink-0 ${
                          allActionsDone
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 animate-pulse'
                            : 'bg-zinc-800 hover:bg-amber-600 text-zinc-200 hover:text-black'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Superar (+500 XP)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fear Modal */}
      <FearModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
