import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { formatCOP, formatDateSpanish } from '../../lib/formatters';
import {
  Wallet,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  PiggyBank,
  ArrowDownRight,
  TrendingDown,
  CheckCircle2,
  Calendar,
  CreditCard,
  Settings
} from 'lucide-react';
import { PaymentMethod } from '../../types';

interface FinanzasViewProps {
  onOpenExpenseModal: () => void;
  onOpenConfig: () => void;
}

export const FinanzasView: React.FC<FinanzasViewProps> = ({
  onOpenExpenseModal,
  onOpenConfig
}) => {
  const {
    financialSettings,
    fixedDeductions,
    expenses,
    goals,
    categories,
    deleteExpense,
    getAvailableFunds
  } = useSayayinStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'gastos' | 'ahorros'>('all');

  const income = financialSettings.baseMonthlyIncome || 0;
  const activeFixedDeductions = fixedDeductions.filter((d) => d.isActive);
  const totalFixed = activeFixedDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableFunds = getAvailableFunds();

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || e.categoryId === selectedCategoryFilter;
    const matchesType =
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'ahorros' && e.isSaving) ||
      (selectedTypeFilter === 'gastos' && !e.isSaving);

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleDelete = (id: string, description: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar el registro de gasto:\n"${description}"?`);
    if (ok) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Gestión Financiera
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Wallet className="w-6 h-6 text-[#FF6600]" />
            Radar de Finanzas Personales
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Moneda oficial: Pesos Colombianos (COP). Cada movimiento actualiza tu Fondo Disponible en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 text-xs bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 hover:text-white border border-zinc-700/60 px-3 py-2.5 rounded-xl font-semibold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Editar Ingreso & Deducciones</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-2 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[3]" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fondo Disponible */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Fondo Disponible Real
          </span>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              availableFunds > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCOP(availableFunds)}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            Ingreso − Deducciones − Gastos
          </span>
        </div>

        {/* Ingreso Base */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Ingreso Base Mensual
          </span>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {formatCOP(income)}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Configurado por usuario</span>
        </div>

        {/* Deducciones Fijas */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Deducciones Fijas ({activeFixedDeductions.length})
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
            {formatCOP(totalFixed)}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            Arriendo, diezmo, traje, salidas, fondo
          </span>
        </div>

        {/* Gastos Totales */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-2xl p-4 shadow-lg">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Gastos Registrados
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
            {formatCOP(totalExpenses)}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">{expenses.length} movimientos</span>
        </div>
      </div>

      {/* 3. Deducciones Fijas Desplegadas (Fase 1 Defaults) */}
      <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" /> Deducciones Fijas Comprometidas
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            Total comprometido: <strong className="text-white">{formatCOP(totalFixed)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {fixedDeductions.map((ded) => (
            <div
              key={ded.id}
              className={`p-3 rounded-2xl border transition-all ${
                ded.isActive
                  ? 'bg-[#181818] border-zinc-800'
                  : 'bg-[#141414] border-zinc-900 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                <span className="truncate">{ded.category}</span>
                <span className="font-mono">Día {ded.dueDay}</span>
              </div>
              <h5 className="text-xs font-bold text-white truncate">{ded.name}</h5>
              <div className="text-sm font-black text-amber-400 font-mono mt-1">
                {formatCOP(ded.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Historial Filtrable de Gastos y Ahorros */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl space-y-4">
        {/* Filters and search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar gasto o ahorro..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type selector */}
            <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedTypeFilter === 'all' ? 'bg-[#FF6600] text-black' : 'text-zinc-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedTypeFilter('gastos')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedTypeFilter === 'gastos' ? 'bg-[#FF6600] text-black' : 'text-zinc-400'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setSelectedTypeFilter('ahorros')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedTypeFilter === 'ahorros' ? 'bg-[#FF6600] text-black' : 'text-zinc-400'
                }`}
              >
                Ahorros
              </button>
            </div>

            {/* Category filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6600]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Descripción</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#242424]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {exp.isSaving ? (
                          <span className="p-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                            <PiggyBank className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-lg bg-zinc-800 text-zinc-400">
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-white leading-tight">{exp.description}</p>
                          {exp.note && <span className="text-[10px] text-zinc-400">{exp.note}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-zinc-300">
                      <span className="bg-[#161616] border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                        {exp.categoryName}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-zinc-400 capitalize">
                      {exp.paymentMethod.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                      {formatDateSpanish(exp.date)}
                    </td>

                    <td
                      className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                        exp.isSaving ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {exp.isSaving ? '+' : '−'}
                      {formatCOP(exp.amount)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDelete(exp.id, exp.description)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
