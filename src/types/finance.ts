
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM format
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Transportation',
  'Healthcare',
  'Education',
  'Travel',
  'Insurance',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Bonus',
  'Other'
];
