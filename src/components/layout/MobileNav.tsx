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
  Flame
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useSayayinStore } from '../../store/useSayayinStore';

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
    { id: 'companero', label: 'Compañero Saiyajin', icon: Users, color: 'text-emerald-400' },
    { id: 'logros', label: 'Logros & Rachas', icon: Trophy, color: 'text-amber-400' },
    { id: 'estadisticas', label: 'Estadísticas de Ki', icon: BarChart3 },
    { id: 'calendario', label: 'Calendario Mensual', icon: Calendar },
    { id: 'configuracion', label: 'Configuración & Supabase', icon: Settings }
  ];

  return (
    <>
      {/* Bottom Floating Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur-md border-t border-[#262626] px-2 py-1.5 flex items-center justify-around safe-area-bottom shadow-2xl">
        <button
          onClick={() => handleSelect('inicio')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'inicio' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => handleSelect('finanzas')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'finanzas' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Finanzas</span>
        </button>

        <button
          onClick={() => handleSelect('objetivos')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'objetivos' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Objetivos</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#FF6600] text-black text-[9px] font-black flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelect('metas')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'metas' ? 'text-[#FF6600]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Metas</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            isMoreOpen ||
            ['habitos', 'miedos', 'planes', 'acciones', 'companero', 'logros', 'estadisticas', 'calendario', 'configuracion'].includes(
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

      {/* "Más" Drawer Modal */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="bg-[#1a1a1a] border-t border-[#333] rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d2d2d]">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Módulos Adicionales
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
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
          </div>
        </div>
      )}
    </>
  );
};
