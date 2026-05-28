import type { Expense, Group } from '@/types';

const GROUPS_KEY = 'xarajat-taqsimlagich.groups';
const EXPENSES_KEY = 'xarajat-taqsimlagich.expenses';

function reviveDate<T extends { date?: Date; createdAt?: Date }>(item: T): T {
  return {
    ...item,
    ...(item.date ? { date: new Date(item.date) } : {}),
    ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
  };
}

export function loadGroups(defaultGroups: Group[]): Group[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return defaultGroups;
    return (JSON.parse(raw) as Group[]).map(reviveDate);
  } catch {
    return defaultGroups;
  }
}

export function loadExpenses(defaultExpenses: Expense[]): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return defaultExpenses;
    return (JSON.parse(raw) as Expense[]).map(reviveDate);
  } catch {
    return defaultExpenses;
  }
}

export function saveGroups(groups: Group[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
