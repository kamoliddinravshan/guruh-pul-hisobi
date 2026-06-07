import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExpenseStore } from '@/stores/expenseStore';
import type { Expense, ExpenseDraft } from '@/shared/types';

const expense: Expense = {
  id: 'expense-1',
  groupId: 'group-1',
  amount: 100_000,
  description: 'Taxi',
  category: 'transport',
  paidBy: 'ali',
  splitBetween: [{ userId: 'ali', share: 100_000 }],
  splitType: 'equal',
  date: '2026-06-04T00:00:00.000Z',
  createdAt: '2026-06-04T00:00:00.000Z',
};

describe('expenseStore', () => {
  beforeEach(() => {
    useExpenseStore.setState({
      expenses: [],
      settlements: [],
      computedSettlements: [],
      isAddExpenseOpen: false,
      selectedGroupId: null,
    });
  });

  it('adds, updates and removes expenses', () => {
    useExpenseStore.getState().addExpense(expense);
    expect(useExpenseStore.getState().expenses).toHaveLength(1);

    useExpenseStore.getState().updateExpense({ ...expense, amount: 150_000 });
    expect(useExpenseStore.getState().expenses[0].amount).toBe(150_000);

    useExpenseStore.getState().removeExpense(expense.id);
    expect(useExpenseStore.getState().expenses).toHaveLength(0);
  });

  it('tracks add expense modal state', () => {
    useExpenseStore.getState().openAddExpense('group-1');
    expect(useExpenseStore.getState().isAddExpenseOpen).toBe(true);
    expect(useExpenseStore.getState().selectedGroupId).toBe('group-1');

    useExpenseStore.getState().closeAddExpense();
    expect(useExpenseStore.getState().isAddExpenseOpen).toBe(false);
    expect(useExpenseStore.getState().selectedGroupId).toBeNull();
  });

  it('creates optimistic expenses for immediate UI updates', () => {
    vi.setSystemTime(new Date('2026-06-04T12:00:00.000Z'));
    const draft: ExpenseDraft = {
      amount: 75_000,
      description: 'Tushlik',
      category: 'food',
      paidBy: 'ali',
      splitBetween: [{ userId: 'ali', share: 75_000 }],
      splitType: 'equal',
      date: '2026-06-04T00:00:00.000Z',
    };

    const optimistic = useExpenseStore.getState().createOptimisticExpense('group-1', draft);

    expect(optimistic.id).toMatch(/^optimistic-/);
    expect(optimistic.groupId).toBe('group-1');
    expect(optimistic.createdAt).toBe('2026-06-04T12:00:00.000Z');
    vi.useRealTimers();
  });
});
