import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { X, Target, Calendar, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { GoalPriority, GoalStatus } from '../../types';
import { formatCOP, getTodayDateString } from '../../lib/formatters';
import { GoalSchema, validateForm } from '../../lib/validation';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal, addObjective } = useSayayinStore();

  const todayStr = getTodayDateString();
  const defaultTargetDate = () => {
    const d = new Date(todayStr + 'T12:00:00');
    d.setMonth(d.getMonth() + 3);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Seguridad Financiera');
  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState(defaultTargetDate());
  const [priority, setPriority] = useState<GoalPriority>('alta');
  const [status, setStatus] = useState<GoalStatus>('activa');
  const [targetAmountStr, setTargetAmountStr] = useState('1200000');
  const [motivation, setMotivation] = useState('');
  const [autoGenerateSmartObjective, setAutoGenerateSmartObjective] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetAmount = Number(targetAmountStr.replace(/\D/g, '')) || 0;

  // Live Pace Calculation in Modal
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(targetDate + 'T00:00:00');
  const msDiff = Math.max(1, end.getTime() - start.getTime());
  const daysTotal = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)));
  const monthsTotal = Math.max(0.5, daysTotal / 30.416);
  const weeksTotal = Math.max(1, daysTotal / 7);

  const dailyPace = Math.round(targetAmount / daysTotal);
  const weeklyPace = Math.round(targetAmount / weeksTotal);
  const monthlyPace = Math.round(targetAmount / monthsTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(GoalSchema, {
      title,
      description,
      targetAmount,
      category,
      startDate,
      targetDate,
      priority,
      status
    });

    if (!validation.success) {
      setErrorMsg(validation.error);
      return;
    }
    setErrorMsg(null);

    const cleanTitle = validation.data.title;
    await addGoal({
      title: cleanTitle,
      description: validation.data.description,
      category: validation.data.category,
      startDate: validation.data.startDate,
      targetDate: validation.data.targetDate,
      priority: validation.data.priority,
      status: validation.data.status,
      targetAmount: validation.data.targetAmount,
      motivation: motivation.trim() || 'Forjar libertad e invulnerabilidad financiera de guerrero.'
    });

    if (autoGenerateSmartObjective && dailyPace > 0) {
      await addObjective({
        title: `Separar ahorro diario para: ${cleanTitle}`,
        date: todayStr,
        timeSlot: 'manana',
        difficulty: dailyPace > 50000 ? 'dificil' : 'normal',
        xpReward: dailyPace > 50000 ? 40 : 20,
        savingAmount: dailyPace,
        isPartnerVisible: true,
        recurrence: 'diaria'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border-t sm:border border-[#333] rounded-t-3xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90dvh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          aria-label="Cerrar modal de meta"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#FF6600]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-3 shrink-0">
          <span className="text-xs font-bold text-[#FF6600] uppercase tracking-widest font-mono">
            Metas de Ahorro Real
          </span>
          <h3 className="text-xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            Crear Meta Saiyajin
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Sin barras ficticias: el progreso se alimenta únicamente de tus ahorros reales registrados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-3">
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Título */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">Nombre de la Meta *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Fondo de Emergencia de 3 Meses..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Valor Objetivo (COP) */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Valor Objetivo en Pesos Colombianos (COP) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 1200000"
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-3 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-zinc-400 font-mono">
                {formatCOP(targetAmount)}
              </span>
            </div>
          </div>

          {/* Ritmo Requerido en Vivo Card */}
          {targetAmount > 0 && (
            <div className="bg-[#141414] border border-[#FF6600]/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6600]">
                <Calculator className="w-3.5 h-3.5" />
                <span>Ritmo Requerido Calculado ({daysTotal} días):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#1c1c1c] p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Mensual</span>
                  <span className="font-mono font-bold text-white text-xs">{formatCOP(monthlyPace)}</span>
                </div>
                <div className="bg-[#1c1c1c] p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Semanal</span>
                  <span className="font-mono font-bold text-white text-xs">{formatCOP(weeklyPace)}</span>
                </div>
                <div className="bg-[#1c1c1c] p-2 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Diario</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">{formatCOP(dailyPace)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Categoría & Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="Seguridad Financiera">Seguridad Financiera / Fondo</option>
                <option value="Cuerpo & Mente">Salud, Cuerpo & Entrenamiento</option>
                <option value="Inversión & Negocio">Inversión & Proyectos</option>
                <option value="Educación">Educación & Cursos</option>
                <option value="Experiencia">Viaje / Recreación</option>
                <option value="Adquisición">Bienes / Equipamiento</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="maxima">Máxima (Prioridad Saiyajin)</option>
              </select>
            </div>
          </div>

          {/* Fechas de inicio y límite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Fecha Objetivo (Límite)</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          {/* Motivación */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Motivación personal (¿Por qué es vital esta meta para tu ki?)
            </label>
            <textarea
              rows={2}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Ej: Para tener paz mental total y nunca tener que depender de deudas ni favores..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Generación Automática de Objetivo Inteligente */}
          {targetAmount > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FF6600]/10 border border-[#FF6600]/30">
              <input
                type="checkbox"
                id="autoSmartObjective"
                checked={autoGenerateSmartObjective}
                onChange={(e) => setAutoGenerateSmartObjective(e.target.checked)}
                className="mt-0.5 accent-[#FF6600] rounded w-4 h-4"
              />
              <label htmlFor="autoSmartObjective" className="cursor-pointer text-xs text-zinc-300">
                <span className="font-bold text-white block font-mono">
                  Generar Objetivo Inteligente Automático
                </span>
                Programar objetivo diario con el ritmo requerido de{' '}
                <strong className="text-[#FF6600]">{formatCOP(dailyPace)}</strong> al día para cumplir a tiempo.
              </label>
            </div>
          )}

          </div>

          {/* Sticky Bottom Buttons */}
          <div className="sticky bottom-0 bg-[#1e1e1e] pt-3 pb-1 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-[#252525] font-bold text-xs min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 min-h-[44px] font-mono text-xs focus-visible:ring-2 focus-visible:ring-[#FF6600]"
            >
              Fijar Meta de Ahorro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
