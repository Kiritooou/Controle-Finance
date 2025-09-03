import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, Category, Goal } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { NewTransaction } from './NewTransaction';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, goals, onAddTransaction }) => {
  const entradas = transactions.filter(t => t.type === 'entrada');
  const saidas = transactions.filter(t => t.type === 'saida');
  
  const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
  const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalEntradas - totalSaidas;

  const categoryData = categories
    .filter(cat => cat.type === 'saida')
    .map(category => {
      const categoryTransactions = saidas.filter(t => t.category === category.name);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { name: category.name, value: total, color: category.color };
    })
    .filter(item => item.value > 0);

  const balanceData = [
    { name: 'Entradas', value: totalEntradas, color: '#10B981' },
    { name: 'Saídas', value: totalSaidas, color: '#EF4444' }
  ];

  const completedGoals = goals.filter(g => g.completed).length;

  return (
    <div className="space-y-6">
      {/* Nova Transação */}
      <NewTransaction categories={categories} onAddTransaction={onAddTransaction} />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><TrendingUp className="h-8 w-8 text-green-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Entradas</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalEntradas)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><TrendingDown className="h-8 w-8 text-red-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Saídas</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalSaidas)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><DollarSign className={`h-8 w-8 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Saldo</p>
              <p className={`text-2xl font-semibold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldo)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><Target className="h-8 w-8 text-blue-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Metas Concluídas</p>
              <p className="text-2xl font-semibold text-gray-900">{completedGoals}/{goals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Entradas vs Saídas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={balanceData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {balanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500"><p>Nenhuma transação de saída encontrada</p></div>
          )}
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transações Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
