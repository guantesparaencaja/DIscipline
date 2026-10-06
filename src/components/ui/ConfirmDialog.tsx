import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDangerous = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c1c1c] border-t sm:border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90dvh] flex flex-col">
        <button
          onClick={onCancel}
          aria-label="Cerrar diálogo"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDangerous
                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                : 'bg-amber-950/60 border-amber-800 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
              Confirmación requerida
            </span>
            <h3 className="text-base font-black text-white font-mono leading-tight">{title}</h3>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed my-2">{message}</p>

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-[#252525] font-bold text-xs min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 font-mono"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 min-h-[44px] font-mono focus-visible:ring-2 ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-500 text-white focus-visible:ring-rose-400'
                : 'bg-[#FF6600] hover:bg-orange-500 text-black focus-visible:ring-[#FF6600]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
