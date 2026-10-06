import React from 'react';
import { Shield, History, Eye, Lock } from 'lucide-react';

interface PrivacySectionProps {
  shareObjectivesGlobally: boolean;
  onToggleGlobalPrivacy: (value: boolean) => void;
  onOpenNivelHistorial: () => void;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  shareObjectivesGlobally,
  onToggleGlobalPrivacy,
  onOpenNivelHistorial
}) => {
  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Privacidad & Compañero de Entrenamiento
            </h3>
            <p className="text-xs text-zinc-400">
              Control de visibilidad y auditoría inmutable de tu progreso
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNivelHistorial}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-zinc-800 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold font-mono transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>¿Por qué tengo este nivel?</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Global Share Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#171717] border border-zinc-800">
          <div className="space-y-0.5 max-w-lg">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#FF6600]" />
              Compartir objetivos diarios con mi compañero
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Si está activo, tus disciplinas marcadas individualmente como visibles serán compartidas con tu compañero en tiempo real. Si lo desactivas, ninguna de tus disciplinas será visible.
            </p>
          </div>
          <input
            type="checkbox"
            checked={shareObjectivesGlobally}
            onChange={(e) => onToggleGlobalPrivacy(e.target.checked)}
            className="w-5 h-5 accent-[#FF6600] rounded cursor-pointer shrink-0"
          />
        </div>

        {/* Privacy Guarantee Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacidad Estricta de Finanzas:</strong> Tus ingresos, gastos registrados, deducciones fijas y montos de ahorro son 100% privados y nunca son compartidos ni transmitidos a tu compañero.
          </p>
        </div>
      </div>
    </div>
  );
};
