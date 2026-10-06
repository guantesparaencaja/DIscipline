import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { formatCOP } from '../../lib/formatters';
import { Settings, Smartphone } from 'lucide-react';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FinancialParamsSection } from './FinancialParamsSection';
import { FixedDeductionsSection } from './FixedDeductionsSection';
import { PrivacySection } from './PrivacySection';
import { GoogleWorkspaceSection } from './GoogleWorkspaceSection';
import { SupabaseConfigSection } from './SupabaseConfigSection';
import { RemindersSection } from './RemindersSection';
import { OfflineSyncSection } from './OfflineSyncSection';
import { DataExportSection } from './DataExportSection';
import { DangerZoneSection } from './DangerZoneSection';
import { errorLogger, SystemErrorEntry } from '../../lib/errorLogger';
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
    expenses,
    goals,
    plans,
    habits,
    fears,
    actions,
    personalRewards,
    authUser,
    deleteAccountPermanently,
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

  // Generic confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDangerous?: boolean;
    confirmLabel?: string;
  } | null>(null);

  // Delete account loading state
  const [isDeleting, setIsDeleting] = useState(false);

  // System error logs
  const [errorLogs, setErrorLogs] = useState<SystemErrorEntry[]>(() => errorLogger.getLoggedErrors());
  const [copiedLog, setCopiedLog] = useState(false);

  // Supabase Credentials
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    try {
      const stored = localStorage.getItem('sayayin_supabase_config');
      if (stored) return JSON.parse(stored).url;
    } catch {}
    return (import.meta as any).env?.VITE_SUPABASE_URL || '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => {
    try {
      const stored = localStorage.getItem('sayayin_supabase_config');
      if (stored) return JSON.parse(stored).anonKey;
    } catch {}
    return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  });
  const [copiedSql, setCopiedSql] = useState(false);

  // Workspace Auth
  const [isWorkspaceLinked, setIsWorkspaceLinked] = useState(isWorkspaceConnected());
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  const handleExportJSON = () => {
    const backup = {
      version: '1.0.0-saiyajin',
      exportedAt: new Date().toISOString(),
      authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
      profile,
      financialSettings,
      fixedDeductions,
      expenses,
      goals,
      plans,
      dailyObjectives,
      habits,
      fears,
      actions,
      personalRewards
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sayayin_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Datos exportados en JSON',
      description: 'Copia de seguridad completa descargada con éxito.'
    });
  };

  const handleExportExpensesCSV = () => {
    if (expenses.length === 0) {
      addToast({
        type: 'info',
        title: 'Sin gastos registrados',
        description: 'No hay gastos para exportar en este momento.'
      });
      return;
    }
    const headers = ['Fecha', 'Descripción', 'Monto_COP', 'Categoría', 'Método_Pago', 'Es_Ahorro', 'Nota'];
    const rows = expenses.map((e) => [
      `"${e.date}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${(e.categoryName || 'General').replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      e.isSaving ? 'SÍ' : 'NO',
      `"${(e.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sayayin_gastos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Gastos exportados en CSV',
      description: `Se exportaron ${expenses.length} registros contables.`
    });
  };

  const handleExecuteDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountPermanently();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearOffline = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Descartar Cola Offline',
      message: '¿Estás seguro de que deseas vaciar las acciones pendientes locales? Esta acción no se puede deshacer.',
      isDangerous: true,
      confirmLabel: 'Descartar Cola',
      onConfirm: async () => {
        await clearOfflineQueue();
        setOfflineCount(0);
        setOfflineItems([]);
        addToast({
          type: 'info',
          title: 'Cola offline vaciada',
          description: 'Se eliminaron las acciones pendientes locales.'
        });
        setConfirmDialog(null);
      }
    });
  };

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
      const items = await getOfflineQueue();
      setOfflineCount(count);
      setOfflineItems(items);
      addToast({
        type: 'success',
        title: 'Sincronización completada',
        description: 'Todas las acciones pendientes han sido procesadas.'
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error de sincronización',
        description: 'No se pudieron sincronizar todas las acciones. Se reintentará después.'
      });
    } finally {
      setIsSyncingQueue(false);
    }
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
      <FinancialParamsSection
        initialIncome={financialSettings.baseMonthlyIncome}
        initialEmergencyTarget={financialSettings.emergencyFundTarget}
        onSave={(income, target) => {
          updateFinancialSettings(income, target);
          addToast({
            type: 'success',
            title: 'Parámetros actualizados',
            description: 'Ingreso base y fondo de emergencia guardados.'
          });
        }}
        showToast={(msg) => addToast({ type: 'warning', title: 'Monto inválido', description: msg })}
      />

      {/* 3. Deducciones Fijas (Diezmo, Arriendo, Traje, Salidas, Fondo) */}
      <FixedDeductionsSection
        fixedDeductions={fixedDeductions}
        onAddDeduction={(name, amount, category) => {
          addFixedDeduction({
            name,
            amount,
            category: category || 'Fijo',
            isActive: true,
            dueDay: 1
          });
          addToast({
            type: 'success',
            title: 'Deducción agregada',
            description: `Se registró "${name}" por ${formatCOP(amount)}.`
          });
        }}
        onEditDeduction={(id, updates) => editFixedDeduction(id, updates)}
        onDeleteDeduction={(ded) => {
          setConfirmDialog({
            isOpen: true,
            title: 'Eliminar Deducción Fija',
            message: `¿Estás seguro de que deseas eliminar la deducción "${ded.name}" de ${formatCOP(ded.amount)}?`,
            isDangerous: true,
            confirmLabel: 'Eliminar',
            onConfirm: () => {
              deleteFixedDeduction(ded.id);
              setConfirmDialog(null);
              addToast({
                type: 'info',
                title: 'Deducción eliminada',
                description: `Se eliminó "${ded.name}".`
              });
            }
          });
        }}
      />

      {/* 4. Privacidad y Compañero de Entrenamiento */}
      <PrivacySection
        shareObjectivesGlobally={profile.shareObjectivesGlobally !== false}
        onToggleGlobalPrivacy={updateGlobalPrivacySetting}
        onOpenNivelHistorial={() => setIsNivelHistorialOpen(true)}
      />

      {/* 5. Google Workspace Sync (Calendar & Tasks) */}
      <GoogleWorkspaceSection
        isWorkspaceLinked={isWorkspaceLinked}
        isLinkingGoogle={isLinkingGoogle}
        onToggleGoogle={handleToggleGoogle}
      />

      {/* 6. Conexión Supabase (Postgres & Realtime) */}
      <SupabaseConfigSection
        supabaseUrl={supabaseUrl}
        setSupabaseUrl={setSupabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
        setSupabaseAnonKey={setSupabaseAnonKey}
        onSaveSupabase={handleSaveSupabase}
        onCopySql={handleCopySql}
        copiedSql={copiedSql}
      />

      {/* 7. Recordatorios por Horario & Web Push */}
      <RemindersSection
        reminders={reminders}
        permStatus={permStatus}
        testingNotification={testingNotification}
        onRequestPermission={handleRequestPermission}
        onTestNotification={handleTestNotification}
        onUpdateReminders={handleUpdateReminders}
      />

      {/* 8. Cola de Sincronización Offline (IndexedDB) */}
      <OfflineSyncSection
        offlineCount={offlineCount}
        offlineItems={offlineItems}
        isSyncingQueue={isSyncingQueue}
        onSyncOffline={handleSyncOffline}
        onClearOffline={handleClearOffline}
      />

      {/* 9. Instalación de la Aplicación (PWA) */}
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

      {/* 10. Exportación de Datos & Registro de Errores */}
      <DataExportSection
        expenses={expenses}
        errorLogs={errorLogs}
        copiedLog={copiedLog}
        onExportJSON={handleExportJSON}
        onExportExpensesCSV={handleExportExpensesCSV}
        onCopyLogs={() => {
          const logText = errorLogger.exportErrorLog();
          navigator.clipboard.writeText(logText);
          setCopiedLog(true);
          setTimeout(() => setCopiedLog(false), 2000);
          addToast({ type: 'info', title: 'Registro copiado al portapapeles' });
        }}
        onClearLogs={() => {
          errorLogger.clearLoggedErrors();
          setErrorLogs([]);
          addToast({ type: 'info', title: 'Registro de errores limpiado' });
        }}
      />

      {/* 11. Zona de Peligro: Restablecer Datos & Eliminar Cuenta */}
      <DangerZoneSection
        onResetDemo={() => {
          setConfirmDialog({
            isOpen: true,
            title: 'Restablecer Entrenamiento Inicial',
            message: '¿Deseas reiniciar todos los datos a los valores iniciales de Fase 1? Tu progreso personalizado actual será reemplazado.',
            isDangerous: true,
            confirmLabel: 'Restablecer Datos',
            onConfirm: () => {
              resetToInitialDemo();
              setConfirmDialog(null);
            }
          });
        }}
        onDeleteAccount={handleExecuteDeleteAccount}
        isDeleting={isDeleting}
      />

      {/* Diálogo Genérico de Confirmación */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          isDangerous={confirmDialog.isDangerous}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};
