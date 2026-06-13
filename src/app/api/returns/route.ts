import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { companyId } = await requireCompany()
    const returns = await prisma.productReturn.findMany({
      where: { companyId },
      include: {
        product: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(returns)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    console.error("Failed to fetch returns:", error)
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const { productId, quantity, amount, returnToStock, reason, note } = body

    // Product must belong to the current company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
    })
    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 })
    }

    const productReturn = await prisma.productReturn.create({
      data: {
        productId,
        quantity,
        amount,
        returnToStock: returnToStock ?? true,
        reason,
        note,
        companyId,
        createdById: userId,
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
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    console.error("Failed to create return:", error)
    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    )
  }
}
