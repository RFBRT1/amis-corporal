import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Clock, 
  Tag, 
  Stethoscope, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';
import { Procedure, ProcedureCategory, UserProfile } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ProceduresModuleProps {
  procedures: Procedure[];
  activeUser: UserProfile;
  onAddProcedure: (proc: Omit<Procedure, 'id'>) => void;
  onUpdateProcedure: (proc: Procedure) => void;
  onDeleteProcedure: (id: string) => void;
}

const CATEGORIES: ('Todos' | ProcedureCategory)[] = [
  'Todos',
  'Consultas',
  'Exames',
  'Pequenas Cirurgias',
  'Procedimentos Estéticos',
  'Terapias & Reabilitação',
  'Outros',
];

export const ProceduresModule: React.FC<ProceduresModuleProps> = ({
  procedures,
  activeUser,
  onAddProcedure,
  onUpdateProcedure,
  onDeleteProcedure,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProcedureCategory>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: ProcedureCategory;
    price: number;
    durationMinutes: number;
    description: string;
    doctorInCharge: string;
    active: boolean;
  }>({
    code: '',
    name: '',
    category: 'Consultas',
    price: 250,
    durationMinutes: 30,
    description: '',
    doctorInCharge: '',
    active: true,
  });

  // Filtered list
  const filteredProcedures = useMemo(() => {
    return procedures.filter((p) => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.doctorInCharge && p.doctorInCharge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [procedures, selectedCategory, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = procedures.length;
    const active = procedures.filter((p) => p.active).length;
    const avgPrice = total > 0 ? procedures.reduce((acc, p) => acc + p.price, 0) / total : 0;
    const maxPrice = total > 0 ? Math.max(...procedures.map((p) => p.price)) : 0;
    return { total, active, avgPrice, maxPrice };
  }, [procedures]);

  const handleOpenNewModal = () => {
    const nextIndex = procedures.length + 1;
    const nextCode = `PR-${String(nextIndex).padStart(3, '0')}`;
    setEditingProcedure(null);
    setFormData({
      code: nextCode,
      name: '',
      category: 'Consultas',
      price: 200,
      durationMinutes: 30,
      description: '',
      doctorInCharge: activeUser.role === 'Médico' ? activeUser.name : 'Geral',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proc: Procedure) => {
    setEditingProcedure(proc);
    setFormData({
      code: proc.code,
      name: proc.name,
      category: proc.category,
      price: proc.price,
      durationMinutes: proc.durationMinutes,
      description: proc.description || '',
      doctorInCharge: proc.doctorInCharge || '',
      active: proc.active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProcedure) {
      onUpdateProcedure({
        ...editingProcedure,
        ...formData,
      });
    } else {
      onAddProcedure(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (proc: Procedure) => {
    if (window.confirm(`Tem certeza que deseja excluir o procedimento "${proc.name}" da tabela de preços?`)) {
      onDeleteProcedure(proc.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Tabela de Valores de Procedimentos
              </h2>
              <p className="text-xs text-slate-500">
                Cadastro, manutenção de preços e catálogo oficial da clínica AMIS
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Procedimento</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total de Procedimentos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 font-display">{stats.total}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {stats.active} ativos no catálogo
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Ticket Médio dos Serviços</p>
          <p className="text-2xl font-bold text-teal-700 mt-1 font-display">{formatCurrency(stats.avgPrice)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Média ponderada</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Procedimento de Maior Valor</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 font-display">{formatCurrency(stats.maxPrice)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Teto da tabela</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Integração Financeira</p>
          <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-faturamento Ativo
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Valores refletem no caixa</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Categories Tab Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Procedures Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Procedimento / Serviço</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Duração</th>
                <th className="py-3 px-4">Médico / Especialidade</th>
                <th className="py-3 px-4 text-right">Valor Oficial</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProcedures.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-slate-600">Nenhum procedimento encontrado.</p>
                    <p className="text-xs text-slate-400">Tente ajustar a busca ou categoria selecionada.</p>
                  </td>
                </tr>
              ) : (
                filteredProcedures.map((proc) => (
                  <tr 
                    key={proc.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">
                      {proc.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{proc.name}</div>
                      {proc.description && (
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{proc.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {proc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proc.durationMinutes} min</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {proc.doctorInCharge || 'Geral'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-display text-base">
                      {proc.price === 0 ? (
                        <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          Gratuito / Retorno
                        </span>
                      ) : (
                        formatCurrency(proc.price)
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {proc.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(proc)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Editar Procedimento e Preço"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proc)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir Procedimento"
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

      {/* Modal: Cadastro / Edição de Procedimento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento na Tabela'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina nome, categoria e valor oficial cobrado na clínica
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
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Ref.
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="PR-001"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProcedureCategory })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Consultas">Consultas</option>
                    <option value="Exames">Exames</option>
                    <option value="Pequenas Cirurgias">Pequenas Cirurgias</option>
                    <option value="Procedimentos Estéticos">Procedimentos Estéticos</option>
                    <option value="Terapias & Reabilitação">Terapias & Reabilitação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Procedimento / Exame *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Consulta Geral, Ecocardiograma, Botox..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Cobrado (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duração Estimada (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Médico ou Especialista Responsável
                </label>
                <input
                  type="text"
                  value={formData.doctorInCharge}
                  onChange={(e) => setFormData({ ...formData, doctorInCharge: e.target.value })}
                  placeholder="Ex: Dra Isabela Kronka Barboza / Dra Aline"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição & Instruções de Preparo ao Paciente (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Jejum de 8 horas, levar exames anteriores..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="activeCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Procedimento ativo para novos agendamentos na clínica
                </label>
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
                  {editingProcedure ? 'Salvar Alterações' : 'Cadastrar Procedimento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
