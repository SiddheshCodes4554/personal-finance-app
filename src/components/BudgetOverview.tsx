
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Settings, Plus } from 'lucide-react';
import { Transaction, Budget, EXPENSE_CATEGORIES } from '@/types/finance';
import { storageUtils } from '@/utils/storage';
import { calculateBudgetProgress, formatCurrency, getCurrentMonth } from '@/utils/calculations';
import { useToast } from '@/hooks/use-toast';

interface BudgetOverviewProps {
  transactions: Transaction[];
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ transactions }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  const { toast } = useToast();
  const currentMonth = getCurrentMonth();

  useEffect(() => {
    setBudgets(storageUtils.getBudgets());
  }, []);

  const handleAddBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;

    storageUtils.updateBudget(
      newBudget.category,
      parseFloat(newBudget.limit),
      currentMonth
    );
    
    setBudgets(storageUtils.getBudgets());
    setNewBudget({ category: '', limit: '' });
    setShowBudgetForm(false);
    
    toast({
      title: "Success",
      description: "Budget updated successfully!",
    });
  };

  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

  return (
    <Card className="border-baby-blue/20 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Monthly Budget</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBudgetForm(!showBudgetForm)}
          className="h-8 w-8 p-0"
        >
          {showBudgetForm ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showBudgetForm && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget-category" className="text-sm">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget-limit" className="text-sm">Budget Limit (₹)</Label>
                <Input
                  id="budget-limit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
            <Button
              onClick={handleAddBudget}
              className="w-full h-9 bg-baby-blue hover:bg-baby-blue/90 text-white"
              disabled={!newBudget.category || !newBudget.limit}
            >
              Set Budget
            </Button>
          </div>
        )}

        {currentMonthBudgets.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No budgets set for this month. Click the + button to add your first budget!
          </div>
        ) : (
          <div className="space-y-4">
            {currentMonthBudgets.map((budget) => {
              const progress = calculateBudgetProgress(budget, transactions);
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{budget.category}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(progress.spent)} / {formatCurrency(budget.limit)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(progress.percentage, 100)}
                    className="h-2"
                    style={{
                      '--progress-background': progress.isOverBudget ? '#EF4444' : 
                        progress.percentage > 80 ? '#F59E0B' : '#10B981'
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs">
                    <span className={progress.isOverBudget ? 'text-danger' : 'text-gray-500'}>
                      {progress.percentage.toFixed(0)}% used
                    </span>
                    <span className={progress.remaining < 0 ? 'text-danger' : 'text-success'}>
                      {formatCurrency(Math.abs(progress.remaining))} 
                      {progress.remaining < 0 ? ' over' : ' remaining'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
