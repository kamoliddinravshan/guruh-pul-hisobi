import { create } from 'zustand';
import type { Expense, ExpenseDraft, Settlement, Transaction } from '@/shared/types';

interface ExpenseState {
  expenses: Expense[];
  settlements: Settlement[];
  computedSettlements: Transaction[];
  isAddExpenseOpen: boolean;
  selectedGroupId: string | null;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;
  setComputedSettlements: (settlements: Transaction[]) => void;
  markSettled: (settlement: Settlement) => void;
  openAddExpense: (groupId: string) => void;
  closeAddExpense: () => void;
  createOptimisticExpense: (groupId: string, draft: ExpenseDraft) => Expense;
}

/**
 * Global expense slice for optimistic UI updates and modal state.
 */
export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  settlements: [],
  computedSettlements: [],
  isAddExpenseOpen: false,
  selectedGroupId: null,
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpense: (expense) =>
    set((state) => ({
      expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
    })),
  removeExpense: (expenseId) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== expenseId),
    })),
  setComputedSettlements: (computedSettlements) => set({ computedSettlements }),
  markSettled: (settlement) => set((state) => ({ settlements: [settlement, ...state.settlements] })),
  openAddExpense: (groupId) => set({ selectedGroupId: groupId, isAddExpenseOpen: true }),
  closeAddExpense: () => set({ selectedGroupId: null, isAddExpenseOpen: false }),
  createOptimisticExpense: (groupId, draft) => ({
    ...draft,
    id: `optimistic-${Date.now()}`,
    groupId,
    createdAt: new Date().toISOString(),
  }),
}));
