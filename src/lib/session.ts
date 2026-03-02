import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
