import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const COMPANY_COOKIE = "company_id"

export type CompanyContext = {
  userId: number
  role: string
  companyId: number
}

/**
 * Get the current logged-in user's ID (as number) from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return parseInt(session.user.id)
}

/**
 * Get the current session. Throws 401 error response if not authenticated.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

/**
 * Check if current user is admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("UNAUTHORIZED")
  if (session.user.role !== "admin") throw new Error("FORBIDDEN")
  return session
}

/**
 * Resolve the current company context for the request.
 * The company comes from the "company_id" cookie but is never trusted alone —
 * access is re-validated against UserCompany (admins have implicit access to
 * every company). Falls back to the first accessible company when the cookie
 * is missing or invalid.
 *
 * Throws "UNAUTHORIZED" when not logged in, "NO_COMPANY_ACCESS" when the user
 * has no accessible company at all (routes should map this to 403).
 */
export async function requireCompany(): Promise<CompanyContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("UNAUTHORIZED")
  const userId = parseInt(session.user.id)
  const role = session.user.role

  const cookieVal = cookies().get(COMPANY_COOKIE)?.value
  const requested = cookieVal ? parseInt(cookieVal) : NaN

  if (!isNaN(requested)) {
    if (role === "admin") {
      const exists = await prisma.company.findUnique({ where: { id: requested } })
      if (exists) return { userId, role, companyId: requested }
    } else {
      const access = await prisma.userCompany.findUnique({
        where: { userId_companyId: { userId, companyId: requested } },
      })
      if (access) return { userId, role, companyId: requested }
    }
  }

  // Fallback: first accessible company (missing/invalid cookie)
  if (role === "admin") {
    const first = await prisma.company.findFirst({ orderBy: { id: "asc" } })
    if (first) return { userId, role, companyId: first.id }
  } else {
    const first = await prisma.userCompany.findFirst({
      where: { userId },
      orderBy: { companyId: "asc" },
    })
    if (first) return { userId, role, companyId: first.companyId }
  }
  throw new Error("NO_COMPANY_ACCESS")
}
