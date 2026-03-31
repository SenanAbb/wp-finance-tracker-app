import { NextRequest, NextResponse } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/auth'];

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ['/', '/transactions', '/analytics', '/accounts'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Obtener token de cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  // Si es ruta pública, permitir acceso
  if (isPublicRoute) {
    // Si el token expiró o es inválido, limpiar cookies y mostrar login
    if (pathname === '/login' && request.nextUrl.searchParams.has('expired')) {
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
    // Si el usuario ya está autenticado y accede a /login, redirigir a /
    if (pathname === '/login' && accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Si es ruta protegida y no hay token, redirigir a login
  if (PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
