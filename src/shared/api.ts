const TOKEN_KEY = 'pb-api-token';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export function getApiToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    throw new Error('Sesi belum dapat disimpan di peramban.');
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getApiToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }
  const response = await fetch(path, { ...options, headers, body });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      try {
        setApiToken(null);
      } catch {
        // Preserve the HTTP authorization error when browser storage is blocked.
      }
    }
    const message =
      typeof payload === 'object' && payload !== null && 'detail' in payload &&
      typeof payload.detail === 'string'
        ? payload.detail
        : typeof payload === 'object' && payload !== null && 'error' in payload &&
            typeof payload.error === 'string'
          ? payload.error
          : 'Permintaan belum dapat diproses. Coba lagi.';
    throw new Error(message);
  }
  return payload as T;
}
