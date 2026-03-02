import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stockIns = await prisma.stockIn.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        createdBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(stockIns)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock-ins" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const productId = parseInt(body.productId)
    const quantity = parseInt(body.quantity)
    const costPerUnit = parseFloat(body.costPerUnit)
    const totalCost = quantity * costPerUnit

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 })
    }

    // Calculate new average cost (weighted average)
    const currentStock = product.stock
    const currentTotalCost = currentStock * product.cost
    const newTotalCost = currentTotalCost + totalCost
    const newStock = currentStock + quantity
    const newAverageCost = newStock > 0 ? newTotalCost / newStock : costPerUnit

    const userId = await getCurrentUserId()

    // Create stock-in record and update product in a transaction
    const [stockIn] = await prisma.$transaction([
      prisma.stockIn.create({
        data: {
          productId,
          quantity,
          costPerUnit,
          totalCost,
          note: body.note || null,
          createdById: userId,
        },
        include: {
          product: true,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          cost: newAverageCost,
        },
      }),
    ])

    return NextResponse.json(stockIn)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create stock-in" }, { status: 500 })
  }
}
