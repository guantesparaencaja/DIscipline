import React, { useState, useEffect } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { Fear, FearCategory, FearStep } from '../../types';
import { FEAR_TEMPLATES } from '../../lib/constants';
import {
  X,
  ShieldAlert,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Flame,
  AlertCircle
} from 'lucide-react';

interface FearModalProps {
  isOpen: boolean;
  onClose: () => void;
  fearToEdit?: Fear | null;
}

interface StepFormItem {
  id?: string;
  title: string;
  description: string;
  xpReward: number;
  braveryPoints: number;
  isCompleted?: boolean;
}

export const FearModal: React.FC<FearModalProps> = ({ isOpen, onClose, fearToEdit }) => {
  const { addFear, editFear, addToast } = useSayayinStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FearCategory>('escasez');
  const [impactScore, setImpactScore] = useState<number>(7);
  const [steps, setSteps] = useState<StepFormItem[]>([
    {
      title: 'Nivel 1: Mirar y nombrar el miedo sin juicio',
      description: 'Reconocer el bloqueo con respiración diafragmática.',
      xpReward: 20,
      braveryPoints: 10
    },
    {
      title: 'Nivel 2: Acción preparatoria en entorno seguro',
      description: 'Dar un primer ensayo controlado.',
      xpReward: 30,
      braveryPoints: 15
    },
    {
      title: 'Nivel 3: Ejecución de combate real decisivo',
      description: 'Romper la barrera mental y registrar la victoria.',
      xpReward: 50,
      braveryPoints: 25
    }
  ]);

  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepXP, setNewStepXP] = useState(25);
  const [newStepBravery, setNewStepBravery] = useState(15);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (fearToEdit) {
      setTitle(fearToEdit.title);
      setDescription(fearToEdit.description || '');
      setCategory(fearToEdit.category);
      setImpactScore(fearToEdit.impactScore || 7);
      if (fearToEdit.steps && fearToEdit.steps.length > 0) {
        setSteps(
          fearToEdit.steps.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description || '',
            xpReward: s.xpReward,
            braveryPoints: s.braveryPoints,
            isCompleted: s.isCompleted
          }))
        );
      }
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setCategory('escasez');
      setImpactScore(7);
      setSteps([
        {
          title: 'Nivel 1: Observar el bloqueo financiero con calma',
          description: 'Mirar los números reales sin culparse.',
          xpReward: 20,
          braveryPoints: 10
        },
        {
          title: 'Nivel 2: Acción preparatoria y controlada',
          description: 'Realizar un ensayo seguro sin riesgo de perder ki.',
          xpReward: 30,
          braveryPoints: 15
        },
        {
          title: 'Nivel 3: Enfrentamiento real directo',
          description: 'Dar el paso firme y consolidar disciplina.',
          xpReward: 50,
          braveryPoints: 25
        }
      ]);
    }
    setValidationError(null);
  }, [fearToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: (typeof FEAR_TEMPLATES)[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category as FearCategory);
    setImpactScore(template.impactScore);
    if (template.steps && template.steps.length >= 3) {
      setSteps(
        template.steps.map((s, idx) => ({
          title: `Nivel ${idx + 1}: ${s.title.replace(/^Nivel \d+:\s*/, '')}`,
          description: s.description || '',
          xpReward: s.xpReward || 25,
          braveryPoints: s.braveryPoints || 15
        }))
      );
    }
    setValidationError(null);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;
    if (steps.length >= 10) {
      setValidationError('La escalera de exposición no puede tener más de 10 niveles.');
      return;
    }

    const nextLevelNum = steps.length + 1;
    const cleanTitle = newStepTitle.trim().replace(/^Nivel \d+:\s*/, '');

    setSteps([
      ...steps,
      {
        title: `Nivel ${nextLevelNum}: ${cleanTitle}`,
        description: newStepDesc.trim() || 'Escalón de superación gradual.',
        xpReward: newStepXP,
        braveryPoints: newStepBravery
      }
    ]);

    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepXP(25 + steps.length * 5);
    setNewStepBravery(15 + steps.length * 5);
    setValidationError(null);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 3) {
      setValidationError('Criterio obligatorio: La escalera de exposición requiere un mínimo de 3 niveles.');
      return;
    }
    const filtered = steps.filter((_, i) => i !== index);
    // Renumber levels
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      title: `Nivel ${idx + 1}: ${s.title.replace(/^Nivel \d+:\s*/, '')}`
    }));
    setSteps(renumbered);
    setValidationError(null);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const copy = [...steps];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Renumber
    const renumbered = copy.map((s, idx) => ({
      ...s,
      title: `Nivel ${idx + 1}: ${s.title.replace(/^Nivel \d+:\s*/, '')}`
    }));
    setSteps(renumbered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('El título del miedo es obligatorio.');
      return;
    }

    if (steps.length < 3 || steps.length > 10) {
      setValidationError('La escalera de exposición debe contener entre 3 y 10 niveles.');
      return;
    }

    const formattedSteps: FearStep[] = steps.map((s, idx) => ({
      id: s.id || `fstep_${Date.now()}_${idx + 1}`,
      fearId: fearToEdit ? fearToEdit.id : '',
      title: s.title,
      description: s.description,
      stepOrder: idx + 1,
      xpReward: s.xpReward,
      braveryPoints: s.braveryPoints,
      isCompleted: !!s.isCompleted
    }));

    if (fearToEdit) {
      editFear(fearToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        impactScore,
        steps: formattedSteps
      });
      addToast({
        type: 'success',
        title: 'Escalera de Miedo actualizada',
        description: `Se actualizaron los ${formattedSteps.length} niveles de exposición.`
      });
    } else {
      addFear({
        title: title.trim(),
        description: description.trim(),
        category,
        impactScore,
        braveryScore: 0,
        steps: formattedSteps
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#181818] border-t sm:border border-purple-800/60 rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de miedo"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 shrink-0 pb-3 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">
              Escalera de Exposición Gradual (3 a 10 Niveles)
            </span>
            <h2 className="text-xl font-black text-white font-mono uppercase tracking-tight mt-0.5">
              {fearToEdit ? 'Editar Escalera de Miedo' : 'Forjar Escalera de Miedo'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Supera la ansiedad paso a paso. No se puede saltar niveles: cada escalón superado suma XP y Valentía.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-3">
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">

        {/* Templates selector if creating new */}
        {!fearToEdit && (
          <div className="space-y-2 pt-1 border-t border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Plantillas de Escalera de Combate:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEAR_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-2.5 rounded-2xl bg-purple-950/20 hover:bg-purple-950/50 border border-purple-900/40 text-left text-xs text-zinc-300 hover:text-white transition-all group"
                >
                  <span className="font-bold block truncate group-hover:text-purple-300">
                    {tmpl.title}
                  </span>
                  <span className="text-[10px] text-purple-400 block font-mono mt-0.5">
                    {tmpl.steps?.length || 5} niveles · {tmpl.category.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Nombre del Miedo o Bloqueo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Hablar en público / Miedo a invertir"
              required
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
              Descripción & Efecto en tu Ki
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué síntomas físicos o pensamientos limitantes detona este miedo?"
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FearCategory)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="escasez">Escasez & Carencia</option>
                <option value="inversion">Miedo a Invertir / Riesgo</option>
                <option value="fracaso">Miedo al Fracaso</option>
                <option value="deuda">Ansiedad por Deuda</option>
                <option value="juicio_social">Juicio Social & Exposición</option>
                <option value="merecimiento">Merecimiento & Tarifas</option>
                <option value="social">Social & Relaciones</option>
                <option value="profesional">Desafío Profesional</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                  Impacto Emocional
                </label>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {impactScore} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={impactScore}
                onChange={(e) => setImpactScore(Number(e.target.value))}
                className="w-full accent-purple-500 mt-2"
              />
            </div>
          </div>

          {/* Exposure Ladder Steps Builder */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Target className="w-4 h-4 text-purple-400" />
                Escalera de Exposición ({steps.length} de 10 niveles)
              </label>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                steps.length >= 3 && steps.length <= 10
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                Min 3 · Max 10
              </span>
            </div>

            {/* List of ordered levels */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#121212] border border-zinc-800 hover:border-purple-800/60 p-3 rounded-2xl flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{step.title}</div>
                      {step.description && (
                        <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{step.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-purple-300">
                        <span>+{step.xpReward} XP</span>
                        <span>·</span>
                        <span className="text-amber-400">+{step.braveryPoints} Valentía</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Step: Move up, down, delete */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStep(idx, 'up')}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800"
                      title="Mover nivel arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => handleMoveStep(idx, 'down')}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800"
                      title="Mover nivel abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                      title="Eliminar escalón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Step Inputs (if < 10) */}
            {steps.length < 10 && (
              <div className="bg-[#141414] border border-purple-900/40 p-3.5 rounded-2xl space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block font-mono">
                  + Agregar Escalón Nivel {steps.length + 1}
                </span>

                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder={`Ej: Nivel ${steps.length + 1}: Exponer propuesta a 1 amigo en privado...`}
                  className="w-full bg-[#1c1c1c] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />

                <input
                  type="text"
                  value={newStepDesc}
                  onChange={(e) => setNewStepDesc(e.target.value)}
                  placeholder="Detalle o instrucción táctica para este escalón..."
                  className="w-full bg-[#1c1c1c] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-zinc-400 text-[10px]">XP:</span>
                    <input
                      type="number"
                      min={10}
                      max={150}
                      value={newStepXP}
                      onChange={(e) => setNewStepXP(Number(e.target.value))}
                      className="w-16 bg-[#1c1c1c] border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-white"
                    />
                    <span className="text-zinc-400 text-[10px] ml-1">Valentía:</span>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={newStepBravery}
                      onChange={(e) => setNewStepBravery(Number(e.target.value))}
                      className="w-16 bg-[#1c1c1c] border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStep}
                    disabled={!newStepTitle.trim()}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Nivel
                  </button>
                </div>
              </div>
            )}
          </div>

          </div>
          </div>

          {/* Sticky Submit Button */}
          <div className="sticky bottom-0 bg-[#181818] pt-3 pb-1 border-t border-zinc-800 shrink-0">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 font-mono min-h-[44px] focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Zap className="w-4 h-4" />
              <span>{fearToEdit ? 'Guardar Cambios de la Escalera' : 'Registrar Miedo con Escalera de Exposición'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
