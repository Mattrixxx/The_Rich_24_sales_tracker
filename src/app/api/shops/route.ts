import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { companyId } = await requireCompany()
    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get("platformId")

    const shops = await prisma.shop.findMany({
      where: {
        companyId,
        ...(platformId ? { platformId: parseInt(platformId) } : {}),
      },
      orderBy: [{ platform: { name: "asc" } }, { name: "asc" }],
      include: {
        platform: true,
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(shops)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const platformId = parseInt(body.platformId)

    // Platform must belong to the current company
    const platform = await prisma.platform.findFirst({
      where: { id: platformId, companyId },
    })
    if (!platform) {
      return NextResponse.json({ error: "ไม่พบแพลตฟอร์ม" }, { status: 400 })
    }

    const shop = await prisma.shop.create({
      data: {
        name: body.name,
        platformId,
        companyId,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        platform: true,
      },
    })
    return NextResponse.json(shop)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "ร้านค้านี้มีอยู่แล้วในแพลตฟอร์มนี้" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 })
  }
}
