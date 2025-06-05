
import { supabase } from '@/integrations/supabase/client';
import { Transaction, Budget } from '@/types/finance';

export const supabaseStorage = {
  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    
    return data?.map(item => ({
      id: item.id,
      amount: parseFloat(item.amount),
      type: item.type as 'income' | 'expense',
      category: item.category,
      date: item.date,
      notes: item.notes || '',
      createdAt: item.created_at
    })) || [];
  },

  addTransaction: async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return null;
    }

    return {
      id: data.id,
      amount: parseFloat(data.amount),
      type: data.type as 'income' | 'expense',
      category: data.category,
      date: data.date,
      notes: data.notes || '',
      createdAt: data.created_at
    };
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<boolean> => {
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: updates.amount,
        type: updates.type,
        category: updates.category,
        date: updates.date,
        notes: updates.notes
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      return false;
    }

    return true;
  },

  deleteTransaction: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }

    return true;
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    
    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
    
    return data?.map(item => ({
      id: item.id,
      category: item.category,
      limit: parseFloat(item.limit_amount),
      spent: 0, // Will be calculated from transactions
      month: item.month
    })) || [];
  },

  updateBudget: async (category: string, limit: number, month: string): Promise<boolean> => {
    const { error } = await supabase
      .from('budgets')
      .upsert({
        category,
        limit_amount: limit,
        month,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      console.error('Error updating budget:', error);
      return false;
    }

    return true;
  }
};
