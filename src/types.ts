export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  currency: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id?: number;
  amount: number;
  date: string;
  description?: string;
  type: 'income' | 'expense' | 'transfer';
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  account_name?: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount_limit: number;
  period: string;
  category_name?: string;
  category_color?: string;
  current_spent?: number;
}

export interface FinancialGoal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  status: 'in_progress' | 'completed' | 'paused';
}

export interface Summary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  recentTransactions: Transaction[];
}
