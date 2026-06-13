import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { companyId } = await requireCompany()
    const stockIns = await prisma.stockIn.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        createdBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(stockIns)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch stock-ins" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const productId = parseInt(body.productId)
    const quantity = parseInt(body.quantity)
    const costPerUnit = parseFloat(body.costPerUnit)
    const totalCost = quantity * costPerUnit

    // Product must belong to the current company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
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

    // Create stock-in record and update product in a transaction
    const [stockIn] = await prisma.$transaction([
      prisma.stockIn.create({
        data: {
          productId,
          quantity,
          costPerUnit,
          totalCost,
          note: body.note || null,
          companyId,
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
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to create stock-in" }, { status: 500 })
  }
}
