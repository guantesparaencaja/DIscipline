import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Target,
  MoreHorizontal,
  FileText,
  Trophy,
  Calendar,
  Users,
  Settings,
  X,
  Zap,
  BarChart3,
  ShieldAlert,
  Flame,
  Gift
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useSayayinStore } from '../../store/useSayayinStore';
import { PWAInstallButton } from '../ui/PWAInstallButton';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { dailyObjectives } = useSayayinStore();
  const safeObjectives = dailyObjectives || [];
  const pendingCount = safeObjectives.filter((o) => o && o.status === 'pendiente').length;

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  const moreItems: { id: NavTab; label: string; icon: React.ElementType; color?: string }[] = [
    { id: 'habitos', label: 'Hábitos & Disciplina', icon: Flame, color: 'text-amber-500' },
    { id: 'miedos', label: 'Miedos & Creencias', icon: ShieldAlert, color: 'text-purple-400' },
    { id: 'planes', label: 'Planes Tácticos', icon: FileText },
    { id: 'acciones', label: 'Acciones Rápidas', icon: Zap },
    { id: 'recompensas', label: 'Recompensas (XP)', icon: Gift, color: 'text-amber-400' },
    { id: 'companero', label: 'Compañero Saiyajin', icon: Users, color: 'text-emerald-400' },
    { id: 'logros', label: 'Logros & Rachas', icon: Trophy, color: 'text-amber-400' },
    { id: 'estadisticas', label: 'Estadísticas de Ki', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario Mensual', icon: Calendar },
    { id: 'configuracion', label: 'Configuración & Supabase', icon: Settings }
  ];

  return (
    <>
      {/* Bottom Floating Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-md border-t border-[#262626] px-1 py-1 flex items-center justify-around safe-area-bottom shadow-2xl">
        <button
          onClick={() => handleSelect('inicio')}
          data-testid="nav-tab-inicio"
          aria-label="Ir a Inicio"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none ${
            activeTab === 'inicio' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => handleSelect('finanzas')}
          data-testid="nav-tab-finanzas"
          aria-label="Ir a Finanzas"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none ${
            activeTab === 'finanzas' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Finanzas</span>
        </button>

        <button
          onClick={() => handleSelect('objetivos')}
          data-testid="nav-tab-objetivos"
          aria-label={`Ir a Objetivos (${pendingCount} pendientes)`}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none ${
            activeTab === 'objetivos' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Objetivos</span>
          {pendingCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-[#FF6600] text-black text-[11px] font-black flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelect('metas')}
          data-testid="nav-tab-metas"
          aria-label="Ir a Metas"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none ${
            activeTab === 'metas' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Metas</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          data-testid="nav-tab-more"
          aria-label="Ver más secciones"
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-[#FF6600] focus-visible:outline-none ${
            isMoreOpen ||
            ['habitos', 'miedos', 'planes', 'acciones', 'recompensas', 'companero', 'logros', 'estadisticas', 'calendario', 'configuracion'].includes(
              activeTab
            )
              ? 'text-[#FF6600]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>Más</span>
        </button>
      </nav>

      {/* "Más" Bottom Sheet Drawer Modal */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="bg-[#1a1a1a] border-t border-[#333] rounded-t-3xl p-5 space-y-4 max-h-[90dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d] shrink-0">
              <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Módulos Adicionales (12 Secciones)
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                aria-label="Cerrar menú adicional"
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#FF6600]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 overflow-y-auto flex-1 pr-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    data-testid={`nav-tab-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#FF6600] ${
                      isActive
                        ? 'bg-[#FF6600]/20 border-[#FF6600] text-white'
                        : 'bg-[#222] border-[#2f2f2f] text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.color || (isActive ? 'text-[#FF6600]' : 'text-zinc-400')}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#2d2d2d] shrink-0">
              <PWAInstallButton className="w-full justify-center" variant="primary" showAlways={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
