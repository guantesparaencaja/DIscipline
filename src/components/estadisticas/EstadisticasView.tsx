import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { formatCOP } from '../../lib/formatters';
import { BarChart3, TrendingUp, Shield, Zap, PieChart as PieIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

export const EstadisticasView: React.FC = () => {
  const {
    financialSettings,
    fixedDeductions,
    expenses,
    dailyObjectives,
    getPowerBreakdown,
    profile
  } = useSayayinStore();

  const breakdown = getPowerBreakdown();

  const income = financialSettings.baseMonthlyIncome || 0;
  const totalFixed = fixedDeductions
    .filter((d) => d.isActive)
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Distribution chart data
  const financialDistribution = [
    { name: 'Deducciones Fijas', value: totalFixed, color: '#F59E0B' },
    { name: 'Gastos Registrados', value: totalExpenses, color: '#EF4444' },
    {
      name: 'Fondo Disponible',
      value: Math.max(0, income - totalFixed - totalExpenses),
      color: '#10B981'
    }
  ];

  // Completion by slot
  const morningObjs = dailyObjectives.filter((o) => o.timeSlot === 'manana');
  const afternoonObjs = dailyObjectives.filter((o) => o.timeSlot === 'tarde');
  const nightObjs = dailyObjectives.filter((o) => o.timeSlot === 'noche');

  const slotStats = [
    {
      slot: 'Mañana',
      total: morningObjs.length,
      done: morningObjs.filter((o) => o.status === 'completado').length
    },
    {
      slot: 'Tarde',
      total: afternoonObjs.length,
      done: afternoonObjs.filter((o) => o.status === 'completado').length
    },
    {
      slot: 'Noche',
      total: nightObjs.length,
      done: nightObjs.filter((o) => o.status === 'completado').length
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Métricas de Combate
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <BarChart3 className="w-6 h-6 text-[#FF6600]" />
          Estadísticas & Auditoría de Ki
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Análisis de distribución de capital, cumplimiento por franja horaria y progresión de poder.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución del Ingreso Mensual */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#FF6600]" />
              Distribución de Ingreso ({formatCOP(income)})
            </h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {financialDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatCOP(Number(val) || 0)}
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-zinc-800/80">
            {financialDistribution.map((d, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 truncate block">{d.name}</span>
                <span className="font-mono font-bold text-white text-xs">{formatCOP(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eficacia por Franja Horaria */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Cumplimiento por Franja Horaria
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slotStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="slot" stroke="#666" fontSize={11} tickLine={false} axisLine={{ stroke: '#333' }} />
                <YAxis stroke="#666" fontSize={11} allowDecimals={false} tickLine={false} axisLine={{ stroke: '#333' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: 12 }}
                />
                <Bar dataKey="done" name="Cumplidos" fill="#FF6600" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total" name="Totales" fill="#333" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Tu disciplina matutina genera el mayor impacto en tu tasa de constancia del mes.
          </p>
        </div>
      </div>
    </div>
  );
};
