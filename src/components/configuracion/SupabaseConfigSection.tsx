import React, { useState } from 'react';
import { Database, Check, Copy, Code } from 'lucide-react';
import { isSupabaseConfigured, SCHEMA_SQL_FASE_1 } from '../../lib/supabase';

interface SupabaseConfigSectionProps {
  supabaseUrl: string;
  setSupabaseUrl: (url: string) => void;
  supabaseAnonKey: string;
  setSupabaseAnonKey: (key: string) => void;
  onSaveSupabase: (e: React.FormEvent) => void;
  onCopySql: () => void;
  copiedSql: boolean;
}

export const SupabaseConfigSection: React.FC<SupabaseConfigSectionProps> = ({
  supabaseUrl,
  setSupabaseUrl,
  supabaseAnonKey,
  setSupabaseAnonKey,
  onSaveSupabase,
  onCopySql,
  copiedSql
}) => {
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Conexión Supabase (Base de Datos & Auth)
            </h3>
            <p className="text-xs text-zinc-400">
              {isSupabaseConfigured()
                ? '🟢 Supabase Configurado y Activo'
                : '🟡 Modo Offline / Local activo (Configura tus credenciales para sincronizar en la nube)'}
            </p>
          </div>
        </div>

        <button
          onClick={onCopySql}
          className="flex items-center gap-1.5 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-emerald-400 border border-emerald-800/60 px-3 py-2 rounded-xl font-bold transition-colors"
        >
          {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copiar Esquema SQL (001_schema_fase1.sql)</span>
        </button>
      </div>

      <form onSubmit={onSaveSupabase} className="space-y-3 text-xs">
        <div>
          <label className="block text-zinc-300 font-bold mb-1">
            VITE_SUPABASE_URL
          </label>
          <input
            type="text"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-bold mb-1">
            VITE_SUPABASE_ANON_KEY
          </label>
          <input
            type="password"
            value={supabaseAnonKey}
            onChange={(e) => setSupabaseAnonKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowSqlViewer(!showSqlViewer)}
            className="text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSqlViewer ? 'Ocultar SQL' : 'Ver Código SQL Completo'}</span>
          </button>

          <button
            type="submit"
            className="bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Guardar Credenciales Supabase
          </button>
        </div>
      </form>

      {showSqlViewer && (
        <div className="mt-3 bg-[#121212] border border-zinc-800 rounded-2xl p-4 max-h-72 overflow-y-auto">
          <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
            {SCHEMA_SQL_FASE_1}
          </pre>
        </div>
      )}
    </div>
  );
};
