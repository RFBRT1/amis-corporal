import React, { useState } from 'react';
import { 
  HeartPulse, 
  Users, 
  CalendarPlus, 
  PlusCircle, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  Database,
  Search,
  Bell
} from 'lucide-react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface HeaderProps {
  activeUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onOpenNewAppointment: () => void;
  onOpenNewFinancial: () => void;
  onOpenCloudGuide: () => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  onSelectUser,
  onOpenNewAppointment,
  onOpenNewFinancial,
  onOpenCloudGuide,
  globalSearch,
  onGlobalSearchChange,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                AMIS
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Clínica Médica
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestão Clínica, Agendamentos & Finanças
            </p>
          </div>
        </div>

        {/* Center: Search & Date */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente, procedimento ou consulta..."
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions, Cloud Sync & User Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloud & Multi-User Architecture Button */}
          <button
            onClick={onOpenCloudGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            title="Ver status de persistência e arquitetura multi-usuário (Firebase/Node.js)"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Conexão Nuvem / Multi-usuário</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Quick Action: New Appointment */}
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </button>

          {/* User Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${activeUser.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  {activeUser.name}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {activeUser.role} {activeUser.crm ? `• ${activeUser.crm}` : ''}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu for testing Multi-user persona switching */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Alternar Colaborador (Multi-Usuário)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Ao vivo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Selecione para simular o acesso de médicos, recepção ou financeiro:
                  </p>
                </div>

                <div className="py-1">
                  {INITIAL_USERS.map((user) => {
                    const isSelected = user.id === activeUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-emerald-50/70 border-l-2 border-emerald-500' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${user.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.role} {user.crm ? `(${user.crm})` : ''}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-bold text-emerald-600">Ativo</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-3 pb-1 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Audit Trail ativo</span>
                  <span className="text-slate-600 font-medium">AMIS v1.0</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
