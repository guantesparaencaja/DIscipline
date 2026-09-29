import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  X,
  Lock,
  Mail,
  User,
  Zap,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authUser,
    signInWithSupabase,
    signUpWithSupabase,
    signOutFromSupabase,
    resetSupabasePassword,
    authLoading,
    authError,
    setAuthError
  } = useSayayinStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setAuthError(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setAuthError('Ingresa tu correo para recibir el enlace de restablecimiento.');
        return;
      }
      const res = await resetSupabasePassword(email);
      if (res.success) {
        setFeedback('Revisa tu bandeja de entrada para restablecer tu contraseña.');
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor completa todos los campos.');
      return;
    }

    if (mode === 'login') {
      await signInWithSupabase(email, password);
    } else {
      if (password.length < 6) {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      const res = await signUpWithSupabase(email, password);
      if (res.success) {
        setFeedback('¡Cuenta creada! Tu progreso ahora se sincroniza en Supabase.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#FF6600]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setFeedback(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6600]/15 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] mx-auto shadow-lg shadow-[#FF6600]/10">
            <Zap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
            {authUser ? 'Sesión de Guerrero Activa' : mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Registrar Guerrero' : 'Recuperar Contraseña'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {authUser
              ? 'Tus progresos, logros y ki se sincronizan en la nube con Supabase.'
              : 'Sincroniza tus finanzas, rachas y objetivos entre dispositivos.'}
          </p>
        </div>

        {/* Connection Status indicator */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141414] border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-zinc-300">
              {isConfigured ? 'Supabase Conectado' : 'Modo Almacenamiento Local'}
            </span>
          </div>

          {!isConfigured && (
            <span className="text-[10px] text-amber-400 font-bold">
              Configura tus credenciales en Ajustes
            </span>
          )}
        </div>

        {/* If already authenticated */}
        {authUser ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Cuenta Conectada
              </span>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6600]" />
                {authUser.email}
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sesión sincronizada con Postgres
              </span>
            </div>

            <button
              onClick={() => {
                signOutFromSupabase();
                setIsAuthModalOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-800 border border-zinc-700 font-bold text-xs uppercase tracking-wider text-zinc-300 transition-all"
            >
              Cerrar Sesión (Volver a Modo Local)
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {feedback && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{feedback}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guerrero@sayayin.app"
                  required
                  className="w-full bg-[#141414] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setAuthError(null);
                      }}
                      className="text-[10px] text-[#FF6600] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#141414] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#FF6600] hover:bg-orange-500 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FF6600]/20 flex items-center justify-center gap-2"
            >
              {authLoading
                ? 'Conectando Ki...'
                : mode === 'login'
                ? 'Entrar al Radar'
                : mode === 'register'
                ? 'Crear Cuenta Saiyajin'
                : 'Enviar Enlace de Recuperación'}
            </button>

            {/* Toggle Login / Register */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <p className="text-xs text-zinc-400">
                  ¿No tienes cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setAuthError(null);
                    }}
                    className="text-[#FF6600] font-bold hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              ) : (
                <p className="text-xs text-zinc-400">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setAuthError(null);
                    }}
                    className="text-[#FF6600] font-bold hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-center">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Continuar entrenando en Modo Local (Sin cuenta)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
