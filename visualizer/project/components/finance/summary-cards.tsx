'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/finance';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const getCategoryExpenses = () => {
    const categoryTotals = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    return topCategory ? { category: topCategory[0], amount: topCategory[1] } : null;
  };

  const topCategory = getCategoryExpenses();

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const recentTransactions = getRecentTransactions();

  const getCategoryColor = (categoryName: string) => {
    const category = PREDEFINED_CATEGORIES.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Income */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className={`h-4 w-4 ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {netBalance >= 0 ? 'Surplus' : 'Deficit'} this month
          </p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <PieChart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {topCategory ? (
            <>
              <div className="text-2xl font-bold">{formatCurrency(topCategory.amount)}</div>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(topCategory.category) }}
                />
                <p className="text-xs text-muted-foreground">{topCategory.category}</p>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No expenses yet</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50 transition-all duration-300 hover:shadow-lg md:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Recent Transactions
          </CardTitle>
          <Badge variant="secondary">{recentTransactions.length}</Badge>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}