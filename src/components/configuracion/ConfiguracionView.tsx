import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { formatCOP } from '../../lib/formatters';
import {
  Settings,
  Wallet,
  CreditCard,
  Database,
  Calendar,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Code
} from 'lucide-react';
import {
  isSupabaseConfigured,
  updateSupabaseCredentials,
  SCHEMA_SQL_FASE_1
} from '../../lib/supabase';
import { googleSignIn, isWorkspaceConnected, workspaceLogout } from '../../lib/workspace';

export const ConfiguracionView: React.FC = () => {
  const {
    financialSettings,
    fixedDeductions,
    updateFinancialSettings,
    addFixedDeduction,
    editFixedDeduction,
    deleteFixedDeduction,
    profile,
    resetToInitialDemo,
    addToast
  } = useSayayinStore();

  // Financial Form
  const [baseIncomeStr, setBaseIncomeStr] = useState(
    String(financialSettings.baseMonthlyIncome || 1250000)
  );
  const [emergencyTargetStr, setEmergencyTargetStr] = useState(
    String(financialSettings.emergencyFundTarget || 3750000)
  );

  // New fixed deduction form
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');
  const [newDeductionCategory, setNewDeductionCategory] = useState('Varios');
  const [newDeductionDueDay, setNewDeductionDueDay] = useState('1');

  // Supabase Credentials
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    try {
      const stored = localStorage.getItem('sayayin_supabase_config');
      if (stored) return JSON.parse(stored).url;
    } catch (e) {}
    return (import.meta as any).env?.VITE_SUPABASE_URL || '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => {
    try {
      const stored = localStorage.getItem('sayayin_supabase_config');
      if (stored) return JSON.parse(stored).anonKey;
    } catch (e) {}
    return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Workspace Auth
  const [isWorkspaceLinked, setIsWorkspaceLinked] = useState(isWorkspaceConnected());
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  const handleSaveFinances = (e: React.FormEvent) => {
    e.preventDefault();
    const income = Number(baseIncomeStr.replace(/\D/g, ''));
    const target = Number(emergencyTargetStr.replace(/\D/g, ''));
    if (!income || income <= 0) {
      alert('Ingresa un ingreso mensual válido');
      return;
    }
    updateFinancialSettings(income, target);
  };

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newDeductionAmount.replace(/\D/g, ''));
    if (!newDeductionName.trim() || !amount || amount <= 0) {
      alert('Ingresa un nombre y monto válido');
      return;
    }
    addFixedDeduction({
      name: newDeductionName.trim(),
      amount,
      category: newDeductionCategory,
      isActive: true,
      dueDay: Number(newDeductionDueDay) || 1
    });
    setNewDeductionName('');
    setNewDeductionAmount('');
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = updateSupabaseCredentials(supabaseUrl.trim(), supabaseAnonKey.trim());
    if (ok) {
      addToast({
        type: 'success',
        title: 'Credenciales de Supabase guardadas',
        description: 'Conectado a la base de datos Postgres y Realtime.'
      });
    } else {
      addToast({
        type: 'info',
        title: 'Modo local activo',
        description: 'Usando motor de persistencia offline.'
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL_FASE_1);
    setCopiedSql(true);
    addToast({
      type: 'success',
      title: 'Esquema SQL copiado',
      description: 'Pégalo en el editor SQL de Supabase.'
    });
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleToggleGoogle = async () => {
    if (isWorkspaceLinked) {
      await workspaceLogout();
      setIsWorkspaceLinked(false);
      addToast({ type: 'info', title: 'Google Desconectado' });
    } else {
      setIsLinkingGoogle(true);
      try {
        const res = await googleSignIn();
        if (res?.user) {
          setIsWorkspaceLinked(true);
          addToast({
            type: 'success',
            title: 'Google Calendar & Tasks Conectado',
            description: 'Sincronización autorizada.'
          });
        }
      } catch (err: any) {
        addToast({ type: 'error', title: 'Error Google', description: err?.message });
      } finally {
        setIsLinkingGoogle(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Ajustes & Conectividad
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <Settings className="w-6 h-6 text-[#FF6600]" />
          Configuración del Sistema
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Ajusta tus parámetros financieros, deducciones fijas, conexiones de Google y credenciales de Supabase.
        </p>
      </div>

      {/* 2. Parámetros Financieros Base */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Wallet className="w-5 h-5 text-[#FF6600]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Ingreso Base & Meta de Fondo
          </h3>
        </div>

        <form onSubmit={handleSaveFinances} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Ingreso Mensual Base (COP) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={baseIncomeStr}
              onChange={(e) => setBaseIncomeStr(e.target.value.replace(/\D/g, ''))}
              placeholder="1250000"
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
            />
            <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
              Vista previa: {formatCOP(Number(baseIncomeStr) || 0)}
            </span>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Meta Fondo de Emergencia (COP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={emergencyTargetStr}
              onChange={(e) => setEmergencyTargetStr(e.target.value.replace(/\D/g, ''))}
              placeholder="3750000"
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
            />
            <span className="text-[11px] text-zinc-400 font-mono mt-1 block">
              Vista previa: {formatCOP(Number(emergencyTargetStr) || 0)}
            </span>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Guardar Parámetros Financieros
            </button>
          </div>
        </form>
      </div>

      {/* 3. Deducciones Fijas (Diezmo, Arriendo, Traje, Salidas, Fondo) */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Deducciones Fijas Mensuales
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Total comprometido:{' '}
            <strong className="text-amber-400">
              {formatCOP(
                fixedDeductions
                  .filter((d) => d.isActive)
                  .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
              )}
            </strong>
          </span>
        </div>

        {/* List of existing deductions */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {fixedDeductions.map((ded) => (
            <div
              key={ded.id}
              className="p-3 rounded-2xl bg-[#171717] border border-zinc-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={ded.isActive}
                  onChange={(e) => editFixedDeduction(ded.id, { isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
                  title="Activar/desactivar descuento en el cálculo"
                />
                <div>
                  <h5 className="font-bold text-white">{ded.name}</h5>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {ded.category} · Pago día {ded.dueDay}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {formatCOP(ded.amount)}
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar la deducción "${ded.name}"?`)) {
                      deleteFixedDeduction(ded.id);
                    }
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new deduction form */}
        <form onSubmit={handleAddDeduction} className="pt-2 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            required
            value={newDeductionName}
            onChange={(e) => setNewDeductionName(e.target.value)}
            placeholder="Nombre (ej: Internet fibra)"
            className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
          />
          <input
            type="text"
            inputMode="numeric"
            required
            value={newDeductionAmount}
            onChange={(e) => setNewDeductionAmount(e.target.value.replace(/\D/g, ''))}
            placeholder="Monto COP (ej: 80000)"
            className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF6600]"
          />
          <input
            type="text"
            value={newDeductionCategory}
            onChange={(e) => setNewDeductionCategory(e.target.value)}
            placeholder="Categoría"
            className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
          />
          <button
            type="submit"
            className="bg-[#242424] hover:bg-[#2e2e2e] text-[#FF6600] border border-[#FF6600]/40 font-bold px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Descuento</span>
          </button>
        </form>
      </div>

      {/* 4. Google Workspace Sync (Calendar & Tasks) */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Google Workspace (Calendar & Tasks)
              </h3>
              <p className="text-xs text-zinc-400">
                Sincroniza tus disciplinas diarias directamente con Google Calendar y Google Tasks.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleGoogle}
            disabled={isLinkingGoogle}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              isWorkspaceLinked
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 hover:bg-rose-900'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
            }`}
          >
            {isLinkingGoogle
              ? 'Conectando...'
              : isWorkspaceLinked
              ? 'Desconectar Google'
              : 'Iniciar Sesión con Google'}
          </button>
        </div>

        <div className="text-xs text-zinc-400 space-y-1">
          <p>• Los permisos solicitados se usan exclusivamente con tu consentimiento explícito.</p>
          <p>• Cada objetivo que sincronices te solicitará confirmación antes de registrarse en tu cuenta de Google.</p>
        </div>
      </div>

      {/* 5. Conexión Supabase (Postgres & Realtime) */}
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
            onClick={handleCopySql}
            className="flex items-center gap-1.5 text-xs bg-[#242424] hover:bg-[#2c2c2c] text-emerald-400 border border-emerald-800/60 px-3 py-2 rounded-xl font-bold transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Esquema SQL (001_schema_fase1.sql)</span>
          </button>
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-3 text-xs">
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

      {/* 6. Restablecer Datos de Demostración */}
      <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Restablecer Entrenamiento de Fase 1</h4>
          <p className="text-xs text-zinc-400">
            Restaura las metas, gastos, deducciones y objetivos a los valores iniciales del sistema.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('¿Deseas reiniciar todos los datos a los valores iniciales de Fase 1?')) {
              resetToInitialDemo();
            }
          }}
          className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl font-bold transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Datos</span>
        </button>
      </div>
    </div>
  );
};
