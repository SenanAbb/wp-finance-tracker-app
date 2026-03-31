// ============================================================================
// Auth Client
// ============================================================================
// Funciones para interactuar con los endpoints de autenticación
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestLoginResponse {
  ok: boolean;
  error?: string;
  expiresIn?: number;
  otp?: string; // Solo en desarrollo
}

interface VerifyOTPResponse {
  ok: boolean;
  error?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface RefreshTokenResponse {
  ok: boolean;
  error?: string;
  accessToken?: string;
  expiresIn?: number;
}

interface LogoutResponse {
  ok: boolean;
  error?: string;
}

interface MeResponse {
  ok: boolean;
  error?: string;
  userId?: string;
  phone?: string;
  sessionId?: string;
}

/**
 * Solicita un OTP para login por teléfono
 */
export async function requestLogin(phone: string): Promise<RequestLoginResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/request-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { ok: false, error: data.error || 'Failed to request login' };
    }

    return await response.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Verifica un OTP e inicia sesión
 */
export async function verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to verify OTP' };
    }

    return data;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Refresca un Access Token usando un Refresh Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { ok: false, error: data.error || 'Failed to refresh token' };
    }

    return await response.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Logout: revoca la sesión actual
 */
export async function logout(accessToken: string): Promise<LogoutResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { ok: false, error: data.error || 'Failed to logout' };
    }

    return await response.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Obtiene información del usuario actual
 */
export async function getMe(accessToken: string): Promise<MeResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { ok: false, error: data.error || 'Failed to get user info' };
    }

    return await response.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Obtiene el Access Token almacenado (desde localStorage o cookies)
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Intentar obtener de localStorage primero (para compatibilidad)
  return localStorage.getItem('accessToken');
}

/**
 * Obtiene el Refresh Token almacenado (desde localStorage o cookies)
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Intentar obtener de localStorage primero (para compatibilidad)
  return localStorage.getItem('refreshToken');
}

/**
 * Almacena los tokens en localStorage y cookies
 */
export function setStoredTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  
  // Guardar en localStorage
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Guardar en cookies para que el middleware pueda acceder
  // Access token: expira en 1 hora
  document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
  // Refresh token: expira en 7 días
  document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;
}

/**
 * Limpia los tokens almacenados
 */
export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  
  // Limpiar localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Limpiar cookies
  document.cookie = 'accessToken=; path=/; max-age=0';
  document.cookie = 'refreshToken=; path=/; max-age=0';
}

/**
 * Verifica si hay un token válido almacenado
 */
export function hasValidToken(): boolean {
  const token = getStoredAccessToken();
  return !!token;
}
