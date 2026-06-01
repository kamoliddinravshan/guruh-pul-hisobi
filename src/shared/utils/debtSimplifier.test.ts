import { describe, expect, it } from 'vitest';
import { simplifyDebts } from '@/shared/utils/debtSimplifier';
import type { Expense } from '@/shared/types';

const baseExpense = {
  id: 'expense-1',
  groupId: 'group-1',
  category: 'ovqat',
  splitType: 'equal',
  date: '2026-06-01T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
} satisfies Partial<Expense>;

describe('simplifyDebts', () => {
  it('returns the minimum settlement for a simple equal split', () => {
    const expenses: Expense[] = [
      {
        ...baseExpense,
        id: 'expense-1',
        amount: 300_000,
        description: 'Kechki ovqat',
        paidBy: 'ali',
        splitBetween: [
          { userId: 'ali', share: 100_000 },
          { userId: 'vali', share: 100_000 },
          { userId: 'gani', share: 100_000 },
        ],
      } as Expense,
    ];

    expect(simplifyDebts(expenses)).toEqual([
      { from: 'vali', to: 'ali', amount: 100_000 },
      { from: 'gani', to: 'ali', amount: 100_000 },
    ]);
  });

  it('greedily pairs the largest debtor and creditor', () => {
    const expenses: Expense[] = [
      {
        ...baseExpense,
        id: 'expense-1',
        amount: 600_000,
        description: 'Mehmonxona',
        paidBy: 'ali',
        splitBetween: [
          { userId: 'ali', share: 150_000 },
          { userId: 'vali', share: 150_000 },
          { userId: 'gani', share: 150_000 },
          { userId: 'dilnoza', share: 150_000 },
        ],
      } as Expense,
      {
        ...baseExpense,
        id: 'expense-2',
        amount: 200_000,
        description: 'Taxi',
        paidBy: 'vali',
        splitBetween: [
          { userId: 'ali', share: 100_000 },
          { userId: 'vali', share: 100_000 },
        ],
      } as Expense,
    ];

    expect(simplifyDebts(expenses)).toEqual([
      { from: 'gani', to: 'ali', amount: 150_000 },
      { from: 'dilnoza', to: 'ali', amount: 150_000 },
      { from: 'vali', to: 'ali', amount: 50_000 },
    ]);
  });

  it('ignores already balanced expenses', () => {
    expect(simplifyDebts([])).toEqual([]);
  });
});
