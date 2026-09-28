import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
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
  Users
} from 'lucide-react';
import { formatDateSpanish, getLevelProgress } from '../../lib/formatters';

export const LogrosView: React.FC = () => {
  const { achievements, userAchievements, xpEvents, profile } = useSayayinStore();

  const levelProgress = getLevelProgress(profile.currentXp);
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Insignias & Méritos
        </span>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
          <Trophy className="w-6 h-6 text-[#FF6600]" />
          Logros & Rachas Saiyajin
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Las condecoraciones del guerrero. Desbloqueadas exclusivamente mediante consistencia real en tus finanzas y rutinas.
        </p>
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
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${levelProgress.progressPercentage}%` }}
              />
            </div>
            <span className="text-[9px] text-zinc-400 block mt-1 font-mono">
              Fórmula: 100·n·(n+1)/2
            </span>
          </div>
        </div>

        {/* Logros Totales */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Insignias Obtenidas
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {userAchievements.length} / {achievements.length}
            </div>
            <span className="text-[10px] text-zinc-400">
              {Math.round((userAchievements.length / achievements.length) * 100)}% desbloqueado
            </span>
          </div>
        </div>
      </div>

      {/* 3. Grid of Achievements */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6600]" /> Galería de Méritos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const unlocked = unlockedMap.get(ach.id);
            const isUnlocked = !!unlocked;

            let IconComp = Trophy;
            if (ach.icon === 'Flame') IconComp = Flame;
            if (ach.icon === 'Zap') IconComp = Zap;
            if (ach.icon === 'Wallet') IconComp = Wallet;
            if (ach.icon === 'Coins') IconComp = Coins;
            if (ach.icon === 'Users') IconComp = Users;

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#241e17] to-[#1e1e1e] border-[#FF6600]/40 shadow-lg shadow-[#FF6600]/10'
                    : 'bg-[#181818] border-zinc-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-[#FF6600] text-black font-bold'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/20 px-2 py-0.5 rounded-full">
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
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                  <span>Categoría: {ach.category}</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold">
                      Desbloqueado ({formatDateSpanish(unlocked.unlockedAt)})
                    </span>
                  ) : (
                    <span>Bloqueado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. XP Audit Log ("Por qué tengo este nivel") */}
      <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-[#FF6600]" />
              Auditoría de Ki: ¿Por qué tengo este nivel?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cada punto de experiencia proviene de un hecho comprobable en tu radar.
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
