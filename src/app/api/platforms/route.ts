import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(platforms)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = await getCurrentUserId()
    const platform = await prisma.platform.create({
      data: {
        name: body.name,
        createdById: userId,
        updatedById: userId,
      },
    })
    return NextResponse.json(platform)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 })
  }
}
