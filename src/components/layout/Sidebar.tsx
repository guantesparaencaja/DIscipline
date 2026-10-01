import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Target,
  FileText,
  Zap,
  ShieldAlert,
  Trophy,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Lock,
  Flame,
  Gift
} from 'lucide-react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { getTodayDateString } from '../../lib/formatters';
import { PWAInstallButton } from '../ui/PWAInstallButton';

export type NavTab =
  | 'inicio'
  | 'finanzas'
  | 'habitos'
  | 'objetivos'
  | 'metas'
  | 'planes'
  | 'acciones'
  | 'recompensas'
  | 'miedos'
  | 'logros'
  | 'estadisticas'
  | 'calendario'
  | 'companero'
  | 'configuracion';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const store = useSayayinStore();
  const profile = store.profile || { currentStreak: 0, bestStreak: 0, totalPower: 0, transformation: 'base' };
  const partner = store.partner;
  const safeObjectives = store.dailyObjectives || [];
  const safeGoals = store.goals || [];
  const safeHabits = store.habits || [];

  const todayStr = getTodayDateString();
  const scheduledTodayHabits = store.getHabitsForDate ? store.getHabitsForDate(todayStr) : [];
  const completedHabitsToday = scheduledTodayHabits.filter((h) => h.completedToday).length;

  const pendingObjectivesCount = safeObjectives.filter((o) => o && o.status === 'pendiente').length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    isLocked?: boolean;
    subtitle?: string;
  }[] = [
    { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
    {
      id: 'finanzas',
      label: 'Finanzas',
      icon: Wallet,
      subtitle: 'Fondo & Gastos'
    },
    {
      id: 'habitos',
      label: 'Hábitos',
      icon: Flame,
      subtitle: 'Disciplina & Rachas',
      badge: scheduledTodayHabits.length > 0 ? `${completedHabitsToday}/${scheduledTodayHabits.length}` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold'
    },
    {
      id: 'objetivos',
      label: 'Objetivos Diarios',
      icon: CheckSquare,
      badge: pendingObjectivesCount > 0 ? pendingObjectivesCount : undefined,
      badgeColor: 'bg-[#FF6600] text-black font-bold'
    },
    {
      id: 'metas',
      label: 'Metas',
      icon: Target,
      badge: safeGoals.length > 0 ? safeGoals.length : undefined
    },
    { id: 'planes', label: 'Planes', icon: FileText },
    { id: 'acciones', label: 'Acciones Rápidas', icon: Zap },
    {
      id: 'recompensas',
      label: 'Recompensas',
      icon: Gift,
      subtitle: 'Canje con XP',
      badge: (store.profile?.availableXp ?? store.profile?.currentXp ?? 0) > 0 ? `${store.profile?.availableXp ?? store.profile?.currentXp} XP` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold'
    },
    {
      id: 'miedos',
      label: 'Miedos & Creencias',
      icon: ShieldAlert,
      subtitle: 'Dominio Mental'
    },
    {
      id: 'logros',
      label: 'Logros & Rachas',
      icon: Trophy,
      badge: `🔥 ${profile.currentStreak}d`
    },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    {
      id: 'companero',
      label: 'Compañero',
      icon: Users,
      badge: partner ? 'En vivo' : undefined,
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
    },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#141414] border-r border-[#242424] flex flex-col shrink-0 min-h-[calc(100dvh-61px)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Menú de Entrenamiento
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              data-testid={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF6600]/20 to-transparent text-white border-l-4 border-[#FF6600] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e1e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#FF6600]' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.isLocked && <Lock className="w-3 h-3 text-zinc-400" />}
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      item.badgeColor || 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* In-App Install Prompt */}
      <div className="px-3 pb-2">
        <PWAInstallButton className="w-full justify-center" variant="outline" />
      </div>

      {/* Racha & Ki Mini Footer */}
      <div className="p-3 border-t border-[#222] bg-[#181818]/60 m-2 rounded-xl text-xs">
        <div className="flex items-center justify-between text-zinc-300 mb-1">
          <span className="text-[11px] font-medium text-zinc-400">Racha Actual</span>
          <span className="font-mono font-bold text-[#FF6600]">🔥 {profile.currentStreak} Días</span>
        </div>
        <div className="flex items-center justify-between text-zinc-300 text-[11px]">
          <span className="text-zinc-400">Mejor Racha</span>
          <span className="font-mono text-zinc-300">{profile.bestStreak} Días</span>
        </div>
      </div>
    </aside>
  );
};
