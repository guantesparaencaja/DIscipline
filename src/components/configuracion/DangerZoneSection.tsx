import React, { useState } from 'react';
import { AlertOctagon, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

interface DangerZoneSectionProps {
  onResetDemo: () => void;
  onDeleteAccount: () => Promise<void>;
  isDeleting: boolean;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onResetDemo,
  onDeleteAccount,
  isDeleting
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteKeyword, setDeleteKeyword] = useState('');

  const handleOpenDelete = () => {
    setDeleteStep(1);
    setDeleteKeyword('');
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep(1);
    setDeleteKeyword('');
  };

  return (
    <>
      <div className="bg-[#1e1e1e] border border-rose-900/40 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
              Zona de Peligro & Destrucción
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Acciones destructivas e irreversibles. Proceder únicamente si estás completamente seguro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Restablecer Demo */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Restablecer Entrenamiento de Fase 1
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Restaura las metas, gastos, deducciones y objetivos a los valores iniciales del sistema.
              </p>
            </div>
            <button
              onClick={onResetDemo}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-zinc-700/60 font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Restablecer Valores
            </button>
          </div>

          {/* Eliminar Cuenta Definitivamente con Doble Confirmación */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Eliminar Mi Cuenta y Datos
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Borrado total e irrecuperable. Exige doble confirmación y purga tus registros locales y de la nube.
              </p>
            </div>
            <button
              onClick={handleOpenDelete}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/40 active:scale-95 font-mono"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Doble Confirmación para Eliminar Cuenta */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#1c1c1c] border-t sm:border border-rose-700/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Paso {deleteStep} de 2 · Acción Irreversible
                </span>
                <h3 className="text-base font-black text-white font-mono">
                  {deleteStep === 1 ? '¿Eliminar tu cuenta por completo?' : 'Confirmación Definitiva'}
                </h3>
              </div>
            </div>

            {deleteStep === 1 ? (
              <>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Estás a punto de borrar definitivamente todo tu progreso como Guerrero Saiyajin:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside bg-[#141414] p-3 rounded-xl border border-zinc-800">
                  <li>Tu nivel actual, racha acumulada y puntos de Ki.</li>
                  <li>Todos tus gastos registrados y metas de ahorro.</li>
                  <li>Todos tus hábitos, disciplinas diarias y miedos enfrentados.</li>
                  <li>Tu conexión con tu compañero de entrenamiento.</li>
                </ul>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseDelete}
                    className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-[#252525] font-bold text-xs font-mono"
                  >
                    Cancelar y Conservar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider font-mono shadow-lg transition-all"
                  >
                    Continuar al Paso 2 →
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para confirmar la destrucción inmediata de tu cuenta, escribe exactamente la frase:{' '}
                  <strong className="text-rose-400 font-mono block mt-1 text-sm select-all">
                    ELIMINAR SAIYAJIN
                  </strong>
                </p>
                <input
                  type="text"
                  value={deleteKeyword}
                  onChange={(e) => setDeleteKeyword(e.target.value)}
                  placeholder="Escribe: ELIMINAR SAIYAJIN"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-rose-800/80 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseDelete}
                    disabled={isDeleting}
                    className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-[#252525] font-bold text-xs font-mono"
                  >
                    Abortar
                  </button>
                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    disabled={deleteKeyword.trim() !== 'ELIMINAR SAIYAJIN' || isDeleting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider font-mono shadow-lg transition-all flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Destruyendo...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Definitivamente</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
