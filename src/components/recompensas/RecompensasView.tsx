import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { RewardModal } from './RewardModal';
import {
  Gift,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  History,
  Sparkles,
  Zap,
  Coffee,
  Gamepad2,
  Film,
  ShoppingBag,
  Award,
  AlertCircle,
  X,
  Flame,
  Check
} from 'lucide-react';
import { PersonalReward } from '../../types';
import { formatDateSpanish } from '../../lib/formatters';

const REWARD_ICONS: { [key: string]: React.ElementType } = {
  Gift,
  Coffee,
  Gamepad2,
  Film,
  ShoppingBag,
  Sparkles,
  Zap,
  Flame,
  Award
};

const CATEGORIES = [
  'Descanso & Ocio',
  'Gastronomía & Antojos',
  'Entretenimiento & Juegos',
  'Cuidado Personal',
  'Experiencias',
  'Compras Personales'
];

export const RecompensasView: React.FC = () => {
  const store = useSayayinStore();
  const personalRewards = store.personalRewards || [];
  const rewardRedemptions = store.rewardRedemptions || [];
  const profile = store.profile || { currentXp: 0, currentLevel: 1, availableXp: 0 };
  const { addReward, editReward, deleteReward, redeemReward } = store;

  const availableXp = profile.availableXp ?? profile.currentXp ?? 0;
  const currentXp = profile.currentXp || 0;

  const [activeTab, setActiveTab] = useState<'catalogo' | 'historial'>('catalogo');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  // Modal create/edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<PersonalReward | null>(null);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardCost, setRewardCost] = useState(100);
  const [rewardCategory, setRewardCategory] = useState(CATEGORIES[0]);
  const [rewardIcon, setRewardIcon] = useState('Gift');

  // Confirmation modal state
  const [confirmRedemptionReward, setConfirmRedemptionReward] = useState<PersonalReward | null>(null);

  const filteredRewards = personalRewards.filter((r) => {
    if (selectedCategory === 'todas') return true;
    return r.category === selectedCategory;
  });

  const totalRedemptionsCount = rewardRedemptions.length;
  const totalXpSpent = rewardRedemptions.reduce((sum, r) => sum + (r.costXp || 0), 0);

  const handleOpenCreate = () => {
    setEditingReward(null);
    setRewardTitle('');
    setRewardDesc('');
    setRewardCost(100);
    setRewardCategory(CATEGORIES[0]);
    setRewardIcon('Gift');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reward: PersonalReward) => {
    setEditingReward(reward);
    setRewardTitle(reward.title);
    setRewardDesc(reward.description || '');
    setRewardCost(reward.costXp);
    setRewardCategory(reward.category);
    setRewardIcon(reward.icon || 'Gift');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    const ok = window.confirm(`¿Seguro que deseas eliminar la recompensa:\n"${title}"?`);
    if (ok) {
      deleteReward(id);
    }
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    if (editingReward) {
      editReward(editingReward.id, {
        title: rewardTitle.trim(),
        description: rewardDesc.trim() || undefined,
        costXp: Math.max(10, rewardCost),
        category: rewardCategory,
        icon: rewardIcon
      });
    } else {
      addReward({
        title: rewardTitle.trim(),
        description: rewardDesc.trim() || undefined,
        costXp: Math.max(10, rewardCost),
        category: rewardCategory,
        icon: rewardIcon
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmRedeem = () => {
    if (!confirmRedemptionReward) return;
    redeemReward(confirmRedemptionReward.id);
    setConfirmRedemptionReward(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
            Tienda de Disciplina Saiyajin
          </span>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            <Gift className="w-6 h-6 text-amber-400" />
            Recompensas Personales Canjeables
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Premia tu constancia real. El canje descuenta únicamente tu <strong className="text-amber-300">XP Disponible</strong> sin reducir tu <strong className="text-white">Nivel Saiyajin</strong> ni tu Ki acumulado.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 font-mono"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Crear Recompensa
        </button>
      </div>

      {/* 2. XP Balances Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Gastable / Disponible */}
        <div className="bg-gradient-to-br from-amber-950/40 to-[#1e1e1e] border border-amber-500/40 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              XP Disponible para Canjear
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {availableXp} <span className="text-sm font-normal text-amber-300/80">XP</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
            Ki gastable en recompensas
          </span>
        </div>

        {/* XP Total Acumulado */}
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              XP Total Histórico
            </span>
            <Zap className="w-4 h-4 text-[#FF6600]" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {currentXp} <span className="text-sm font-normal text-zinc-400">XP</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
            Rige tu Nivel {profile.currentLevel} (nunca baja)
          </span>
        </div>

        {/* Total Canjes Realizados */}
        <div className="bg-[#1e1e1e] border border-emerald-950/60 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Canjes Realizados
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {totalRedemptionsCount}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
            {totalXpSpent} XP disfrutados en total
          </span>
        </div>

        {/* Recompensas Activas en Catálogo */}
        <div className="bg-[#1e1e1e] border border-purple-900/40 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Recompensas Creadas
            </span>
            <Gift className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono mt-1">
            {personalRewards.length}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
            Tus metas de disfrute personal
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              activeTab === 'catalogo'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-950/50'
                : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Catálogo ({personalRewards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              activeTab === 'historial'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-950/50'
                : 'text-zinc-400 hover:text-white bg-[#1a1a1a]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial de Canjes ({rewardRedemptions.length})</span>
          </button>
        </div>

        {activeTab === 'catalogo' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#141414] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
          >
            <option value="todas">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 4. Tab: Catálogo de Recompensas */}
      {activeTab === 'catalogo' && (
        <>
          {filteredRewards.length === 0 ? (
            <div className="bg-[#1e1e1e] border border-dashed border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
              <Gift className="w-12 h-12 text-amber-500/40 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono">
                No hay recompensas en esta categoría
              </h3>
              <p className="text-xs text-zinc-400">
                Define premios que te motiven: un café especial, una tarde de videojuegos, un libro o una salida con tu pareja.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs font-mono uppercase"
              >
                + Crear Mi Primera Recompensa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRewards.map((reward) => {
                const IconComponent = REWARD_ICONS[reward.icon || 'Gift'] || Gift;
                const canAfford = availableXp >= reward.costXp;
                const missingXp = reward.costXp - availableXp;

                return (
                  <div
                    key={reward.id}
                    className={`bg-[#1e1e1e] border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all space-y-4 hover:border-amber-500/50 ${
                      canAfford ? 'border-zinc-800' : 'border-zinc-900 opacity-90'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top icon and category row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 font-mono block">
                              {reward.category}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Canjeado: {reward.timesRedeemed || 0} {reward.timesRedeemed === 1 ? 'vez' : 'veces'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(reward)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Editar recompensa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(reward.id, reward.title)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Eliminar recompensa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-black text-white font-mono leading-tight">
                          {reward.title}
                        </h3>
                        {reward.description && (
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {reward.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Cost & Redeem Button */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                          Costo Requerido
                        </span>
                        <div className="font-mono font-black text-base text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          {reward.costXp} XP
                        </div>
                      </div>

                      <button
                        onClick={() => setConfirmRedemptionReward(reward)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-black font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-black shadow-lg shadow-amber-950/50'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Canjear</span>
                          </>
                        ) : (
                          <span>Faltan {missingXp} XP</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 5. Tab: Historial de Canjes */}
      {activeTab === 'historial' && (
        <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Registro Histórico de Canjes
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historial auditado de todas las recompensas canjeadas con XP disponible.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-xl">
              Total canjeado: {totalXpSpent} XP
            </span>
          </div>

          {rewardRedemptions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <Gift className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-mono">Aún no has canjeado ninguna recompensa personal.</p>
              <p className="text-xs text-zinc-400">
                Acumula XP completando acciones, objetivos y hábitos para canjear tus premios favoritos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {rewardRedemptions.map((red) => (
                <div key={red.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono leading-tight">
                        {red.rewardTitle}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Canjeado el {formatDateSpanish(red.redeemedAt.substring(0, 10))}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-amber-400 block">
                      −{red.costXp} XP disponible
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Nivel Saiyajin intacto
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Modal Crear / Editar Recompensa */}
      <RewardModal
        isOpen={isModalOpen}
        editingReward={editingReward}
        rewardTitle={rewardTitle}
        setRewardTitle={setRewardTitle}
        rewardDesc={rewardDesc}
        setRewardDesc={setRewardDesc}
        rewardCategory={rewardCategory}
        setRewardCategory={setRewardCategory}
        rewardCost={rewardCost}
        setRewardCost={setRewardCost}
        rewardIcon={rewardIcon}
        setRewardIcon={setRewardIcon}
        categories={CATEGORIES}
        rewardIcons={REWARD_ICONS}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveReward}
      />

      {/* 7. Confirmation Modal for Redemption */}
      {confirmRedemptionReward && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#1e1e1e] border border-amber-500/50 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Gift className="w-7 h-7 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                Confirmación de Canje
              </span>
              <h3 className="text-lg font-black text-white font-mono mt-0.5">
                ¿Deseas canjear esta recompensa?
              </h3>
              <p className="text-xs text-zinc-300 mt-2 font-mono font-bold bg-[#141414] p-3 rounded-2xl border border-zinc-800">
                "{confirmRedemptionReward.title}"
              </p>
            </div>

            <div className="bg-[#181818] p-3 rounded-2xl border border-zinc-800 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Costo de canje:</span>
                <strong className="text-amber-400 font-black">−{confirmRedemptionReward.costXp} XP</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tu XP Disponible actual:</span>
                <strong className="text-white">{availableXp} XP</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>XP Disponible tras canje:</span>
                <strong className="text-emerald-400">{availableXp - confirmRedemptionReward.costXp} XP</strong>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tu Nivel {profile.currentLevel} no bajará.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmRedemptionReward(null)}
                className="flex-1 py-2.5 rounded-xl text-zinc-400 hover:text-white bg-[#252525] font-mono font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-amber-950/60"
              >
                Sí, Canjear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
