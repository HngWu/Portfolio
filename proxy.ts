import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get("admin_session")?.value

  const isTokenValidFormat = Boolean(sessionToken && sessionToken.length >= 32)

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isTokenValidFormat) {
      const loginUrl = new URL("/admin/login", request.url)
      return addSecurityHeaders(NextResponse.redirect(loginUrl))
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
