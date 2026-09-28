import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/ui/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { FinanzasView } from './components/finanzas/FinanzasView';
import { MetasView } from './components/metas/MetasView';
import { ObjetivosView } from './components/objetivos/ObjetivosView';
import { CompaneroView } from './components/companero/CompaneroView';
import { LogrosView } from './components/logros/LogrosView';
import { ConfiguracionView } from './components/configuracion/ConfiguracionView';
import { PlanesView } from './components/planes/PlanesView';
import { AccionesView } from './components/acciones/AccionesView';
import { MiedosView } from './components/miedos/MiedosView';
import { EstadisticasView } from './components/estadisticas/EstadisticasView';
import { CalendarioView } from './components/calendario/CalendarioView';
import { PowerBreakdownModal } from './components/dashboard/PowerBreakdownModal';
import { ExpenseModal } from './components/finanzas/ExpenseModal';
import { ObjectiveModal } from './components/objetivos/ObjectiveModal';
import { GoalModal } from './components/metas/GoalModal';
import { useSayayinStore } from './store/useSayayinStore';

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
    setIsGoalModalOpen
  } = useSayayinStore();

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col font-sans selection:bg-[#FF6600] selection:text-black antialiased">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
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
            />
          )}

          {activeTab === 'miedos' && <MiedosView />}

          {activeTab === 'logros' && <LogrosView />}

          {activeTab === 'estadisticas' && <EstadisticasView />}

          {activeTab === 'calendario' && (
            <CalendarioView onOpenObjectiveModal={() => setIsQuickObjectiveModalOpen(true)} />
          )}

          {activeTab === 'companero' && <CompaneroView />}

          {activeTab === 'configuracion' && <ConfiguracionView />}
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

      {/* 5. Notification Toasts Container */}
      <ToastContainer />
    </div>
  );
}
