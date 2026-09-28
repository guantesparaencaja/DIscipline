import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { Zap, PlusCircle, PiggyBank, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { SMART_OBJECTIVE_TEMPLATES } from '../../lib/constants';
import { getTodayDateString } from '../../lib/formatters';

interface AccionesViewProps {
  onOpenExpenseModal: () => void;
  onOpenGoalModal: () => void;
}

export const AccionesView: React.FC<AccionesViewProps> = ({
  onOpenExpenseModal,
  onOpenGoalModal
}) => {
  const { addObjective, addToast } = useSayayinStore();
  const todayStr = getTodayDateString();

  const handleQuickAddTemplate = (tmpl: (typeof SMART_OBJECTIVE_TEMPLATES)[0]) => {
    addObjective({
      title: tmpl.title,
      date: todayStr,
      timeSlot: tmpl.timeSlot,
      difficulty: tmpl.difficulty,
      xpReward: tmpl.difficulty === 'facil' ? 10 : tmpl.difficulty === 'normal' ? 20 : tmpl.difficulty === 'dificil' ? 40 : 75,
      isPartnerVisible: true,
      recurrence: 'diaria'
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Despliegue Inmediato
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <Zap className="w-6 h-6 text-[#FF6600]" />
          Acciones Rápidas del Guerrero
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Atajos tácticos para registrar movimientos financieros o inyectar disciplinas en tu día con un solo clic.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Atajo 1: Registrar Gasto */}
        <div
          onClick={onOpenExpenseModal}
          className="bg-gradient-to-br from-[#241a14] to-[#1e1e1e] border border-[#FF6600]/40 rounded-3xl p-5 shadow-xl cursor-pointer hover:border-[#FF6600] transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] mb-3 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Registrar Gasto o Ahorro</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Audita inmediatamente tu fondo disponible en COP ingresando tu compra o aporte de ahorro.
          </p>
        </div>

        {/* Atajo 2: Nueva Meta */}
        <div
          onClick={onOpenGoalModal}
          className="bg-gradient-to-br from-[#1a211e] to-[#1e1e1e] border border-emerald-900/50 rounded-3xl p-5 shadow-xl cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Crear Nueva Meta de Ahorro</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Calcula el ritmo diario, semanal y mensual requerido para blindar tus finanzas.
          </p>
        </div>
      </div>

      {/* Instant Disciplines Generator */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF6600]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Inyectar Rutina Inmediata de Entrenamiento (1 Clic)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SMART_OBJECTIVE_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-[#171717] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                  <span className="font-bold text-[#FF6600]">{tmpl.category}</span>
                  <span className="capitalize">{tmpl.timeSlot}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{tmpl.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{tmpl.description}</p>
              </div>

              <button
                onClick={() => handleQuickAddTemplate(tmpl)}
                className="w-full py-2 bg-[#222] hover:bg-[#FF6600] text-zinc-300 hover:text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Añadir a mi día de hoy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
