import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = await getCurrentUserId()
    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        cost: parseFloat(body.cost),
        price: parseFloat(body.price),
        updatedById: userId,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
