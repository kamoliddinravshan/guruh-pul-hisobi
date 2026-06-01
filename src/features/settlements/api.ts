import { apiClient, apiRequest } from '@/shared/api/client';
import type { Settlement, Transaction } from '@/shared/types';

export interface SuggestedSettlement {
  from: unknown;
  to: unknown;
  amount: string;
}

/** Read simplified debt transactions for a group. */
export function listSuggestedSettlements(groupId: string) {
  return apiRequest<{ transactions: SuggestedSettlement[] }>(apiClient.get(`/groups/${groupId}/settlements/`));
}

/** Read settlement payment history. */
export function listSettlementHistory(groupId: string) {
  return apiRequest<Settlement[]>(apiClient.get(`/groups/${groupId}/history/`));
}

/** Record one settlement payment. */
export function settle(groupId: string, payload: { paid_to_id: string; amount: number; note?: string }) {
  return apiRequest<Settlement>(apiClient.post(`/groups/${groupId}/settle/`, payload));
}

/** Frontend-only transaction type adapter for Zustand selectors. */
export function toTransaction(item: { from: { id: string }; to: { id: string }; amount: string }): Transaction {
  return { from: item.from.id, to: item.to.id, amount: Number(item.amount) };
}
