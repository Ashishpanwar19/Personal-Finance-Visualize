'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { TransactionForm } from '@/components/finance/transaction-form';
import { TransactionList } from '@/components/finance/transaction-list';
import { SummaryCards } from '@/components/finance/summary-cards';
import { Charts } from '@/components/finance/charts';
import { BudgetManager } from '@/components/finance/budget-manager';
import { Transaction, Budget } from '@/types/finance';
import { getTransactions, getBudgets, deleteTransaction } from '@/lib/storage';
import { Plus, BarChart3, DollarSign, Target, TrendingUp } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadData = () => {
    setTransactions(getTransactions());
    setBudgets(getBudgets());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransactionSubmit = () => {
    loadData();
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    loadData();
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personal Finance Visualizer
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your income, expenses, and budgets with beautiful visualizations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleTransactionSubmit}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 backdrop-blur-sm bg-background/80">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <SummaryCards transactions={transactions} />
            <Charts transactions={transactions} budgets={budgets} />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <BudgetManager
              budgets={budgets}
              transactions={transactions}
              onUpdate={loadData}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Charts transactions={transactions} budgets={budgets} />
              
              {/* Insights Card */}
              <Card className="backdrop-blur-sm bg-background/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Financial Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300">Spending Trend</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {transactions.filter(t => t.type === 'expense').length > 0 
                          ? 'Track your monthly spending patterns'
                          : 'Start adding expenses to see trends'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-300">Savings Rate</h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {transactions.length > 0 
                          ? 'Monitor your income vs expenses'
                          : 'Add transactions to calculate savings'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300">Budget Health</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        {budgets.length > 0 
                          ? 'Stay on track with your budget goals'
                          : 'Set budgets to improve financial discipline'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}