import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession, requireAdmin, requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

// GET: companies the current user can access + the active company id
export async function GET() {
  try {
    const session = await requireSession()
    const role = session.user.role
    const userId = parseInt(session.user.id)

    const companies =
      role === "admin"
        ? await prisma.company.findMany({ orderBy: { id: "asc" } })
        : (
            await prisma.userCompany.findMany({
              where: { userId },
              include: { company: true },
              orderBy: { companyId: "asc" },
            })
          ).map((uc) => uc.company)

    let currentId: number | null = null
    try {
      const ctx = await requireCompany()
      currentId = ctx.companyId
    } catch {
      // user has no company access — currentId stays null
    }

    return NextResponse.json({
      companies: companies.map((c) => ({ id: c.id, name: c.name })),
      currentId,
    })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}

// POST: create a company (admin only)
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const name = (body.name || "").trim()
    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อบริษัท" }, { status: 400 })
    }
    const company = await prisma.company.create({ data: { name } })
    return NextResponse.json(company)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "มีบริษัทชื่อนี้อยู่แล้ว" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}
