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
  Unlink,
  Share2,
  MessageCircle,
  Swords,
  Crown,
  AlertTriangle,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { TimeSlot } from '../../types';

export const CompaneroView: React.FC = () => {
  const {
    profile,
    partner,
    partnerLiveStatus,
    connectPartner,
    disconnectPartner,
    addToast
  } = useSayayinStore();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(profile.inviteCode);
      setCopied(true);
      addToast({
        type: 'info',
        title: 'Código copiado al portapapeles',
        description: profile.inviteCode
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      addToast({
        type: 'info',
        title: 'Tu código de invitación',
        description: profile.inviteCode
      });
    }
  };

  const handleShareWhatsApp = () => {
    const shareText = `¡Únete a mi entrenamiento financiero y de hábitos en Sayayin Radar! Mi código de compañero es: ${profile.inviteCode}. Conéctate y compitamos en racha y ki: ${window.location.origin}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Sayayin Radar - Entrenamiento en Pareja',
          text: shareText,
          url: window.location.href
        })
        .catch(() => {
          // Fallback direct WhatsApp URL
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;

    setIsConnecting(true);
    const res = await connectPartner(clean);
    setIsConnecting(false);

    if (!res.success) {
      addToast({
        type: 'error',
        title: 'No se pudo conectar',
        description: res.message
      });
    } else {
      setInputCode('');
    }
  };

  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    await disconnectPartner();
    setIsDisconnecting(false);
    setShowDisconnectConfirm(false);
  };

  const partnerTrans = partner ? TRANSFORMATIONS[partner.transformation] : null;
  const myTrans = TRANSFORMATIONS[profile.transformation] || TRANSFORMATIONS.base;
  const slots: TimeSlot[] = ['manana', 'tarde', 'noche'];

  // Status Indicator
  const renderLiveStatusIndicator = () => {
    if (partnerLiveStatus === 'online') {
      return (
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          En vivo
        </span>
      );
    }
    if (partnerLiveStatus === 'connecting') {
      return (
        <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Reconectando…
        </span>
      );
    }
    return (
      <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-700/60 flex items-center gap-1.5">
        <WifiOff className="w-3 h-3 text-zinc-500" />
        Desconectado
      </span>
    );
  };

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
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Entrena en sincronía y desafía a tu rival. Visualiza su nivel, racha y disciplinas del día. Tu información financiera (ingresos, gastos, metas) permanece 100% privada y cifrada.
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

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-[#252525] hover:bg-[#303030] text-zinc-300 hover:text-white transition-colors"
              title="Copiar código"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 transition-colors"
              title="Compartir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white font-mono">
                ¿Desvincular a {partner?.displayName}?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dejarán de ver sus progresos y disciplinas mutuas en tiempo real. Podrás volver a vincularte en cualquier momento con su código de invitación.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                disabled={isDisconnecting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white transition-colors"
              >
                {isDisconnecting ? 'Desvinculando...' : 'Confirmar Desvinculación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Empty State if not yet connected */}
      {!partner ? (
        <div className="space-y-6">
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] mx-auto">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white font-mono">
                Entrenamiento en Solitario
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                El entrenamiento de un Saiyajin se eleva al límite cuando dos guerreros compiten por superar sus rachas. Comparte tu código de invitación con tu compañero o ingresa el suyo.
              </p>
            </div>

            {/* Big Code Display */}
            <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block text-left">
                  Tu Código Personal
                </span>
                <span className="text-xl font-mono font-black text-[#FF6600] tracking-widest block text-left mt-0.5">
                  {profile.inviteCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black font-mono flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleConnect} className="max-w-md mx-auto flex gap-2 pt-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ingresa código (ej: SAYAYIN-9A2K4B)"
                className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-4 py-2.5 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#FF6600]"
              />
              <button
                type="submit"
                disabled={isConnecting}
                className="bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0 font-mono"
              >
                {isConnecting ? 'Conectando...' : 'Enlazar'}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Privacidad garantizada: Ingresos, gastos y metas son 100% invisibles para tu compañero.</span>
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
                  {partner.displayName ? partner.displayName.charAt(0).toUpperCase() : 'S'}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderLiveStatusIndicator()}
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
                    <span className={`text-xs font-bold ${partnerTrans?.textColor || 'text-zinc-300'}`}>
                      {partnerTrans?.name || 'Guerrero Base'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Box & Actions */}
              <div className="flex items-center gap-3">
                <div className="bg-[#141414] p-3 rounded-2xl border border-zinc-800 text-center min-w-[80px]">
                  <span className="text-[10px] text-zinc-400 block font-mono">Racha</span>
                  <span className="text-base font-black text-[#FF6600] font-mono">
                    🔥 {partner.currentStreak}d
                  </span>
                </div>

                <div className="bg-[#141414] p-3 rounded-2xl border border-zinc-800 text-center min-w-[80px]">
                  <span className="text-[10px] text-zinc-400 block font-mono">Ki Total</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {partner.currentXp} XP
                  </span>
                </div>

                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="p-3 bg-[#242424] hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 border border-zinc-800 hover:border-rose-800 rounded-2xl transition-colors"
                  title="Desvincular compañero"
                >
                  <Unlink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Retos Compartidos (Rivalidad Saiyajin) */}
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#FF6600]/15 text-[#FF6600] border border-[#FF6600]/30">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Retos Compartidos & Rivalidad Saiyajin
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Comparación semanal de disciplina y poder acumulado
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Semana Actual
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Racha Comparison */}
              <div className="bg-[#171717] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <Flame className="w-4 h-4 text-[#FF6600]" />
                    Batalla de Racha Consecutiva
                  </span>
                  {profile.currentStreak > partner.currentStreak ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Vas Ganando
                    </span>
                  ) : profile.currentStreak < partner.currentStreak ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                      Te Lidera {partner.displayName.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Empate Técnico
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block">TÚ</span>
                    <span className="text-2xl font-black text-[#FF6600] font-mono mt-0.5 block">
                      {profile.currentStreak} días
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block truncate">
                      {partner.displayName.toUpperCase()}
                    </span>
                    <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                      {partner.currentStreak} días
                    </span>
                  </div>
                </div>
              </div>

              {/* XP Comparison */}
              <div className="bg-[#171717] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Comparación de Ki & XP
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Diferencia: {Math.abs(profile.currentXp - partner.currentXp)} XP
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300">Tú ({profile.transformation.toUpperCase()})</span>
                    <span className="font-bold text-[#FF6600]">{profile.currentXp} XP</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FF6600] h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            5,
                            Math.round(
                              (profile.currentXp /
                                Math.max(1, profile.currentXp + partner.currentXp)) *
                                100
                            )
                          )
                        )}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-zinc-300">{partner.displayName}</span>
                    <span className="font-bold text-amber-400">{partner.currentXp} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Partner Today's Objectives (Live feed grouped by time slot) */}
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-[#FF6600]" />
                Disciplinas de Hoy de {partner.displayName}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {(partner.todayObjectives || []).filter((o) => o.status === 'completado').length} de{' '}
                {(partner.todayObjectives || []).length} cumplidas
              </span>
            </div>

            {(partner.todayObjectives || []).length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                {partner.displayName} no tiene disciplinas públicas registradas para hoy aún.
              </div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => {
                  const slotObjs = (partner.todayObjectives || []).filter((o) => o.timeSlot === slot);
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
                          const diff = DIFFICULTY_CONFIG[obj.difficulty] || DIFFICULTY_CONFIG.normal;
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
                              <div className="flex items-center gap-3 min-w-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950 shrink-0" />
                                ) : (
                                  <Clock className="w-5 h-5 text-zinc-500 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p
                                    className={`text-xs font-bold truncate ${
                                      isDone ? 'line-through text-zinc-400' : 'text-white'
                                    }`}
                                  >
                                    {obj.title}
                                  </p>
                                  {obj.customTime && (
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      🕒 {obj.customTime}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${diff.badgeColor}`}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
