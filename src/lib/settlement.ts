import type { Debt, Expense, Group, BalanceRow } from '@/types';

export const EPSILON = 0.01;

export function calculateGroupBalances(group: Group, expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};
  group.members.forEach((member) => (balances[member] = 0));

  expenses
    .filter((expense) => expense.groupId === group.id)
    .forEach((expense) => {
      const participants = expense.participants.filter((member) => balances[member] !== undefined);
      if (!participants.length || expense.amount <= 0 || balances[expense.payer] === undefined) return;

      const share = expense.amount / participants.length;
      balances[expense.payer] += expense.amount;
      participants.forEach((participant) => {
        balances[participant] -= share;
      });
    });

  return balances;
}

export function getBalanceRows(group: Group, expenses: Expense[]): BalanceRow[] {
  return group.members.map((member) => {
    const groupExpenses = expenses.filter((expense) => expense.groupId === group.id);
    const paid = groupExpenses.filter((expense) => expense.payer === member).reduce((s, e) => s + e.amount, 0);
    const share = groupExpenses.reduce((sum, expense) => {
      if (!expense.participants.includes(member)) return sum;
      return sum + expense.amount / expense.participants.length;
    }, 0);
    return { member, paid, share, balance: paid - share };
  });
}

export function simplifyDebts(group: Group, expenses: Expense[]): Debt[] {
  const balances = calculateGroupBalances(group, expenses);
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > EPSILON)
    .map(([member, amount]) => ({ member, amount }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -EPSILON)
    .map(([member, amount]) => ({ member, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const result: Debt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > EPSILON) {
      result.push({ from: debtor.member, to: creditor.member, amount: Math.round(amount), groupId: group.id });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= EPSILON) debtorIndex += 1;
    if (creditor.amount <= EPSILON) creditorIndex += 1;
  }

  return result;
}

export function calculateAllDebts(groups: Group[], expenses: Expense[]): Debt[] {
  return groups.flatMap((group) => simplifyDebts(group, expenses));
}

export function formatUZS(value: number): string {
  return `${Math.round(value).toLocaleString('uz-UZ')} so'm`;
}
