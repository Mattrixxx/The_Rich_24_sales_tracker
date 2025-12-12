import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get("platformId")

    const shops = await prisma.shop.findMany({
      where: platformId ? { platformId: parseInt(platformId) } : undefined,
      orderBy: [{ platform: { name: "asc" } }, { name: "asc" }],
      include: {
        platform: true,
      },
    })
    return NextResponse.json(shops)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const shop = await prisma.shop.create({
      data: {
        name: body.name,
        platformId: parseInt(body.platformId),
      },
      include: {
        platform: true,
      },
    })
    return NextResponse.json(shop)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "ร้านค้านี้มีอยู่แล้วในแพลตฟอร์มนี้" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 })
  }
}
