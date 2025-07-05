'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Budget, Transaction } from '@/types/finance';
import { PREDEFINED_CATEGORIES, MONTHS } from '@/lib/constants';
import { addBudget, deleteBudget } from '@/lib/storage';
import { Target, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdate: () => void;
}

export function BudgetManager({ budgets, transactions, onUpdate }: BudgetManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear(),
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) return;

    addBudget({
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: MONTHS[parseInt(formData.month)],
      year: formData.year,
    });

    setFormData({
      category: '',
      amount: '',
      month: currentMonth.toString(),
      year: currentYear,
    });
    setShowForm(false);
    onUpdate();
  };

  const getCurrentMonthBudgets = () => {
    return budgets.filter(budget => 
      budget.month === MONTHS[currentMonth] && budget.year === currentYear
    );
  };

  const getSpentAmount = (category: string) => {
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear &&
             transaction.category === category &&
             transaction.type === 'expense';
    });

    return currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = PREDEFINED_CATEGORIES.find(cat => cat.name === categoryName);
    return category?.color || '#6b7280';
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const currentMonthBudgets = getCurrentMonthBudgets();
  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = currentMonthBudgets.reduce((sum, budget) => sum + getSpentAmount(budget.category), 0);

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-background/80 border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Budget Manager
              <Badge variant="secondary">
                {MONTHS[currentMonth]} {currentYear}
              </Badge>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="transition-all duration-200 hover:scale-105"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.filter(cat => cat.name !== 'Income').map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Budget Amount ($)</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-month">Month</Label>
                  <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Budget
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {currentMonthBudgets.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No budgets set for this month</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start by adding your first budget to track your spending
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Budget Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Monthly Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">${totalBudget.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${(totalBudget - totalSpent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(totalBudget - totalSpent).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>

              {/* Individual Budget Progress */}
              <div className="space-y-4">
                {currentMonthBudgets.map((budget) => {
                  const spent = getSpentAmount(budget.category);
                  const remaining = budget.amount - spent;
                  const percentage = (spent / budget.amount) * 100;
                  const isOverBudget = spent > budget.amount;

                  return (
                    <div key={budget.id} className="p-4 border rounded-lg bg-card/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: getCategoryColor(budget.category) }}
                          />
                          <h4 className="font-medium">{budget.category}</h4>
                          {isOverBudget && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteBudget(budget.id);
                            onUpdate();
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: ${spent.toFixed(2)}</span>
                          <span>Budget: ${budget.amount.toFixed(2)}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(spent, budget.amount)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverBudget ? 'Over' : 'Remaining'}: ${Math.abs(remaining).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% used
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}