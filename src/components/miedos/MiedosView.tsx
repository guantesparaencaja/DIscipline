import React from 'react';
import { ShieldAlert, Lock, Sparkles } from 'lucide-react';

export const MiedosView: React.FC = () => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Dominio Mental
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <ShieldAlert className="w-6 h-6 text-purple-400" />
          Módulo de Miedos & Creencias Financieras
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          La superación del miedo a la escasez y al fracaso es la prueba definitiva del Guerrero.
        </p>
      </div>

      <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-10 text-center max-w-lg mx-auto shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800/80">
            Módulo Programado para Fase 2
          </span>
          <h3 className="text-lg font-bold text-white font-mono">
            Enfrentar los Fantasmas del Dinero
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Este módulo permitirá registrar bloqueos financieros, temores de inversión y hábitos de sabotaje para transmutarlos en disciplina de combate con el motor RPG.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
          Fase 1 enfocada en finanzas reales, metas, objetivos con horario y compañero.
        </div>
      </div>
    </div>
  );
};
