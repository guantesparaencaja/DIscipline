import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { FearCategory } from '../../types';
import { FEAR_TEMPLATES } from '../../lib/constants';
import {
  X,
  ShieldAlert,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface FearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FearModal: React.FC<FearModalProps> = ({ isOpen, onClose }) => {
  const { addFear } = useSayayinStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FearCategory>('escasez');
  const [impactScore, setImpactScore] = useState<number>(7);
  const [actions, setActions] = useState<string[]>([
    'Definir un límite presupuestal estricto para esta semana',
    'Registrar cada gasto al instante para mantener control visual'
  ]);
  const [newActionInput, setNewActionInput] = useState('');

  if (!isOpen) return null;

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionInput.trim()) return;
    setActions([...actions, newActionInput.trim()]);
    setNewActionInput('');
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSelectTemplate = (template: typeof FEAR_TEMPLATES[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setImpactScore(template.impactScore);
    setActions([...template.actions]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addFear({
      title: title.trim(),
      description: description.trim(),
      category,
      impactScore,
      actions: actions.map((act, idx) => ({
        id: 'fa_' + Date.now() + '_' + idx,
        title: act,
        completed: false
      }))
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-purple-800/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-mono uppercase tracking-wide">
              Identificar & Enfrentar Miedo
            </h2>
            <p className="text-xs text-zinc-400">
              Registra una creencia limitante o bloqueo financiero para combatirlo con acciones reales.
            </p>
          </div>
        </div>

        {/* Quick Templates Drawer */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Plantillas de Bloqueos Comunes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEAR_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className="p-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/40 text-left text-[11px] text-zinc-300 hover:text-white transition-all group"
              >
                <span className="font-bold block truncate group-hover:text-purple-300">
                  {tmpl.title}
                </span>
                <span className="text-[9px] text-purple-400 capitalize">
                  {tmpl.category} · Impacto {tmpl.impactScore}/10
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Título del Miedo o Bloqueo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Miedo a mirar el saldo o quedarme sin ahorros"
              required
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Descripción & Efecto en tu Ki
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Cómo te paraliza o sabotea este pensamiento en tu vida cotidiana?"
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category & Impact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FearCategory)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="escasez">Escasez & Carencia</option>
                <option value="inversion">Miedo a Invertir / Riesgo</option>
                <option value="fracaso">Miedo al Fracaso</option>
                <option value="deuda">Ansiedad por Deuda</option>
                <option value="juicio_social">Juicio Social / Aparentar</option>
                <option value="merecimiento">Merecimiento & Tarifas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Nivel de Impacto: {impactScore}/10
              </label>
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

          {/* Combat Actions List */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" /> Acciones de Combate (Cada una otorga +100 XP)
              </label>
              <span className="text-[10px] font-mono text-purple-400">
                {actions.length} acciones
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {actions.map((act, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#141414] border border-zinc-800 text-xs"
                >
                  <span className="text-zinc-200 min-w-0 break-words flex-1">
                    {index + 1}. {act}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add action row */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newActionInput}
                onChange={(e) => setNewActionInput(e.target.value)}
                placeholder="Añadir paso accionable..."
                className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddAction}
                className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 font-mono"
            >
              <Zap className="w-4 h-4" /> Registrar Miedo para Combate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
