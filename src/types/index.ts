export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'entrada' | 'saida';
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'entrada' | 'saida' | 'both';
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  completed: boolean;
  completedAt?: string;
}

export interface FilterType {
  type: 'todos' | 'entrada' | 'saida';
  period: 'todos' | 'semanal' | 'mensal' | 'anual';
}
