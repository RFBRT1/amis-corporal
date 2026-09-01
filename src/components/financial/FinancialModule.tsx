import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  Search, 
  PieChart as PieIcon, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  X,
  Building,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  FinancialEntry, 
  TransactionType, 
  PaymentMethod, 
  ExpenseCategory, 
  Procedure, 
  UserProfile 
} from '../../types';
import { formatCurrency, formatDateBR } from '../../utils/formatters';

interface FinancialModuleProps {
  entries: FinancialEntry[];
  procedures: Procedure[];
  activeUser: UserProfile;
  onAddEntry: (entry: Omit<FinancialEntry, 'id' | 'createdAt'>) => void;
  onUpdateEntry: (entry: FinancialEntry) => void;
  onDeleteEntry: (id: string) => void;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

type PeriodPreset = 'today' | 'week' | 'month' | 'last30' | 'year' | 'all' | 'custom';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Aluguel & Condomínio',
  'Honorários Médicos',
  'Salários & Encargos',
  'Insumos & Medicamentos',
  'Equipamentos & Manutenção',
  'Marketing & Software',
  'Impostos & Taxas',
  'Limpeza & Descartáveis',
  'Outros',
];

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  entries,
  procedures,
  activeUser,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  // Period filter states
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('month');
  
  // Initialize start & end date for the current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [typeFilter, setTypeFilter] = useState<'Todos' | TransactionType>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pago' | 'Pendente'>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(isModalOpenExternal);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('Receita');
  const [formData, setFormData] = useState<{
    description: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: PaymentMethod;
    status: 'Pago' | 'Pendente';
    patientName: string;
    doctorName: string;
    recipientOrSupplier: string;
    notes: string;
    procedureId?: string;
  }>({
    description: '',
    amount: 250,
    category: 'Consultas',
    date: todayStr,
    paymentMethod: 'Pix',
    status: 'Pago',
    patientName: '',
    doctorName: 'Dra Isabela Kronka Barboza',
    recipientOrSupplier: '',
    notes: '',
    procedureId: '',
  });

  // Handle period presets change
  const handlePeriodChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const now = new Date();

    if (preset === 'today') {
      const d = now.toISOString().split('T')[0];
      setStartDate(d);
      setEndDate(d);
    } else if (preset === 'week') {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'last30') {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      const firstDayYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      setStartDate(firstDayYear);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'all') {
      setStartDate('2020-01-01');
      setEndDate('2030-12-31');
    }
  };

  // Filter entries based on period, type, status, and search
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Date filter
      const itemDate = item.date;
      const matchPeriod = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      
      // Type filter
      const matchType = typeFilter === 'Todos' || item.type === typeFilter;

      // Status filter
      const matchStatus = statusFilter === 'Todos' || item.status === statusFilter;

      // Search filter
      const matchSearch = 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.patientName && item.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.recipientOrSupplier && item.recipientOrSupplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.doctorName && item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchPeriod && matchType && matchStatus && matchSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, startDate, endDate, typeFilter, statusFilter, searchTerm]);

  // Overall Financial Calculations
  const metrics = useMemo(() => {
    let totalIncomePaid = 0;
    let totalIncomePending = 0;
    let totalExpensePaid = 0;
    let totalExpensePending = 0;

    // Filtered range metrics
    filteredEntries.forEach((e) => {
      if (e.type === 'Receita') {
        if (e.status === 'Pago') totalIncomePaid += e.amount;
        else totalIncomePending += e.amount;
      } else {
        if (e.status === 'Pago') totalExpensePaid += e.amount;
        else totalExpensePending += e.amount;
      }
    });

    const netProfit = totalIncomePaid - totalExpensePaid;
    const profitMargin = totalIncomePaid > 0 ? (netProfit / totalIncomePaid) * 100 : 0;

    // Today's total billing
    const todayEntries = entries.filter((e) => e.date === todayStr && e.type === 'Receita' && e.status === 'Pago');
    const todayIncome = todayEntries.reduce((acc, e) => acc + e.amount, 0);

    return {
      totalIncomePaid,
      totalIncomePending,
      totalExpensePaid,
      totalExpensePending,
      netProfit,
      profitMargin,
      todayIncome,
      count: filteredEntries.length,
    };
  }, [filteredEntries, entries, todayStr]);

  // Chart: Cash Flow by Date
  const cashFlowChartData = useMemo(() => {
    const map = new Map<string, { date: string; receitas: number; despesas: number; saldo: number }>();
    
    // Sort chronological
    const sorted = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach((e) => {
      const d = formatDateBR(e.date);
      const existing = map.get(d) || { date: d, receitas: 0, despesas: 0, saldo: 0 };
      if (e.type === 'Receita' && e.status === 'Pago') {
        existing.receitas += e.amount;
      } else if (e.type === 'Despesa' && e.status === 'Pago') {
        existing.despesas += e.amount;
      }
      existing.saldo = existing.receitas - existing.despesas;
      map.set(d, existing);
    });

    return Array.from(map.values());
  }, [filteredEntries]);

  // Chart: Expense Breakdown by Category
  const expenseCategoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries
      .filter((e) => e.type === 'Despesa')
      .forEach((e) => {
        map.set(e.category, (map.get(e.category) || 0) + e.amount);
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  // Chart: Payment Methods
  const paymentMethodsChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach((e) => {
      map.set(e.paymentMethod, (map.get(e.paymentMethod) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  // Open New Transaction Modal
  const handleOpenNewModal = (type: TransactionType = 'Receita') => {
    setEditingEntry(null);
    setFormType(type);
    const defaultProc = procedures[0];
    setFormData({
      description: type === 'Receita' ? (defaultProc ? `Procedimento - ${defaultProc.name}` : 'Consulta Médica') : '',
      amount: type === 'Receita' ? (defaultProc ? defaultProc.price : 250) : 100,
      category: type === 'Receita' ? 'Consultas' : 'Insumos & Medicamentos',
      date: todayStr,
      paymentMethod: 'Pix',
      status: 'Pago',
      patientName: '',
      doctorName: 'Dra. Camila Mendes',
      recipientOrSupplier: '',
      notes: '',
      procedureId: defaultProc?.id || '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setFormType(entry.type);
    setFormData({
      description: entry.description,
      amount: entry.amount,
      category: entry.category,
      date: entry.date,
      paymentMethod: entry.paymentMethod,
      status: entry.status,
      patientName: entry.patientName || '',
      doctorName: entry.doctorName || '',
      recipientOrSupplier: entry.recipientOrSupplier || '',
      notes: entry.notes || '',
      procedureId: '',
    });
    setIsModalOpen(true);
  };

  // Auto-fill when procedure changes in Receita form
  const handleProcedureSelection = (procId: string) => {
    const proc = procedures.find((p) => p.id === procId);
    if (proc) {
      setFormData((prev) => ({
        ...prev,
        procedureId: procId,
        description: `Procedimento - ${proc.name}`,
        amount: proc.price,
        category: proc.category,
        doctorName: proc.doctorInCharge && proc.doctorInCharge !== 'Geral' ? proc.doctorInCharge : prev.doctorName,
      }));
    }
  };

  // Submit transaction form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    if (editingEntry) {
      onUpdateEntry({
        ...editingEntry,
        type: formType,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        patientName: formType === 'Receita' ? formData.patientName : undefined,
        doctorName: formType === 'Receita' ? formData.doctorName : undefined,
        recipientOrSupplier: formType === 'Despesa' ? formData.recipientOrSupplier : undefined,
        notes: formData.notes,
      });
    } else {
      onAddEntry({
        type: formType,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        patientName: formType === 'Receita' ? formData.patientName : undefined,
        doctorName: formType === 'Receita' ? formData.doctorName : undefined,
        recipientOrSupplier: formType === 'Despesa' ? formData.recipientOrSupplier : undefined,
        notes: formData.notes,
        createdBy: activeUser.name,
      });
    }

    setIsModalOpen(false);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tipo', 'Descrição', 'Valor (R$)', 'Categoria', 'Data', 'Forma Pagamento', 'Status', 'Paciente / Favorecido', 'Médico', 'Responsável'];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.type,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.category,
      formatDateBR(e.date),
      e.paymentMethod,
      e.status,
      `"${(e.patientName || e.recipientOrSupplier || '').replace(/"/g, '""')}"`,
      `"${(e.doctorName || '').replace(/"/g, '""')}"`,
      e.createdBy,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_financeiro_amis_${startDate}_ate_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Módulo de Controle Financeiro & Fluxo de Caixa
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                AMIS Clínicas
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Receitas de procedimentos, despesas operacionais, fechamento de caixa e demonstrativos
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            title="Exportar dados filtrados para Excel / Planilhas (CSV)"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => handleOpenNewModal('Despesa')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>Nova Despesa</span>
          </button>

          <button
            onClick={() => handleOpenNewModal('Receita')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Nova Receita</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income / Faturamento */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Faturamento do Período</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-display">
            {formatCurrency(metrics.totalIncomePaid)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            <span>Hoje: <strong className="text-slate-700">{formatCurrency(metrics.todayIncome)}</strong></span>
            {metrics.totalIncomePending > 0 && (
              <span className="text-amber-600 font-medium">+{formatCurrency(metrics.totalIncomePending)} a receber</span>
            )}
          </div>
        </div>

        {/* Total Expenses / Despesas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Despesas Totais</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2 font-display">
            {formatCurrency(metrics.totalExpensePaid)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            <span>Saídas pagas</span>
            {metrics.totalExpensePending > 0 && (
              <span className="text-rose-600 font-medium">+{formatCurrency(metrics.totalExpensePending)} a pagar</span>
            )}
          </div>
        </div>

        {/* Net Profit / Saldo Líquido */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saldo Líquido (Lucro)</span>
            <div className={`p-1.5 rounded-lg ${metrics.netProfit >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold mt-2 font-display ${
            metrics.netProfit >= 0 ? 'text-teal-800' : 'text-rose-700'
          }`}>
            {formatCurrency(metrics.netProfit)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Margem Operacional:</span>
            <span className="font-bold text-slate-800">{metrics.profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Volume & Tickets */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Volume de Lançamentos</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2 font-display">
            {metrics.count} <span className="text-xs font-normal text-slate-400">transações</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Origem:</span>
            <span className="text-emerald-700 font-bold">100% Auditado</span>
          </div>
        </div>

      </div>

      {/* Period Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Preset Range Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Período:
            </span>
            {[
              { id: 'today', label: 'Hoje' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mês' },
              { id: 'last30', label: 'Últimos 30 Dias' },
              { id: 'year', label: 'Este Ano' },
              { id: 'all', label: 'Tudo' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePeriodChange(preset.id as PeriodPreset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  periodPreset === preset.id
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date Picker Range Inputs (Data Inicial e Final) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500">De:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPeriodPreset('custom');
              }}
              className="text-xs bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
            <span className="text-[11px] font-semibold text-slate-500 border-l border-slate-200 pl-2">Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPeriodPreset('custom');
              }}
              className="text-xs bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

        </div>

        {/* Secondary Filter Row (Type, Status, Search) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['Todos', 'Receita', 'Despesa'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    typeFilter === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'Todos' ? 'Todos os Tipos' : t === 'Receita' ? 'Entradas (Receitas)' : 'Saídas (Despesas)'}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['Todos', 'Pago', 'Pendente'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'Todos' ? 'Todos os Status' : s === 'Pago' ? 'Pagos / Recebidos' : 'Pendentes'}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

        </div>

      </div>

      {/* Visual Charts: Cash Flow & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Evolution Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Fluxo de Caixa no Período (Entradas vs. Saídas)
              </h3>
              <p className="text-xs text-slate-400">Evolução diária de receitas e despesas</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Entradas
              </span>
              <span className="flex items-center gap-1 font-medium text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Saídas
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {cashFlowChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip 
                    formatter={(val: number) => [formatCurrency(val), '']}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceitas)" name="Receitas" />
                  <Area type="monotone" dataKey="despesas" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDespesas)" name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum dado financeiro para exibir no gráfico neste período.
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Despesas por Categoria
            </h3>
            <p className="text-xs text-slate-400">Composição dos custos operacionais</p>
          </div>

          <div className="h-52 w-full">
            {expenseCategoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseCategoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhuma despesa no período.
              </div>
            )}
          </div>

          {/* Top Categories List */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {expenseCategoryChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 font-display">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Extrato Detalhado de Lançamentos ({filteredEntries.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Período: {formatDateBR(startDate)} até {formatDateBR(endDate)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição do Lançamento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Forma Pagto</th>
                <th className="py-3 px-4">Paciente / Médico / Favorecido</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600">Nenhum lançamento financeiro neste período.</p>
                    <p className="text-xs text-slate-400">Clique em "Nova Receita" ou "Nova Despesa" para registrar.</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => {
                  const isIncome = item.type === 'Receita';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {isIncome ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ArrowUpRight className="w-3 h-3" /> Entrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <ArrowDownRight className="w-3 h-3" /> Saída
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {formatDateBR(item.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">{item.description}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 italic line-clamp-1">{item.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {item.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {item.patientName && (
                          <div className="font-medium text-slate-900">👤 {item.patientName}</div>
                        )}
                        {item.doctorName && (
                          <div className="text-slate-500 text-[11px]">🩺 {item.doctorName}</div>
                        )}
                        {item.recipientOrSupplier && (
                          <div className="font-medium text-slate-800">🏢 {item.recipientOrSupplier}</div>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold font-display text-sm ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === 'Pago' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="Editar Lançamento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir lançamento "${item.description}"?`)) {
                                onDeleteEntry(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Financial Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
              formType === 'Receita' ? 'bg-emerald-50/70' : 'bg-rose-50/70'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl text-white ${
                  formType === 'Receita' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {formType === 'Receita' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {editingEntry ? `Editar ${formType}` : `Nova ${formType}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formType === 'Receita' 
                      ? 'Registro de entrada vinculada a procedimento ou consulta' 
                      : 'Registro de saída / despesa operacional da clínica'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseExternalModal) onCloseExternalModal();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Type Switcher (if new) */}
              {!editingEntry && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Receita');
                      setFormData((prev) => ({ ...prev, category: 'Consultas' }));
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formType === 'Receita'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Despesa');
                      setFormData((prev) => ({ ...prev, category: 'Insumos & Medicamentos' }));
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formType === 'Despesa'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Despesa (Saída)
                  </button>
                </div>
              )}

              {/* If Receita: Quick load from Procedure Table */}
              {formType === 'Receita' && (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/80">
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    Vincular à Tabela de Procedimentos (Auto-Preenchimento):
                  </label>
                  <select
                    value={formData.procedureId}
                    onChange={(e) => handleProcedureSelection(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">Selecione um procedimento para puxar o valor...</option>
                    {procedures.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={formType === 'Receita' ? 'Ex: Consulta Cardiológica - Beatriz V.' : 'Ex: Compra de Luvas Cirúrgicas'}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Amount, Date and Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pago' | 'Pendente' })}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  >
                    <option value="Pago">Pago / Recebido</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  {formType === 'Receita' ? (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Consultas">Consultas</option>
                      <option value="Exames">Exames</option>
                      <option value="Pequenas Cirurgias">Pequenas Cirurgias</option>
                      <option value="Procedimentos Estéticos">Procedimentos Estéticos</option>
                      <option value="Terapias & Reabilitação">Terapias & Reabilitação</option>
                      <option value="Outras Receitas">Outras Receitas</option>
                    </select>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Convênio">Convênio</option>
                    <option value="Boleto">Boleto Bancário</option>
                  </select>
                </div>
              </div>

              {/* Conditional: Patient / Doctor for Receita OR Supplier for Despesa */}
              {formType === 'Receita' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paciente (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="Nome do paciente"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Médico Atendente (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Ex: Dra Isabela Kronka Barboza"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fornecedor / Favorecido (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.recipientOrSupplier}
                    onChange={(e) => setFormData({ ...formData, recipientOrSupplier: e.target.value })}
                    placeholder="Ex: Imobiliária, Distribuidora Hospitalar, Enel..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Financeiras (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Número de nota fiscal, recibo ou detalhes..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseExternalModal) onCloseExternalModal();
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all ${
                    formType === 'Receita' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingEntry ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
