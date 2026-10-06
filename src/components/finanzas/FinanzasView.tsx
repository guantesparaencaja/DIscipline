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
  Settings,
  AlertTriangle,
  AlertOctagon,
  PieChart,
  Edit2,
  X
} from 'lucide-react';
import { CategoryBudgetModal } from './CategoryBudgetModal';

interface FinanzasViewProps {
  onOpenExpenseModal: () => void;
  onOpenConfig: () => void;
}

export const FinanzasView: React.FC<FinanzasViewProps> = ({
  onOpenExpenseModal,
  onOpenConfig
}) => {
  const store = useSayayinStore();
  const financialSettings = store.financialSettings || { baseMonthlyIncome: 1250000 };
  const fixedDeductions = store.fixedDeductions || [];
  const expenses = store.expenses || [];
  const goals = store.goals || [];
  const categories = store.categories || [];
  const { deleteExpense, getAvailableFunds, updateCategoryBudget } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'gastos' | 'ahorros'>('all');
  const [budgetModalCategory, setBudgetModalCategory] = useState<any>(null);
  const [budgetInputStr, setBudgetInputStr] = useState('');

  const income = financialSettings.baseMonthlyIncome || 0;
  const activeFixedDeductions = fixedDeductions.filter((d) => d && d.isActive);
  const totalFixed = activeFixedDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const availableFunds = getAvailableFunds();

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const handleOpenBudgetModal = (cat: any) => {
    setBudgetModalCategory(cat);
    setBudgetInputStr(String(cat.budgetLimit || 150000));
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetModalCategory) return;
    const amount = Number(budgetInputStr.replace(/\D/g, '')) || 0;
    updateCategoryBudget(budgetModalCategory.id, amount);
    setBudgetModalCategory(null);
  };

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

      {/* 4. Presupuesto Mensual por Categoría con Alertas (80% y 100%) */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#FF6600]" />
              Presupuesto Mensual por Categoría
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Control de límites con alerta temprana al <strong className="text-amber-400 font-bold">80%</strong> y alerta roja al <strong className="text-rose-400 font-bold">100%</strong>.
            </p>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Mes evaluado: {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Dynamic Critical Alert Banners */}
        {(() => {
          const categoriesWithMetrics = categories.map((cat) => {
            const spent = expenses
              .filter((e) => !e.isSaving && e.categoryId === cat.id && e.date.startsWith(currentMonthStr))
              .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const limit = cat.budgetLimit || 300000;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            return { ...cat, spent, limit, pct };
          });

          const exceeded = categoriesWithMetrics.filter((c) => c.pct >= 100);
          const warning80 = categoriesWithMetrics.filter((c) => c.pct >= 80 && c.pct < 100);

          return (
            <div className="space-y-2">
              {exceeded.length > 0 && (
                <div className="bg-rose-950/40 border border-rose-600/60 rounded-2xl p-3.5 flex items-start gap-3 text-xs animate-pulse">
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-rose-300 font-bold font-mono block">
                      ¡ALERTA CRÍTICA: LÍMITE PRESUPUESTARIO SUPERADO AL 100%!
                    </strong>
                    <span className="text-zinc-300 leading-relaxed">
                      Has excedido el tope fijado en: {exceeded.map((c) => `${c.name} (${c.pct}%)`).join(', ')}.
                      Modera los desembolsos en estas áreas para evitar drenar tu Fondo Disponible.
                    </span>
                  </div>
                </div>
              )}

              {warning80.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-amber-300 font-bold font-mono block">
                      ¡ADVERTENCIA: ZONA DE RIESGO SUPERIOR AL 80%!
                    </strong>
                    <span className="text-zinc-300 leading-relaxed">
                      Las siguientes categorías están cerca de agotarse: {warning80.map((c) => `${c.name} (${c.pct}%)`).join(', ')}.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Categories Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {categories.map((cat) => {
            const spent = expenses
              .filter((e) => !e.isSaving && e.categoryId === cat.id && e.date.startsWith(currentMonthStr))
              .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            const limit = cat.budgetLimit || 300000;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const remaining = Math.max(0, limit - spent);

            let statusColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
            let barGradient = 'from-emerald-500 to-emerald-400';
            let statusLabel = 'Bajo control';

            if (pct >= 100) {
              statusColor = 'text-rose-400 bg-rose-950/80 border-rose-800/80';
              barGradient = 'from-rose-600 to-rose-400';
              statusLabel = '¡100% Excedido!';
            } else if (pct >= 80) {
              statusColor = 'text-amber-400 bg-amber-950/80 border-amber-800/80';
              barGradient = 'from-amber-600 to-amber-400';
              statusLabel = '¡Alerta 80%!';
            }

            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-[#181818] ${
                  pct >= 100
                    ? 'border-rose-600/70 shadow-lg shadow-rose-950/30'
                    : pct >= 80
                    ? 'border-amber-600/60'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#FF6600' }}
                    />
                    <h5 className="font-bold text-white text-xs truncate font-mono">
                      {cat.name}
                    </h5>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border font-mono uppercase ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${barGradient}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>{pct}% gastado</span>
                    <span>
                      {pct >= 100 ? (
                        <strong className="text-rose-400 font-bold">Excedido en {formatCOP(spent - limit)}</strong>
                      ) : (
                        <span>Restante: {formatCOP(remaining)}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Amount details and Edit button */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      Gastado / Límite
                    </span>
                    <div className="font-mono font-bold text-white text-xs">
                      <span className={pct >= 100 ? 'text-rose-400' : 'text-zinc-200'}>
                        {formatCOP(spent)}
                      </span>
                      <span className="text-zinc-500"> / </span>
                      <span className="text-zinc-400">{formatCOP(limit)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBudgetModal(cat)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-[#222] hover:bg-[#2c2c2c] border border-zinc-700/40 transition-colors flex items-center gap-1 font-mono text-[10px]"
                    title="Editar límite de presupuesto"
                  >
                    <Edit2 className="w-3 h-3 text-[#FF6600]" />
                    <span>Límite</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Historial Filtrable de Gastos y Ahorros */}
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

      {/* 6. Modal para Editar Límite de Presupuesto */}
      {budgetModalCategory && (
        <CategoryBudgetModal
          category={budgetModalCategory}
          budgetInputStr={budgetInputStr}
          onChangeInput={setBudgetInputStr}
          onClose={() => setBudgetModalCategory(null)}
          onSubmit={handleSaveBudget}
        />
      )}
    </div>
  );
};
