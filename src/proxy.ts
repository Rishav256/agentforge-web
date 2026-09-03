import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { handleNhostProxy } from './lib/nhost/server';

// Routes accessible without auth
const publicRoutes = ['/', '/signin', '/signup', '/verify', '/verify/error'];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  // Always refresh — even on public routes — so session state stays current
  const session = await handleNhostProxy(request, response);

  if (isPublicRoute) {
    return response;
  }

  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
