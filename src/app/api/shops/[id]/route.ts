import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await requireCompany()
    const shop = await prisma.shop.findFirst({
      where: { id: parseInt(params.id), companyId },
      include: { platform: true },
    })
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }
    return NextResponse.json(shop)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, companyId } = await requireCompany()
    const existing = await prisma.shop.findFirst({
      where: { id: parseInt(params.id), companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const body = await request.json()
    const platformId = parseInt(body.platformId)

    // Platform must belong to the current company
    const platform = await prisma.platform.findFirst({
      where: { id: platformId, companyId },
    })
    if (!platform) {
      return NextResponse.json({ error: "ไม่พบแพลตฟอร์ม" }, { status: 400 })
    }

    const shop = await prisma.shop.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        platformId,
        updatedById: userId,
      },
      include: { platform: true },
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
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await requireCompany()
    const existing = await prisma.shop.findFirst({
      where: { id: parseInt(params.id), companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await prisma.shop.delete({
      where: { id: existing.id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 })
  }
}
