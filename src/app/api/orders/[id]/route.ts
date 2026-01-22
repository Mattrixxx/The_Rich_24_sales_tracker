import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.order.delete({
      where: { id: parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}

interface OrderItemInput {
  productId: string | number
  quantity: string | number
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const orderId = parseInt(params.id)

    // Get all products in the order
    const items: OrderItemInput[] = body.items || []
    if (items.length === 0) {
      return NextResponse.json({ error: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" }, { status: 400 })
    }

    const productIds = items.map((item) => parseInt(item.productId.toString()))

    // Get existing order with items
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 })
    }

    // รวม query employee และ products ไว้ด้วยกันเพื่อลดการใช้ connection
    const [employee, products] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: parseInt(body.employeeId) },
      }),
      prisma.product.findMany({
        where: { id: { in: productIds } },
      })
    ])

    if (!employee) {
      return NextResponse.json({ error: "ไม่พบพนักงาน" }, { status: 400 })
    }

    // Calculate stock changes
    const stockChanges = new Map<number, number>()

    // First, add back stock from old items
    for (const oldItem of existingOrder.items) {
      stockChanges.set(oldItem.productId, (stockChanges.get(oldItem.productId) || 0) + oldItem.quantity)
    }

    // Then, subtract stock for new items
    for (const newItem of items) {
      const productId = parseInt(newItem.productId.toString())
      const quantity = parseInt(newItem.quantity.toString())
      stockChanges.set(productId, (stockChanges.get(productId) || 0) - quantity)
    }

    // Check if we have enough stock
    for (const [productId, stockChange] of Array.from(stockChanges.entries())) {
      const product = products.find((p) => p.id === productId)
      if (!product) {
        return NextResponse.json({ error: `ไม่พบสินค้า ID: ${productId}` }, { status: 400 })
      }

      const newStock = product.stock + stockChange
      if (newStock < 0) {
        return NextResponse.json({
          error: `สต๊อก "${product.name}" ไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)`
        }, { status: 400 })
      }
    }

    const totalPrice = parseFloat(body.totalPrice)
    // Calculate commission based on type (with backward compatibility)
    const commission = (employee as any).commissionType === "percentage" 
      ? totalPrice * ((employee as any).commissionValue ?? employee.commissionRate)
      : (employee as any).commissionType === "fixed"
      ? (employee as any).commissionValue
      : totalPrice * employee.commissionRate

    // Update order with items and adjust stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.orderItem.deleteMany({
        where: { orderId },
      })

      // Parse order date if provided
      const orderDate = body.orderDate ? new Date(body.orderDate + 'T00:00:00') : new Date()

      // Update the order with new items
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          employeeId: parseInt(body.employeeId),
          platformId: parseInt(body.platformId),
          totalPrice,
          commission,
          note: body.note || null,
          shopId: body.shopId ? parseInt(body.shopId) : null,
          createdAt: orderDate,
          items: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === parseInt(item.productId.toString()))!
              const quantity = parseInt(item.quantity.toString())
              const unitPrice = product.price
              return {
                productId: product.id,
                quantity,
                unitPrice,
                subtotal: quantity * unitPrice,
              }
            }),
          },
        },
        include: {
          employee: true,
          platform: true,
          shop: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Update stock for all affected products
      for (const [productId, stockChange] of Array.from(stockChanges.entries())) {
        if (stockChange !== 0) {
          await tx.product.update({
            where: { id: productId },
            data: { stock: { increment: stockChange } },
          })
        }
      }

      return updatedOrder
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
