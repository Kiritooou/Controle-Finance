import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Categorias de Entrada
  { id: '1', name: 'Salário', color: '#10B981', type: 'entrada' },
  { id: '2', name: 'Freelance', color: '#059669', type: 'entrada' },
  { id: '3', name: 'Investimentos', color: '#047857', type: 'entrada' },
  { id: '4', name: 'Vendas', color: '#065F46', type: 'entrada' },
  { id: '5', name: 'Outros Ganhos', color: '#064E3B', type: 'entrada' },
  
  // Categorias de Saída
  { id: '6', name: 'Alimentação', color: '#EF4444', type: 'saida' },
  { id: '7', name: 'Transporte', color: '#DC2626', type: 'saida' },
  { id: '8', name: 'Moradia', color: '#B91C1C', type: 'saida' },
  { id: '9', name: 'Saúde', color: '#991B1B', type: 'saida' },
  { id: '10', name: 'Educação', color: '#7F1D1D', type: 'saida' },
  { id: '11', name: 'Entretenimento', color: '#F59E0B', type: 'saida' },
  { id: '12', name: 'Compras', color: '#D97706', type: 'saida' },
  { id: '13', name: 'Contas', color: '#B45309', type: 'saida' },
  { id: '14', name: 'Outros Gastos', color: '#92400E', type: 'saida' }
];
