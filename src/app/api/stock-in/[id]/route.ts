import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const stockIn = await prisma.stockIn.findUnique({
      where: { id },
      include: { product: true },
    })

    if (!stockIn) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 })
    }

    const product = stockIn.product
    const newStock = product.stock - stockIn.quantity

    // Reverse weighted average cost
    const newCost =
      newStock > 0
        ? (product.stock * product.cost - stockIn.totalCost) / newStock
        : product.cost

    await prisma.$transaction([
      prisma.stockIn.delete({ where: { id } }),
      prisma.product.update({
        where: { id: product.id },
        data: { stock: newStock, cost: newCost },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete stock-in" }, { status: 500 })
  }
}
