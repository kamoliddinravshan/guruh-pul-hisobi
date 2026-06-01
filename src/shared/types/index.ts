export type CurrencyCode = 'UZS';
export type SplitType = 'equal' | 'percent' | 'exact';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  createdBy: string;
  currency: CurrencyCode;
  createdAt: string;
}

export interface ExpenseSplit {
  userId: string;
  share: number;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  splitBetween: ExpenseSplit[];
  splitType: SplitType;
  date: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  settledAt: string;
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface ExpenseDraft {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  splitBetween: ExpenseSplit[];
  splitType: SplitType;
  date: string;
}
