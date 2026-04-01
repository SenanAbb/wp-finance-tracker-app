import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && /localhost|127\.0\.0\.1/.test(envUrl)) return envUrl
  return '/api'
})()

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

  const absoluteUrl = await (async () => {
    if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
      return `${API_URL}/auth/me`
    }

    const h = await headers()
    const host = h.get('x-forwarded-host') || h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    return `${proto}://${host}${API_URL}/auth/me`
  })()

  const res = await fetch(absoluteUrl, {
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
