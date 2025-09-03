import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateTime = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const getDateRange = (period: string) => {
  const now = new Date();
  
  switch (period) {
    case 'semanal':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
      };
    case 'mensal':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case 'anual':
      return {
        start: startOfYear(now),
        end: endOfYear(now)
      };
    default:
      return null;
  }
};

export const filterTransactionsByPeriod = (transactions: any[], period: string) => {
  if (period === 'todos') return transactions;
  
  const range = getDateRange(period);
  if (!range) return transactions;
  
  return transactions.filter(transaction => 
    isWithinInterval(new Date(transaction.date), range)
  );
};
