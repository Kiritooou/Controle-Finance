import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface CategoryFormProps {
  category: Category | null;
  onSave: (categoryData: Omit<Category, 'id'> | Category) => void;
  onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'saida' as 'entrada' | 'saida',
    color: '#EF4444'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type === 'both' ? 'saida' : category.type,
        color: category.color
      });
    } else {
      setFormData({ name: '', type: 'saida', color: '#EF4444' });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('O nome da categoria é obrigatório.');
      return;
    }
    if (category) {
      onSave({ ...category, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <fieldset className="mt-2">
                <div className="flex items-center space-x-10">
                  <div className="flex items-center">
                    <input id="form-entrada" name="type" type="radio" value="entrada" checked={formData.type === 'entrada'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida' })} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"/>
                    <label htmlFor="form-entrada" className="ml-3 block text-sm font-medium text-gray-700">Entrada</label>
                  </div>
                  <div className="flex items-center">
                    <input id="form-saida" name="type" type="radio" value="saida" checked={formData.type === 'saida'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida' })} className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"/>
                    <label htmlFor="form-saida" className="ml-3 block text-sm font-medium text-gray-700">Saída</label>
                  </div>
                </div>
              </fieldset>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor</label>
              <input type="color" id="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="mt-1 block w-full h-10"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancelar
            </button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
