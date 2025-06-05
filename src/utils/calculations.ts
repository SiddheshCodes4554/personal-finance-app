
import { Transaction, Budget } from '@/types/finance';

export const calculateTotals = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses
  };
};

export const getMonthlySpending = (transactions: Transaction[], month: string) => {
  return transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
};

export const calculateBudgetProgress = (budget: Budget, transactions: Transaction[]) => {
  const spent = transactions
    .filter(t => 
      t.type === 'expense' && 
      t.category === budget.category && 
      t.date.startsWith(budget.month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
  
  const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  
  return {
    spent,
    percentage,
    remaining: budget.limit - spent,
    isOverBudget: spent > budget.limit
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};
