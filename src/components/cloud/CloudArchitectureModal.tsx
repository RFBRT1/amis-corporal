import React, { useState } from 'react';
import { 
  CloudCog, 
  Database, 
  ShieldCheck, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RefreshCw, 
  Server, 
  Layers, 
  Users, 
  Terminal,
  ExternalLink,
  X
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface CloudArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseReload: () => void;
}

export const CloudArchitectureModal: React.FC<CloudArchitectureModalProps> = ({
  isOpen,
  onClose,
  onDatabaseReload,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'firebase' | 'htmljs' | 'nodeapi' | 'backup'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExport = () => {
    const jsonStr = StorageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_clinica_amis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importDatabase(content)) {
        alert('Backup importado com sucesso!');
        onDatabaseReload();
        onClose();
      } else {
        alert('Falha ao importar o arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar a base de dados para os registros de demonstração da Clínica AMIS?')) {
      StorageService.resetDatabase();
      onDatabaseReload();
      alert('Banco de dados restaurado com sucesso!');
      onClose();
    }
  };

  // Code Snippets for pure JS / Firebase
  const FIREBASE_CONFIG_SNIPPET = `// firebase-config.js - Configuração e Sincronização em Tempo Real (Firebase Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "amis-clinica.firebaseapp.com",
  projectId: "amis-clinica",
  storageBucket: "amis-clinica.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Inicialização
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Ouvinte em tempo real para múltiplos usuários (Recepção, Médicos, Financeiro)
export function escutarAgendamentos(callback) {
  const q = query(collection(db, "agendamentos"), orderBy("data", "asc"));
  return onSnapshot(q, (snapshot) => {
    const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(agendamentos);
  });
}`;

  const HTML_PURE_JS_SNIPPET = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AMIS - Gestão Clínica Integrada</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-display { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 antialiased min-h-screen flex flex-col md:flex-row">

  <!-- ================= SIDEBAR ================= -->
  <aside class="w-full md:w-64 bg-slate-900 text-white p-5 flex flex-col justify-between shrink-0">
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
          +
        </div>
        <div>
          <h1 class="text-xl font-bold font-display tracking-tight text-white">AMIS CLÍNICA</h1>
          <p class="text-[11px] text-emerald-400 font-medium">Gestão & Agendamentos</p>
        </div>
      </div>

      <!-- Live Sync Status -->
      <div id="syncBadge" class="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl text-xs flex items-center gap-2 text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span id="syncText">Sincronizando Nuvem...</span>
      </div>

      <!-- Navigation Tabs -->
      <nav class="space-y-1.5 font-medium text-sm">
        <button onclick="switchTab('agenda')" id="tabBtn-agenda" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold transition-all">
          <i data-lucide="calendar" class="w-4 h-4"></i>
          <span>Agenda & Consultas</span>
        </button>
        <button onclick="switchTab('procedimentos')" id="tabBtn-procedimentos" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <i data-lucide="stethoscope" class="w-4 h-4"></i>
          <span>Procedimentos</span>
        </button>
        <button onclick="switchTab('financeiro')" id="tabBtn-financeiro" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <i data-lucide="wallet" class="w-4 h-4"></i>
          <span>Controle Financeiro</span>
        </button>
      </nav>
    </div>

    <!-- Active User Card -->
    <div class="pt-4 border-t border-slate-800 flex items-center gap-3 mt-6">
      <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
        AM
      </div>
      <div class="text-xs">
        <p class="font-bold text-white">Clínica AMIS</p>
        <p class="text-slate-400">Multi-Usuário Ativo</p>
      </div>
    </div>
  </aside>

  <!-- ================= MAIN CONTENT ================= -->
  <main class="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">

    <!-- TAB 1: AGENDA & AGENDAMENTOS -->
    <section id="tab-agenda" class="space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 font-display">Agenda de Atendimentos</h2>
          <p class="text-xs text-slate-500">Agende pacientes, vincule procedimentos e gere parcelamentos automáticos.</p>
        </div>
        <button onclick="openModal('modalAgendamento')" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Novo Agendamento</span>
        </button>
      </div>

      <!-- Appointments List -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-sm text-slate-800">Próximos Atendimentos</h3>
          <span id="totalAgendamentosCount" class="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">0 cadastrados</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3.5">Data/Hora</th>
                <th class="p-3.5">Paciente</th>
                <th class="p-3.5">Profissional</th>
                <th class="p-3.5">Procedimento</th>
                <th class="p-3.5">Valor & Pagamento</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody id="listaAgendamentosBody" class="divide-y divide-slate-100 text-slate-700 font-medium">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 2: PROCEDIMENTOS -->
    <section id="tab-procedimentos" class="hidden space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 font-display">Tabela de Procedimentos & Preços</h2>
          <p class="text-xs text-slate-500">Cadastre valores, durações e profissionais responsáveis.</p>
        </div>
        <button onclick="openModal('modalProcedimento')" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center gap-2">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Cadastrar Procedimento</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="gridProcedimentos">
        <!-- Rendered dynamically -->
      </div>
    </section>

    <!-- TAB 3: CONTROLE FINANCEIRO -->
    <section id="tab-financeiro" class="hidden space-y-6">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 font-display">Controle Financeiro & Fluxo de Caixa</h2>
          <p class="text-xs text-slate-500">Entradas desmembradas por mês e controle de despesas operacionais.</p>
        </div>
        <div class="flex items-center gap-3">
          <select id="filtroMesFinanceiro" onchange="renderFinanceiro()" class="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
            <!-- Rendered dynamically -->
          </select>
          <button onclick="openModal('modalDespesa')" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Nova Despesa</span>
          </button>
        </div>
      </div>

      <!-- Financial KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 font-semibold">Receitas do Mês</span>
          <h4 id="kpiReceitas" class="text-xl font-bold text-emerald-600 font-display mt-1">R$ 0,00</h4>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 font-semibold">Despesas do Mês</span>
          <h4 id="kpiDespesas" class="text-xl font-bold text-rose-600 font-display mt-1">R$ 0,00</h4>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span class="text-xs text-slate-500 font-semibold">Resultado Líquido</span>
          <h4 id="kpiSaldo" class="text-xl font-bold text-slate-800 font-display mt-1">R$ 0,00</h4>
        </div>
      </div>

      <!-- Financial Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 class="font-bold text-sm text-slate-800">Lançamentos do Período Selecionado</h3>
          <span class="text-xs text-slate-500">Inclui parcelas mensais de procedimentos</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3.5">Data Vencimento</th>
                <th class="p-3.5">Tipo</th>
                <th class="p-3.5">Descrição</th>
                <th class="p-3.5">Profissional / Fornecedor</th>
                <th class="p-3.5">Forma de Pagamento</th>
                <th class="p-3.5">Valor da Parcela</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody id="listaFinanceiroBody" class="divide-y divide-slate-100 text-slate-700 font-medium">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

  </main>

  <!-- ================= MODAL: NOVO AGENDAMENTO ================= -->
  <div id="modalAgendamento" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-slate-900 text-base font-display">Novo Agendamento Clínico</h3>
        <button onclick="closeModal('modalAgendamento')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>
      <form id="formAgendamento" onsubmit="handleSalvarAgendamento(event)" class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nome do Paciente *</label>
            <input id="aptPaciente" type="text" required placeholder="Ex: Roberto Antunes" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone *</label>
            <input id="aptTelefone" type="text" required placeholder="(11) 98765-4321" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Profissional Responsável *</label>
            <select id="aptProfissional" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
              <option value="Dra Isabela Kronka Barboza">Dra Isabela Kronka Barboza</option>
              <option value="Dra Aline">Dra Aline</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Procedimento *</label>
          <select id="aptProcedimento" onchange="atualizarPrecoAgendamento()" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
            <!-- Options populated via JS -->
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Data da Consulta *</label>
            <input id="aptData" type="date" required class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Horário *</label>
            <input id="aptHora" type="time" required value="09:00" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <!-- Parcelamento e Pagamento -->
        <div class="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-emerald-900">Condições de Pagamento:</span>
            <span id="aptValorTotalTexto" class="text-sm font-bold text-emerald-700 font-display">R$ 0,00</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
              <select id="aptFormaPagamento" class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                <option value="Pix">Pix (À Vista)</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Parcelamento (Meses)</label>
              <select id="aptParcelas" class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg">
                <option value="1">1x (À Vista no Mês)</option>
                <option value="2">2x Mensais</option>
                <option value="3">3x Mensais</option>
                <option value="4">4x Mensais</option>
                <option value="5">5x Mensais</option>
                <option value="6">6x Mensais</option>
                <option value="10">10x Mensais</option>
                <option value="12">12x Mensais</option>
              </select>
            </div>
          </div>
          <p class="text-[10px] text-emerald-800">
            * O valor será desmembrado e distribuído automaticamente mês a mês no módulo financeiro.
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeModal('modalAgendamento')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
          <button type="submit" class="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">Salvar Agendamento</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= MODAL: NOVO PROCEDIMENTO ================= -->
  <div id="modalProcedimento" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-slate-900 text-base font-display">Cadastrar Novo Procedimento</h3>
        <button onclick="closeModal('modalProcedimento')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>
      <form id="formProcedimento" onsubmit="handleSalvarProcedimento(event)" class="p-6 space-y-3.5">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Código</label>
            <input id="procCodigo" type="text" required placeholder="AMIS-01" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nome do Procedimento *</label>
            <input id="procNome" type="text" required placeholder="Ex: Consulta Cardiológica" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
            <select id="procCategoria" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
              <option value="Consultas">Consultas</option>
              <option value="Exames">Exames</option>
              <option value="Cirurgias">Cirurgias</option>
              <option value="Estética">Estética</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Preço Oficial (R$) *</label>
            <input id="procPreco" type="number" step="0.01" required placeholder="380.00" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Duração (Minutos)</label>
            <input id="procDuracao" type="number" required value="30" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Profissional Padrão</label>
            <input id="procMedico" type="text" value="Dra Isabela Kronka Barboza" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeModal('modalProcedimento')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
          <button type="submit" class="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">Cadastrar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= MODAL: NOVA DESPESA ================= -->
  <div id="modalDespesa" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="font-bold text-slate-900 text-base font-display">Lançar Despesa da Clínica</h3>
        <button onclick="closeModal('modalDespesa')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>
      <form id="formDespesa" onsubmit="handleSalvarDespesa(event)" class="p-6 space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Descrição da Despesa *</label>
          <input id="despDescricao" type="text" required placeholder="Ex: Insumos Cirúrgicos / Aluguel" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
            <input id="despValor" type="number" step="0.01" required placeholder="450.00" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Data Vencimento *</label>
            <input id="despData" type="date" required class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
            <select id="despCategoria" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
              <option value="Materiais & Insumos">Materiais & Insumos</option>
              <option value="Aluguel & Condomínio">Aluguel & Condomínio</option>
              <option value="Honorários Médicos">Honorários Médicos</option>
              <option value="Softwares & Sistemas">Softwares & Sistemas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Fornecedor / Beneficiário</label>
            <input id="despFornecedor" type="text" placeholder="Nome do Fornecedor" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeModal('modalDespesa')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
          <button type="submit" class="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm">Salvar Despesa</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= JAVASCRIPT & FIREBASE ================= -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { 
      getFirestore, 
      collection, 
      onSnapshot, 
      addDoc, 
      updateDoc, 
      deleteDoc, 
      doc, 
      query, 
      orderBy 
    } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // 1. CONFIGURAÇÃO DO FIREBASE (Insira suas chaves aqui se desejar nuvem persistente)
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "amis-clinica.firebaseapp.com",
      projectId: "amis-clinica",
      storageBucket: "amis-clinica.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef"
    };

    let db = null;
    let isFirebaseEnabled = false;

    try {
      if (firebaseConfig.apiKey !== "SUA_API_KEY") {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        isFirebaseEnabled = true;
        document.getElementById("syncText").innerText = "Firebase Firestore Conectado";
      } else {
        document.getElementById("syncText").innerText = "Armazenamento Local Ativo (Cole sua chave do Firebase no código para nuvem)";
      }
    } catch(e) {
      console.warn("Iniciando em modo de armazenamento local:", e);
      document.getElementById("syncText").innerText = "Modo Local / Offline";
    }

    // 2. BASE DE DADOS INICIAL
    window.procedimentos = JSON.parse(localStorage.getItem('amis_proc')) || [
      { id: '1', codigo: 'AMIS-01', nome: 'Consulta Cardiológica', categoria: 'Consultas', preco: 380.00, duracao: 45, medico: 'Dra Isabela Kronka Barboza' },
      { id: '2', codigo: 'AMIS-02', nome: 'Consulta Geral / Clínica', categoria: 'Consultas', preco: 250.00, duracao: 30, medico: 'Dra Aline' },
      { id: '3', codigo: 'AMIS-03', nome: 'Eletrocardiograma (ECG)', categoria: 'Exames', preco: 130.00, duracao: 20, medico: 'Dra Isabela Kronka Barboza' },
      { id: '4', codigo: 'AMIS-04', nome: 'Ultrassom Abdominal Total', categoria: 'Exames', preco: 290.00, duracao: 30, medico: 'Dra Aline' },
      { id: '5', codigo: 'AMIS-05', nome: 'Aplicação de Toxina Botulínica (Botox)', categoria: 'Estética', preco: 1200.00, duracao: 40, medico: 'Dra Isabela Kronka Barboza' }
    ];

    window.agendamentos = JSON.parse(localStorage.getItem('amis_apt')) || [
      {
        id: 'apt_1',
        paciente: 'Beatriz Vasconcelos',
        telefone: '(11) 98765-4321',
        medico: 'Dra Isabela Kronka Barboza',
        procedimento: 'Consulta Cardiológica',
        data: new Date().toISOString().split('T')[0],
        hora: '09:00',
        valorTotal: 380.00,
        formaPagamento: 'Pix',
        parcelas: 1,
        status: 'Realizado'
      }
    ];

    window.financeiro = JSON.parse(localStorage.getItem('amis_fin')) || [
      {
        id: 'fin_1',
        tipo: 'Receita',
        descricao: 'Consulta Cardiológica - Beatriz Vasconcelos (1/1)',
        profissional: 'Dra Isabela Kronka Barboza',
        valor: 380.00,
        formaPagamento: 'Pix',
        dataVencimento: new Date().toISOString().split('T')[0],
        mesReferencia: new Date().toISOString().slice(0, 7),
        status: 'Pago'
      }
    ];

    // Helper functions
    const formatBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    window.saveState = function() {
      localStorage.setItem('amis_proc', JSON.stringify(window.procedimentos));
      localStorage.setItem('amis_apt', JSON.stringify(window.agendamentos));
      localStorage.setItem('amis_fin', JSON.stringify(window.financeiro));
      window.renderAll();
    };

    // TAB SWITCHING
    window.switchTab = function(tab) {
      ['agenda', 'procedimentos', 'financeiro'].forEach(t => {
        document.getElementById('tab-' + t).classList.add('hidden');
        document.getElementById('tabBtn-' + t).classList.remove('bg-emerald-600', 'text-white');
        document.getElementById('tabBtn-' + t).classList.add('text-slate-400');
      });
      document.getElementById('tab-' + tab).classList.remove('hidden');
      document.getElementById('tabBtn-' + tab).classList.add('bg-emerald-600', 'text-white');
      document.getElementById('tabBtn-' + tab).classList.remove('text-slate-400');
      lucide.createIcons();
    };

    // MODAL CONTROL
    window.openModal = function(id) {
      document.getElementById(id).classList.remove('hidden');
      if (id === 'modalAgendamento') {
        const procSelect = document.getElementById('aptProcedimento');
        procSelect.innerHTML = window.procedimentos.map(p => \`<option value="\${p.id}">\${p.nome} (\${formatBRL(p.preco)})\</option>\`).join('');
        document.getElementById('aptData').value = new Date().toISOString().split('T')[0];
        window.atualizarPrecoAgendamento();
      }
      if (id === 'modalDespesa') {
        document.getElementById('despData').value = new Date().toISOString().split('T')[0];
      }
    };
    window.closeModal = function(id) {
      document.getElementById(id).classList.add('hidden');
    };

    window.atualizarPrecoAgendamento = function() {
      const pId = document.getElementById('aptProcedimento').value;
      const proc = window.procedimentos.find(p => p.id === pId);
      if (proc) {
        document.getElementById('aptValorTotalTexto').innerText = formatBRL(proc.preco);
        if (proc.medico) document.getElementById('aptProfissional').value = proc.medico;
      }
    };

    // 3. SALVAR AGENDAMENTO COM PARCELAMENTO DESMEMBRADO
    window.handleSalvarAgendamento = async function(e) {
      e.preventDefault();
      const pId = document.getElementById('aptProcedimento').value;
      const proc = window.procedimentos.find(p => p.id === pId);
      const parcelasCount = parseInt(document.getElementById('aptParcelas').value) || 1;
      const valorTotal = proc ? proc.preco : 0;
      const valorParcela = Math.round((valorTotal / parcelasCount) * 100) / 100;
      const dataConsulta = document.getElementById('aptData').value;
      const paciente = document.getElementById('aptPaciente').value;
      const profissional = document.getElementById('aptProfissional').value;
      const formaPagamento = document.getElementById('aptFormaPagamento').value;

      const novoAgendamento = {
        id: 'apt_' + Date.now(),
        paciente,
        telefone: document.getElementById('aptTelefone').value,
        medico: profissional,
        procedimento: proc ? proc.nome : 'Consulta',
        data: dataConsulta,
        hora: document.getElementById('aptHora').value,
        valorTotal,
        formaPagamento,
        parcelas: parcelasCount,
        status: 'Agendado'
      };

      // DESMEMBRAMENTO DAS PARCELAS MÊS A MÊS NO FINANCEIRO
      const dataBase = new Date(dataConsulta + 'T12:00:00');
      for (let i = 1; i <= parcelasCount; i++) {
        const dataVenc = new Date(dataBase);
        dataVenc.setMonth(dataBase.getMonth() + (i - 1));
        const mesRef = dataVenc.toISOString().slice(0, 7); // Ex: "2026-09"
        const dataStr = dataVenc.toISOString().split('T')[0];

        const novaReceita = {
          id: 'fin_' + Date.now() + '_' + i,
          tipo: 'Receita',
          descricao: \`\${proc.nome} - \${paciente} (Parcela \${i}/\${parcelasCount})\`,
          profissional: profissional,
          valor: valorParcela,
          formaPagamento: formaPagamento,
          dataVencimento: dataStr,
          mesReferencia: mesRef,
          status: i === 1 ? 'Pago' : 'Pendente'
        };

        window.financeiro.unshift(novaReceita);

        if (isFirebaseEnabled) {
          try { await addDoc(collection(db, "financeiro"), novaReceita); } catch(err){}
        }
      }

      window.agendamentos.unshift(novoAgendamento);
      if (isFirebaseEnabled) {
        try { await addDoc(collection(db, "agendamentos"), novoAgendamento); } catch(err){}
      }

      window.saveState();
      window.closeModal('modalAgendamento');
      e.target.reset();
      alert(\`Agendamento salvo com sucesso! Foram geradas \${parcelasCount} parcela(s) de \${formatBRL(valorParcela)} no financeiro.\`);
    };

    // 4. SALVAR PROCEDIMENTO
    window.handleSalvarProcedimento = async function(e) {
      e.preventDefault();
      const novoProc = {
        id: 'proc_' + Date.now(),
        codigo: document.getElementById('procCodigo').value,
        nome: document.getElementById('procNome').value,
        categoria: document.getElementById('procCategoria').value,
        preco: parseFloat(document.getElementById('procPreco').value),
        duracao: parseInt(document.getElementById('procDuracao').value),
        medico: document.getElementById('procMedico').value
      };

      window.procedimentos.push(novoProc);
      if (isFirebaseEnabled) {
        try { await addDoc(collection(db, "procedimentos"), novoProc); } catch(err){}
      }

      window.saveState();
      window.closeModal('modalProcedimento');
      e.target.reset();
    };

    // 5. SALVAR DESPESA
    window.handleSalvarDespesa = async function(e) {
      e.preventDefault();
      const dataVenc = document.getElementById('despData').value;
      const mesRef = dataVenc.slice(0, 7);

      const novaDespesa = {
        id: 'fin_' + Date.now(),
        tipo: 'Despesa',
        descricao: document.getElementById('despDescricao').value,
        profissional: document.getElementById('despFornecedor').value || 'Fornecedor',
        valor: parseFloat(document.getElementById('despValor').value),
        formaPagamento: 'Boleto',
        dataVencimento: dataVenc,
        mesReferencia: mesRef,
        status: 'Pago'
      };

      window.financeiro.unshift(novaDespesa);
      if (isFirebaseEnabled) {
        try { await addDoc(collection(db, "financeiro"), novaDespesa); } catch(err){}
      }

      window.saveState();
      window.closeModal('modalDespesa');
      e.target.reset();
    };

    // 6. RENDERIZADORES
    window.renderAgendamentos = function() {
      const tbody = document.getElementById('listaAgendamentosBody');
      document.getElementById('totalAgendamentosCount').innerText = \`\${window.agendamentos.length} cadastrados\`;
      tbody.innerHTML = window.agendamentos.map(a => \`
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="p-3.5"><span class="font-bold text-slate-900">\${a.data.split('-').reverse().join('/')}</span> <span class="text-slate-400 font-mono">\${a.hora}</span></td>
          <td class="p-3.5 font-bold text-slate-800">\${a.paciente}<br><span class="text-[11px] font-normal text-slate-500">\${a.telefone}</span></td>
          <td class="p-3.5 text-emerald-800 font-semibold">\${a.medico}</td>
          <td class="p-3.5">\${a.procedimento}</td>
          <td class="p-3.5 font-bold text-emerald-700">\${formatBRL(a.valorTotal)} <span class="text-[10px] text-slate-500 block font-normal">\${a.formaPagamento} (\${a.parcelas || 1}x)</span></td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${a.status === 'Realizado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">\${a.status}</span></td>
          <td class="p-3.5 text-right">
            <button onclick="concluirAgendamento('\${a.id}')" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]">Concluir</button>
          </td>
        </tr>
      \`).join('');
    };

    window.renderProcedimentos = function() {
      const grid = document.getElementById('gridProcedimentos');
      grid.innerHTML = window.procedimentos.map(p => \`
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">\${p.codigo}</span>
            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">\${p.categoria}</span>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-sm">\${p.nome}</h4>
            <p class="text-xs text-slate-500 mt-0.5">Resp: \${p.medico || 'Clínico Geral'}</p>
          </div>
          <div class="flex justify-between items-end pt-3 border-t border-slate-100">
            <div>
              <span class="text-[10px] text-slate-400 block">Duração Estimada</span>
              <span class="text-xs font-semibold text-slate-700">\${p.duracao} minutos</span>
            </div>
            <span class="text-base font-bold text-emerald-600 font-display">\${formatBRL(p.preco)}</span>
          </div>
        </div>
      \`).join('');
    };

    window.renderFinanceiro = function() {
      const selectMes = document.getElementById('filtroMesFinanceiro');
      const mesesDisponiveis = [...new Set(window.financeiro.map(f => f.mesReferencia || f.dataVencimento.slice(0, 7)))].sort().reverse();
      
      if (selectMes.options.length === 0 || selectMes.innerHTML === '') {
        selectMes.innerHTML = mesesDisponiveis.map(m => \`<option value="\${m}">Mês: \${m.split('-').reverse().join('/')}\</option>\`).join('');
      }

      const mesEscolhido = selectMes.value || mesesDisponiveis[0] || new Date().toISOString().slice(0, 7);
      const filtrados = window.financeiro.filter(f => (f.mesReferencia || f.dataVencimento.slice(0, 7)) === mesEscolhido);

      const totalReceitas = filtrados.filter(f => f.tipo === 'Receita').reduce((sum, f) => sum + f.valor, 0);
      const totalDespesas = filtrados.filter(f => f.tipo === 'Despesa').reduce((sum, f) => sum + f.valor, 0);
      const saldo = totalReceitas - totalDespesas;

      document.getElementById('kpiReceitas').innerText = formatBRL(totalReceitas);
      document.getElementById('kpiDespesas').innerText = formatBRL(totalDespesas);
      document.getElementById('kpiSaldo').innerText = formatBRL(saldo);
      document.getElementById('kpiSaldo').className = \`text-xl font-bold font-display mt-1 \${saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}\`;

      const tbody = document.getElementById('listaFinanceiroBody');
      tbody.innerHTML = filtrados.map(f => \`
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="p-3.5 font-mono">\${f.dataVencimento.split('-').reverse().join('/')}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold \${f.tipo === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">\${f.tipo}</span></td>
          <td class="p-3.5 font-semibold text-slate-800">\${f.descricao}</td>
          <td class="p-3.5 text-slate-600">\${f.profissional}</td>
          <td class="p-3.5 font-mono text-slate-500">\${f.formaPagamento}</td>
          <td class="p-3.5 font-bold \${f.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}">\${formatBRL(f.valor)}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${f.status === 'Pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">\${f.status}</span></td>
          <td class="p-3.5 text-right">
            \${f.status === 'Pendente' ? \`<button onclick="baixarLancamento('\${f.id}')" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">Dar Baixa</button>\` : '<span class="text-slate-400 text-[11px]">Quitado</span>'}
          </td>
        </tr>
      \`).join('');
    };

    window.concluirAgendamento = function(id) {
      const apt = window.agendamentos.find(a => a.id === id);
      if (apt) {
        apt.status = 'Realizado';
        window.saveState();
      }
    };

    window.baixarLancamento = function(id) {
      const fin = window.financeiro.find(f => f.id === id);
      if (fin) {
        fin.status = 'Pago';
        window.saveState();
      }
    };

    window.renderAll = function() {
      window.renderAgendamentos();
      window.renderProcedimentos();
      window.renderFinanceiro();
      lucide.createIcons();
    };

    // Inicialização ao carregar
    window.addEventListener('DOMContentLoaded', () => {
      window.renderAll();
    });
  </script>
</body>
</html>`;

  const NODE_EXPRESS_API = `// server.js - API Leve em Node.js com Express para Clínica AMIS
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let agendamentos = [];
let procedimentos = [];
let lancamentosFinanceiros = [];

// Rotas de Agendamentos
app.get('/api/agendamentos', (req, res) => res.json(agendamentos));
app.post('/api/agendamentos', (req, res) => {
  const novo = { id: Date.now().toString(), ...req.body, status: 'Agendado' };
  agendamentos.push(novo);
  res.status(201).json(novo);
});

// Rotas de Tabela de Preços de Procedimentos
app.get('/api/procedimentos', (req, res) => res.json(procedimentos));
app.post('/api/procedimentos', (req, res) => {
  const novo = { id: Date.now().toString(), ...req.body };
  procedimentos.push(novo);
  res.status(201).json(novo);
});

// Rotas de Controle Financeiro
app.get('/api/financeiro', (req, res) => res.json(lancamentosFinanceiros));
app.post('/api/financeiro', (req, res) => {
  const novo = { id: Date.now().toString(), ...req.body, data: new Date().toISOString() };
  lancamentosFinanceiros.push(novo);
  res.status(201).json(novo);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Servidor AMIS rodando na porta \${PORT}\`));`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white">
              <CloudCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display">
                Arquitetura de Nuvem & Acesso Multi-Usuário
              </h3>
              <p className="text-xs text-slate-500">
                Guia de implementação, persistência em nuvem (Firebase / Node.js) e backup de dados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral & Diagrama' },
            { id: 'firebase', label: 'Firebase Firestore (Nuvem)' },
            { id: 'htmljs', label: 'HTML5 + JS Puro (Exemplo)' },
            { id: 'nodeapi', label: 'API Node.js / Express' },
            { id: 'backup', label: 'Backup & Restauração' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Como Funciona o Acesso Multi-usuário na Clínica AMIS
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Para permitir que <strong>múltiplas recepcionistas, médicos e administradores</strong> acessem e alimentem a clínica simultaneamente de diferentes computadores ou celulares, adotamos uma arquitetura orientada a eventos em tempo real (WebSockets / Firestore `onSnapshot` / BroadcastChannel).
                </p>
              </div>

              {/* Multi-role Architecture Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                    1. Recepção / Atendimento
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Agendamentos & Chegada</p>
                  <p className="text-[11px] text-slate-500">
                    Cadastra pacientes, marca consultas, altera status para "Em Atendimento" e envia confirmação por WhatsApp.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                    2. Consultórios Médicos
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Atendimento & Conclusão</p>
                  <p className="text-[11px] text-slate-500">
                    Médicos visualizam sua grade individual de horários e marcam consultas como "Realizado" com 1 clique.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
                    3. Gestão Financeira
                  </span>
                  <p className="text-xs font-semibold text-slate-800">Faturamento & Despesas</p>
                  <p className="text-[11px] text-slate-500">
                    Recebe as consultas realizadas automaticamente no fluxo de caixa e lança despesas e custos operacionais.
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Canal de Sincronização Local:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    BroadcastChannel Ativo (Multi-Abas e Dispositivos)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Banco de Dados em Nuvem:</span>
                  <span className="text-teal-400 font-bold">Firebase Firestore Ready</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Código de Conexão Modular com Firebase Firestore (Tempo Real):
                </p>
                <button
                  onClick={() => handleCopy(FIREBASE_CONFIG_SNIPPET, 'firebase')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  {copiedKey === 'firebase' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'firebase' ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-72">
                {FIREBASE_CONFIG_SNIPPET}
              </pre>
            </div>
          )}

          {activeTab === 'htmljs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Estrutura Completa em HTML5 + Tailwind CSS (CDN) + JS Puro:
                </p>
                <button
                  onClick={() => handleCopy(HTML_PURE_JS_SNIPPET, 'htmljs')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  {copiedKey === 'htmljs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'htmljs' ? 'Copiado!' : 'Copiar HTML + JS'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-72">
                {HTML_PURE_JS_SNIPPET}
              </pre>
            </div>
          )}

          {activeTab === 'nodeapi' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">
                  Estrutura de API REST em Node.js com Express:
                </p>
                <button
                  onClick={() => handleCopy(NODE_EXPRESS_API, 'nodeapi')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                >
                  {copiedKey === 'nodeapi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'nodeapi' ? 'Copiado!' : 'Copiar API Node'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-72">
                {NODE_EXPRESS_API}
              </pre>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Exporte todos os agendamentos, tabela de procedimentos e fluxo financeiro em formato JSON para portabilidade ou backup seguro da clínica.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Exportar Backup JSON</h5>
                    <p className="text-[11px] text-slate-500">Baixar cópia de segurança completa</p>
                  </div>
                </button>

                <label className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-3 text-left cursor-pointer transition-colors">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Restaurar / Importar Backup</h5>
                    <p className="text-[11px] text-slate-500">Carregar arquivo .json salvo</p>
                  </div>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restaurar Base de Dados de Demonstração (Demo Data)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar Guia
          </button>
        </div>

      </div>
    </div>
  );
};
