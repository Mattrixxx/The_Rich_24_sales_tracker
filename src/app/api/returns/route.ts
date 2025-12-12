import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const returns = await prisma.productReturn.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(returns)
  } catch (error) {
    console.error("Failed to fetch returns:", error)
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity, amount, returnToStock, reason, note } = body

    // Create return record
    const productReturn = await prisma.productReturn.create({
      data: {
        productId,
        quantity,
        amount,
        returnToStock: returnToStock ?? true,
        reason,
        note,
      },
      include: { product: true },
    })

    // If returnToStock is true, add quantity back to product stock
    if (returnToStock) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      })
    }

    return NextResponse.json(productReturn, { status: 201 })
  } catch (error) {
    console.error("Failed to create return:", error)
    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    )
  }
}
