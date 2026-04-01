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
  expiresIn?: number;
}

interface RefreshTokenResponse {
  ok: boolean;
  error?: string;
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
      credentials: 'include',
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
      credentials: 'include',
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
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({}),
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
export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
export async function getMe(): Promise<MeResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
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

