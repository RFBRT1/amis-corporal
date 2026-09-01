/**
 * Formatting utilities for AMIS Medical Management System (BRL, Dates, WhatsApp, Receipts)
 */

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  // handles YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr;
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Realizado':
    case 'Pago':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Agendado':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Confirmado':
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'Em Atendimento':
      return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
    case 'Cancelado':
    case 'Pendente':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

export const createWhatsAppMessageLink = (
  phone: string,
  patientName: string,
  doctorName: string,
  procedureName: string,
  date: string,
  time: string
): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  const text = `Olá, *${patientName}*! 👋\n\nConfirmamos seu agendamento na *Clínica AMIS*:\n\n🩺 *Procedimento:* ${procedureName}\n👨‍⚕️ *Profissional:* ${doctorName}\n📅 *Data:* ${formatDateBR(date)}\n⏰ *Horário:* ${time}\n📍 *Local:* Av. Paulista, 1000 - Cj. 402 - Bela Vista, SP\n\nPor favor, responda com *1* para Confirmar ou *2* para Reagendar. Obrigado! 🏥`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};
