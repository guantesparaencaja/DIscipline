import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, Home } from 'lucide-react';
import { errorLogger } from '../../lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = () => {
    const errorDetails = `Sayayin Radar Error:
Mensaje: ${this.state.error?.message || 'Desconocido'}
Stack: ${this.state.error?.stack || 'Sin traza'}
Fecha: ${new Date().toISOString()}
URL: ${window.location.href}`;

    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#121212] text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1e1e1e] border border-rose-800/80 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-700/60 flex items-center justify-center text-rose-500 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                Alerta de Combate · Anomalía Crítica
              </span>
              <h1 className="text-xl font-black text-white font-mono">
                El Radar de Ki Sufrió una Falla
              </h1>
              <p className="text-xs text-zinc-400">
                Ocurrió un error inesperado al renderizar este componente. Tu progreso local y datos de entrenamiento están a salvo.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF6600] hover:bg-[#e05a00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Home className="w-4 h-4" />
                Reiniciar
              </button>
            </div>

            <button
              onClick={this.handleCopyError}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              {this.state.copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Detalle copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar reporte de error técnico</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
