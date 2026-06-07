import { AUTH_KEY } from '@/lib/auth-context';

function getApiBaseUrls() {
  if (import.meta.env.VITE_API_URL) return [import.meta.env.VITE_API_URL];
  if (typeof window === 'undefined') return ['http://localhost:8000/api/v1'];
  return [
    `${window.location.protocol}//${window.location.hostname}:8000/api/v1`,
  ];
}

const API_BASE_URLS = getApiBaseUrls();

export function formatApiError(error: unknown): string {
  if (!error) return 'Server bilan aloqa qilishda xatolik yuz berdi';
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) return error.map(formatApiError).join(' ');
  if (typeof error === 'object') {
    return Object.entries(error)
      .map(([field, value]) => {
        const message = formatApiError(value);
        return field === 'non_field_errors' || field === 'detail' ? message : `${field}: ${message}`;
      })
      .join(' ');
  }
  return String(error);
}

function getAuthToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).access : null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let lastNetworkError: unknown;

  for (const baseUrl of API_BASE_URLS) {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      lastNetworkError = error;
      continue;
    }

    const envelope = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(formatApiError(envelope.error || envelope.detail || envelope));
    }

    if (typeof envelope.success === 'boolean') {
      if (!envelope.success) throw new Error(formatApiError(envelope.error));
      return envelope.data as T;
    }

    return envelope as T;
  }

  const checkedUrls = API_BASE_URLS.join(', ');
  if (lastNetworkError) {
    throw new Error(`Serverga ulanib bo'lmadi. Backend quyidagi manzillardan birida ishlayotganini tekshiring: ${checkedUrls}`);
  }

  throw new Error('Server bilan aloqa qilishda xatolik yuz berdi');
}
