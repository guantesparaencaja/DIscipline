import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useSayayinStore } from '../../store/useSayayinStore';
import { getTodayDateString } from '../../lib/formatters';
import { BarChart2 } from 'lucide-react';

export const WeeklyCompletionChart: React.FC = () => {
  const { dailyObjectives } = useSayayinStore();
  const todayStr = getTodayDateString();

  // Generate last 7 days
  const data = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStr + 'T12:00:00');
    d.setDate(d.getDate() - (6 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const dayLabel = d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');

    const dayObjs = (dailyObjectives || []).filter((o) => o && o.date === dateStr);
    const completed = dayObjs.filter((o) => o && o.status === 'completado').length;
    const total = dayObjs.length;

    return {
      day: dayLabel.toUpperCase(),
      dateStr,
      completados: completed,
      pendientes: Math.max(0, total - completed),
      total
    };
  });

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#FF6600]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Rendimiento de los Últimos 7 Días
          </h4>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">Objetivos Cumplidos</span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              stroke="#666"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#333' }}
            />
            <YAxis
              stroke="#666"
              fontSize={10}
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: '#333' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#141414] border border-[#333] p-2 rounded-xl text-xs shadow-xl">
                      <p className="font-bold text-white">{item.day} ({item.dateStr})</p>
                      <p className="text-emerald-400 font-mono mt-0.5">
                        Completados: {item.completados}
                      </p>
                      <p className="text-zinc-400 font-mono">
                        Pendientes: {item.pendientes}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="completados" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.dateStr === todayStr ? '#FF6600' : '#10B981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
          <span>Días anteriores</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6600]" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
};
