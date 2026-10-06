import React from 'react';
import { X } from 'lucide-react';
import { formatCOP } from '../../lib/formatters';

interface CategoryBudgetModalProps {
  category: any;
  budgetInputStr: string;
  onChangeInput: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({
  category,
  budgetInputStr,
  onChangeInput,
  onClose,
  onSubmit
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-widest font-mono">
            Límite Presupuestario
          </span>
          <h3 className="text-lg font-black text-white font-mono mt-0.5">
            {category.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Fija el gasto máximo mensual. Te alertará al 80% y 100%.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Tope Mensual (Pesos Colombianos COP) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={budgetInputStr}
                onChange={(e) => onChangeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 300000"
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
              />
              <span className="absolute right-3.5 top-3 text-xs text-zinc-400 font-mono">
                {formatCOP(Number(budgetInputStr) || 0)}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 font-mono block mb-1.5">
              Sugerencias rápidas:
            </span>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              {[100000, 200000, 350000, 500000, 800000, 1200000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeInput(String(val))}
                  className="py-1.5 px-2 bg-[#161616] hover:bg-[#252525] border border-zinc-800 rounded-lg text-zinc-300 transition-colors font-bold text-center"
                >
                  {formatCOP(val)}
                </button>
              ))}
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
              className="px-5 py-2 rounded-xl bg-[#FF6600] hover:bg-orange-500 text-black font-black font-mono uppercase tracking-wider"
            >
              Guardar Límite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
