import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(platforms)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const platform = await prisma.platform.create({
      data: {
        name: body.name,
      },
    })
    return NextResponse.json(platform)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 })
  }
}
