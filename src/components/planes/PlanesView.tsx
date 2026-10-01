import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  FileText,
  Plus,
  CheckCircle2,
  Circle,
  Target,
  Calendar,
  ArrowRight,
  Sparkles,
  PauseCircle,
  PlayCircle,
  XCircle,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { Plan, PlanMilestone } from '../../types';
import { formatDateSpanish, getTodayDateString } from '../../lib/formatters';

interface PlanesViewProps {
  onNavigateToGoals: () => void;
}

export const PlanesView: React.FC<PlanesViewProps> = ({ onNavigateToGoals }) => {
  const store = useSayayinStore();
  const plans = store.plans || [];
  const goals = store.goals || [];
  const {
    toggleMilestone,
    addPlan,
    editPlan,
    deletePlan,
    updatePlanStatus,
    generateObjectivesFromPlan
  } = store;

  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'pausado' | 'completado' | 'cancelado'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form state
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [milestones, setMilestones] = useState<{ title: string; targetDate: string }[]>([
    { title: 'Auditoría inicial y fijación de cuota', targetDate: getTodayDateString() },
    { title: 'Primer 25% de ahorro alcanzado', targetDate: getTodayDateString() },
    { title: 'Consolidación de meta al 100%', targetDate: getTodayDateString() }
  ]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const filteredPlans = plans.filter((p) => {
    if (statusFilter === 'todos') return true;
    return p.status === statusFilter;
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setPlanTitle('');
    setPlanDesc('');
    setSelectedGoalId(goals[0]?.id || '');
    setStartDate(getTodayDateString());
    setEndDate(getTodayDateString());
    setMilestones([
      { title: 'Hito 1: Revisión y primer aporte', targetDate: getTodayDateString() },
      { title: 'Hito 2: Mitad del camino alcanzado', targetDate: getTodayDateString() },
      { title: 'Hito 3: Meta cumplida al 100%', targetDate: getTodayDateString() }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanTitle(plan.title);
    setPlanDesc(plan.description);
    setSelectedGoalId(plan.goalId);
    setStartDate(plan.startDate);
    setEndDate(plan.endDate);
    setMilestones(
      (plan.milestones || []).map((m) => ({
        title: m.title,
        targetDate: m.targetDate
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      { title: newMilestoneTitle.trim(), targetDate: endDate || getTodayDateString() }
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    const formattedMilestones: PlanMilestone[] = milestones.map((m, idx) => ({
      id: 'ms_' + Date.now() + '_' + idx,
      title: m.title,
      targetDate: m.targetDate,
      completed: false
    }));

    if (editingPlan) {
      editPlan(editingPlan.id, {
        title: planTitle.trim(),
        description: planDesc.trim(),
        goalId: selectedGoalId,
        startDate,
        endDate,
        milestones: formattedMilestones
      });
    } else {
      addPlan({
        title: planTitle.trim(),
        description: planDesc.trim(),
        goalId: selectedGoalId,
        startDate,
        endDate,
        status: 'activo',
        milestones: formattedMilestones
      });
    }

    setIsModalOpen(false);
  };

  const handleDeletePlan = (id: string, title: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar el plan táctico:\n"${title}"?`);
    if (ok) {
      deletePlan(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
            Estrategia Táctica
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <FileText className="w-6 h-6 text-[#FF6600]" />
            Planes Tácticos de Metas
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Gestiona planes con estados (activo, pausado, completado, cancelado) y genera objetivos diarios automáticos a partir de los hitos del plan.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#FF6600] hover:bg-orange-500 active:scale-95 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 font-mono"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Plan Táctico</span>
        </button>
      </div>

      {/* 2. Status Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        {(['todos', 'activo', 'pausado', 'completado', 'cancelado'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all font-mono capitalize ${
              statusFilter === st
                ? 'bg-[#FF6600] text-black font-black'
                : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
            }`}
          >
            {st === 'todos' ? `Todos (${plans.length})` : st}
          </button>
        ))}
      </div>

      {/* 3. Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl max-w-md mx-auto space-y-3">
          <FileText className="w-12 h-12 text-[#FF6600]/40 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">No hay planes en este estado</h3>
          <p className="text-xs text-zinc-400">
            Crea un plan táctico con hitos ordenados para guiar tus metas de ahorro.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#FF6600] text-black font-bold text-xs px-4 py-2 rounded-xl"
          >
            + Crear Mi Primer Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPlans.map((plan) => {
            const goal = goals.find((g) => g.id === plan.goalId);
            const milestones = plan.milestones || [];
            const completedCount = milestones.filter((m) => m && m.completed).length;
            const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

            let statusBadge = 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
            if (plan.status === 'pausado') statusBadge = 'bg-amber-950/80 text-amber-400 border-amber-800';
            if (plan.status === 'completado') statusBadge = 'bg-blue-950/80 text-blue-400 border-blue-800';
            if (plan.status === 'cancelado') statusBadge = 'bg-rose-950/80 text-rose-400 border-rose-800';

            return (
              <div
                key={plan.id}
                className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-5 transition-all hover:border-[#FF6600]/40"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6600] bg-[#FF6600]/15 px-2.5 py-0.5 rounded-full border border-[#FF6600]/30 font-mono">
                        {goal ? `Meta: ${goal.title}` : 'Meta General'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-mono ${statusBadge}`}>
                        {plan.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white font-mono mt-1">{plan.title}</h3>
                    {plan.description && (
                      <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">{plan.description}</p>
                    )}
                  </div>

                  {/* Plan status controls and edit */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={plan.status}
                      onChange={(e) => updatePlanStatus(plan.id, e.target.value as any)}
                      className="bg-[#141414] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#FF6600]"
                    >
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors"
                      title="Editar plan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePlan(plan.id, plan.title)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-[#252525] hover:bg-[#303030] transition-colors"
                      title="Eliminar plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Avance de Hitos:</span>
                    <span className="text-white font-bold">
                      {completedCount} de {milestones.length} hitos ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF6600] to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                      Hitos del Plan
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Haz clic en un hito para marcarlo como completado
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(plan.id, m.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
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

                {/* Action generator footer */}
                <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Plazo: {formatDateSpanish(plan.startDate)} al {formatDateSpanish(plan.endDate)}
                  </span>

                  <button
                    onClick={() => generateObjectivesFromPlan(plan.id)}
                    className="flex items-center gap-2 bg-[#252525] hover:bg-[#303030] text-zinc-200 hover:text-white border border-zinc-700/60 font-bold text-xs px-4 py-2 rounded-xl transition-all font-mono"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
                    <span>Generar Objetivos Diarios desde el Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal Crear / Editar Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-zinc-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest font-mono">
                Estrategia Táctica
              </span>
              <h3 className="text-xl font-black text-white font-mono mt-0.5">
                {editingPlan ? 'Editar Plan Táctico' : 'Crear Plan Táctico'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Estructura tu meta en hitos cronológicos claros y ejecutables.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Título del Plan *</label>
                <input
                  type="text"
                  required
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Ej: Plan Blindaje de Ahorro Rápido en 90 Días..."
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Estrategia general para cumplir este plan..."
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FF6600] resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Meta de Ahorro Asociada</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="">Selecciona meta vinculada...</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              {/* Milestones builder */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-bold">Hitos del Plan ({milestones.length})</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141414] border border-zinc-800"
                    >
                      <span className="text-zinc-200 truncate flex-1">
                        {idx + 1}. {m.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Nuevo hito táctico..."
                    className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold"
                  >
                    + Hito
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 mt-3 font-mono"
              >
                {editingPlan ? 'Guardar Cambios del Plan' : 'Crear Plan Táctico'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
