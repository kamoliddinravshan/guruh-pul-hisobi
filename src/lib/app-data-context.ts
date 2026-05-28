import { createContext } from 'react';
import type { Debt, Expense, Group } from '@/types';

export interface AppDataContextValue {
  groups: Group[];
  expenses: Expense[];
  debts: Debt[];
  totalExpenses: number;
  totalDebts: number;
  totalMembers: number;
  averageExpense: number;
  isCreateGroupOpen: boolean;
  isExpenseModalOpen: boolean;
  selectedGroup: Group | null;
  formatCurrency: (amount: number) => string;
  openCreateGroup: () => void;
  closeCreateGroup: () => void;
  openExpenseModal: (group?: Group | null) => void;
  closeExpenseModal: () => void;
  handleCreateGroup: (groupData: Omit<Group, 'id' | 'totalExpenses' | 'createdAt'>) => void;
  handleAddExpense: (expenseData: Omit<Expense, 'id' | 'date'>) => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
