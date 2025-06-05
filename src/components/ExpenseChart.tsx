
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/calculations';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#8AAAE5', // Baby blue
  '#10B981', // Success green
  '#F59E0B', // Warning orange
  '#EF4444', // Danger red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-baby-blue/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No expense data available for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-baby-blue/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Expense Breakdown
          <span className="text-sm font-normal text-gray-600 ml-2">
            Total: {formatCurrency(totalExpenses)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => 
                  `${value}: ${formatCurrency(entry.payload?.value || 0)}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
