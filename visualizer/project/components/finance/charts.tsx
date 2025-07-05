'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Transaction, Budget } from '@/types/finance';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react';

interface ChartsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function Charts({ transactions, budgets }: ChartsProps) {
  const getCategoryColor = (categoryName: string) => {
    const category = PREDEFINED_CATEGORIES.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  // Monthly expenses data
  const getMonthlyExpenses = () => {
    const monthlyData: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
      });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, amount]) => {
        const [year, monthNum] = month.split('-');
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short' });
        return {
          month: monthName,
          amount: Math.round(amount),
        };
      });
  };

  // Category expenses data
  const getCategoryExpenses = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        color: getCategoryColor(category),
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Budget comparison data
  const getBudgetComparison = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long' });

    const currentBudgets = budgets.filter(budget => 
      budget.month === monthName && budget.year === currentYear
    );

    return currentBudgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth &&
                 transactionDate.getFullYear() === currentYear &&
                 t.category === budget.category &&
                 t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: budget.category,
        budget: budget.amount,
        actual: Math.round(spent),
        color: getCategoryColor(budget.category),
      };
    });
  };

  const monthlyExpenses = getMonthlyExpenses();
  const categoryExpenses = getCategoryExpenses();
  const budgetComparison = getBudgetComparison();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Expenses Chart */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  className="transition-all duration-200 hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Pie Chart */}
      <Card className="backdrop-blur-sm bg-background/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-green-500" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryExpenses.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  className="transition-all duration-200"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Budget vs Actual Chart */}
      {budgetComparison.length > 0 && (
        <Card className="backdrop-blur-sm bg-background/80 border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Budget vs Actual Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Budget"
                />
                <Bar 
                  dataKey="actual" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Actual"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}