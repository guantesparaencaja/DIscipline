import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { TRANSFORMATIONS, TIME_SLOT_CONFIG, DIFFICULTY_CONFIG } from '../../lib/constants';
import {
  Users,
  Copy,
  Check,
  Flame,
  Zap,
  Trophy,
  Shield,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  Clock,
  Sparkles,
  Link,
  Unlink
} from 'lucide-react';
import { TimeSlot } from '../../types';

export const CompaneroView: React.FC = () => {
  const { profile, partner, connectPartner, disconnectPartner, addToast } = useSayayinStore();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.inviteCode);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Código copiado al portapapeles',
      description: profile.inviteCode
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsConnecting(true);
    const res = await connectPartner(inputCode);
    setIsConnecting(false);

    if (!res.success) {
      addToast({
        type: 'error',
        title: 'Error de enlace',
        description: res.message
      });
    } else {
      setInputCode('');
    }
  };

  const partnerTrans = partner ? TRANSFORMATIONS[partner.transformation] : null;
  const slots: TimeSlot[] = ['manana', 'tarde', 'noche'];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Entrenamiento en Pareja
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Users className="w-6 h-6 text-[#FF6600]" />
            Compañero Saiyajin en Tiempo Real
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Entrena en sincronía. Visualiza el ki, racha y objetivos diarios de tu compañero. Tu información financiera permanece estrictamente privada.
          </p>
        </div>

        {/* My Invite Code Banner */}
        <div className="bg-[#1e1e1e] border border-zinc-800 p-3 rounded-2xl flex items-center gap-3 shrink-0">
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">
              Tu Código de Invitación
            </span>
            <span className="font-mono font-black text-white text-sm tracking-wider">
              {profile.inviteCode}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-[#252525] hover:bg-[#303030] text-zinc-300 hover:text-white transition-colors"
            title="Copiar código"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Join Partner Form if not yet connected */}
      {!partner ? (
        <div className="space-y-6">
          {/* Empty State Hero */}
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] mx-auto">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-mono">
                Aún no tienes un compañero de entrenamiento
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                El entrenamiento Saiyajin se potencia cuando dos guerreros compiten por superar sus límites. Comparte tu código de invitación o ingresa el de tu compañero.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleConnect} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ingresa código (ej: SAYAYIN-VEGETA)"
                className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#FF6600]"
              />
              <button
                type="submit"
                disabled={isConnecting}
                className="bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                {isConnecting ? 'Conectando...' : 'Enlazar'}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacidad garantizada: Finanzas, gastos y montos son 100% invisibles para tu compañero.</span>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Partner Active Dashboard */
        <div className="space-y-6">
          {/* Partner Hero Card */}
          <div className="bg-gradient-to-r from-[#1e1e1e] via-[#1c1c1c] to-[#1a231d] border border-emerald-900/40 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center font-black text-black text-xl font-mono shadow-xl border-2 border-emerald-500/40">
                  {partner.displayName.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      En vivo vía Supabase Realtime
                    </span>
                    <span className="text-xs text-zinc-400">
                      Enlazados desde {partner.connectedSince}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white font-mono mt-1">
                    {partner.displayName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                      Nivel {partner.currentLevel}
                    </span>
                    <span className={`text-xs font-bold ${partnerTrans?.textColor}`}>
                      {partnerTrans?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Box */}
              <div className="flex items-center gap-3">
                <div className="bg-[#141414] p-3 rounded-2xl border border-zinc-800 text-center min-w-[80px]">
                  <span className="text-[10px] text-zinc-400 block">Racha</span>
                  <span className="text-base font-black text-[#FF6600] font-mono">
                    🔥 {partner.currentStreak}d
                  </span>
                </div>

                <div className="bg-[#141414] p-3 rounded-2xl border border-zinc-800 text-center min-w-[80px]">
                  <span className="text-[10px] text-zinc-400 block">Ki Total</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {partner.currentXp} XP
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas desvincularte de este compañero de entrenamiento?')) {
                      disconnectPartner();
                    }
                  }}
                  className="p-3 bg-[#242424] hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 border border-zinc-800 hover:border-rose-800 rounded-2xl transition-colors"
                  title="Desvincular compañero"
                >
                  <Unlink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Partner Today's Objectives (Live feed grouped by time slot) */}
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-[#FF6600]" />
                Objetivos de Hoy de {partner.displayName}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {partner.todayObjectives.filter((o) => o.status === 'completado').length} de{' '}
                {partner.todayObjectives.length} cumplidos
              </span>
            </div>

            <div className="space-y-4">
              {slots.map((slot) => {
                const slotObjs = partner.todayObjectives.filter((o) => o.timeSlot === slot);
                if (slotObjs.length === 0) return null;

                const slotConf = TIME_SLOT_CONFIG[slot];
                let SlotIcon = Sun;
                if (slot === 'tarde') SlotIcon = Sunset;
                if (slot === 'noche') SlotIcon = Moon;

                return (
                  <div key={slot} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                      <SlotIcon className={`w-3.5 h-3.5 ${slotConf.color}`} />
                      <span className="capitalize">{slotConf.label}</span>
                    </div>

                    <div className="space-y-2">
                      {slotObjs.map((obj) => {
                        const diff = DIFFICULTY_CONFIG[obj.difficulty];
                        const isDone = obj.status === 'completado';

                        return (
                          <div
                            key={obj.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-zinc-300'
                                : 'bg-[#171717] border-zinc-800/80 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950 shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-zinc-500 shrink-0" />
                              )}
                              <div>
                                <p
                                  className={`text-xs font-bold ${
                                    isDone ? 'line-through text-zinc-400' : 'text-white'
                                  }`}
                                >
                                  {obj.title}
                                </p>
                                {obj.customTime && (
                                  <span className="text-[10px] text-zinc-400 font-mono">
                                    {obj.customTime}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${diff.badgeColor}`}
                            >
                              +{diff.xp} XP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
