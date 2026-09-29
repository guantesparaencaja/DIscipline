import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  X,
  Trophy,
  RotateCcw
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, undoCompleteObjective } = useSayayinStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderColor = 'border-emerald-500/50';
        let bgGradient = 'from-emerald-950/90 to-[#1e1e1e]';
        let iconColor = 'text-emerald-400';

        if (toast.type === 'xp') {
          Icon = Zap;
          borderColor = 'border-[#FF6600]/70 shadow-lg shadow-[#FF6600]/20';
          bgGradient = 'from-amber-950/90 to-[#1e1e1e]';
          iconColor = 'text-[#FF6600]';
        } else if (toast.type === 'level_up') {
          Icon = Sparkles;
          borderColor = 'border-yellow-400/80 shadow-xl shadow-yellow-500/30';
          bgGradient = 'from-amber-900 via-orange-950 to-[#1e1e1e]';
          iconColor = 'text-yellow-400 animate-spin-slow';
        } else if (toast.type === 'transformation') {
          Icon = Sparkles;
          borderColor = 'border-purple-500/80 shadow-xl shadow-purple-500/30';
          bgGradient = 'from-purple-950 via-indigo-950 to-[#1e1e1e]';
          iconColor = 'text-purple-300';
        } else if (toast.type === 'achievement') {
          Icon = Trophy;
          borderColor = 'border-amber-400/60 shadow-lg shadow-amber-500/20';
          bgGradient = 'from-amber-950 to-[#1e1e1e]';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'border-amber-500/60';
          bgGradient = 'from-amber-950/90 to-[#1e1e1e]';
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'border-rose-500/60';
          bgGradient = 'from-rose-950/90 to-[#1e1e1e]';
          iconColor = 'text-rose-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderColor = 'border-sky-500/60';
          bgGradient = 'from-sky-950/90 to-[#1e1e1e]';
          iconColor = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border bg-gradient-to-r ${bgGradient} ${borderColor} shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className={`p-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white tracking-wide">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.description}
                </p>
              )}
              {toast.undoId && (
                <button
                  onClick={() => {
                    undoCompleteObjective(toast.undoId!);
                    dismissToast(toast.id);
                  }}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black text-[#FF6600] hover:text-white border border-[#FF6600]/40 text-[10px] font-bold font-mono uppercase flex items-center gap-1.5 transition-all shadow active:scale-95"
                >
                  <RotateCcw className="w-3 h-3 text-[#FF6600]" />
                  <span>Deshacer Completado (10s)</span>
                </button>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-400 hover:text-white p-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
