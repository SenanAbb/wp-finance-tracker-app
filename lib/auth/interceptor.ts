// ============================================================================
// HTTP Interceptor for Auth
// ============================================================================
// Intercepta requests HTTP para agregar Authorization header
// Maneja refresh de tokens automáticamente
// ============================================================================

import { refreshAccessToken, getStoredAccessToken, getStoredRefreshToken, setStoredTokens, clearStoredTokens } from './client';

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
    return fetch(url, fetchOptions);
  }

  // Obtener token actual
  let accessToken = getStoredAccessToken();

  // Si no hay token, retornar 401
  if (!accessToken) {
    const response = new Response(JSON.stringify({ ok: false, error: 'No token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
    return response;
  }

  // Agregar Authorization header
  const headers = new Headers(fetchOptions.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Si recibimos 401, intentar refrescar token
  if (response.status === 401) {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredTokens();
      return response;
    }

    // Intentar refrescar
    const refreshResult = await refreshAccessToken(refreshToken);
    if (!refreshResult.ok || !refreshResult.accessToken) {
      clearStoredTokens();
      return response;
    }

    // Guardar nuevo token
    setStoredTokens(refreshResult.accessToken, refreshToken);

    // Reintentar request original con nuevo token
    const newHeaders = new Headers(fetchOptions.headers);
    newHeaders.set('Authorization', `Bearer ${refreshResult.accessToken}`);

    response = await fetch(url, {
      ...fetchOptions,
      headers: newHeaders,
    });
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
