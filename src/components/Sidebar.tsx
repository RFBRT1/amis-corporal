import React from 'react';
import { 
  CalendarDays, 
  FileSpreadsheet, 
  DollarSign, 
  Users2, 
  Activity, 
  CloudCog, 
  HelpCircle,
  Stethoscope,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';

export type NavTab = 'appointments' | 'procedures' | 'financial' | 'patients' | 'cloud' | 'logs';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  appointmentsCountToday: number;
  totalProceduresCount: number;
  pendingReceivablesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  appointmentsCountToday,
  totalProceduresCount,
  pendingReceivablesCount,
}) => {
  const navItems = [
    {
      id: 'appointments' as NavTab,
      label: 'Agendamentos',
      sublabel: 'Agenda e consultas',
      icon: CalendarDays,
      badge: appointmentsCountToday > 0 ? `${appointmentsCountToday} hoje` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'procedures' as NavTab,
      label: 'Tabela de Procedimentos',
      sublabel: 'Valores e catálogo',
      icon: FileSpreadsheet,
      badge: `${totalProceduresCount} itens`,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'financial' as NavTab,
      label: 'Controle Financeiro',
      sublabel: 'Fluxo, entradas & saídas',
      icon: DollarSign,
      badge: pendingReceivablesCount > 0 ? `${pendingReceivablesCount} pendentes` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'patients' as NavTab,
      label: 'Pacientes',
      sublabel: 'Cadastros e histórico',
      icon: Users2,
    },
    {
      id: 'logs' as NavTab,
      label: 'Logs & Auditoria',
      sublabel: 'Atividades multi-usuário',
      icon: Activity,
    },
    {
      id: 'cloud' as NavTab,
      label: 'Arquitetura & Nuvem',
      sublabel: 'Firebase & Multi-usuário',
      icon: CloudCog,
      isSpecial: true,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Módulos do Sistema
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              } ${item.isSpecial && !isActive ? 'border border-dashed border-teal-300 bg-teal-50/50' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.isSpecial ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200'
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {item.label}
                  </p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </p>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                  isActive ? 'bg-white text-emerald-800' : item.badgeColor
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Clinic Status Info Card */}
      <div className="mt-auto p-3 m-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-display">Clínica AMIS</h4>
            <p className="text-[10px] text-slate-400">Unidade Jardins / SP</p>
          </div>
        </div>
        
        <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-700/60">
          <div className="flex justify-between items-center text-slate-300">
            <span>Horário de Funcionamento:</span>
            <span className="font-semibold text-white">08:00 - 19:00</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Sincronização:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Em Tempo Real
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
