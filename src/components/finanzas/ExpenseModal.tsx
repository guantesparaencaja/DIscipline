import React, { useState } from 'react';
import { useSayayinStore } from '../../store/useSayayinStore';
import { X, DollarSign, Tag, Calendar, CreditCard, PiggyBank } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      alert('Ingresa un monto válido mayor a 0 COP');
      return;
    }
    if (!description.trim()) {
      alert('Ingresa una descripción del gasto');
      return;
    }

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#252525] hover:bg-[#303030] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Registro de Movimiento
          </span>
          <h3 className="text-xl font-black text-white font-mono flex items-center gap-2 mt-0.5">
            {isSaving ? 'Apartar Ahorro para Meta' : 'Registrar Gasto Real'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#FF6600] hover:bg-orange-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 mt-2"
          >
            Guardar Movimiento
          </button>
        </form>
      </div>
    </div>
  );
};
