
import { Transaction, Budget, User } from '@/types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance_transactions',
  BUDGETS: 'finance_budgets',
  USER: 'finance_user'
};

export const storageUtils = {
  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = storageUtils.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    storageUtils.saveTransactions(transactions);
    return newTransaction;
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): void => {
    const transactions = storageUtils.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      storageUtils.saveTransactions(transactions);
    }
  },

  deleteTransaction: (id: string): void => {
    const transactions = storageUtils.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    storageUtils.saveTransactions(filtered);
  },

  // Budgets
  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },

  saveBudgets: (budgets: Budget[]): void => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  updateBudget: (category: string, limit: number, month: string): void => {
    const budgets = storageUtils.getBudgets();
    const existing = budgets.find(b => b.category === category && b.month === month);
    
    if (existing) {
      existing.limit = limit;
    } else {
      budgets.push({
        id: crypto.randomUUID(),
        category,
        limit,
        spent: 0,
        month
      });
    }
    
    storageUtils.saveBudgets(budgets);
  },

  // Export data
  exportData: () => {
    return {
      transactions: storageUtils.getTransactions(),
      budgets: storageUtils.getBudgets(),
      exportDate: new Date().toISOString()
    };
  },

  // Import data
  importData: (data: { transactions: Transaction[], budgets: Budget[] }) => {
    storageUtils.saveTransactions(data.transactions);
    storageUtils.saveBudgets(data.budgets);
  }
};
