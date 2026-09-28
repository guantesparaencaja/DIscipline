import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from '../../lib/constants';
import { HelpCircle, ChevronRight, Zap, TrendingUp, Shield } from 'lucide-react';

interface PowerRingProps {
  onOpenBreakdown: () => void;
}

export const PowerRing: React.FC<PowerRingProps> = ({ onOpenBreakdown }) => {
  const { profile, getPowerBreakdown } = useSayayinStore();
  const breakdown = getPowerBreakdown();
  const currentTrans = TRANSFORMATIONS[breakdown.transformationId];
  const nextTrans = breakdown.nextTransformationId ? TRANSFORMATIONS[breakdown.nextTransformationId] : null;

  // SVG Gauge calculations
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const power = Math.max(0, Math.min(100, breakdown.totalPower));
  const strokeDashoffset = circumference - (power / 100) * circumference;

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Subtle Ki Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Tu Transformación Actual
          </span>
          <h3 className="text-xl font-black text-white flex items-center gap-2 mt-0.5 font-mono">
            {currentTrans.name}
          </h3>
        </div>
        <button
          onClick={onOpenBreakdown}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#FF6600] bg-[#242424] hover:bg-[#2c2c2c] px-3 py-1.5 rounded-xl border border-zinc-700/60 transition-colors"
          title="Ver desglose de la fórmula de poder"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#FF6600]" />
          <span className="font-semibold">¿Por qué estoy aquí?</span>
        </button>
      </div>

      {/* Center Ring & Gauge */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Radial Meter */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#2a2a2a"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#powerGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6600" />
                <stop offset="60%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Power Score */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Poder Total
            </span>
            <span className="text-4xl font-black text-white font-mono tracking-tight">
              {power}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">
              Escala 0 – 100
            </span>
          </div>
        </div>

        {/* Breakdown Pillars */}
        <div className="space-y-3 w-full sm:w-auto flex-1 max-w-xs">
          {/* Poder Base */}
          <div className="bg-[#171717] border border-[#2a2a2a] p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#FF6600]" /> Poder Base (70%)
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {breakdown.basePower} / 100
              </span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FF6600] h-full rounded-full transition-all duration-700"
                style={{ width: `${breakdown.basePower}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>Finanzas: {breakdown.financialPower}</span>
              <span>Hábitos: {breakdown.habitsPower}</span>
            </div>
          </div>

          {/* Poder de Evolución */}
          <div className="bg-[#171717] border border-[#2a2a2a] p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400" /> Poder de Evolución (30%)
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {breakdown.evolutionPower} / 100
              </span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${breakdown.evolutionPower}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>Metas, Nivel y Logros</span>
              <span>Rachas activas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Transformation Target Indicator */}
      <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
        {nextTrans ? (
          <>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-zinc-400">Siguiente forma:</span>
              <span className={`font-bold ${nextTrans.textColor}`}>{nextTrans.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[#FF6600] font-mono font-bold">
              <span>+{breakdown.powerNeededForNext} pts requeridos</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </>
        ) : (
          <div className="w-full text-center text-purple-400 font-bold font-mono">
            ¡Has alcanzado la cima divina del Ultra Instinto!
          </div>
        )}
      </div>
    </div>
  );
};
