import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const role = token?.role as string | undefined

    // If role is not yet in token (edge case on first OAuth login), let it through
    if (!role) return NextResponse.next()

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // Doctor trying to access patient dashboard → redirect to doctor dashboard
    if (pathname.startsWith('/patient-dashboard') && role === 'doctor') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Patient trying to access doctor dashboard → redirect to patient dashboard
    if (pathname.startsWith('/dashboard') && role === 'patient') {
      return NextResponse.redirect(new URL('/patient-dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Redirect to /login if no valid JWT token
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/patient-dashboard/:path*',
    '/disease-prediction/:path*',
    '/consult-doctor/:path*',
    '/buy-medicine/:path*',
    '/pathology/:path*',
    '/health-policy/:path*',
    '/knowledge-center/:path*',
  ],
}
