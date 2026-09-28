import React from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { TRANSFORMATIONS, TRANSFORMATION_ORDER } from '../../lib/constants';
import { Sparkles, Lock, Check } from 'lucide-react';
import { TransformationId } from '../../types';

export const TransformationStrip: React.FC = () => {
  const { profile } = useSayayinStore();
  const currentTransId = profile.transformation;
  const currentTotalPower = profile.totalPower;

  return (
    <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-3xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6600]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Escalafón de Transformaciones Saiyajin
          </h4>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">
          Tu Poder Actual: <strong className="text-[#FF6600]">{currentTotalPower} pts</strong>
        </span>
      </div>

      {/* Horizontal Scrollable Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 overflow-x-auto pb-1">
        {TRANSFORMATION_ORDER.map((id) => {
          const config = TRANSFORMATIONS[id];
          const isCurrent = currentTransId === id;
          const isUnlocked = currentTotalPower >= config.minPower;

          return (
            <div
              key={id}
              className={`relative rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-300 border text-center ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#2a1e17] to-[#1e1e1e] border-[#FF6600] ring-2 ring-[#FF6600]/40 shadow-lg shadow-[#FF6600]/20 scale-102 z-10'
                  : isUnlocked
                  ? 'bg-[#181818] border-zinc-700/60 opacity-90'
                  : 'bg-[#141414] border-zinc-800/40 opacity-50 grayscale'
              }`}
            >
              {/* Badge Top */}
              <div className="flex items-center justify-between text-[9px] mb-1">
                <span className="font-mono text-zinc-400">
                  {config.minPower}-{config.maxPower}
                </span>
                {isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#FF6600] animate-ping" />
                ) : isUnlocked ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Lock className="w-3 h-3 text-zinc-400" />
                )}
              </div>

              {/* Transformation Name */}
              <div className="my-1.5">
                <h5 className={`text-xs font-black truncate ${config.textColor}`}>
                  {config.shortName}
                </h5>
                <p className="text-[9px] text-zinc-400 truncate mt-0.5">{config.name}</p>
              </div>

              {/* Status Tag */}
              <div className="mt-1">
                {isCurrent ? (
                  <span className="block text-[9px] font-black uppercase tracking-wider py-0.5 rounded bg-[#FF6600] text-black">
                    ACTUAL
                  </span>
                ) : (
                  <span className="block text-[9px] text-zinc-400 font-mono">
                    {isUnlocked ? 'Dominado' : `Req. ${config.minPower}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
