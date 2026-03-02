import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: parseInt(params.id) },
      include: { platform: true },
    })
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }
    return NextResponse.json(shop)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = await getCurrentUserId()
    const shop = await prisma.shop.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        platformId: parseInt(body.platformId),
        updatedById: userId,
      },
      include: { platform: true },
    })
    return NextResponse.json(shop)
  } catch (error: any) {
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
    await prisma.shop.delete({
      where: { id: parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete shop" }, { status: 500 })
  }
}
