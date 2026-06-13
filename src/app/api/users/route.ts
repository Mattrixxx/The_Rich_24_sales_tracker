import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, getCurrentUserId } from "@/lib/session"
import { hash } from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    const users = await prisma.appUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        companyAccess: { select: { companyId: true } },
      },
    })
    return NextResponse.json(
      users.map(({ companyAccess, ...u }) => ({
        ...u,
        companyIds: companyAccess.map((c) => c.companyId),
      }))
    )
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { username, password, name, role, companyIds } = body

    if (!username || !password || !name) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 })
    }

    const existing = await prisma.appUser.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: "username นี้ถูกใช้งานแล้ว" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)
    const user = await prisma.appUser.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role || "user",
        // admin มีสิทธิ์ทุกบริษัทอยู่แล้ว ไม่ต้องสร้าง UserCompany
        ...(role !== "admin" && Array.isArray(companyIds) && companyIds.length > 0
          ? {
              companyAccess: {
                create: companyIds.map((companyId: number) => ({ companyId })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
