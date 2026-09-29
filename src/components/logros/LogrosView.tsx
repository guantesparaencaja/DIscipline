import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { AchievementCategory } from '../../types';
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
  Shield,
  Coins,
  Wallet,
  Users,
  Award,
  Crown,
  Filter,
  CheckSquare,
  Search,
  RefreshCw
} from 'lucide-react';
import { formatDateSpanish, getLevelProgress } from '../../lib/formatters';

export const LogrosView: React.FC = () => {
  const store = useSayayinStore();
  const achievements = store.achievements || [];
  const userAchievements = store.userAchievements || [];
  const xpEvents = store.xpEvents || [];
  const profile = store.profile || { currentXp: 0, currentLevel: 1, currentStreak: 0, bestStreak: 0 };
  const { checkAchievements } = store;

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'todos'>('todos');
  const [filterUnlocked, setFilterUnlocked] = useState<'todos' | 'desbloqueados' | 'bloqueados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const levelProgress = getLevelProgress(profile.currentXp);
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

  const filteredAchievements = achievements.filter((ach) => {
    if (!ach) return false;
    const isUnlocked = unlockedMap.has(ach.id);
    if (selectedCategory !== 'todos' && ach.category !== selectedCategory) return false;
    if (filterUnlocked === 'desbloqueados' && !isUnlocked) return false;
    if (filterUnlocked === 'bloqueados' && isUnlocked) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (ach.title && ach.title.toLowerCase().includes(q)) ||
        (ach.description && ach.description.toLowerCase().includes(q)) ||
        (ach.requirement && ach.requirement.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const handleRefreshAchievements = () => {
    checkAchievements();
  };

  const categories: { id: AchievementCategory | 'todos'; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'disciplina', label: 'Disciplina' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'poder', label: 'Poder' },
    { id: 'mental', label: 'Mental' },
    { id: 'social', label: 'Social' }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Insignias & Méritos del Guerrero
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Trophy className="w-6 h-6 text-[#FF6600]" />
            Sistema de Logros & Condecoraciones
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Recompensas de honor otorgadas exclusivamente por actos reales: constancia de hábitos, ahorro sostenido, disciplina presupuestal y dominio mental.
          </p>
        </div>

        <button
          onClick={handleRefreshAchievements}
          className="bg-[#1e1e1e] hover:bg-[#252525] border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 shrink-0 transition-colors shadow-lg"
        >
          <RefreshCw className="w-4 h-4 text-[#FF6600]" />
          Verificar Logros
        </button>
      </div>

      {/* 2. Streak & Level Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Racha Actual */}
        <div className="bg-gradient-to-br from-[#2a170d] to-[#1e1e1e] border border-[#FF6600]/40 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6600]/20 border border-[#FF6600]/40 flex items-center justify-center text-[#FF6600] shrink-0">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Racha Ininterrumpida
            </span>
            <div className="text-2xl font-black text-white font-mono">
              🔥 {profile.currentStreak} Días
            </div>
            <span className="text-[10px] text-zinc-400">
              Mejor racha histórica: {profile.bestStreak} días
            </span>
          </div>
        </div>

        {/* Nivel & Fórmula */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-black font-mono text-2xl">
            {profile.currentLevel}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Nivel de Combate
            </span>
            <div className="text-lg font-black text-white font-mono">
              {profile.currentXp} XP Acumulados
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress.progressPercentage}%` }}
              />
            </div>
            <span className="text-[9px] text-zinc-400 block mt-1 font-mono">
              Fórmula RPG: 100·n·(n+1)/2
            </span>
          </div>
        </div>

        {/* Logros Totales */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Insignias Desbloqueadas
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {unlockedCount} / {totalCount}
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 block mt-1">
              {completionPercentage}% del arsenal de méritos completado
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filters and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF6600] text-black shadow-md shadow-[#FF6600]/20'
                    : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar logro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161616] border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <select
              value={filterUnlocked}
              onChange={(e) => setFilterUnlocked(e.target.value as any)}
              className="bg-[#161616] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6600]"
            >
              <option value="todos">Todos</option>
              <option value="desbloqueados">Desbloqueados</option>
              <option value="bloqueados">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Grid of Achievements */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const unlocked = unlockedMap.get(ach.id);
            const isUnlocked = !!unlocked;

            let IconComp = Trophy;
            if (ach.icon === 'Flame') IconComp = Flame;
            if (ach.icon === 'Zap') IconComp = Zap;
            if (ach.icon === 'Wallet') IconComp = Wallet;
            if (ach.icon === 'Coins') IconComp = Coins;
            if (ach.icon === 'Users') IconComp = Users;
            if (ach.icon === 'Shield') IconComp = Shield;
            if (ach.icon === 'ShieldAlert') IconComp = Shield;
            if (ach.icon === 'Crown') IconComp = Crown;
            if (ach.icon === 'Calendar') IconComp = Calendar;
            if (ach.icon === 'CheckCircle2') IconComp = CheckCircle2;

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#241e17] via-[#1e1e1e] to-[#1c1813] border-[#FF6600]/40 shadow-lg shadow-[#FF6600]/10 hover:border-[#FF6600]'
                    : 'bg-[#181818] border-zinc-800/80 hover:border-zinc-700 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                        isUnlocked
                          ? 'bg-[#FF6600] text-black font-black'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/25 px-2.5 py-0.5 rounded-full">
                        +{ach.xpReward} XP
                      </span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white font-mono">{ach.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{ach.description}</p>

                  {/* Specific Requirement Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#121212] border border-zinc-800/60 text-[11px] space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block font-mono">
                      Requisito de Desbloqueo:
                    </span>
                    <p className="text-zinc-300 font-mono text-[10px]">
                      {ach.requirement || ach.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                  <span className="capitalize">Categoría: {ach.category}</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {formatDateSpanish(unlocked.unlockedAt)}
                    </span>
                  ) : (
                    <span className="text-zinc-500">Bloqueado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. XP Audit Log ("Por qué tengo este nivel") */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-[#FF6600]" />
              Auditoría de Ki: ¿Por qué tengo este nivel?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cada punto de experiencia proviene de un hecho comprobable en tu radar y acciones reales.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#FF6600]">
            Total: {profile.currentXp} XP
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60 pr-1">
          {xpEvents.length === 0 ? (
            <p className="py-6 text-center text-zinc-500 text-xs">Sin registros de XP aún.</p>
          ) : (
            xpEvents.map((ev) => (
              <div key={ev.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#FF6600] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{ev.description}</p>
                    <span className="text-[10px] text-zinc-500">{formatDateSpanish(ev.createdAt)}</span>
                  </div>
                </div>

                <span className="font-mono font-black text-[#FF6600] text-sm shrink-0">
                  +{ev.xpAmount} XP
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
