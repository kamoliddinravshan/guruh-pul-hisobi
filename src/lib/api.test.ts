import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_KEY } from '@/lib/auth-context';

describe('formatApiError', () => {
  it('turns DRF field errors into readable text', async () => {
    const { formatApiError } = await import('@/lib/api');

    expect(formatApiError({
      password: [
        'This password is too short.',
        'This password is too common.',
      ],
    })).toBe('password: This password is too short. This password is too common.');
  });

  it('uses detail without field prefix', async () => {
    const { formatApiError } = await import('@/lib/api');

    expect(formatApiError({ detail: 'Authentication credentials were not provided.' }))
      .toBe('Authentication credentials were not provided.');
  });
});

describe('apiRequest', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.stubGlobal('window', {
      location: {
        protocol: 'http:',
        hostname: '172.25.82.115',
      },
    });
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => key === AUTH_KEY ? JSON.stringify({ access: 'access-token' }) : null),
    });
  });

  it('unwraps successful API envelopes and sends bearer token', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'group-1' },
        error: null,
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { apiRequest } = await import('@/lib/api');

    await expect(apiRequest('/groups/')).resolves.toEqual({ id: 'group-1' });
    expect(fetchMock).toHaveBeenCalledWith('http://172.25.82.115:8000/api/v1/groups/', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-token' }),
    }));
  });

  it('throws readable messages for DRF validation errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      json: async () => ({
        success: false,
        data: null,
        error: { email: ['custom user with this email already exists.'] },
      }),
    })));
    const { apiRequest } = await import('@/lib/api');

    await expect(apiRequest('/auth/register/')).rejects.toThrow('email: custom user with this email already exists.');
  });
});
