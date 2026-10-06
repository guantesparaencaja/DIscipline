import React, { useState } from 'react';
import { CreditCard, Trash2, Plus } from 'lucide-react';
import { FixedDeduction } from '../../types';
import { formatCOP } from '../../lib/formatters';

interface FixedDeductionsSectionProps {
  fixedDeductions: FixedDeduction[];
  onAddDeduction: (name: string, amount: number, category: string) => void;
  onEditDeduction: (id: string, updates: Partial<FixedDeduction>) => void;
  onDeleteDeduction: (ded: FixedDeduction) => void;
}

export const FixedDeductionsSection: React.FC<FixedDeductionsSectionProps> = ({
  fixedDeductions,
  onAddDeduction,
  onEditDeduction,
  onDeleteDeduction
}) => {
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');
  const [newDeductionCategory, setNewDeductionCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeductionName.trim() || !newDeductionAmount.trim()) return;
    onAddDeduction(newDeductionName.trim(), Number(newDeductionAmount) || 0, newDeductionCategory.trim());
    setNewDeductionName('');
    setNewDeductionAmount('');
    setNewDeductionCategory('');
  };

  const totalComprometido = fixedDeductions
    .filter((d) => d.isActive)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Deducciones Fijas Mensuales
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          Total comprometido:{' '}
          <strong className="text-amber-400">{formatCOP(totalComprometido)}</strong>
        </span>
      </div>

      {/* List of existing deductions */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {fixedDeductions.map((ded) => (
          <div
            key={ded.id}
            className="p-3 rounded-2xl bg-[#171717] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={ded.isActive}
                onChange={(e) => onEditDeduction(ded.id, { isActive: e.target.checked })}
                className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
                title="Activar/desactivar descuento en el cálculo"
              />
              <div>
                <h5 className="font-bold text-white">{ded.name}</h5>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {ded.category} · Pago día {ded.dueDay}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-amber-400 text-sm">
                {formatCOP(ded.amount)}
              </span>
              <button
                onClick={() => onDeleteDeduction(ded)}
                className="text-zinc-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new deduction form */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <input
          type="text"
          required
          value={newDeductionName}
          onChange={(e) => setNewDeductionName(e.target.value)}
          placeholder="Nombre (ej: Internet fibra)"
          className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
        />
        <input
          type="text"
          inputMode="numeric"
          required
          value={newDeductionAmount}
          onChange={(e) => setNewDeductionAmount(e.target.value.replace(/\D/g, ''))}
          placeholder="Monto COP (ej: 80000)"
          className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF6600]"
        />
        <input
          type="text"
          value={newDeductionCategory}
          onChange={(e) => setNewDeductionCategory(e.target.value)}
          placeholder="Categoría"
          className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
        />
        <button
          type="submit"
          className="bg-[#242424] hover:bg-[#2e2e2e] text-[#FF6600] border border-[#FF6600]/40 font-bold px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Descuento</span>
        </button>
      </form>
    </div>
  );
};
