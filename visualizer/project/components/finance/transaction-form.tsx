'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { addTransaction, updateTransaction } from '@/lib/storage';
import { Plus, Edit3, X } from 'lucide-react';

interface TransactionFormProps {
  transaction: Transaction | null;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    description: transaction?.description || '',
    category: transaction?.category || '',
    type: transaction?.type || 'expense' as 'income' | 'expense',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const transactionData = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description.trim(),
      category: formData.category,
      type: formData.type,
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onSubmit();
  };

  const handleReset = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      type: 'expense',
    });
    setErrors({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm bg-background/80 border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          {transaction ? (
            <>
              <Edit3 className="h-5 w-5 text-blue-500" />
              Edit Transaction
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-green-500" />
              Add New Transaction
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`transition-all duration-200 ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`transition-all duration-200 ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`transition-all duration-200 resize-none ${errors.description ? 'border-red-500' : ''}`}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className={`transition-all duration-200 ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_CATEGORIES.map((category) => (
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
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Expense
                    </div>
                  </SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Income
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              className="transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Reset
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onCancel}
                className="transition-all duration-200 hover:scale-105"
                size="lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}