import React, { useState, useEffect } from 'react';
import {
  Flame,
  Bell,
  Sparkles,
  Settings,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Zap,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { MOTIVATIONAL_QUOTES, TRANSFORMATIONS } from '../../lib/constants';
import { formatCOP, getLevelProgress } from '../../lib/formatters';
import { googleSignIn, isWorkspaceConnected, workspaceLogout } from '../../lib/workspace';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenPowerBreakdown: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenPowerBreakdown }) => {
  const { profile, xpEvents, addToast } = useSayayinStore();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isWorkspaceUserConnected, setIsWorkspaceUserConnected] = useState(isWorkspaceConnected());
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Rotate motivational quotes every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const levelProgress = getLevelProgress(profile.currentXp);
  const currentTrans = TRANSFORMATIONS[profile.transformation];

  const handleGoogleConnect = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setIsWorkspaceUserConnected(true);
        addToast({
          type: 'success',
          title: 'Google Workspace Conectado',
          description: `Sincronización activa para Google Calendar y Google Tasks.`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al conectar Google',
        description: err?.message || 'No se pudo completar el inicio de sesión.'
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await workspaceLogout();
    setIsWorkspaceUserConnected(false);
    addToast({
      type: 'info',
      title: 'Google Desconectado',
      description: 'Se han cerrado las sesiones de Calendar y Tasks.'
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-[#262626] px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onOpenPowerBreakdown}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-amber-600 flex items-center justify-center shadow-lg shadow-[#FF6600]/25 border border-[#FF6600]/40 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-black fill-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#121212] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-wider text-white text-lg font-mono">
                SAYAYIN<span className="text-[#FF6600]">.RADAR</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FF6600]/15 text-[#FF6600] border border-[#FF6600]/30">
                FASE 1
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block font-medium">
              Evolución RPG · Finanzas & Hábitos
            </p>
          </div>
        </div>

        {/* Motivational Ticker (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4 items-center justify-center">
          <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-full px-4 py-1.5 flex items-center gap-2 text-xs text-zinc-300 shadow-inner w-full overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6600] shrink-0 animate-spin-slow" />
            <span className="truncate italic font-serif">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
          </div>
        </div>

        {/* Action Controls & User Level */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Google Workspace status indicator */}
          <div className="hidden lg:block">
            {isWorkspaceUserConnected ? (
              <button
                onClick={handleGoogleDisconnect}
                title="Google Calendar & Tasks Conectado (Click para desconectar)"
                className="flex items-center gap-1.5 text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg hover:bg-emerald-900/60 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Google Sync Activo</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleConnect}
                disabled={isSigningIn}
                title="Conectar Google Calendar & Google Tasks"
                className="flex items-center gap-1.5 text-xs bg-[#1e1e1e] text-zinc-300 border border-zinc-700/60 px-2.5 py-1.5 rounded-lg hover:border-[#FF6600]/60 hover:text-white transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{isSigningIn ? 'Conectando...' : 'Conectar Google'}</span>
              </button>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#FF6600]/50 text-zinc-300 hover:text-white transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {xpEvents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6600] rounded-full ring-2 ring-[#121212]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl z-50 p-3 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FF6600]" /> Historial de Ki & XP
                  </h4>
                  <span className="text-[10px] text-zinc-400">{xpEvents.length} registros</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60 my-1 text-xs">
                  {xpEvents.slice(0, 8).map((ev) => (
                    <div key={ev.id} className="py-2 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-zinc-200 line-clamp-1">{ev.description}</p>
                        <span className="text-[10px] text-zinc-500">{ev.createdAt}</span>
                      </div>
                      <span className="font-mono font-bold text-[#FF6600] shrink-0">
                        +{ev.xpAmount} XP
                      </span>
                    </div>
                  ))}
                  {xpEvents.length === 0 && (
                    <p className="py-4 text-center text-zinc-500 text-xs">Aún no hay eventos de ki.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Level & Saiyajin Tag */}
          <div
            onClick={onOpenPowerBreakdown}
            className="flex items-center gap-2.5 bg-[#1e1e1e] border border-[#2f2f2f] hover:border-[#FF6600]/60 p-1.5 pr-3 rounded-xl cursor-pointer transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center font-bold text-black text-xs font-mono shadow">
              {profile.currentLevel}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-bold text-white group-hover:text-[#FF6600] transition-colors">
                  Nivel {profile.currentLevel}
                </span>
                <span className="text-[10px] text-zinc-400">·</span>
                <span className={`text-[10px] font-semibold ${currentTrans.textColor}`}>
                  {currentTrans.shortName}
                </span>
              </div>
              <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF6600] to-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-[#1e1e1e] border border-[#2c2c2c] hover:border-[#FF6600]/50 text-zinc-300 hover:text-white transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
