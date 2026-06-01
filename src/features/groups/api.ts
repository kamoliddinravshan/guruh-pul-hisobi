import { apiClient, apiRequest } from '@/shared/api/client';
import type { Group } from '@/shared/types';

export interface CreateGroupPayload {
  name: string;
  description?: string;
  currency?: 'UZS';
}

/** List groups for the authenticated user. */
export function listGroups() {
  return apiRequest<Group[]>(apiClient.get('/groups/'));
}

/** Create a group and make current user admin. */
export function createGroup(payload: CreateGroupPayload) {
  return apiRequest<Group>(apiClient.post('/groups/', payload));
}

/** Join a group with invite code. */
export function joinGroup(code: string) {
  return apiRequest<Group>(apiClient.post(`/groups/join/${code}/`));
}
