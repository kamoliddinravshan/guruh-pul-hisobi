import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExpense, deleteExpense, listGroupExpenses, updateExpense } from '@/features/expenses/api';
import type { ExpenseDraft } from '@/shared/types';

/**
 * React Query hook for group expenses.
 */
export function useExpense(groupId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['groups', groupId, 'expenses'];

  const expensesQuery = useQuery({
    queryKey,
    queryFn: () => listGroupExpenses(groupId),
    enabled: Boolean(groupId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ExpenseDraft) => createExpense(groupId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: string; payload: Partial<ExpenseDraft> }) =>
      updateExpense(expenseId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { expensesQuery, createMutation, updateMutation, deleteMutation };
}
