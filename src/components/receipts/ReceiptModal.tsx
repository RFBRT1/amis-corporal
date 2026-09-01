import React from 'react';
import { Printer, X, HeartPulse, ShieldCheck, Calendar, User, Stethoscope, CheckCircle2 } from 'lucide-react';
import { Appointment } from '../../types';
import { formatDateBR, formatCurrency } from '../../utils/formatters';

interface ReceiptModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Declaração de Comparecimento / Recibo Clínico
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Documento</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-900 font-sans print:p-10">
          
          {/* Clinic Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                  CLÍNICA AMIS
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Medicina Integrada, Diagnósticos & Procedimentos Especializados
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-800">CNPJ: 45.123.789/0001-90</p>
              <p>Av. Paulista, 1000 - Cj. 402 - SP</p>
              <p>Tel: (11) 3254-8800 • contato@clinicaamis.com.br</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4 decoration-emerald-600">
              Declaração de Comparecimento & Recibo
            </h2>
            <p className="text-xs text-slate-500 mt-1">Código de Registro: AMIS-{appointment.id.toUpperCase()}</p>
          </div>

          {/* Statement Content */}
          <div className="text-sm leading-relaxed text-slate-700 space-y-4">
            <p>
              Declaramos para os devidos fins que o(a) paciente <strong>{appointment.patientName}</strong> compareceu às dependências da <strong>Clínica AMIS</strong> para realização de atendimento médico/procedimento clínico sob supervisão profissional.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Procedimento / Serviço:</span>
                  <strong className="text-slate-900 text-sm">{appointment.procedureName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Profissional Responsável:</span>
                  <strong className="text-slate-900 text-sm">{appointment.doctorName}</strong>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Data:</span>
                  <strong className="text-slate-900">{formatDateBR(appointment.date)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Horário:</span>
                  <strong className="text-slate-900">{appointment.time} ({appointment.durationMinutes} min)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Valor Cobrado:</span>
                  <strong className="text-emerald-700 font-bold">{formatCurrency(appointment.procedurePrice)}</strong>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-0.5">Observações Clínicas:</span>
                <p className="italic">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Location & Date */}
          <div className="text-right text-xs text-slate-600 pt-4">
            São Paulo - SP, {todayStr}.
          </div>

          {/* Signature Line */}
          <div className="pt-10 flex justify-between items-end">
            <div className="text-left text-[11px] text-slate-400">
              <p>Autenticação Digital AMIS</p>
              <p className="font-mono">{appointment.id}-{Date.now()}</p>
            </div>

            <div className="text-center w-64 border-t border-slate-800 pt-2">
              <p className="font-bold text-xs text-slate-900">{appointment.doctorName}</p>
              <p className="text-[11px] text-slate-500">Corpo Clínico • AMIS Medicina</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
