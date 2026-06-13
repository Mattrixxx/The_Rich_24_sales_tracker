import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await requireCompany()
    const { id } = await params
    const productReturn = await prisma.productReturn.findFirst({
      where: { id: parseInt(id), companyId },
      include: { product: true },
    })
    if (!productReturn) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(productReturn)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    console.error("Failed to fetch return:", error)
    return NextResponse.json(
      { error: "Failed to fetch return" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await requireCompany()
    const { id } = await params
    const body = await request.json()
    const { productId, quantity, amount, returnToStock, reason, note } = body

    // Get the old return to adjust stock if needed
    const oldReturn = await prisma.productReturn.findFirst({
      where: { id: parseInt(id), companyId },
    })

    if (!oldReturn) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      )
    }

    // New product must belong to the current company
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
    })
    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 })
    }

    // Adjust stock based on changes
    // First, reverse the old stock change if it was returned to stock
    if (oldReturn.returnToStock) {
      await prisma.product.update({
        where: { id: oldReturn.productId },
        data: { stock: { decrement: oldReturn.quantity } },
      })
    }

    // Update the return record
    const updatedReturn = await prisma.productReturn.update({
      where: { id: oldReturn.id },
      data: {
        productId,
        quantity,
        amount,
        returnToStock,
        reason,
        note,
      },
      include: { product: true },
    })

    // Apply new stock change if returnToStock is true
    if (returnToStock) {
      await prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      })
    }

    return NextResponse.json(updatedReturn)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    console.error("Failed to update return:", error)
    return NextResponse.json(
      { error: "Failed to update return" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await requireCompany()
    const { id } = await params

    // Get the return to reverse stock if needed
    const productReturn = await prisma.productReturn.findFirst({
      where: { id: parseInt(id), companyId },
    })

    if (!productReturn) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      )
    }

    // Reverse stock change if it was returned to stock
    if (productReturn.returnToStock) {
      await prisma.product.update({
        where: { id: productReturn.productId },
        data: { stock: { decrement: productReturn.quantity } },
      })
    }

    await prisma.productReturn.delete({
      where: { id: productReturn.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    console.error("Failed to delete return:", error)
    return NextResponse.json(
      { error: "Failed to delete return" },
      { status: 500 }
    )
  }
}
