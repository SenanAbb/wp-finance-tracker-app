// ============================================================================
// HTTP Interceptor for Auth
// ============================================================================
// Intercepta requests HTTP para incluir cookies de sesión
// Maneja refresh de sesión automáticamente
// ============================================================================

import { refreshAccessToken } from './client';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Wrapper para fetch que maneja autenticación automáticamente
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Si skipAuth es true, usar fetch normal
  if (skipAuth) {
    return fetch(url, { ...fetchOptions, credentials: 'include' });
  }

  let response = await fetch(url, { ...fetchOptions, credentials: 'include' });

  // Si recibimos 401, intentar refrescar token
  if (response.status === 401) {
    const refreshResult = await refreshAccessToken();
    if (!refreshResult.ok) return response;

    response = await fetch(url, { ...fetchOptions, credentials: 'include' });
  }

  return response;
}

/**
 * Wrapper para fetch que es más fácil de usar
 * Retorna JSON automáticamente
 */
export async function apiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}
