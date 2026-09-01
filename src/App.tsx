import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { AppointmentsModule } from './components/appointments/AppointmentsModule';
import { ProceduresModule } from './components/procedures/ProceduresModule';
import { FinancialModule } from './components/financial/FinancialModule';
import { PatientsModule } from './components/patients/PatientsModule';
import { AuditLogsModule } from './components/logs/AuditLogsModule';
import { CloudArchitectureModal } from './components/cloud/CloudArchitectureModal';
import { ReceiptModal } from './components/receipts/ReceiptModal';
import { StorageService } from './services/storageService';
import { 
  Appointment, 
  Procedure, 
  FinancialEntry, 
  Patient, 
  UserProfile, 
  AuditLog, 
  PaymentMethod 
} from './types';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('appointments');
  const [activeUser, setActiveUser] = useState<UserProfile>(StorageService.getActiveUser());
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [appointments, setAppointments] = useState<Appointment[]>(StorageService.getAppointments());
  const [procedures, setProcedures] = useState<Procedure[]>(StorageService.getProcedures());
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(StorageService.getFinancialEntries());
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients());
  const [logs, setLogs] = useState<AuditLog[]>(StorageService.getLogs());

  // Modals
  const [isCloudGuideOpen, setIsCloudGuideOpen] = useState(false);
  const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState<Appointment | null>(null);

  // Sync listener across tabs/windows
  useEffect(() => {
    const unsubscribe = StorageService.onSync(() => {
      setAppointments(StorageService.getAppointments());
      setProcedures(StorageService.getProcedures());
      setFinancialEntries(StorageService.getFinancialEntries());
      setPatients(StorageService.getPatients());
      setLogs(StorageService.getLogs());
    });
    return () => unsubscribe();
  }, []);

  const reloadData = () => {
    setAppointments(StorageService.getAppointments());
    setProcedures(StorageService.getProcedures());
    setFinancialEntries(StorageService.getFinancialEntries());
    setPatients(StorageService.getPatients());
    setLogs(StorageService.getLogs());
    setActiveUser(StorageService.getActiveUser());
  };

  // --- APPOINTMENTS HANDLERS ---
  const handleAddAppointment = (newApt: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `apt_${Date.now()}`;
    const fullApt: Appointment = {
      ...newApt,
      id,
      updatedAt: new Date().toISOString(),
    };
    const updated = [fullApt, ...appointments];
    setAppointments(updated);
    StorageService.saveAppointments(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Novo Agendamento',
      `Agendou ${fullApt.procedureName} para ${fullApt.patientName} em ${fullApt.date} às ${fullApt.time}`
    );
    setLogs(StorageService.getLogs());
  };

  const handleUpdateAppointment = (updatedApt: Appointment) => {
    const updated = appointments.map((a) => (a.id === updatedApt.id ? updatedApt : a));
    setAppointments(updated);
    StorageService.saveAppointments(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Agendamento Atualizado',
      `Alterou consulta de ${updatedApt.patientName} (Status: ${updatedApt.status})`
    );
    setLogs(StorageService.getLogs());
  };

  const handleDeleteAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    StorageService.saveAppointments(updated);
    if (apt) {
      StorageService.addLog(
        activeUser.name,
        activeUser.role,
        'Agendamento Cancelado',
        `Excluiu agendamento de ${apt.patientName} (${apt.procedureName})`
      );
      setLogs(StorageService.getLogs());
    }
  };

  // Quick complete & bill (1-Click automation!)
  const handleQuickCompleteAndBill = (apt: Appointment, paymentMethod: PaymentMethod) => {
    const finId = `fin_${Date.now()}`;
    
    // 1. Create Financial Entry
    const newFinEntry: FinancialEntry = {
      id: finId,
      type: 'Receita',
      description: `${apt.procedureName} - ${apt.patientName}`,
      amount: apt.procedurePrice,
      category: 'Consultas',
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'Pago',
      appointmentId: apt.id,
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      createdBy: activeUser.name,
      createdAt: new Date().toISOString(),
    };

    const updatedFin = [newFinEntry, ...financialEntries];
    setFinancialEntries(updatedFin);
    StorageService.saveFinancialEntries(updatedFin);

    // 2. Update Appointment to 'Realizado'
    const updatedApt: Appointment = {
      ...apt,
      status: 'Realizado',
      isPaid: true,
      paymentMethod,
      financialEntryId: finId,
      updatedAt: new Date().toISOString(),
    };

    const updatedAppts = appointments.map((a) => (a.id === apt.id ? updatedApt : a));
    setAppointments(updatedAppts);
    StorageService.saveAppointments(updatedAppts);

    // 3. Log
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Atendimento Faturado',
      `Finalizou e recebeu R$ ${apt.procedurePrice.toFixed(2)} via ${paymentMethod} de ${apt.patientName}`
    );
    setLogs(StorageService.getLogs());

    // Trigger confetti celebration for completed billing
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  };

  // --- PROCEDURES HANDLERS ---
  const handleAddProcedure = (newProc: Omit<Procedure, 'id'>) => {
    const id = `proc_${Date.now()}`;
    const fullProc: Procedure = { ...newProc, id };
    const updated = [...procedures, fullProc];
    setProcedures(updated);
    StorageService.saveProcedures(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Procedimento Cadastrado',
      `Adicionou "${fullProc.name}" na tabela de preços (R$ ${fullProc.price.toFixed(2)})`
    );
    setLogs(StorageService.getLogs());
  };

  const handleUpdateProcedure = (updatedProc: Procedure) => {
    const updated = procedures.map((p) => (p.id === updatedProc.id ? updatedProc : p));
    setProcedures(updated);
    StorageService.saveProcedures(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Tabela de Preços Alterada',
      `Atualizou valor/dados de "${updatedProc.name}" (R$ ${updatedProc.price.toFixed(2)})`
    );
    setLogs(StorageService.getLogs());
  };

  const handleDeleteProcedure = (id: string) => {
    const proc = procedures.find((p) => p.id === id);
    const updated = procedures.filter((p) => p.id !== id);
    setProcedures(updated);
    StorageService.saveProcedures(updated);
    if (proc) {
      StorageService.addLog(
        activeUser.name,
        activeUser.role,
        'Procedimento Removido',
        `Removeu "${proc.name}" da tabela de valores`
      );
      setLogs(StorageService.getLogs());
    }
  };

  // --- FINANCIAL HANDLERS ---
  const handleAddFinancialEntry = (newEntry: Omit<FinancialEntry, 'id' | 'createdAt'>) => {
    const id = `fin_${Date.now()}`;
    const fullEntry: FinancialEntry = {
      ...newEntry,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [fullEntry, ...financialEntries];
    setFinancialEntries(updated);
    StorageService.saveFinancialEntries(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      newEntry.type === 'Receita' ? 'Receita Lançada' : 'Despesa Registrada',
      `${newEntry.description} - R$ ${newEntry.amount.toFixed(2)} (${newEntry.status})`
    );
    setLogs(StorageService.getLogs());
  };

  const handleUpdateFinancialEntry = (updatedEntry: FinancialEntry) => {
    const updated = financialEntries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e));
    setFinancialEntries(updated);
    StorageService.saveFinancialEntries(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Lançamento Editado',
      `Atualizou ${updatedEntry.type}: ${updatedEntry.description}`
    );
    setLogs(StorageService.getLogs());
  };

  const handleDeleteFinancialEntry = (id: string) => {
    const entry = financialEntries.find((e) => e.id === id);
    const updated = financialEntries.filter((e) => e.id !== id);
    setFinancialEntries(updated);
    StorageService.saveFinancialEntries(updated);
    if (entry) {
      StorageService.addLog(
        activeUser.name,
        activeUser.role,
        'Lançamento Excluído',
        `Removeu ${entry.type}: ${entry.description} (R$ ${entry.amount.toFixed(2)})`
      );
      setLogs(StorageService.getLogs());
    }
  };

  // --- PATIENT HANDLERS ---
  const handleAddPatient = (newPat: Omit<Patient, 'id' | 'createdAt'>) => {
    const id = `pat_${Date.now()}`;
    const fullPat: Patient = {
      ...newPat,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [fullPat, ...patients];
    setPatients(updated);
    StorageService.savePatients(updated);
    StorageService.addLog(
      activeUser.name,
      activeUser.role,
      'Paciente Cadastrado',
      `Cadastrou ficha de ${fullPat.name} (${fullPat.insurance || 'Particular'})`
    );
    setLogs(StorageService.getLogs());
  };

  // Counts for sidebar badges
  const todayStr = new Date().toISOString().split('T')[0];
  const appointmentsCountToday = appointments.filter((a) => a.date === todayStr).length;
  const pendingReceivablesCount = financialEntries.filter((f) => f.status === 'Pendente').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        activeUser={activeUser}
        onSelectUser={(user) => {
          setActiveUser(user);
          StorageService.setActiveUser(user);
        }}
        onOpenNewAppointment={() => {
          setCurrentTab('appointments');
        }}
        onOpenNewFinancial={() => {
          setCurrentTab('financial');
        }}
        onOpenCloudGuide={() => setIsCloudGuideOpen(true)}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab === 'cloud') {
              setIsCloudGuideOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          appointmentsCountToday={appointmentsCountToday}
          totalProceduresCount={procedures.length}
          pendingReceivablesCount={pendingReceivablesCount}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 min-w-0">
          {currentTab === 'appointments' && (
            <AppointmentsModule
              appointments={appointments}
              procedures={procedures}
              patients={patients}
              activeUser={activeUser}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onQuickCompleteAndBill={handleQuickCompleteAndBill}
              onPrintReceipt={(apt) => setSelectedReceiptAppointment(apt)}
              globalSearch={globalSearch}
            />
          )}

          {currentTab === 'procedures' && (
            <ProceduresModule
              procedures={procedures}
              activeUser={activeUser}
              onAddProcedure={handleAddProcedure}
              onUpdateProcedure={handleUpdateProcedure}
              onDeleteProcedure={handleDeleteProcedure}
            />
          )}

          {currentTab === 'financial' && (
            <FinancialModule
              entries={financialEntries}
              procedures={procedures}
              activeUser={activeUser}
              onAddEntry={handleAddFinancialEntry}
              onUpdateEntry={handleUpdateFinancialEntry}
              onDeleteEntry={handleDeleteFinancialEntry}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsModule
              patients={patients}
              appointments={appointments}
              procedures={procedures}
              onAddPatient={handleAddPatient}
              globalSearch={globalSearch}
            />
          )}

          {currentTab === 'logs' && (
            <AuditLogsModule logs={logs} />
          )}
        </main>

      </div>

      {/* Cloud Architecture & Multi-User Modal */}
      <CloudArchitectureModal
        isOpen={isCloudGuideOpen}
        onClose={() => setIsCloudGuideOpen(false)}
        onDatabaseReload={reloadData}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        appointment={selectedReceiptAppointment}
        onClose={() => setSelectedReceiptAppointment(null)}
      />
    </div>
  );
}
