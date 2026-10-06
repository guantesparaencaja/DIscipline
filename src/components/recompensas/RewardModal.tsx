import React from 'react';
import { X } from 'lucide-react';
import { PersonalReward } from '../../types';

interface RewardModalProps {
  isOpen: boolean;
  editingReward: PersonalReward | null;
  rewardTitle: string;
  setRewardTitle: (val: string) => void;
  rewardDesc: string;
  setRewardDesc: (val: string) => void;
  rewardCategory: string;
  setRewardCategory: (val: string) => void;
  rewardCost: number;
  setRewardCost: (val: number) => void;
  rewardIcon: string;
  setRewardIcon: (val: string) => void;
  categories: string[];
  rewardIcons: Record<string, React.ElementType>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  editingReward,
  rewardTitle,
  setRewardTitle,
  rewardDesc,
  setRewardDesc,
  rewardCategory,
  setRewardCategory,
  rewardCost,
  setRewardCost,
  rewardIcon,
  setRewardIcon,
  categories,
  rewardIcons,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
            {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa Personal'}
          </span>
          <h3 className="text-lg font-black text-white font-mono mt-0.5">
            {editingReward ? 'Ajustar Premio' : 'Crear Premio Canjeable'}
          </h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-bold mb-1">Título de la Recompensa *</label>
            <input
              type="text"
              required
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="Ej: Salida a comer sushi, Tarde de videojuegos..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">Descripción / Reglas</label>
            <textarea
              rows={2}
              value={rewardDesc}
              onChange={(e) => setRewardDesc(e.target.value)}
              placeholder="¿Qué condiciones te concedes para disfrutar este premio?"
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">Categoría</label>
            <select
              value={rewardCategory}
              onChange={(e) => setRewardCategory(e.target.value)}
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Costo en XP Disponible ({rewardCost} XP)
            </label>
            <input
              type="number"
              min={10}
              step={10}
              required
              value={rewardCost}
              onChange={(e) => setRewardCost(Number(e.target.value))}
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-2 mt-2">
              {[50, 100, 150, 200, 300].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRewardCost(v)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                    rewardCost === v
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-[#181818] text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {v} XP
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">Ícono</label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(rewardIcons).map((iconKey) => {
                const Comp = rewardIcons[iconKey];
                const isSelected = rewardIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setRewardIcon(iconKey)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-[#181818] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Comp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] font-mono font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black font-mono uppercase tracking-wider"
            >
              {editingReward ? 'Guardar Cambios' : 'Crear Recompensa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
