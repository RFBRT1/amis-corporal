import { 
  Appointment, 
  Procedure, 
  FinancialEntry, 
  Patient, 
  UserProfile, 
  AuditLog 
} from '../types';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_PROCEDURES, 
  INITIAL_FINANCIAL_ENTRIES, 
  INITIAL_PATIENTS, 
  INITIAL_USERS, 
  INITIAL_LOGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  APPOINTMENTS: 'amis_clinic_appointments_v2',
  PROCEDURES: 'amis_clinic_procedures_v2',
  FINANCIAL: 'amis_clinic_financial_v2',
  PATIENTS: 'amis_clinic_patients_v2',
  ACTIVE_USER: 'amis_clinic_active_user_v2',
  LOGS: 'amis_clinic_logs_v2',
  FIREBASE_CONFIG: 'amis_clinic_firebase_config_v2',
};

// Create a BroadcastChannel for multi-tab/multi-window synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('amis_clinic_channel');
  }
} catch {
  // BroadcastChannel not available
}

export const StorageService = {
  // --- Appointments ---
  getAppointments: (): Appointment[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },

  saveAppointments: (appointments: Appointment[], triggerSync = true): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      if (triggerSync && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_APPOINTMENTS', payload: appointments });
      }
    } catch (e) {
      console.error('Error saving appointments', e);
    }
  },

  // --- Procedures ---
  getProcedures: (): Procedure[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(INITIAL_PROCEDURES));
      return INITIAL_PROCEDURES;
    } catch {
      return INITIAL_PROCEDURES;
    }
  },

  saveProcedures: (procedures: Procedure[], triggerSync = true): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
      if (triggerSync && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_PROCEDURES', payload: procedures });
      }
    } catch (e) {
      console.error('Error saving procedures', e);
    }
  },

  // --- Financial Entries ---
  getFinancialEntries: (): FinancialEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL_ENTRIES));
      return INITIAL_FINANCIAL_ENTRIES;
    } catch {
      return INITIAL_FINANCIAL_ENTRIES;
    }
  },

  saveFinancialEntries: (entries: FinancialEntry[], triggerSync = true): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(entries));
      if (triggerSync && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_FINANCIAL', payload: entries });
      }
    } catch (e) {
      console.error('Error saving financial entries', e);
    }
  },

  // --- Patients ---
  getPatients: (): Patient[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatients: (patients: Patient[], triggerSync = true): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
      if (triggerSync && broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_PATIENTS', payload: patients });
      }
    } catch (e) {
      console.error('Error saving patients', e);
    }
  },

  // --- Active User ---
  getActiveUser: (): UserProfile => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[2])); // Default to Renata (Reception)
      return INITIAL_USERS[2];
    } catch {
      return INITIAL_USERS[2];
    }
  },

  setActiveUser: (user: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error setting active user', e);
    }
  },

  // --- Logs ---
  getLogs: (): AuditLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (data) return JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog: (userName: string, userRole: string, action: string, details: string): void => {
    try {
      const currentLogs = StorageService.getLogs();
      const now = new Date();
      const timeStr = `Hoje, ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      const newLog: AuditLog = {
        id: `log_${Date.now()}`,
        userName,
        userRole,
        action,
        details,
        timestamp: timeStr,
      };
      const updated = [newLog, ...currentLogs].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'SYNC_LOGS', payload: updated });
      }
    } catch (e) {
      console.error('Error adding log', e);
    }
  },

  // Reset to initial demo database
  resetDatabase: (): void => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(INITIAL_PROCEDURES));
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL_ENTRIES));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'DATABASE_RESET' });
    }
  },

  // Export full backup
  exportDatabase: (): string => {
    const data = {
      appointments: StorageService.getAppointments(),
      procedures: StorageService.getProcedures(),
      financial: StorageService.getFinancialEntries(),
      patients: StorageService.getPatients(),
      logs: StorageService.getLogs(),
      exportedAt: new Date().toISOString(),
      clinic: 'AMIS Clínica Médica',
    };
    return JSON.stringify(data, null, 2);
  },

  // Import backup
  importDatabase: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      if (data.procedures) localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(data.procedures));
      if (data.financial) localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(data.financial));
      if (data.patients) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.patients));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'DATABASE_IMPORTED' });
      }
      return true;
    } catch {
      return false;
    }
  },

  // Subscribe to multi-tab / real-time updates
  onSync: (callback: (event: { type: string; payload?: unknown }) => void) => {
    if (!broadcastChannel) return () => {};
    const handler = (e: MessageEvent) => {
      callback(e.data);
    };
    broadcastChannel.addEventListener('message', handler);
    return () => {
      broadcastChannel?.removeEventListener('message', handler);
    };
  }
};
