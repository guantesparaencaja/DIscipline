import React from 'react';
import { Calendar } from 'lucide-react';

interface GoogleWorkspaceSectionProps {
  isWorkspaceLinked: boolean;
  isLinkingGoogle: boolean;
  onToggleGoogle: () => void;
}

export const GoogleWorkspaceSection: React.FC<GoogleWorkspaceSectionProps> = ({
  isWorkspaceLinked,
  isLinkingGoogle,
  onToggleGoogle
}) => {
  return (
    <div className="bg-[#1e1e1e] border border-[#2b2b2b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Google Workspace (Calendar & Tasks)
            </h3>
            <p className="text-xs text-zinc-400">
              Sincroniza tus disciplinas diarias directamente con Google Calendar y Google Tasks.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleGoogle}
          disabled={isLinkingGoogle}
          className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            isWorkspaceLinked
              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 hover:bg-rose-900'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
          }`}
        >
          {isLinkingGoogle
            ? 'Conectando...'
            : isWorkspaceLinked
            ? 'Desconectar Google'
            : 'Iniciar Sesión con Google'}
        </button>
      </div>

      <div className="text-xs text-zinc-400 space-y-1">
        <p>• Los permisos solicitados se usan exclusivamente con tu consentimiento explícito.</p>
        <p>• Cada objetivo que sincronices te solicitará confirmación antes de registrarse en tu cuenta de Google.</p>
      </div>
    </div>
  );
};
