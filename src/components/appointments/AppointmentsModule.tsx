import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Calendar as CalendarIcon,
  Phone,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Share2
} from 'lucide-react';
import { 
  Appointment, 
  AppointmentStatus, 
  Procedure, 
  Patient, 
  UserProfile, 
  PaymentMethod 
} from '../../types';
import { 
  formatCurrency, 
  formatDateBR, 
  getStatusBadgeClass, 
  createWhatsAppMessageLink 
} from '../../utils/formatters';

interface AppointmentsModuleProps {
  appointments: Appointment[];
  procedures: Procedure[];
  patients: Patient[];
  activeUser: UserProfile;
  onAddAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAppointment: (apt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onQuickCompleteAndBill: (apt: Appointment, paymentMethod: PaymentMethod) => void;
  onPrintReceipt: (apt: Appointment) => void;
  globalSearch: string;
}

type ViewMode = 'daily' | 'weekly' | 'list';

const STATUS_LIST: ('Todos' | AppointmentStatus)[] = [
  'Todos',
  'Agendado',
  'Confirmado',
  'Em Atendimento',
  'Realizado',
  'Cancelado',
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({
  appointments,
  procedures,
  patients,
  activeUser,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onQuickCompleteAndBill,
  onPrintReceipt,
  globalSearch,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | AppointmentStatus>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State for New/Edit Appointment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Quick Billing Modal State
  const [billingModalApt, setBillingModalApt] = useState<Appointment | null>(null);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<PaymentMethod>('Pix');

  // Form State
  const [formData, setFormData] = useState<{
    patientName: string;
    patientPhone: string;
    doctorName: string;
    procedureId: string;
    date: string;
    time: string;
    durationMinutes: number;
    status: AppointmentStatus;
    notes: string;
  }>({
    patientName: '',
    patientPhone: '',
    doctorName: 'Dra Isabela Kronka Barboza',
    procedureId: procedures[0]?.id || '',
    date: selectedDate,
    time: '09:00',
    durationMinutes: 30,
    status: 'Agendado',
    notes: '',
  });

  // Filter doctors list from data
  const doctorsList = useMemo(() => {
    const docs = new Set<string>();
    docs.add('Dra Isabela Kronka Barboza');
    docs.add('Dra Aline');
    appointments.forEach((a) => {
      if (a.doctorName) docs.add(a.doctorName);
    });
    return Array.from(docs);
  }, [appointments]);

  // Combined search term
  const effectiveSearch = searchTerm || globalSearch;

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchDoctor = selectedDoctor === 'Todos' || apt.doctorName === selectedDoctor;
      const matchStatus = selectedStatus === 'Todos' || apt.status === selectedStatus;
      
      let matchDate = true;
      if (viewMode === 'daily') {
        matchDate = apt.date === selectedDate;
      }

      const matchSearch = 
        apt.patientName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        apt.procedureName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        apt.patientPhone.includes(effectiveSearch) ||
        (apt.notes && apt.notes.toLowerCase().includes(effectiveSearch.toLowerCase()));

      return matchDoctor && matchStatus && matchDate && matchSearch;
    });
  }, [appointments, selectedDoctor, selectedStatus, selectedDate, viewMode, effectiveSearch]);

  // Stats for today
  const todayStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayList = appointments.filter((a) => a.date === todayStr);
    const total = todayList.length;
    const realizados = todayList.filter((a) => a.status === 'Realizado').length;
    const agendados = todayList.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado').length;
    const emAtendimento = todayList.filter((a) => a.status === 'Em Atendimento').length;
    const totalRevenueToday = todayList
      .filter((a) => a.status === 'Realizado')
      .reduce((acc, a) => acc + (a.procedurePrice || 0), 0);

    return { total, realizados, agendados, emAtendimento, totalRevenueToday };
  }, [appointments]);

  // Handle opening New Appointment Modal
  const handleOpenNewModal = (presetTime?: string) => {
    const defaultProc = procedures[0] || { id: '', name: '', price: 200, durationMinutes: 30 };
    setEditingAppointment(null);
    setFormData({
      patientName: '',
      patientPhone: '',
      doctorName: selectedDoctor !== 'Todos' ? selectedDoctor : (activeUser.role === 'Médico' ? activeUser.name : 'Dra Isabela Kronka Barboza'),
      procedureId: defaultProc.id,
      date: selectedDate,
      time: presetTime || '09:00',
      durationMinutes: defaultProc.durationMinutes || 30,
      status: 'Agendado',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Handle opening Edit Appointment Modal
  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      doctorName: apt.doctorName,
      procedureId: apt.procedureId,
      date: apt.date,
      time: apt.time,
      durationMinutes: apt.durationMinutes,
      status: apt.status,
      notes: apt.notes || '',
    });
    setIsModalOpen(true);
  };

  // When procedure dropdown changes, auto update duration and default doctor if available
  const handleProcedureChange = (procId: string) => {
    const proc = procedures.find((p) => p.id === procId);
    if (proc) {
      setFormData((prev) => ({
        ...prev,
        procedureId: procId,
        durationMinutes: proc.durationMinutes || 30,
        doctorName: proc.doctorInCharge && proc.doctorInCharge !== 'Geral' ? proc.doctorInCharge : prev.doctorName,
      }));
    } else {
      setFormData((prev) => ({ ...prev, procedureId: procId }));
    }
  };

  // Submit appointment form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) return;

    const proc = procedures.find((p) => p.id === formData.procedureId);
    const procName = proc ? proc.name : 'Consulta Médica';
    const procPrice = proc ? proc.price : 250;

    if (editingAppointment) {
      onUpdateAppointment({
        ...editingAppointment,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        doctorName: formData.doctorName,
        procedureId: formData.procedureId,
        procedureName: procName,
        procedurePrice: procPrice,
        date: formData.date,
        time: formData.time,
        durationMinutes: formData.durationMinutes,
        status: formData.status,
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddAppointment({
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        doctorName: formData.doctorName,
        procedureId: formData.procedureId,
        procedureName: procName,
        procedurePrice: procPrice,
        date: formData.date,
        time: formData.time,
        durationMinutes: formData.durationMinutes,
        status: formData.status,
        notes: formData.notes,
        createdBy: activeUser.name,
      });
    }

    setIsModalOpen(false);
  };

  // Change date by offset
  const handleDateShift = (days: number) => {
    const curr = new Date(selectedDate + 'T12:00:00');
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Módulo de Agendamentos & Agenda Clínica
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Multi-usuário
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controle de consultas, procedimentos, envio de WhatsApp e faturamento em 1 clique
            </p>
          </div>
        </div>

        {/* View Mode & New Appointment */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda do Dia
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista Completa
            </button>
          </div>

          <button
            onClick={() => handleOpenNewModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </div>

      {/* Daily Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Consultas de Hoje</span>
          <p className="text-2xl font-bold text-slate-800 mt-1 font-display">{todayStats.total}</p>
          <span className="text-[11px] text-slate-400">Na grade da clínica</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Realizadas Hoje</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 font-display">{todayStats.realizados}</p>
          <span className="text-[11px] text-emerald-600">Atendimentos concluídos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Aguardando / Em Andamento</span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-display">
            {todayStats.agendados + todayStats.emAtendimento}
          </p>
          <span className="text-[11px] text-amber-600">Pacientes previstos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Faturamento Realizado Hoje</span>
          <p className="text-xl font-bold text-teal-700 mt-1 font-display">
            {formatCurrency(todayStats.totalRevenueToday)}
          </p>
          <span className="text-[11px] text-slate-400">Total faturado no dia</span>
        </div>
      </div>

      {/* Date Bar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Navigation Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Date Selector with Next / Prev */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400 border-l border-slate-200 pl-2 hidden sm:inline">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
            </div>

            <button
              onClick={() => handleDateShift(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* Filters: Doctor, Status and Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Doctor Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Todos">Todos os Médicos</option>
                {doctorsList.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente / fone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

        </div>

        {/* Status Pill Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {STATUS_LIST.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Main View: Timeline or List */}
      {viewMode === 'daily' ? (
        /* Daily Hourly Timeline Layout */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Grade de Horários - {formatDateBR(selectedDate)}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredAppointments.length} agendamento(s) neste dia
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {TIME_SLOTS.map((slot) => {
              const slotAppointments = filteredAppointments.filter((a) => a.time === slot);
              const hasAppts = slotAppointments.length > 0;

              return (
                <div 
                  key={slot} 
                  className={`flex flex-col sm:flex-row items-start p-3 sm:p-4 hover:bg-slate-50/50 transition-colors group ${
                    hasAppts ? 'bg-emerald-50/10' : ''
                  }`}
                >
                  {/* Time Label */}
                  <div className="w-20 shrink-0 font-mono font-bold text-slate-600 text-sm flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors"></span>
                    {slot}
                  </div>

                  {/* Appointments in this slot or Empty placeholder */}
                  <div className="flex-1 w-full mt-2 sm:mt-0">
                    {hasAppts ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {slotAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
                          >
                            {/* Card Top: Patient & Status */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  {apt.patientName}
                                </h4>
                                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                  <Stethoscope className="w-3.5 h-3.5" />
                                  {apt.procedureName}
                                </p>
                              </div>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>

                            {/* Card Details: Doctor, Time, Phone, Price */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                              <div>
                                <span className="text-slate-400 text-[10px] block">Médico:</span>
                                <span className="font-medium text-slate-800">{apt.doctorName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">Valor do Procedimento:</span>
                                <span className="font-bold text-emerald-700 font-display">
                                  {formatCurrency(apt.procedurePrice)}
                                </span>
                              </div>
                            </div>

                            {apt.notes && (
                              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                                "{apt.notes}"
                              </p>
                            )}

                            {/* Card Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                              
                              {/* Left actions: WhatsApp & Print */}
                              <div className="flex items-center gap-1">
                                {apt.patientPhone && (
                                  <a
                                    href={createWhatsAppMessageLink(
                                      apt.patientPhone,
                                      apt.patientName,
                                      apt.doctorName,
                                      apt.procedureName,
                                      apt.date,
                                      apt.time
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                                    title="Enviar Lembrete por WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="hidden sm:inline">WhatsApp</span>
                                  </a>
                                )}

                                <button
                                  onClick={() => onPrintReceipt(apt)}
                                  className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                                  title="Imprimir Comprovante de Comparecimento"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="hidden sm:inline">Declaração</span>
                                </button>
                              </div>

                              {/* Right actions: Quick Status & Faturar */}
                              <div className="flex items-center gap-1">
                                {apt.status !== 'Realizado' ? (
                                  <button
                                    onClick={() => setBillingModalApt(apt)}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-all"
                                    title="Finalizar consulta e gerar receita no financeiro"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    <span>Concluir & Faturar</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Faturado
                                  </span>
                                )}

                                <button
                                  onClick={() => handleOpenEditModal(apt)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Deseja cancelar/excluir o agendamento de ${apt.patientName}?`)) {
                                      onDeleteAppointment(apt.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenNewModal(slot)}
                        className="w-full py-2 px-3 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between group/slot"
                      >
                        <span>Horário livre</span>
                        <span className="opacity-0 group-hover/slot:opacity-100 font-semibold text-emerald-600 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Agendar neste horário
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed List Layout */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data & Hora</th>
                  <th className="py-3 px-4">Paciente / Contato</th>
                  <th className="py-3 px-4">Médico</th>
                  <th className="py-3 px-4">Procedimento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-slate-600">Nenhum agendamento encontrado com os filtros atuais.</p>
                      <p className="text-xs text-slate-400">Altere os filtros ou adicione uma nova consulta.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{formatDateBR(apt.date)}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {apt.time} ({apt.durationMinutes} min)
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{apt.patientName}</div>
                        <div className="text-xs text-slate-500">{apt.patientPhone || 'Sem telefone'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                        {apt.doctorName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 text-xs">{apt.procedureName}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-display">
                        {formatCurrency(apt.procedurePrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status !== 'Realizado' && (
                            <button
                              onClick={() => setBillingModalApt(apt)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              title="Concluir e Faturar"
                            >
                              Faturar
                            </button>
                          )}
                          {apt.patientPhone && (
                            <a
                              href={createWhatsAppMessageLink(
                                apt.patientPhone,
                                apt.patientName,
                                apt.doctorName,
                                apt.procedureName,
                                apt.date,
                                apt.time
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => onPrintReceipt(apt)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                            title="Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(apt)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir agendamento de ${apt.patientName}?`)) {
                                onDeleteAppointment(apt.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Appointment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento na Clínica AMIS'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preencha os dados do paciente, procedimento e horário
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Patient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-7777"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Procedure Selector (Linked directly to Procedures Table) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedimento / Serviço (Tabela de Preços) *
                </label>
                <select
                  value={formData.procedureId}
                  onChange={(e) => handleProcedureChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} ({formatCurrency(p.price)})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  O valor e a duração são carregados dinamicamente da Tabela de Procedimentos.
                </p>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Médico / Profissional Responsável *
                </label>
                <select
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {doctorsList.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>

              {/* Date, Time and Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horário *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-2.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Agendamento
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="Agendado">Agendado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Em Atendimento">Em Atendimento</option>
                  <option value="Realizado">Realizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Clínicas / Recepção (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Primeira consulta, paciente com dor no peito, laudo urgente..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                >
                  {editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Billing / Faturar Consulta */}
      {billingModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    Finalizar & Faturar Atendimento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lançamento automático de receita no módulo financeiro
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBillingModalApt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Paciente:</span>
                  <span className="font-bold text-slate-800">{billingModalApt.patientName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Procedimento:</span>
                  <span className="font-semibold text-slate-800">{billingModalApt.procedureName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Médico:</span>
                  <span className="font-medium text-slate-800">{billingModalApt.doctorName}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Valor a Receber:</span>
                  <span className="font-extrabold text-emerald-700 font-display text-base">
                    {formatCurrency(billingModalApt.procedurePrice)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Forma de Pagamento Utilizada:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Convênio', 'Boleto'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setBillingPaymentMethod(method)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        billingPaymentMethod === method
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{method}</span>
                      {billingPaymentMethod === method && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setBillingModalApt(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onQuickCompleteAndBill(billingModalApt, billingPaymentMethod);
                    setBillingModalApt(null);
                  }}
                  className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Recebimento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
