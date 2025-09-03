import React, { useState } from 'react';
import { Category, Transaction } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CategoryForm } from './CategoryForm';

interface CategoriesProps {
  categories: Category[];
  transactions: Transaction[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ categories, transactions, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const openModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSave = (categoryData: Omit<Category, 'id'> | Category) => {
    if ('id' in categoryData) {
      onUpdateCategory(categoryData);
    } else {
      onAddCategory(categoryData);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    const isCategoryInUse = transactions.some(t => t.category === categories.find(c => c.id === id)?.name);
    if (isCategoryInUse) {
      alert('Esta categoria está em uso e não pode ser excluída. Por favor, reatribua as transações existentes para outra categoria primeiro.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      onDeleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h2>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }}></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <button onClick={() => openModal(category)} className="text-blue-600 hover:text-blue-900"><Pencil className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};
