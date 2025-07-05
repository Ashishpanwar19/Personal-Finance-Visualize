export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
  year: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
}

export interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  color: string;
}