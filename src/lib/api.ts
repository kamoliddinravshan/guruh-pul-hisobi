import { AUTH_KEY } from '@/lib/auth-context';

function getApiBaseUrls() {
  if (import.meta.env.VITE_API_URL) return [import.meta.env.VITE_API_URL];
  return [
    `${window.location.protocol}//${window.location.hostname}:5000/api`,
    `${window.location.protocol}//${window.location.hostname}:5050/api`,
    `${window.location.protocol}//${window.location.hostname}:8000/api`,
  ];
}

const API_BASE_URLS = getApiBaseUrls();

function getAuthToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).token : null;
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

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Server bilan aloqa qilishda xatolik yuz berdi');
    }

    return data as T;
  }

  const checkedUrls = API_BASE_URLS.join(', ');
  if (lastNetworkError) {
    throw new Error(`Serverga ulanib bo'lmadi. Backend quyidagi manzillardan birida ishlayotganini tekshiring: ${checkedUrls}`);
  }

  throw new Error('Server bilan aloqa qilishda xatolik yuz berdi');
}
