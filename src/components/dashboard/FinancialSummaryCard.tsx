import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { formatCOP } from '../../lib/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  PlusCircle,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

interface FinancialSummaryCardProps {
  onOpenExpenseModal: () => void;
  onNavigateToFinances: () => void;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  onOpenExpenseModal,
  onNavigateToFinances
}) => {
  const { financialSettings, fixedDeductions, expenses, goals, getAvailableFunds } = useSayayinStore();

  const income = financialSettings.baseMonthlyIncome || 0;
  const activeDeductionsTotal = fixedDeductions
    .filter((d) => d.isActive)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalSavedInGoals = goals.reduce((sum, g) => sum + (Number(g.currentSavings) || 0), 0);

  const availableFunds = getAvailableFunds();
  const isHealthy = availableFunds > income * 0.15;
  const isWarning = availableFunds >= 0 && availableFunds <= income * 0.15;
  const isNegative = availableFunds < 0;

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Control de Ki Financiero
              </span>
              <h3 className="text-base font-bold text-white font-mono">Radar de Finanzas</h3>
            </div>
          </div>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 text-xs bg-[#252525] hover:bg-[#2e2e2e] text-[#FF6600] border border-[#FF6600]/40 px-3 py-1.5 rounded-xl font-bold transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Registrar Gasto</span>
          </button>
        </div>

        {/* Fondo Disponible Big Display */}
        <div className="bg-[#171717] border border-[#2a2a2a] rounded-2xl p-4 my-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Fondo Disponible Actual</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isHealthy
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                  : isWarning
                  ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                  : 'bg-rose-950 text-rose-400 border border-rose-800/60'
              }`}
            >
              {isHealthy ? 'Saludable' : isWarning ? 'Ajustado' : 'Déficit'}
            </span>
          </div>

          <div
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              isHealthy ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {formatCOP(availableFunds)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">
            = Ingreso ({formatCOP(income)}) − Fijos ({formatCOP(activeDeductionsTotal)}) − Gastos ({formatCOP(totalExpenses)})
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-2 text-xs">
          <div className="bg-[#171717] border border-zinc-800/80 p-2.5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Ingreso Base</span>
            <span className="font-mono font-bold text-zinc-200">{formatCOP(income)}</span>
          </div>

          <div className="bg-[#171717] border border-zinc-800/80 p-2.5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Deducciones Fijas</span>
            <span className="font-mono font-bold text-amber-400">{formatCOP(activeDeductionsTotal)}</span>
          </div>

          <div className="bg-[#171717] border border-zinc-800/80 p-2.5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Gastos del Mes</span>
            <span className="font-mono font-bold text-rose-400">{formatCOP(totalExpenses)}</span>
          </div>

          <div className="bg-[#171717] border border-zinc-800/80 p-2.5 rounded-xl">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Ahorro en Metas</span>
            <span className="font-mono font-bold text-[#FF6600]">{formatCOP(totalSavedInGoals)}</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation Link */}
      <button
        onClick={onNavigateToFinances}
        className="w-full mt-3 py-2 text-xs text-zinc-400 hover:text-white bg-[#222] hover:bg-[#282828] rounded-xl border border-zinc-700/60 font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <span>Gestionar Presupuesto & Descuentos</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
