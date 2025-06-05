
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  title?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  title = "Transactions"
}) => {
  if (transactions.length === 0) {
    return (
      <Card className="border-baby-blue/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Add your first transaction to get started!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-baby-blue/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {transaction.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  {transaction.notes && (
                    <div className="text-xs text-gray-400 mt-1">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success' : 'text-danger'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      transaction.type === 'income'
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {transaction.type}
                  </Badge>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8 p-0 hover:bg-baby-blue/10"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 p-0 hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
