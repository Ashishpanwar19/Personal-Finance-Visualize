import { Transaction, Budget } from '@/types/finance';

const TRANSACTIONS_KEY = 'finance-transactions';
const BUDGETS_KEY = 'finance-budgets';

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getBudgets = (): Budget[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BUDGETS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBudgets = (budgets: Budget[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
    return transactions[index];
  }
  return null;
};

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
};

export const addBudget = (budget: Omit<Budget, 'id'>) => {
  const budgets = getBudgets();
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString(),
  };
  budgets.push(newBudget);
  saveBudgets(budgets);
  return newBudget;
};

export const updateBudget = (id: string, updates: Partial<Budget>) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updates };
    saveBudgets(budgets);
    return budgets[index];
  }
  return null;
};

export const deleteBudget = (id: string) => {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  saveBudgets(filtered);
};