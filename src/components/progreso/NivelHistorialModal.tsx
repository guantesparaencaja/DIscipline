import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { getLevelProgress, formatDateSpanish } from '../../lib/formatters';
import {
  Trophy,
  Target,
  PiggyBank,
  Flame,
  Shield,
  RotateCcw,
  Sparkles,
  X,
  History,
  Info
} from 'lucide-react';
import { XPEvent } from '../../types';

interface NivelHistorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NivelHistorialModal: React.FC<NivelHistorialModalProps> = ({ isOpen, onClose }) => {
  const { profile, xpEvents } = useSayayinStore();
  const [filter, setFilter] = useState<string>('todos');

  if (!isOpen) return null;

  const safeXpEvents = xpEvents || [];
  const levelInfo = getLevelProgress(profile?.currentXp || 0);

  const filteredEvents = safeXpEvents.filter((ev) => {
    if (!ev) return false;
    if (filter === 'todos') return true;
    if (filter === 'objective') return ev.sourceType === 'objective';
    if (filter === 'saving') return ev.sourceType === 'saving';
    if (filter === 'achievement') return ev.sourceType === 'achievement';
    if (filter === 'compensatory_undo') return ev.sourceType === 'compensatory_undo';
    if (filter === 'fears') return ev.sourceType === 'fear_action' || ev.sourceType === 'fear_conquered';
    return true;
  });

  const getSourceIcon = (sourceType: XPEvent['sourceType']) => {
    switch (sourceType) {
      case 'objective':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'saving':
        return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'streak_bonus':
        return <Flame className="w-4 h-4 text-[#FF6600]" />;
      case 'compensatory_undo':
        return <RotateCcw className="w-4 h-4 text-rose-400" />;
      case 'fear_action':
      case 'fear_conquered':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSourceBadge = (sourceType: XPEvent['sourceType']) => {
    switch (sourceType) {
      case 'objective':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Objetivo
          </span>
        );
      case 'saving':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Ahorro Real
          </span>
        );
      case 'achievement':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Logro
          </span>
        );
      case 'streak_bonus':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Racha
          </span>
        );
      case 'compensatory_undo':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Deshacer / Reversión
          </span>
        );
      case 'fear_action':
      case 'fear_conquered':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Dominio Mental
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
            Evento
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF6600]/15 text-[#FF6600] border border-[#FF6600]/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                ¿Por qué tengo este nivel?
              </h3>
              <p className="text-xs text-zinc-400">
                Auditoría transparente e inmutable de cada punto de XP acumulado
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

        {/* Level Stats Summary */}
        <div className="bg-[#171717] border border-zinc-800 rounded-2xl p-4 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6600] to-amber-600 flex items-center justify-center text-black font-black text-xl font-mono shadow-lg shadow-orange-950/30">
                {levelInfo.level}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Nivel de Guerrero Actual
                </span>
                <div className="text-base font-black text-white font-mono flex items-center gap-2">
                  <span>Nivel {levelInfo.level}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30 uppercase">
                    {profile?.transformation || 'BASE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                Total Acumulado
              </span>
              <span className="text-xl font-black text-amber-400">
                {profile?.currentXp || 0} XP
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Faltan {levelInfo.xpNeededForNextLevel - levelInfo.xpInCurrentLevel} XP para Nivel {levelInfo.level + 1}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF6600] to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>{levelInfo.xpInCurrentLevel} XP en este nivel</span>
              <span>{levelInfo.progressPercentage}% completado</span>
            </div>
          </div>
        </div>

        {/* Audit explanation notice */}
        <div className="flex items-start gap-2 bg-blue-950/20 border border-blue-800/40 rounded-2xl p-3 text-xs text-blue-300 shrink-0">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Cada punto de XP en tu cuenta proviene de una disciplina registrada. Al deshacer una acción completada dentro de los 10 segundos, se genera un evento compensatorio negativo sin romper tu racha.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'objective', label: 'Objetivos' },
            { id: 'saving', label: 'Ahorros' },
            { id: 'achievement', label: 'Logros' },
            { id: 'compensatory_undo', label: 'Deshacer' },
            { id: 'fears', label: 'Miedos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 font-mono ${
                filter === tab.id
                  ? 'bg-[#FF6600] text-black'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* XP Events List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No hay registros de XP en esta categoría.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isNegative = ev.xpAmount < 0;
              return (
                <div
                  key={ev.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isNegative
                      ? 'bg-rose-950/15 border-rose-900/40 hover:border-rose-800/60'
                      : 'bg-[#181818] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 shrink-0">
                      {getSourceIcon(ev.sourceType)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getSourceBadge(ev.sourceType)}
                        <span className="text-[10px] font-mono text-zinc-400">
                          {formatDateSpanish(ev.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-1 truncate">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl border ${
                        isNegative
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      }`}
                    >
                      {isNegative ? `${ev.xpAmount} XP` : `+${ev.xpAmount} XP`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
