import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface MeResponse {
  ok: boolean
  error?: string
  userId?: string
  phone?: string
  sessionId?: string
}

/**
 * Obtiene el userId del usuario autenticado desde la cookie accessToken.
 * Llama a /auth/me en el API para validar el token.
 * Si no hay sesión válida, redirige a /login.
 */
export async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    redirect('/login?expired=1')
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    redirect('/login?expired=1')
  }

  const data: MeResponse = await res.json()

  if (!data.ok || !data.userId) {
    redirect('/login?expired=1')
  }

  return data.userId
}
