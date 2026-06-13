import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { requireSession, COMPANY_COOKIE } from "@/lib/session"

export const dynamic = 'force-dynamic'

// POST: switch the active company (validates access before setting the cookie)
export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const role = session.user.role
    const userId = parseInt(session.user.id)

    const body = await request.json()
    const companyId = parseInt(body.companyId)
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid companyId" }, { status: 400 })
    }

    let allowed = false
    let companyName = ""
    if (role === "admin") {
      const company = await prisma.company.findUnique({ where: { id: companyId } })
      if (company) {
        allowed = true
        companyName = company.name
      }
    } else {
      const access = await prisma.userCompany.findUnique({
        where: { userId_companyId: { userId, companyId } },
        include: { company: true },
      })
      if (access) {
        allowed = true
        companyName = access.company.name
      }
    }

    if (!allowed) {
      return NextResponse.json({ error: "No access to this company" }, { status: 403 })
    }

    cookies().set(COMPANY_COOKIE, String(companyId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({ id: companyId, name: companyName })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to switch company" }, { status: 500 })
  }
}
