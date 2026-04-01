import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnProfile = req.nextUrl.pathname.startsWith('/profile')
  const isOnLogs = req.nextUrl.pathname.startsWith('/logs')
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')

  const isProtectedRoute = isOnDashboard || isOnProfile || isOnLogs || isOnAdmin

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
