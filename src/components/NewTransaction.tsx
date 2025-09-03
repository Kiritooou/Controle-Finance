import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { Plus } from 'lucide-react';

interface NewTransactionProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const NewTransaction: React.FC<NewTransactionProps> = ({ categories, onAddTransaction }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'saida' as 'entrada' | 'saida',
    date: new Date().toISOString().split('T')[0]
  });

  const [showForm, setShowForm] = useState(false);

  const filteredCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date
    };

    onAddTransaction(transaction);
    
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'saida',
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowForm(false);
    alert('Transação adicionada com sucesso!');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {!showForm ? (
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Adicionar Transação</h2>
            <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <Plus className="mr-2 h-5 w-5" />
                Nova
            </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-base font-medium text-gray-900">Tipo de Transação</label>
            <fieldset className="mt-2">
              <div className="flex items-center space-x-10">
                <div className="flex items-center">
                  <input id="entrada" name="type" type="radio" value="entrada" checked={formData.type === 'entrada'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida', category: '' })} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"/>
                  <label htmlFor="entrada" className="ml-3 block text-sm font-medium text-gray-700">Entrada</label>
                </div>
                <div className="flex items-center">
                  <input id="saida" name="type" type="radio" value="saida" checked={formData.type === 'saida'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida', category: '' })} className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"/>
                  <label htmlFor="saida" className="ml-3 block text-sm font-medium text-gray-700">Saída</label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">R$</span></div>
                <input type="number" id="amount" step="0.01" min="0" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 sm:text-sm border-gray-300 rounded-md" placeholder="0,00"/>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição *</label>
              <input type="text" id="description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: Supermercado"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria *</label>
              <select id="category" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Selecione</option>
                {filteredCategories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button type="submit" className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Adicionar Transação</button>
            <button type="button" onClick={() => setShowForm(false)} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
};
