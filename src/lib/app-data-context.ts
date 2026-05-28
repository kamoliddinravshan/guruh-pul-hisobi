import { createContext } from 'react';
import type { Debt, Expense, Group, Settlement } from '@/types';

export interface AppDataContextValue {
  groups: Group[];
  expenses: Expense[];
  debts: Debt[];
  settlements: Settlement[];
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
  markDebtPaid: (debt: Debt) => void;
  getGroupById: (groupId: string) => Group | undefined;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
