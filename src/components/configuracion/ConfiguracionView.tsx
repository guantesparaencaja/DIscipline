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
  Code,
  Shield,
  History,
  Lock,
  Eye,
  Bell,
  Clock,
  Smartphone,
  WifiOff,
  Wifi,
  Moon,
  Sun,
  Sunset
} from 'lucide-react';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendTestNotification,
  ReminderSettings
} from '../../lib/notifications';
import {
  getOfflineQueue,
  getOfflineQueueCount,
  clearOfflineQueue,
  QueuedSyncAction
} from '../../lib/offlineQueue';
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
    dailyObjectives,
    updateGlobalPrivacySetting,
    setIsNivelHistorialOpen,
    resetToInitialDemo,
    syncOfflineQueueNow,
    addToast
  } = useSayayinStore();

  // Reminder and Push Notification settings
  const [reminders, setReminders] = useState<ReminderSettings>(() => getReminderSettings());
  const [permStatus, setPermStatus] = useState<NotificationPermission>(() => getNotificationPermissionStatus());
  const [testingNotification, setTestingNotification] = useState(false);

  // Offline Sync Queue state
  const [offlineItems, setOfflineItems] = useState<QueuedSyncAction[]>([]);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  React.useEffect(() => {
    const refreshQueue = async () => {
      const count = await getOfflineQueueCount();
      setOfflineCount(count);
      const items = await getOfflineQueue();
      setOfflineItems(items);
    };
    refreshQueue();

    const handler = () => refreshQueue();
    window.addEventListener('sayayin-offline-queue-changed', handler);
    window.addEventListener('online', handler);
    return () => {
      window.removeEventListener('sayayin-offline-queue-changed', handler);
      window.removeEventListener('online', handler);
    };
  }, []);

  const handleUpdateReminders = (updates: Partial<ReminderSettings>) => {
    const next = saveReminderSettings(updates);
    setReminders(next);
    addToast({
      type: 'success',
      title: 'Configuración de recordatorios guardada',
      description: 'Los avisos por franja horaria están sincronizados.'
    });
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
    if (res === 'granted') {
      addToast({
        type: 'success',
        title: '¡Permiso de notificaciones concedido!',
        description: 'Recibirás avisos de tus objetivos según tus franjas horarias.'
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Permiso denegado',
        description: 'Habilita las notificaciones en los ajustes de tu navegador.'
      });
    }
  };

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      const ok = await sendTestNotification(dailyObjectives || []);
      if (ok) {
        addToast({
          type: 'success',
          title: 'Notificación de prueba enviada',
          description: 'Revisa tu centro de notificaciones.'
        });
      } else {
        addToast({
          type: 'warning',
          title: 'No se pudo enviar la notificación',
          description: 'Verifica los permisos en tu navegador.'
        });
      }
    } finally {
      setTestingNotification(false);
    }
  };

  const handleSyncOffline = async () => {
    if (!navigator.onLine) {
      addToast({
        type: 'warning',
        title: 'Sin conexión a internet',
        description: 'Conéctate a una red para subir las acciones pendientes.'
      });
      return;
    }
    setIsSyncingQueue(true);
    try {
      await syncOfflineQueueNow();
      const count = await getOfflineQueueCount();
      setOfflineCount(count);
      const items = await getOfflineQueue();
      setOfflineItems(items);
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const handleClearOffline = async () => {
    if (window.confirm('¿Seguro que deseas descartar la cola de acciones offline?')) {
      await clearOfflineQueue();
      setOfflineCount(0);
      setOfflineItems([]);
      addToast({
        type: 'info',
        title: 'Cola offline vaciada',
        description: 'Se eliminaron las acciones pendientes locales.'
      });
    }
  };

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
      addToast({
        type: 'warning',
        title: 'Monto inválido',
        description: 'Ingresa un ingreso mensual válido mayor a 0 COP'
      });
      return;
    }
    updateFinancialSettings(income, target);
  };

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newDeductionAmount.replace(/\D/g, ''));
    if (!newDeductionName.trim() || !amount || amount <= 0) {
      addToast({
        type: 'warning',
        title: 'Datos incompletos',
        description: 'Ingresa un nombre y monto válido mayor a 0 COP'
      });
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

      {/* 4. Privacidad y Compañero de Entrenamiento */}
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
            onClick={() => setIsNivelHistorialOpen(true)}
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
              checked={profile.shareObjectivesGlobally !== false}
              onChange={(e) => updateGlobalPrivacySetting(e.target.checked)}
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

      {/* 5. Google Workspace Sync (Calendar & Tasks) */}
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

      {/* 6. Recordatorios por Franja Horaria & Web Push */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                Recordatorios por Horario & Web Push
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Avisos locales y Web Push que te alertan cuántos objetivos restan por franja horaria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {permStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition-colors min-h-[44px]"
              >
                Solicitar Permiso Push
              </button>
            )}

            <button
              type="button"
              disabled={testingNotification}
              onClick={handleTestNotification}
              className="px-3.5 py-2 bg-[#252525] hover:bg-[#303030] text-zinc-200 border border-zinc-700/60 font-bold text-xs rounded-xl font-mono transition-colors min-h-[44px]"
            >
              Probar Notificación
            </button>
          </div>
        </div>

        {/* Master Switch & Status */}
        <div className="bg-[#161616] p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white block font-mono">
              Notificaciones del Radar Activas
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Estado en navegador: <strong className={permStatus === 'granted' ? 'text-emerald-400' : 'text-amber-400'}>
                {permStatus === 'granted' ? 'Permiso Concedido' : permStatus === 'denied' ? 'Permiso Denegado' : 'Sin solicitar'}
              </strong>
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={reminders.enabled}
              onChange={(e) => handleUpdateReminders({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6600]"></div>
          </label>
        </div>

        {/* Franjas Horarias Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
          {/* Mañana */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" /> Turno Mañana
              </span>
              <input
                type="checkbox"
                checked={reminders.morningEnabled}
                onChange={(e) => handleUpdateReminders({ morningEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FF6600] rounded"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Notifica cuántos objetivos matutinos tienes pendientes.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="time"
                value={reminders.morningTime}
                onChange={(e) => handleUpdateReminders({ morningTime: e.target.value })}
                className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
              />
            </div>
          </div>

          {/* Tarde */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sunset className="w-4 h-4 text-orange-400" /> Turno Tarde
              </span>
              <input
                type="checkbox"
                checked={reminders.afternoonEnabled}
                onChange={(e) => handleUpdateReminders({ afternoonEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FF6600] rounded"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Notifica cuántos objetivos vespertinos faltan por cumplir.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="time"
                value={reminders.afternoonTime}
                onChange={(e) => handleUpdateReminders({ afternoonTime: e.target.value })}
                className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
              />
            </div>
          </div>

          {/* Noche */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-purple-400" /> Turno Noche
              </span>
              <input
                type="checkbox"
                checked={reminders.nightEnabled}
                onChange={(e) => handleUpdateReminders({ nightEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FF6600] rounded"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Recordatorio final para cerrar las disciplinas nocturnas.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="time"
                value={reminders.nightTime}
                onChange={(e) => handleUpdateReminders({ nightTime: e.target.value })}
                className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resumen Nocturno Opcional */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171720] to-[#161616] border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-400" /> Resumen Nocturno de Cierre
            </span>
            <p className="text-[11px] text-zinc-400">
              Emite el reporte diario: <strong className="text-zinc-200">"Hoy completaste X de Y objetivos"</strong> al terminar tu día.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <input
              type="time"
              value={reminders.nightSummaryTime}
              onChange={(e) => handleUpdateReminders({ nightSummaryTime: e.target.value })}
              className="bg-[#111] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:border-[#FF6600] focus:outline-none"
            />
            <input
              type="checkbox"
              checked={reminders.nightSummaryEnabled}
              onChange={(e) => handleUpdateReminders({ nightSummaryEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#FF6600] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 7. Cola de Sincronización Offline (IndexedDB) */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                Motor Offline & Cola IndexedDB
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Las acciones realizadas sin conexión se persisten en IndexedDB y se sincronizan en orden estricto sin duplicados al reconectar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncOffline}
              disabled={isSyncingQueue || offlineCount === 0}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all min-h-[44px] ${
                offlineCount > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingQueue ? 'animate-spin' : ''}`} />
              <span>{isSyncingQueue ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>

            {offlineCount > 0 && (
              <button
                onClick={handleClearOffline}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Limpiar cola"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                typeof navigator !== 'undefined' && navigator.onLine ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-zinc-300">
              Conexión actual: <strong className="text-white">{typeof navigator !== 'undefined' && navigator.onLine ? 'Conectado a Internet' : 'Sin conexión (Modo Offline)'}</strong>
            </span>
          </div>

          <span className="text-zinc-400">
            Acciones en cola: <strong className={offlineCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{offlineCount} pendientes</strong>
          </span>
        </div>

        {offlineItems.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {offlineItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#161616] border border-zinc-800/80 flex items-center justify-between text-[11px] font-mono"
              >
                <span className="text-zinc-200">
                  {idx + 1}. {item.type.replace(/_/g, ' ')}
                </span>
                <span className="text-zinc-500">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. Instalación de la Aplicación (PWA) */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center text-[#FF6600] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                Instalar Sayayin Radar en tu Móvil
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Instálala como PWA nativa para entrenar en pantalla completa y recibir recordatorios sin abrir el navegador.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <PWAInstallButton showAlways={true} variant="primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800">
          <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800/80 space-y-1">
            <strong className="text-white block font-bold">Android & Google Chrome / Edge:</strong>
            <span>Presiona el botón superior o usa el menú del navegador → "Instalar aplicación".</span>
          </div>
          <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800/80 space-y-1">
            <strong className="text-white block font-bold">iPhone / iPad (Safari):</strong>
            <span>Toca el icono Compartir de Safari y selecciona "Añadir a pantalla de inicio".</span>
          </div>
        </div>
      </div>

      {/* 9. Restablecer Datos de Demostración */}
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
