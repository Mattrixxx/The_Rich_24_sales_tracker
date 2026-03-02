import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = await getCurrentUserId()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        cost: parseFloat(body.cost),
        price: parseFloat(body.price),
        createdById: userId,
        updatedById: userId,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
