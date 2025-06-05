
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, TrendingUp, TrendingDown, DollarSign, LogOut } from 'lucide-react';
import { supabaseStorage } from '@/utils/supabaseStorage';
import { calculateTotals, formatCurrency, getCurrentMonth } from '@/utils/calculations';
import { Transaction } from '@/types/finance';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { BudgetOverview } from './BudgetOverview';
import { ExpenseChart } from './ExpenseChart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
// Add this import at the top of the file
import * as XLSX from 'xlsx';

export const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await supabaseStorage.getTransactions();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction = await supabaseStorage.addTransaction(transactionData);
    if (newTransaction) {
      setTransactions([newTransaction, ...transactions]);
      setShowTransactionForm(false);
      toast({
        title: "Success",
        description: "Transaction added successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleUpdateTransaction = async (updates: Partial<Transaction>) => {
    if (editingTransaction) {
      const success = await supabaseStorage.updateTransaction(editingTransaction.id, updates);
      if (success) {
        await loadTransactions();
        setShowTransactionForm(false);
        setEditingTransaction(null);
        toast({
          title: "Success",
          description: "Transaction updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update transaction",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const success = await supabaseStorage.deleteTransaction(id);
    if (success) {
      setTransactions(transactions.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Success",
      description: "Signed out successfully!",
    });
  };

  const handleExportData = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Format transactions for the transactions sheet
    const transactionData = transactions.map(t => ({
      'Date': new Date(t.date).toLocaleDateString(),
      'Type': t.type.charAt(0).toUpperCase() + t.type.slice(1),
      'Category': t.category,
      'Amount': t.amount,
      'Notes': t.notes || ''
    }));
    
    // Create transactions worksheet
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionData);
    
    // Apply some styling to the transactions sheet
    const transactionsCols = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 20 }, // Category
      { wch: 12 }, // Amount
      { wch: 30 }  // Notes
    ];
    transactionsSheet['!cols'] = transactionsCols;
    
    // Add transactions sheet to workbook
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    
    // Create summary sheet with totals
    const { totalIncome, totalExpenses, netBalance } = calculateTotals(transactions);
    const summaryData = [
      { 'Summary': 'Total Income', 'Amount': totalIncome },
      { 'Summary': 'Total Expenses', 'Amount': totalExpenses },
      { 'Summary': 'Net Balance', 'Amount': netBalance }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Create category breakdown sheet
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      'Category': category,
      'Total Spent': amount
    }));
    
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
    
    // Generate Excel file
    const currentMonth = getCurrentMonth();
    const fileName = `finance-data-${currentMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Success",
      description: "Data exported to Excel successfully!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-baby-blue/10 to-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const { totalIncome, totalExpenses, netBalance } = calculateTotals(transactions);
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(getCurrentMonth())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-baby-blue/10 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTransactionForm(true)}
              className="bg-baby-blue hover:bg-baby-blue/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              onClick={handleExportData}
              className="border-baby-blue text-baby-blue hover:bg-baby-blue hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-baby-blue/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-baby-blue/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-baby-blue/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Net Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-baby-blue" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(netBalance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart transactions={currentMonthTransactions} />
          <BudgetOverview transactions={transactions} />
        </div>

        {/* Recent Transactions */}
        <TransactionList 
          transactions={transactions.slice(0, 10)}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          title="Recent Transactions"
        />

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            onClose={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
