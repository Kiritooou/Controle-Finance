import React, { useState } from 'react';
import { Goal } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { Target, Plus, CheckCircle, Trash2 } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const goal: Goal = {
      id: uuidv4(),
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
      completed: false
    };

    onAddGoal(goal);
    
    setFormData({ title: '', targetAmount: '', deadline: '' });
    setShowForm(false);
    alert('Meta adicionada com sucesso!');
  };

  const handleAddToGoal = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount;
    
    const updatedGoal: Goal = {
      ...goal,
      currentAmount: newAmount,
      completed: isCompleted,
      completedAt: isCompleted && !goal.completed ? new Date().toISOString() : goal.completedAt
    };

    onUpdateGoal(updatedGoal);

    if (isCompleted && !goal.completed) {
      setShowMessage(`🎉 Parabéns! Você concluiu a meta "${goal.title}"! 🎉`);
      setTimeout(() => setShowMessage(null), 5000);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      onDeleteGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de sucesso */}
      {showMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{showMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Metas Financeiras</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título da Meta
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ex: Emergência"
                />
              </div>
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                  Valor da Meta
                </label>
                <input
                  type="number"
                  id="targetAmount"
                  step="0.01"
                  min="0"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Data Limite
                </label>
                <input
                  type="date"
                  id="deadline"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Adicionar Meta
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const progressCapped = Math.min(progress, 100);
            
            return (
              <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Target className={`h-6 w-6 ${goal.completed ? 'text-green-500' : 'text-blue-500'}`} />
                    <h3 className="ml-2 text-lg font-medium text-gray-900">{goal.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{progressCapped.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressCapped}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Atual:</span>
                    <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meta:</span>
                    <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restante:</span>
                    <span className="font-medium">
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prazo:</span>
                    <span className="font-medium">
                      {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {goal.completed ? (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Meta Concluída!
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Adicionar valor"
                      className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const amount = parseFloat((e.target as HTMLInputElement).value);
                          if (amount > 0) {
                            handleAddToGoal(goal.id, amount);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const amount = parseFloat(input.value);
                        if (amount > 0) {
                          handleAddToGoal(goal.id, amount);
                          input.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Adicionar à Meta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma meta criada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira meta financeira.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
