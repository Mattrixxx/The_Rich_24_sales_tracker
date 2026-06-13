import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { companyId } = await requireCompany()
    const platforms = await prisma.platform.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(platforms)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const platform = await prisma.platform.create({
      data: {
        name: body.name,
        companyId,
        createdById: userId,
        updatedById: userId,
      },
    })
    return NextResponse.json(platform)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "มีแพลตฟอร์มชื่อนี้อยู่แล้ว" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 })
  }
}
