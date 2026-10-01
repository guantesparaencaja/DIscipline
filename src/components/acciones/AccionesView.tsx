import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  Zap,
  PlusCircle,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  Target,
  FileText,
  Flame,
  CheckSquare,
  ArrowRight,
  Filter,
  X,
  Gift
} from 'lucide-react';
import { ActionItem, ActionTargetType } from '../../types';
import { formatCOP, getTodayDateString } from '../../lib/formatters';

interface AccionesViewProps {
  onOpenExpenseModal: () => void;
  onOpenGoalModal: () => void;
  onNavigateToRewards?: () => void;
}

export const AccionesView: React.FC<AccionesViewProps> = ({
  onOpenExpenseModal,
  onOpenGoalModal,
  onNavigateToRewards
}) => {
  const store = useSayayinStore();
  const actions = store.actions || [];
  const goals = store.goals || [];
  const plans = store.plans || [];
  const dailyObjectives = store.dailyObjectives || [];
  const habits = store.habits || [];
  const { addAction, toggleAction, deleteAction } = store;

  const [filterType, setFilterType] = useState<ActionTargetType | 'todas' | 'completadas'>('todas');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for new action
  const [actionTitle, setActionTitle] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [targetType, setTargetType] = useState<ActionTargetType>('meta');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [xpReward, setXpReward] = useState(25);

  const filteredActions = actions.filter((a) => {
    if (filterType === 'todas') return !a.isCompleted;
    if (filterType === 'completadas') return a.isCompleted;
    return a.targetType === filterType && !a.isCompleted;
  });

  const totalActions = actions.length;
  const pendingActions = actions.filter((a) => !a.isCompleted).length;
  const completedActions = actions.filter((a) => a.isCompleted).length;
  const totalXpEarned = actions
    .filter((a) => a.isCompleted)
    .reduce((sum, a) => sum + (a.xpReward || 0), 0);

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;

    let targetTitle = '';
    if (targetType === 'meta') {
      const g = goals.find((item) => item.id === selectedTargetId);
      targetTitle = g ? g.title : 'Meta de Ahorro';
    } else if (targetType === 'plan') {
      const p = plans.find((item) => item.id === selectedTargetId);
      targetTitle = p ? p.title : 'Plan Táctico';
    } else if (targetType === 'objetivo') {
      const o = dailyObjectives.find((item) => item.id === selectedTargetId);
      targetTitle = o ? o.title : 'Objetivo Diario';
    } else if (targetType === 'habito') {
      const h = habits.find((item) => item.id === selectedTargetId);
      targetTitle = h ? h.name : 'Hábito';
    }

    addAction({
      title: actionTitle.trim(),
      description: actionDesc.trim() || undefined,
      targetType,
      targetId: selectedTargetId || undefined,
      targetTitle: targetTitle || undefined,
      xpReward
    });

    setActionTitle('');
    setActionDesc('');
    setSelectedTargetId('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteAction = (id: string, title: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar la acción:\n"${title}"?`);
    if (ok) {
      deleteAction(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
            Acciones Tácticas Conectadas
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Zap className="w-6 h-6 text-[#FF6600]" />
            Acciones de Batalla del Guerrero
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Cada acción está estrictamente ligada a una meta, plan, objetivo o hábito. Marcarla como hecha suma XP real y avanza la disciplina vinculada.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToRewards && (
            <button
              onClick={onNavigateToRewards}
              className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-mono"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Tienda de Recompensas</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#FF6600] hover:bg-orange-500 active:scale-95 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 font-mono"
          >
            <PlusCircle className="w-4 h-4 stroke-[3]" />
            <span>Vincular Nueva Acción</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
            Acciones Pendientes
          </span>
          <div className="text-2xl font-black text-white font-mono mt-0.5">
            {pendingActions}
          </div>
          <span className="text-[10px] text-zinc-400">Listas para ejecutar</span>
        </div>

        <div className="bg-[#1e1e1e] border border-emerald-950/60 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
            Acciones Cumplidas
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
            {completedActions} de {totalActions}
          </div>
          <span className="text-[10px] text-emerald-400">Disciplina verificada</span>
        </div>

        <div className="bg-[#1e1e1e] border border-[#FF6600]/30 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
            XP Ganado en Acciones
          </span>
          <div className="text-2xl font-black text-[#FF6600] font-mono mt-0.5">
            +{totalXpEarned} XP
          </div>
          <span className="text-[10px] text-zinc-400">Suma a tu ki disponible</span>
        </div>

        <div className="bg-[#1e1e1e] border border-purple-900/40 rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
            Entidades Conectadas
          </span>
          <div className="text-2xl font-black text-purple-300 font-mono mt-0.5">
            {goals.length + plans.length + habits.length}
          </div>
          <span className="text-[10px] text-zinc-400">Metas, planes y hábitos</span>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setFilterType('todas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono ${
            filterType === 'todas'
              ? 'bg-[#FF6600] text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          Todas Pendientes ({pendingActions})
        </button>

        <button
          onClick={() => setFilterType('meta')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono flex items-center gap-1.5 ${
            filterType === 'meta'
              ? 'bg-[#FF6600] text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Metas
        </button>

        <button
          onClick={() => setFilterType('plan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono flex items-center gap-1.5 ${
            filterType === 'plan'
              ? 'bg-[#FF6600] text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Planes
        </button>

        <button
          onClick={() => setFilterType('objetivo')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono flex items-center gap-1.5 ${
            filterType === 'objetivo'
              ? 'bg-[#FF6600] text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Objetivos
        </button>

        <button
          onClick={() => setFilterType('habito')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono flex items-center gap-1.5 ${
            filterType === 'habito'
              ? 'bg-[#FF6600] text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Hábitos
        </button>

        <button
          onClick={() => setFilterType('completadas')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all font-mono flex items-center gap-1.5 ml-auto ${
            filterType === 'completadas'
              ? 'bg-emerald-500 text-black font-black'
              : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Completadas ({completedActions})
        </button>
      </div>

      {/* 4. Actions List */}
      {filteredActions.length === 0 ? (
        <div className="bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <Zap className="w-12 h-12 text-[#FF6600]/40 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">
            No hay acciones en esta vista
          </h3>
          <p className="text-xs text-zinc-400">
            Vincula acciones tácticas a tus metas de ahorro, planes, objetivos o hábitos para acumular XP y avanzar en sincronía.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 px-4 py-2 bg-[#FF6600] hover:bg-orange-500 text-black rounded-xl text-xs font-black font-mono uppercase"
          >
            + Crear Nueva Acción
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action) => {
            const isDone = action.isCompleted;

            let typeBadgeColor = 'bg-zinc-800 text-zinc-300 border-zinc-700';
            let TypeIcon = Zap;
            if (action.targetType === 'meta') {
              typeBadgeColor = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
              TypeIcon = Target;
            } else if (action.targetType === 'plan') {
              typeBadgeColor = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
              TypeIcon = FileText;
            } else if (action.targetType === 'objetivo') {
              typeBadgeColor = 'bg-orange-950/60 text-orange-300 border-[#FF6600]/60';
              TypeIcon = CheckSquare;
            } else if (action.targetType === 'habito') {
              typeBadgeColor = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
              TypeIcon = Flame;
            }

            return (
              <div
                key={action.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                  isDone
                    ? 'bg-[#181818] border-emerald-900/40 opacity-70'
                    : 'bg-[#1e1e1e] border-[#2b2b2b] hover:border-[#FF6600]/50 shadow-xl'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Badges & Target connection */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${typeBadgeColor}`}>
                      <TypeIcon className="w-3 h-3" />
                      {action.targetType}: {action.targetTitle || 'General'}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold font-mono text-[#FF6600] bg-[#FF6600]/15 border border-[#FF6600]/30 px-2 py-0.5 rounded-full">
                        +{action.xpReward} XP
                      </span>
                      <button
                        onClick={() => handleDeleteAction(action.id, action.title)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Eliminar acción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleAction(action.id)}
                      className="mt-0.5 shrink-0 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 hover:text-[#FF6600]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-bold leading-snug ${isDone ? 'line-through text-zinc-400' : 'text-white'}`}>
                        {action.title}
                      </h4>
                      {action.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom status action info */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>
                    {isDone ? 'Completada y sincronizada' : 'Al completar suma XP y avanza la disciplina ligada'}
                  </span>
                  <button
                    onClick={() => toggleAction(action.id)}
                    className={`font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                      isDone
                        ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-[#FF6600] hover:bg-orange-500 text-black font-black'
                    }`}
                  >
                    {isDone ? 'Desmarcar' : 'Marcar Hecha'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Quick Deployment Shortcuts (Atajos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
        <div
          onClick={onOpenExpenseModal}
          className="bg-gradient-to-br from-[#241a14] to-[#1e1e1e] border border-[#FF6600]/40 rounded-3xl p-5 shadow-xl cursor-pointer hover:border-[#FF6600] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] mb-3 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Registrar Gasto o Aporte de Ahorro</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Audita inmediatamente tu fondo disponible en COP ingresando tu compra o aporte real de ahorro.
          </p>
        </div>

        <div
          onClick={onOpenGoalModal}
          className="bg-gradient-to-br from-[#1a211e] to-[#1e1e1e] border border-emerald-900/50 rounded-3xl p-5 shadow-xl cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Fijar Nueva Meta de Ahorro</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Calcula automáticamente el ritmo requerido diario/semanal/mensual para blindar tus finanzas.
          </p>
        </div>
      </div>

      {/* 6. Modal Crear Acción */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest font-mono">
                Conexión de Disciplina
              </span>
              <h3 className="text-xl font-black text-white font-mono mt-0.5">
                Vincular Nueva Acción Táctica
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Define una tarea concreta y conéctala a tu meta, plan u objetivo para que aporte progreso.
              </p>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Título de la Acción *</label>
                <input
                  type="text"
                  required
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder="Ej: Auditar extracto de la tarjeta de crédito..."
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Descripción / Instrucción</label>
                <textarea
                  rows={2}
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  placeholder="Detalle táctico o criterio para darla por hecha..."
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6600] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Conectar con</label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value as ActionTargetType);
                      setSelectedTargetId('');
                    }}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="meta">Meta de Ahorro</option>
                    <option value="plan">Plan Táctico</option>
                    <option value="objetivo">Objetivo Diario</option>
                    <option value="habito">Hábito</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Recompensa en XP</label>
                  <select
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value={15}>+15 XP (Rápida)</option>
                    <option value={25}>+25 XP (Normal)</option>
                    <option value={40}>+40 XP (Desafío Táctico)</option>
                    <option value={60}>+60 XP (Épica)</option>
                  </select>
                </div>
              </div>

              {/* Selector dinámico según el targetType */}
              {targetType === 'meta' && (
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Seleccionar Meta de Ahorro</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="">Seleccionar meta...</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({formatCOP(g.targetAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'plan' && (
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Seleccionar Plan</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="">Seleccionar plan...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'objetivo' && (
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Seleccionar Objetivo Diario</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="">Seleccionar objetivo...</option>
                    {dailyObjectives.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'habito' && (
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Seleccionar Hábito</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="">Seleccionar hábito...</option>
                    {habits.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 mt-2 font-mono"
              >
                Vincular Acción (+{xpReward} XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
