import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'minimal';
  showAlways?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary',
  showAlways = false
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and not forced to show
  if (isInstalled && !showAlways) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowIOSGuide(true);
    }
  };

  const buttonStyles = {
    primary:
      'bg-[#FF6600] hover:bg-orange-500 active:scale-95 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 font-mono min-h-[44px]',
    outline:
      'border border-[#FF6600]/60 hover:bg-[#FF6600]/15 text-[#FF6600] font-bold text-xs uppercase px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 font-mono min-h-[44px]',
    minimal:
      'text-zinc-300 hover:text-white hover:bg-[#252525] p-2 rounded-xl transition-colors flex items-center gap-2 font-mono text-xs min-h-[44px] min-w-[44px]'
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        aria-label="Instalar aplicación en dispositivo"
        className={`${buttonStyles[variant]} ${className} focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none`}
      >
        {isInstalled ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>App Instalada</span>
          </>
        ) : (
          <>
            <Download className={`w-4 h-4 ${isInstalling ? 'animate-bounce' : ''}`} />
            <span>{isIOS ? 'Instalar en iPhone' : 'Instalar App'}</span>
          </>
        )}
      </button>

      {/* Modal Guía iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#1c1c1c] border-t sm:border border-zinc-700/80 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setShowIOSGuide(false)}
              aria-label="Cerrar guía de instalación"
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider font-mono">
                  Instalación en iPhone / iPad
                </span>
                <h3 className="text-lg font-black text-white font-mono leading-tight">
                  Añadir a Pantalla de Inicio
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              iOS no permite la instalación automática con un solo clic. Sigue estos 2 sencillos pasos en Safari:
            </p>

            <div className="space-y-3 bg-[#141414] p-4 rounded-2xl border border-zinc-800 text-xs font-mono mb-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FF6600] text-black font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Toca el botón Compartir <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Ubicado en la barra inferior (o superior en iPad) de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-[#FF6600] text-black font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Selecciona "Añadir a pantalla de inicio" <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Desliza hacia abajo en el menú de opciones hasta encontrar el icono de "+".
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#1c1c1c] pt-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black text-xs uppercase font-mono tracking-wider rounded-xl transition-colors min-h-[44px]"
              >
                Entendido, ¡Listo!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
