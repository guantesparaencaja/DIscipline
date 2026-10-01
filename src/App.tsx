import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/ToastContainer';
import { PowerBreakdownModal } from './components/dashboard/PowerBreakdownModal';
import { ExpenseModal } from './components/finanzas/ExpenseModal';
import { ObjectiveModal } from './components/objetivos/ObjectiveModal';
import { GoalModal } from './components/metas/GoalModal';
import { AuthModal } from './components/auth/AuthModal';
import { NivelHistorialModal } from './components/progreso/NivelHistorialModal';
import { OfflineIndicator } from './components/ui/OfflineIndicator';
import { useSayayinStore } from './store/useSayayinStore';
import { evaluateReminders } from './lib/notifications';
import { Flame } from 'lucide-react';
import { DashboardView } from './components/dashboard/DashboardView';

// Helper to safely load dynamic chunks with automatic retry
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      console.warn('Chunk import error, retrying module load...', err);
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          factory().then(resolve, reject);
        }, 400);
      });
    })
  );
}

// Lazy-loaded Secondary Views for Bundle Splitting
const HabitosView = lazyRetry(() =>
  import('./components/habitos/HabitosView').then((m) => ({ default: m.HabitosView }))
);
const FinanzasView = lazyRetry(() =>
  import('./components/finanzas/FinanzasView').then((m) => ({ default: m.FinanzasView }))
);
const MetasView = lazyRetry(() =>
  import('./components/metas/MetasView').then((m) => ({ default: m.MetasView }))
);
const ObjetivosView = lazyRetry(() =>
  import('./components/objetivos/ObjetivosView').then((m) => ({ default: m.ObjetivosView }))
);
const CompaneroView = lazyRetry(() =>
  import('./components/companero/CompaneroView').then((m) => ({ default: m.CompaneroView }))
);
const LogrosView = lazyRetry(() =>
  import('./components/logros/LogrosView').then((m) => ({ default: m.LogrosView }))
);
const ConfiguracionView = lazyRetry(() =>
  import('./components/configuracion/ConfiguracionView').then((m) => ({ default: m.ConfiguracionView }))
);
const PlanesView = lazyRetry(() =>
  import('./components/planes/PlanesView').then((m) => ({ default: m.PlanesView }))
);
const AccionesView = lazyRetry(() =>
  import('./components/acciones/AccionesView').then((m) => ({ default: m.AccionesView }))
);
const RecompensasView = lazyRetry(() =>
  import('./components/recompensas/RecompensasView').then((m) => ({ default: m.RecompensasView }))
);
const MiedosView = lazyRetry(() =>
  import('./components/miedos/MiedosView').then((m) => ({ default: m.MiedosView }))
);
const EstadisticasView = lazyRetry(() =>
  import('./components/estadisticas/EstadisticasView').then((m) => ({ default: m.EstadisticasView }))
);
const CalendarioView = lazyRetry(() =>
  import('./components/calendario/CalendarioView').then((m) => ({ default: m.CalendarioView }))
);

const ViewLoadingFallback = () => (
  <div className="py-20 flex flex-col items-center justify-center space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] animate-pulse">
      <Flame className="w-6 h-6 animate-bounce" />
    </div>
    <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider">
      Cargando Ki del Módulo...
    </span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');

  const {
    isPowerModalOpen,
    setIsPowerModalOpen,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    isQuickObjectiveModalOpen,
    setIsQuickObjectiveModalOpen,
    isGoalModalOpen,
    setIsGoalModalOpen,
    isNivelHistorialOpen,
    setIsNivelHistorialOpen,
    initAuthListener,
    checkAchievements,
    generateRecurringObjectives,
    dailyObjectives
  } = useSayayinStore();

  useEffect(() => {
    initAuthListener();
    checkAchievements();
    generateRecurringObjectives();

    // Check reminders initially and every 30s
    evaluateReminders(dailyObjectives || []);
    const reminderInterval = setInterval(() => {
      evaluateReminders(useSayayinStore.getState().dailyObjectives || []);
    }, 30000);

    return () => clearInterval(reminderInterval);
  }, []);

  return (
    <div className="min-h-dvh bg-[#121212] text-zinc-100 flex flex-col font-sans selection:bg-[#FF6600] selection:text-black antialiased">
      {/* Offline Sync State Indicator */}
      <OfflineIndicator />

      {/* 1. Top Bar */}
      <Navbar
        onOpenSettings={() => setActiveTab('configuracion')}
        onOpenPowerBreakdown={() => setIsPowerModalOpen(true)}
      />

      {/* 2. Main Content Layout (Desktop Sidebar + Center View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden pb-28 md:pb-8">
          <Suspense fallback={<ViewLoadingFallback />}>
            {activeTab === 'inicio' && (
              <DashboardView
                onOpenPowerBreakdown={() => setIsPowerModalOpen(true)}
                onOpenObjectiveModal={() => setIsQuickObjectiveModalOpen(true)}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'finanzas' && (
              <FinanzasView
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onOpenConfig={() => setActiveTab('configuracion')}
              />
            )}

            {activeTab === 'habitos' && <HabitosView />}

            {activeTab === 'metas' && (
              <MetasView
                onOpenGoalModal={() => setIsGoalModalOpen(true)}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onOpenObjectiveModal={() => setIsQuickObjectiveModalOpen(true)}
              />
            )}

            {activeTab === 'objetivos' && (
              <ObjetivosView onOpenObjectiveModal={() => setIsQuickObjectiveModalOpen(true)} />
            )}

            {activeTab === 'planes' && (
              <PlanesView onNavigateToGoals={() => setActiveTab('metas')} />
            )}

            {activeTab === 'acciones' && (
              <AccionesView
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onOpenGoalModal={() => setIsGoalModalOpen(true)}
                onNavigateToRewards={() => setActiveTab('recompensas')}
              />
            )}

            {activeTab === 'recompensas' && <RecompensasView />}

            {activeTab === 'miedos' && <MiedosView />}

            {activeTab === 'logros' && <LogrosView />}

            {activeTab === 'estadisticas' && <EstadisticasView />}

            {activeTab === 'calendario' && (
              <CalendarioView onOpenObjectiveModal={() => setIsQuickObjectiveModalOpen(true)} />
            )}

            {activeTab === 'companero' && <CompaneroView />}

            {activeTab === 'configuracion' && <ConfiguracionView />}
          </Suspense>
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 4. Global Modals */}
      <PowerBreakdownModal
        isOpen={isPowerModalOpen}
        onClose={() => setIsPowerModalOpen(false)}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <ObjectiveModal
        isOpen={isQuickObjectiveModalOpen}
        onClose={() => setIsQuickObjectiveModalOpen(false)}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <NivelHistorialModal
        isOpen={isNivelHistorialOpen}
        onClose={() => setIsNivelHistorialOpen(false)}
      />

      <AuthModal />

      {/* 5. Notification Toasts Container */}
      <ToastContainer />
    </div>
  );
}
