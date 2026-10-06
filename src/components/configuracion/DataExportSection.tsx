import React from 'react';
import { Download, FileText, FileSpreadsheet, Terminal, Copy, Check, Trash2 } from 'lucide-react';
import { Expense } from '../../types';
import { errorLogger, SystemErrorEntry } from '../../lib/errorLogger';

interface DataExportSectionProps {
  expenses: Expense[];
  errorLogs: SystemErrorEntry[];
  copiedLog: boolean;
  onExportJSON: () => void;
  onExportExpensesCSV: () => void;
  onCopyLogs: () => void;
  onClearLogs: () => void;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({
  expenses,
  errorLogs,
  copiedLog,
  onExportJSON,
  onExportExpensesCSV,
  onCopyLogs,
  onClearLogs
}) => {
  return (
    <div className="bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
            Soberanía de Datos & Exportación
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Descarga tu historial financiero, metas, disciplinas y hábitos para tu propia custodia o contabilidad.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Export JSON */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800/80 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <span className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <FileText className="w-4 h-4 text-[#FF6600]" />
              Copia Completa (JSON)
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Incluye perfil, Ki, nivel, objetivos diarios, metas, finanzas, deducciones fijas, hábitos y miedos.
            </p>
          </div>
          <button
            onClick={onExportJSON}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-zinc-700/60 font-mono"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6600]" />
            Descargar JSON
          </button>
        </div>

        {/* Export Expenses CSV */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-zinc-800/80 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <span className="flex items-center gap-2 text-xs font-bold text-white font-mono">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Historial de Gastos (CSV)
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Compatible con Excel y Google Sheets. Contiene fecha, concepto, monto COP, categoría y método de pago ({expenses.length} registros).
            </p>
          </div>
          <button
            onClick={onExportExpensesCSV}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-zinc-700/60 font-mono"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Diagnóstico y Registro de Errores */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
              Registro de Errores del Sistema ({errorLogs.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCopyLogs}
              className="text-[11px] text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center gap-1 font-mono transition-colors"
            >
              {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedLog ? 'Copiado' : 'Copiar'}
            </button>
            {errorLogs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-[11px] text-zinc-400 hover:text-rose-400 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center gap-1 font-mono transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {errorLogs.length > 0 ? (
          <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800/90 max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px]">
            {errorLogs.map((log) => (
              <div key={log.id} className="text-zinc-400 pb-1 border-b border-zinc-800/50 last:border-0">
                <span className="text-rose-400 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="text-zinc-200">{log.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800/90 text-center font-mono text-xs text-zinc-500">
            Radar operando al 100% de Ki · Cero anomalías registradas.
          </div>
        )}
      </div>
    </div>
  );
};
