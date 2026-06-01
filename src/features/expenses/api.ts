import { apiClient, apiRequest } from '@/shared/api/client';
import type { Expense, ExpenseDraft } from '@/shared/types';

/**
 * Reads all expenses in a group.
 */
export function listGroupExpenses(groupId: string) {
  return apiRequest<Expense[]>(apiClient.get(`/groups/${groupId}/expenses/`));
}

/**
 * Creates a new expense in a group.
 */
export function createExpense(groupId: string, payload: ExpenseDraft) {
  return apiRequest<Expense>(apiClient.post(`/groups/${groupId}/expenses/`, payload));
}

/**
 * Updates an existing expense.
 */
export function updateExpense(expenseId: string, payload: Partial<ExpenseDraft>) {
  return apiRequest<Expense>(apiClient.patch(`/expenses/${expenseId}/`, payload));
}

/**
 * Deletes an expense.
 */
export function deleteExpense(expenseId: string) {
  return apiRequest<{ deleted: boolean }>(apiClient.delete(`/expenses/${expenseId}/`));
}
