import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin-only API routes → return 403 JSON
    const adminOnlyApiPaths = ["/api/users"]
    if (adminOnlyApiPaths.some((p) => pathname.startsWith(p))) {
      if (token?.role !== "admin") {
        return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าใช้งาน" }, { status: 403 })
      }
    }

    // Admin-only page routes → redirect to /unauthorized
    const adminOnlyPagePaths = ["/", "/users"]
    if (adminOnlyPagePaths.some((p) => pathname === p)) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/((?!login|unauthorized|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
