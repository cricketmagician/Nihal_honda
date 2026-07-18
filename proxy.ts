import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isStaticFile = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')
  
  if (isStaticFile) return NextResponse.next()

  const authCookie = request.cookies.get('auth_user_id')

  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
