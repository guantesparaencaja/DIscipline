import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  X,
  Sparkles,
  Clock,
  Zap,
  PiggyBank,
  Users,
  Repeat,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { DIFFICULTY_CONFIG, SMART_OBJECTIVE_TEMPLATES, TIME_SLOT_CONFIG } from '../../lib/constants';
import { ObjectiveDifficulty, RecurrenceType, TimeSlot } from '../../types';
import { formatCOP, getTodayDateString } from '../../lib/formatters';

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({ isOpen, onClose }) => {
  const { selectedDate, goals, addObjective } = useSayayinStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate || getTodayDateString());
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('manana');
  const [customTime, setCustomTime] = useState('');
  const [difficulty, setDifficulty] = useState<ObjectiveDifficulty>('normal');
  const [savingAmountStr, setSavingAmountStr] = useState('');
  const [goalId, setGoalId] = useState(goals[0]?.id || '');
  const [isPartnerVisible, setIsPartnerVisible] = useState(true);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('diaria');

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: (typeof SMART_OBJECTIVE_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setTimeSlot(tmpl.timeSlot);
    setDifficulty(tmpl.difficulty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Ingresa el título del objetivo');
      return;
    }

    const savingAmount = savingAmountStr ? Number(savingAmountStr.replace(/\D/g, '')) : undefined;
    const xpReward = DIFFICULTY_CONFIG[difficulty].xp;

    addObjective({
      title: title.trim(),
      date,
      timeSlot,
      customTime: customTime.trim() || undefined,
      difficulty,
      xpReward,
      savingAmount: savingAmount && savingAmount > 0 ? savingAmount : undefined,
      goalId: savingAmount && goalId ? goalId : undefined,
      isPartnerVisible,
      recurrence
    });

    // Reset and close
    setTitle('');
    setSavingAmountStr('');
    setCustomTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Rutina & Disciplina Saiyajin
          </span>
          <h3 className="text-xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            Crear Objetivo Diario con Horario
          </h3>
        </div>

        {/* Smart Templates Carousel / Badges */}
        <div className="mb-4 p-3 bg-[#151515] rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6600] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plantillas de Disciplina Rápida (Click para aplicar):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {SMART_OBJECTIVE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="text-[11px] bg-[#222] hover:bg-[#2c2c2c] hover:border-[#FF6600]/60 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60 transition-colors text-left truncate max-w-full"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Título */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">Título del Objetivo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Registrar gastos del día y verificar presupuesto..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Fecha y Franja Horaria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Fecha programada</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Franja Horaria *</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="manana">Mañana (06:00 - 12:00)</option>
                <option value="tarde">Tarde (12:00 - 18:00)</option>
                <option value="noche">Noche (18:00 - 23:59)</option>
                <option value="personalizada">Hora fija personalizada</option>
              </select>
            </div>
          </div>

          {/* Hora personalizada si aplica */}
          {timeSlot === 'personalizada' && (
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Hora exacta (HH:mm)</label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          )}

          {/* Dificultad y Recompensa XP */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1.5">
              Dificultad & Recompensa de Ki (XP) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['facil', 'normal', 'dificil', 'extremo'] as ObjectiveDifficulty[]).map((diff) => {
                const conf = DIFFICULTY_CONFIG[diff];
                const isSelected = difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                      isSelected
                        ? `${conf.badgeColor} ring-2 ring-[#FF6600]`
                        : 'bg-[#141414] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs">{conf.label}</span>
                    <span className="text-[10px] opacity-80">+{conf.xp} XP</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monto de Ahorro Opcional */}
          <div className="bg-[#161616] p-3 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span>Ahorro Opcional Vinculado a este objetivo (COP)</span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Al completar este objetivo, se registrará automáticamente un ahorro real para tu meta.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={savingAmountStr}
                onChange={(e) => setSavingAmountStr(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 20000"
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF6600]"
              />

              {goals.length > 0 && savingAmountStr && (
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Visibilidad para compañero & Repetición */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Repetición</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="diaria">Repetir Todos los Días</option>
                <option value="una_vez">Solo una vez (Fecha seleccionada)</option>
                <option value="dias_semana">Días de semana (Lun a Vie)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#141414] rounded-xl border border-zinc-800">
              <div>
                <span className="font-bold text-white block">Visible a Compañero</span>
                <span className="text-[10px] text-zinc-400">Podrá ver tu avance en vivo</span>
              </div>
              <input
                type="checkbox"
                checked={isPartnerVisible}
                onChange={(e) => setIsPartnerVisible(e.target.checked)}
                className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 mt-2"
          >
            Agregar Objetivo al Radar
          </button>
        </form>
      </div>
    </div>
  );
};
