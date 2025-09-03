import React, { useState } from 'react';
import { Transaction, Goal, Category } from '../types';
import { formatCurrency, filterTransactionsByPeriod } from '../utils/dateUtils';
import { generateEnhancedReport } from '../utils/pdfGenerator';
import { FileText, Download, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  goals: Goal[];
  categories: Category[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions, goals, categories }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'todos' | 'semanal' | 'mensal' | 'anual'>('todos');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);
  
  const entradas = filteredTransactions.filter(t => t.type === 'entrada');
  const saidas = filteredTransactions.filter(t => t.type === 'saida');
  const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalEntradas - totalSaidas;

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    await generateEnhancedReport({
      transactions: filteredTransactions,
      goals,
      categories,
      period: getPeriodLabel(true)
    }, {
      balanceChartId: 'pdf-chart-balance',
      categoryChartId: 'pdf-chart-category'
    });
    setIsGenerating(false);
  };

  const getCategoryTotals = (type: 'entrada' | 'saida') => {
    const categoryTotals: { [key: string]: number } = {};
    filteredTransactions.filter(t => t.type === type).forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).slice(0, 5);
  };

  const topCategoriesEntrada = getCategoryTotals('entrada');
  const topCategoriasSaida = getCategoryTotals('saida');

  const getPeriodLabel = (raw = false) => {
    const labels = {
      semanal: raw ? 'semanal' : 'Relatório Semanal',
      mensal: raw ? 'mensal' : 'Relatório Mensal',
      anual: raw ? 'anual' : 'Relatório Anual',
      todos: raw ? 'geral' : 'Relatório Geral'
    };
    return labels[selectedPeriod];
  };

  // Data for PDF charts
  const balanceData = [{ name: 'Entradas', value: totalEntradas, color: '#10B981' }, { name: 'Saídas', value: totalSaidas, color: '#EF4444' }];
  const categoryData = categories.filter(c => c.type === 'saida').map(cat => ({
    name: cat.name,
    value: saidas.filter(t => t.category === cat.name).reduce((sum, t) => sum + t.amount, 0),
    color: cat.color
  })).filter(item => item.value > 0);

  return (
    <>
      {/* Hidden charts for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '500px', height: '300px', background: 'white' }}>
        <div id="pdf-chart-balance" style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer><PieChart><Pie data={balanceData} dataKey="value" outerRadius={80} fill="#8884d8">{balanceData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '500px', height: '300px', background: 'white' }}>
        <div id="pdf-chart-category" style={{ width: '100%', height: '100%' }}>
          {categoryData.length > 0 && <ResponsiveContainer><PieChart><Pie data={categoryData} dataKey="value" outerRadius={80} fill="#8884d8">{categoryData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)} className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                <option value="todos">Todos os períodos</option>
                <option value="semanal">Esta semana</option>
                <option value="mensal">Este mês</option>
                <option value="anual">Este ano</option>
              </select>
              <button onClick={handleGeneratePDF} disabled={isGenerating} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Gerando...' : 'Baixar PDF'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center"><Calendar className="mr-2 h-5 w-5" />{getPeriodLabel()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center"><p className="text-sm font-medium text-gray-500">Total de Entradas</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p><p className="text-sm text-gray-500">{entradas.length} transações</p></div>
              <div className="text-center"><p className="text-sm font-medium text-gray-500">Total de Saídas</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p><p className="text-sm text-gray-500">{saidas.length} transações</p></div>
              <div className="text-center"><p className="text-sm font-medium text-gray-500">Saldo</p><p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldo)}</p><p className="text-sm text-gray-500">{saldo >= 0 ? 'Positivo' : 'Negativo'}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Top 5 Categorias - Entradas</h4>
              {topCategoriesEntrada.length > 0 ? <div className="space-y-3">{topCategoriesEntrada.map(([c, a], i) => <div key={c} className="flex justify-between items-center"><div className="flex items-center"><span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span><span className="ml-3 text-sm font-medium text-gray-900">{c}</span></div><span className="text-sm font-medium text-green-600">{formatCurrency(a)}</span></div>)}</div> : <p className="text-gray-500 text-center py-4">Nenhuma entrada encontrada</p>}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Top 5 Categorias - Saídas</h4>
              {topCategoriasSaida.length > 0 ? <div className="space-y-3">{topCategoriasSaida.map(([c, a], i) => <div key={c} className="flex justify-between items-center"><div className="flex items-center"><span className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span><span className="ml-3 text-sm font-medium text-gray-900">{c}</span></div><span className="text-sm font-medium text-red-600">{formatCurrency(a)}</span></div>)}</div> : <p className="text-gray-500 text-center py-4">Nenhuma saída encontrada</p>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-medium text-gray-900 flex items-center"><FileText className="mr-2 h-5 w-5" />Preview do Relatório PDF</h4></div>
            <div className="text-sm text-gray-600 space-y-2"><p><strong>Período:</strong> {getPeriodLabel()}</p><p><strong>Conteúdo:</strong> Resumo financeiro, gráficos de visão geral, lista completa de transações e resumo de metas.</p><p><strong>Data de Geração:</strong> {new Date().toLocaleDateString('pt-BR')}</p></div>
          </div>
        </div>
      </div>
    </>
  );
};
