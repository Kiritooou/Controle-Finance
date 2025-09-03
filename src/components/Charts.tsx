import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const Charts: React.FC<ChartsProps> = ({ transactions, categories }) => {
  const [chartType, setChartType] = useState<'monthly' | 'trend'>('monthly');

  const getLast12MonthsData = () => {
    const now = new Date();
    const start = subMonths(startOfMonth(now), 11);
    const end = endOfMonth(now);
    const months = eachMonthOfInterval({ start, end });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTransactions = transactions.filter(t => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd);
      const entradas = monthTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
      const saidas = monthTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
      return { month: format(month, 'MMM yyyy', { locale: ptBR }), entradas, saidas, saldo: entradas - saidas };
    });
  };

  const getTrendData = () => {
    const now = new Date();
    const start = subMonths(startOfMonth(now), 5);
    const end = endOfMonth(now);
    const months = eachMonthOfInterval({ start, end });
    let saldoAcumulado = 0;
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthTransactions = transactions.filter(t => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd);
      const entradas = monthTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
      const saidas = monthTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
      const saldoMensal = entradas - saidas;
      saldoAcumulado += saldoMensal;
      return { month: format(month, 'MMM yyyy', { locale: ptBR }), saldoMensal, saldoAcumulado };
    });
  };

  const monthlyData = getLast12MonthsData();
  const trendData = getTrendData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => <p key={index} style={{ color: entry.color }} className="text-sm">{entry.name}: {formatCurrency(entry.value)}</p>)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gráficos Financeiros</h2>
          <div className="mt-4 sm:mt-0">
            <select value={chartType} onChange={(e) => setChartType(e.target.value as 'monthly' | 'trend')} className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="monthly">Relatório Mensal</option>
              <option value="trend">Tendência de Saldo</option>
            </select>
          </div>
        </div>

        {chartType === 'monthly' ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Entradas e Saídas por Mês (Últimos 12 Meses)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} /><YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="entradas" fill="#10B981" name="Entradas" /><Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4"><h4 className="text-sm font-medium text-green-800">Maior Entrada Mensal</h4><p className="text-lg font-bold text-green-900">{formatCurrency(Math.max(...monthlyData.map(d => d.entradas)))}</p></div>
              <div className="bg-red-50 rounded-lg p-4"><h4 className="text-sm font-medium text-red-800">Maior Saída Mensal</h4><p className="text-lg font-bold text-red-900">{formatCurrency(Math.max(...monthlyData.map(d => d.saidas)))}</p></div>
              <div className="bg-blue-50 rounded-lg p-4"><h4 className="text-sm font-medium text-blue-800">Média Mensal de Saldo</h4><p className="text-lg font-bold text-blue-900">{formatCurrency(monthlyData.reduce((a, d) => a + d.saldo, 0) / monthlyData.length)}</p></div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tendência de Saldo (Últimos 6 Meses)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} /><YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} /><Tooltip content={<CustomTooltip />} /><Legend /><Line type="monotone" dataKey="saldoMensal" stroke="#8884d8" strokeWidth={2} name="Saldo Mensal" dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }} /><Line type="monotone" dataKey="saldoAcumulado" stroke="#82ca9d" strokeWidth={2} name="Saldo Acumulado" dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4"><h4 className="text-sm font-medium text-purple-800">Melhor Mês</h4><p className="text-lg font-bold text-purple-900">{formatCurrency(Math.max(...trendData.map(d => d.saldoMensal)))}</p></div>
              <div className="bg-indigo-50 rounded-lg p-4"><h4 className="text-sm font-medium text-indigo-800">Saldo Atual Acumulado</h4><p className="text-lg font-bold text-indigo-900">{formatCurrency(trendData[trendData.length - 1]?.saldoAcumulado || 0)}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
