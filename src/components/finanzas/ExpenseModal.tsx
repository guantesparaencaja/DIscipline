import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { X, DollarSign, Tag, Calendar, CreditCard, PiggyBank, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { formatCOP, getTodayDateString } from '../../lib/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { categories, goals, addExpense } = useSayayinStore();

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_alimentacion');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta_debito');
  const [isSaving, setIsSaving] = useState(false);
  const [goalId, setGoalId] = useState(goals[0]?.id || '');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0 COP');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Ingresa una descripción del gasto');
      return;
    }
    setErrorMsg(null);

    const selectedCategory = categories.find((c) => c.id === categoryId);

    addExpense({
      description: description.trim(),
      amount,
      categoryId,
      categoryName: selectedCategory ? selectedCategory.name : 'Varios',
      date,
      paymentMethod,
      isSaving,
      goalId: isSaving ? goalId : undefined,
      note: note.trim() || undefined
    });

    // Reset and close
    setDescription('');
    setAmountStr('');
    setIsSaving(false);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setAmountStr('');
      return;
    }
    setAmountStr(rawVal);
  };

  const formattedPreview = amountStr ? formatCOP(Number(amountStr)) : '$0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border-t sm:border border-[#333] rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90dvh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          aria-label="Cerrar modal de gasto"
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#FF6600]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 shrink-0">
          <span className="text-xs font-bold text-[#FF6600] uppercase tracking-widest font-mono">
            Registro de Movimiento
          </span>
          <h3 className="text-xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            {isSaving ? 'Apartar Ahorro para Meta' : 'Registrar Gasto Real'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Monto (COP) */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">
              Monto en Pesos Colombianos (COP) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="Ej: 50000"
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-3 text-white font-mono text-base focus:outline-none focus:border-[#FF6600]"
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-zinc-400 font-mono">
                {formattedPreview}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-zinc-300 font-bold mb-1">Descripción del movimiento *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Almuerzo de trabajo, Mercado semanal, Cuota fondo..."
              className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Toggle Es Ahorro para Meta */}
          <div className="p-3 bg-[#161616] rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[#FF6600]" />
              <div>
                <span className="font-bold text-white block">¿Es un ahorro para una meta?</span>
                <span className="text-[10px] text-zinc-400">
                  Suma al progreso de tu meta y eleva tu Poder Financiero
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isSaving}
              onChange={(e) => setIsSaving(e.target.checked)}
              className="w-4 h-4 accent-[#FF6600] rounded cursor-pointer"
            />
          </div>

          {/* Selector de Meta si es ahorro */}
          {isSaving && (
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Vincular a Meta de Ahorro *</label>
              {goals.length === 0 ? (
                <p className="text-zinc-400 italic">No tienes metas creadas aún. Crea una primero en el módulo de Metas.</p>
              ) : (
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({formatCOP(g.currentSavings)} / {formatCOP(g.targetAmount)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Categoría & Método de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta_debito">Tarjeta Débito</option>
                <option value="tarjeta_credito">Tarjeta Crédito</option>
                <option value="transferencia">Transferencia (Nequi/Daviplata/Bancolombia)</option>
              </select>
            </div>
          </div>

          {/* Fecha y Nota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-bold mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold mb-1">Nota adicional</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opcional..."
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Buttons */}
        <div className="sticky bottom-0 bg-[#1e1e1e] pt-3 pb-1 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-[#252525] font-bold text-xs min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 min-h-[44px] font-mono text-xs focus-visible:ring-2 focus-visible:ring-[#FF6600]"
          >
            Guardar Movimiento
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};
