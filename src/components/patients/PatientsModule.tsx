import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  FileText, 
  Clock, 
  X,
  Stethoscope
} from 'lucide-react';
import { Patient, Appointment, Procedure } from '../../types';
import { formatDateBR, formatCurrency, createWhatsAppMessageLink } from '../../utils/formatters';

interface PatientsModuleProps {
  patients: Patient[];
  appointments: Appointment[];
  procedures: Procedure[];
  onAddPatient: (pat: Omit<Patient, 'id' | 'createdAt'>) => void;
  onSelectPatientForAppointment?: (patient: Patient) => void;
  globalSearch: string;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  patients,
  appointments,
  procedures,
  onAddPatient,
  onSelectPatientForAppointment,
  globalSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    cpf: string;
    birthDate: string;
    insurance: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    birthDate: '',
    insurance: 'Particular',
    notes: '',
  });

  const effectiveSearch = searchTerm || globalSearch;

  const filteredPatients = patients.filter((p) => {
    return (
      p.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      p.phone.includes(effectiveSearch) ||
      (p.email && p.email.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      (p.cpf && p.cpf.includes(effectiveSearch)) ||
      (p.insurance && p.insurance.toLowerCase().includes(effectiveSearch.toLowerCase()))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddPatient({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      cpf: formData.cpf || undefined,
      birthDate: formData.birthDate || undefined,
      insurance: formData.insurance || 'Particular',
      notes: formData.notes || undefined,
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      cpf: '',
      birthDate: '',
      insurance: 'Particular',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Cadastro de Pacientes & Histórico Clínico
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie fichas de pacientes, convênios e histórico de atendimentos na AMIS
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Paciente</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, CPF ou convênio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <strong className="text-slate-800 font-bold">{patients.length}</strong> pacientes cadastrados
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          const patientAppts = appointments.filter(
            (a) => a.patientId === patient.id || a.patientName.toLowerCase() === patient.name.toLowerCase()
          );
          const totalSpent = patientAppts
            .filter((a) => a.status === 'Realizado')
            .reduce((acc, a) => acc + (a.procedurePrice || 0), 0);

          return (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm font-display">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {patient.insurance || 'Particular'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100 mt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.cpf && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span>CPF: {patient.cpf}</span>
                    </div>
                  )}
                </div>

                {patient.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 italic">
                    {patient.notes}
                  </p>
                )}
              </div>

              {/* Patient Footer: Appts count and summary */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Consultas:</span>
                  <span className="font-bold text-slate-800">{patientAppts.length} registro(s)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Total Investido:</span>
                  <span className="font-bold text-emerald-700 font-display">{formatCurrency(totalSpent)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Patient */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    Cadastrar Novo Paciente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ficha cadastral para atendimento na clínica AMIS
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Beatriz Vasconcelos"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="paciente@email.com"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Convênio / Plano de Saúde
                  </label>
                  <input
                    type="text"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    placeholder="Particular, Unimed, Bradesco..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações / Histórico de Alergias
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Alergias medicamentosas, restrições ou preferências..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
