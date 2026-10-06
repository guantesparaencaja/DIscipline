import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { formatCOP } from '../../lib/formatters';

interface FinancialParamsSectionProps {
  initialIncome: number;
  initialEmergencyTarget: number;
  onSave: (income: number, target: number) => void;
  showToast: (msg: string) => void;
}

export const FinancialParamsSection: React.FC<FinancialParamsSectionProps> = ({
  initialIncome,
  initialEmergencyTarget,
  onSave,
  showToast
}) => {
  const [baseIncomeStr, setBaseIncomeStr] = useState(String(initialIncome || 1250000));
  const [emergencyTargetStr, setEmergencyTargetStr] = useState(String(initialEmergencyTarget || 3750000));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = Number(baseIncomeStr.replace(/\D/g, ''));
    const target = Number(emergencyTargetStr.replace(/\D/g, ''));

    if (isNaN(income) || income <= 0) {
      showToast('Ingresa un ingreso mensual válido mayor a 0 COP');
      return;
    }
    onSave(income, target);
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <Wallet className="w-5 h-5 text-[#FF6600]" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Ingreso Base & Meta de Fondo
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-zinc-300 font-bold mb-1">
            Ingreso Mensual Base (COP) *
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            value={baseIncomeStr}
            onChange={(e) => setBaseIncomeStr(e.target.value.replace(/\D/g, ''))}
            placeholder="1250000"
            className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
          />
          <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
            Vista previa: {formatCOP(Number(baseIncomeStr) || 0)}
          </span>
        </div>

        <div>
          <label className="block text-zinc-300 font-bold mb-1">
            Meta Fondo de Emergencia (COP)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={emergencyTargetStr}
            onChange={(e) => setEmergencyTargetStr(e.target.value.replace(/\D/g, ''))}
            placeholder="3750000"
            className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
          />
          <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
            Vista previa: {formatCOP(Number(emergencyTargetStr) || 0)}
          </span>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Guardar Parámetros Financieros
          </button>
        </div>
      </form>
    </div>
  );
};
