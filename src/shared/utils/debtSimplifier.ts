import type { Expense, Transaction } from '@/shared/types';

/**
 * Computes minimum settlement transactions using the Greedy Minimum Cash Flow algorithm.
 *
 * Complexity is dominated by sorting creditor/debtor lists. It is fast enough for groups
 * up to 50 members because each loop settles at least one participant.
 */
export function simplifyDebts(expenses: Expense[]): Transaction[] {
  const balances: Record<string, number> = {};

  for (const expense of expenses) {
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

    for (const split of expense.splitBetween) {
      balances[split.userId] = (balances[split.userId] || 0) - split.share;
    }
  }

  const creditors = Object.entries(balances).filter(([, balance]) => balance > 0.01);
  const debtors = Object.entries(balances).filter(([, balance]) => balance < -0.01);
  const transactions: Transaction[] = [];

  while (creditors.length && debtors.length) {
    creditors.sort((left, right) => right[1] - left[1]);
    debtors.sort((left, right) => left[1] - right[1]);

    const amount = Math.min(creditors[0][1], -debtors[0][1]);

    transactions.push({
      from: debtors[0][0],
      to: creditors[0][0],
      amount: Math.round(amount),
    });

    creditors[0][1] -= amount;
    debtors[0][1] += amount;

    if (creditors[0][1] < 0.01) creditors.shift();
    if (debtors[0][1] > -0.01) debtors.shift();
  }

  return transactions;
}
