function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
}

const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(`Serverga ulanib bo'lmadi. Backend ${API_BASE_URL} manzilida ishga tushganini tekshiring.`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Server bilan aloqa qilishda xatolik yuz berdi');
  }

  return data as T;
}
