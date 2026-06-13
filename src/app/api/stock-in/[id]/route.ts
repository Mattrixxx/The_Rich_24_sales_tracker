import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await requireCompany()
    const id = parseInt(params.id)

    const stockIn = await prisma.stockIn.findFirst({
      where: { id, companyId },
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
      prisma.stockIn.delete({ where: { id: stockIn.id } }),
      prisma.product.update({
        where: { id: product.id },
        data: { stock: newStock, cost: newCost },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to delete stock-in" }, { status: 500 })
  }
}
