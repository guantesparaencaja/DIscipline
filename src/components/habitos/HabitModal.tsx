import React, { useState, useEffect } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  X,
  Flame,
  Clock,
  Zap,
  Repeat,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Check
} from 'lucide-react';
import { Habit, HabitFrequency, TimeSlot } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'L', fullLabel: 'Lunes' },
  { value: 2, label: 'M', fullLabel: 'Martes' },
  { value: 3, label: 'X', fullLabel: 'Miércoles' },
  { value: 4, label: 'J', fullLabel: 'Jueves' },
  { value: 5, label: 'V', fullLabel: 'Viernes' },
  { value: 6, label: 'S', fullLabel: 'Sábado' },
  { value: 0, label: 'D', fullLabel: 'Domingo' }
];

const HABIT_TEMPLATES = [
  {
    name: 'Meditación Ki & Respiración',
    description: '10 min al despertar para centrar la mente y elevar el ki.',
    frequency: 'diaria' as HabitFrequency,
    customDays: [0, 1, 2, 3, 4, 5, 6],
    timeSlot: 'manana' as TimeSlot,
    optionalTime: '06:30',
    xpReward: 15
  },
  {
    name: 'Entrenamiento 100G de Gravedad',
    description: 'Rutina de fuerza intensa para romper límites físicos.',
    frequency: 'personalizada' as HabitFrequency,
    customDays: [1, 3, 5],
    timeSlot: 'tarde' as TimeSlot,
    optionalTime: '17:00',
    xpReward: 25
  },
  {
    name: 'Registro Táctico de Gastos',
    description: 'Anotar cada compra y verificar el fondo disponible.',
    frequency: 'diaria' as HabitFrequency,
    customDays: [0, 1, 2, 3, 4, 5, 6],
    timeSlot: 'noche' as TimeSlot,
    optionalTime: '21:00',
    xpReward: 20
  },
  {
    name: 'Auditoría Semanal de Metas',
    description: 'Revisión y calibración dominical de ahorros y progresos.',
    frequency: 'semanal' as HabitFrequency,
    customDays: [0],
    timeSlot: 'noche' as TimeSlot,
    optionalTime: '20:00',
    xpReward: 30
  }
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit
}) => {
  const { addHabit, updateHabit } = useSayayinStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('diaria');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('manana');
  const [optionalTime, setOptionalTime] = useState('');
  const [xpReward, setXpReward] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setFrequency(habitToEdit.frequency);
      if (habitToEdit.frequency === 'semanal') {
        setSelectedWeeklyDay(habitToEdit.customDays?.[0] ?? 1);
        setCustomDays(habitToEdit.customDays || [1]);
      } else {
        setCustomDays(habitToEdit.customDays || [1, 2, 3, 4, 5]);
      }
      setTimeSlot(habitToEdit.timeSlot);
      setOptionalTime(habitToEdit.optionalTime || '');
      setXpReward(habitToEdit.xpReward);
      setIsActive(habitToEdit.isActive);
    } else {
      setName('');
      setDescription('');
      setFrequency('diaria');
      setCustomDays([1, 2, 3, 4, 5]);
      setSelectedWeeklyDay(1);
      setTimeSlot('manana');
      setOptionalTime('');
      setXpReward(15);
      setIsActive(true);
    }
    setError(null);
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleCustomDay = (day: number) => {
    if (customDays.includes(day)) {
      if (customDays.length === 1) {
        setError('Debes seleccionar al menos un día');
        return;
      }
      setError(null);
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setError(null);
      setCustomDays([...customDays, day].sort());
    }
  };

  const handleApplyTemplate = (tmpl: (typeof HABIT_TEMPLATES)[0]) => {
    setName(tmpl.name);
    setDescription(tmpl.description);
    setFrequency(tmpl.frequency);
    if (tmpl.frequency === 'semanal') {
      setSelectedWeeklyDay(tmpl.customDays[0]);
      setCustomDays(tmpl.customDays);
    } else {
      setCustomDays(tmpl.customDays);
    }
    setTimeSlot(tmpl.timeSlot);
    setOptionalTime(tmpl.optionalTime);
    setXpReward(tmpl.xpReward);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa un nombre para el hábito.');
      return;
    }

    let finalDays: number[] = [];
    if (frequency === 'diaria') {
      finalDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (frequency === 'semanal') {
      finalDays = [selectedWeeklyDay];
    } else {
      if (customDays.length === 0) {
        setError('Selecciona al menos un día para la frecuencia personalizada.');
        return;
      }
      finalDays = customDays;
    }

    try {
      if (habitToEdit) {
        await updateHabit(habitToEdit.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          frequency,
          customDays: finalDays,
          timeSlot,
          optionalTime: optionalTime.trim() || undefined,
          xpReward,
          isActive
        });
      } else {
        await addHabit({
          name: name.trim(),
          description: description.trim() || undefined,
          frequency,
          customDays: finalDays,
          timeSlot,
          optionalTime: optionalTime.trim() || undefined,
          xpReward,
          isActive
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el hábito');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181818] border border-[#333] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2b2b] bg-gradient-to-r from-[#201c18] to-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                {habitToEdit ? 'Editar Hábito Saiyajin' : 'Nuevo Hábito de Entrenamiento'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                La disciplina diaria transforma tu ki y forja tu destino
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Quick Templates (only if creating new) */}
          {!habitToEdit && (
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Inspiración Táctica (Plantillas):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HABIT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="text-left p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-[#FF6600]/50 hover:bg-zinc-800/60 transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-[#FF6600] truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between mt-0.5">
                      <span className="capitalize">{tmpl.frequency}</span>
                      <span className="font-mono text-amber-400">+{tmpl.xpReward} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Habit Name */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Nombre del Hábito <span className="text-[#FF6600]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Meditación Ki matutina, 100 flexiones..."
              required
              className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6600] transition-colors"
            />
          </div>

          {/* Habit Description */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Motivación o Detalle <span className="text-zinc-500 text-[10px] font-normal">(Opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe por qué este hábito es vital para tu evolución..."
              className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6600] transition-colors resize-none"
            />
          </div>

          {/* Frequency Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
              Frecuencia de Cumplimiento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'diaria', label: 'Diaria', desc: 'Todos los días' },
                  { id: 'semanal', label: 'Semanal', desc: '1 día fijo' },
                  { id: 'personalizada', label: 'Personalizada', desc: 'Días elegidos' }
                ] as const
              ).map((f) => {
                const isSelected = frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setFrequency(f.id);
                      setError(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#FF6600]/20 border-[#FF6600] text-white'
                        : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* If Weekly: Select day of week */}
            {frequency === 'semanal' && (
              <div className="mt-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-400 block mb-2">
                  ¿Qué día de la semana corresponde?
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedWeeklyDay === day.value;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setSelectedWeeklyDay(day.value)}
                        className={`h-9 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#FF6600] text-black shadow-md'
                            : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                        }`}
                        title={day.fullLabel}
                      >
                        <span>{day.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 text-center">
                  Este hábito solo aparecerá y contará en el radar los{' '}
                  <span className="text-white font-bold">
                    {DAYS_OF_WEEK.find((d) => d.value === selectedWeeklyDay)?.fullLabel}s
                  </span>
                  .
                </p>
              </div>
            )}

            {/* If Custom: Multi-select days */}
            {frequency === 'personalizada' && (
              <div className="mt-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-400 block mb-2">
                  Selecciona los días programados:
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = customDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleCustomDay(day.value)}
                        className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#FF6600] text-black font-black shadow-md'
                            : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                        title={day.fullLabel}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setCustomDays([1, 2, 3, 4, 5])}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    Lun - Vie
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomDays([0, 6])}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    Fin de semana
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomDays([1, 3, 5])}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    Lun / Mié / Vie
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time Slot & Optional Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Franja del Día
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'manana', label: 'Mañana', icon: Sun },
                    { id: 'tarde', label: 'Tarde', icon: Sunset },
                    { id: 'noche', label: 'Noche', icon: Moon }
                  ] as const
                ).map((slot) => {
                  const Icon = slot.icon;
                  const isSelected = timeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(slot.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-xs ${
                        isSelected
                          ? 'bg-[#FF6600]/20 border-[#FF6600] text-white'
                          : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Hora Específica <span className="text-zinc-500 text-[10px] font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={optionalTime}
                  onChange={(e) => setOptionalTime(e.target.value)}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#FF6600] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* XP Reward */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
              Recompensa de Ki (XP) al Cumplir
            </label>
            <div className="flex gap-2">
              {[10, 15, 20, 25, 30].map((xp) => {
                const isSelected = xpReward === xp;
                return (
                  <button
                    key={xp}
                    type="button"
                    onClick={() => setXpReward(xp)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    +{xp} XP
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Switch if editing */}
          {habitToEdit && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div>
                <span className="text-xs font-bold text-white block">Estado del Hábito</span>
                <span className="text-[10px] text-zinc-400">
                  {isActive ? 'Activo en tu radar diario' : 'Pausado temporalmente'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isActive ? 'bg-[#FF6600]' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6600] to-orange-500 text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{habitToEdit ? 'Guardar Cambios' : 'Crear Hábito'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
