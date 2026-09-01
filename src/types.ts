export type AppointmentStatus = 'Agendado' | 'Confirmado' | 'Em Atendimento' | 'Realizado' | 'Cancelado';

export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Convênio' | 'Boleto';

export type TransactionType = 'Receita' | 'Despesa';

export type ExpenseCategory = 
  | 'Aluguel & Condomínio'
  | 'Honorários Médicos'
  | 'Salários & Encargos'
  | 'Insumos & Medicamentos'
  | 'Equipamentos & Manutenção'
  | 'Marketing & Software'
  | 'Impostos & Taxas'
  | 'Limpeza & Descartáveis'
  | 'Outros';

export type ProcedureCategory = 
  | 'Consultas'
  | 'Exames'
  | 'Pequenas Cirurgias'
  | 'Procedimentos Estéticos'
  | 'Terapias & Reabilitação'
  | 'Outros';

export interface UserProfile {
  id: string;
  name: string;
  role: 'Médico' | 'Recepcionista' | 'Administrador' | 'Administração' | 'Gestor Financeiro';
  crm?: string;
  avatarColor: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  insurance?: string;
  notes?: string;
  createdAt: string;
}

export interface Procedure {
  id: string;
  code: string;
  name: string;
  category: ProcedureCategory;
  price: number;
  durationMinutes: number;
  description?: string;
  doctorInCharge?: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorId?: string;
  procedureId: string;
  procedureName: string;
  procedurePrice: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  financialEntryId?: string; // linked financial entry if paid
  isPaid?: boolean;
  paymentMethod?: PaymentMethod;
  createdBy: string;
  updatedAt: string;
}

export interface FinancialEntry {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: 'Pago' | 'Pendente';
  appointmentId?: string;
  patientName?: string;
  doctorName?: string;
  recipientOrSupplier?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}
