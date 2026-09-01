import React from 'react';
import { Activity, ShieldCheck, User, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsModuleProps {
  logs: AuditLog[];
}

export const AuditLogsModule: React.FC<AuditLogsModuleProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Trilha de Auditoria & Atividades Multi-Usuário
            </h2>
            <p className="text-xs text-slate-500">
              Registro cronológico de todas as ações de médicos, recepcionistas e administradores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Audit Log Ativo</span>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Nenhuma atividade registrada ainda.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id || index}
                className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {log.userName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {log.userName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        {log.userRole}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {log.action}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {log.details}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
