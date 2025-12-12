import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
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
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

interface OrderItemInput {
  productId: string | number
  quantity: string | number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Get employee for commission calculation
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(body.employeeId) },
    })

    if (!employee) {
      return NextResponse.json({ error: "ไม่พบพนักงาน" }, { status: 400 })
    }

    // Get all products in the order
    const items: OrderItemInput[] = body.items || []
    if (items.length === 0) {
      return NextResponse.json({ error: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" }, { status: 400 })
    }

    const productIds = items.map((item) => parseInt(item.productId.toString()))
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    // Check stock for all products
    for (const item of items) {
      const product = products.find((p) => p.id === parseInt(item.productId.toString()))
      const quantity = parseInt(item.quantity.toString())
      
      if (!product) {
        return NextResponse.json({ error: `ไม่พบสินค้า ID: ${item.productId}` }, { status: 400 })
      }
      
      if (product.stock < quantity) {
        return NextResponse.json({ 
          error: `สต๊อก "${product.name}" ไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)` 
        }, { status: 400 })
      }
    }

    const totalPrice = parseFloat(body.totalPrice)
    const commission = totalPrice * employee.commissionRate

    // Create order with items and deduct stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          employeeId: parseInt(body.employeeId),
          platformId: parseInt(body.platformId),
          totalPrice,
          commission,
          note: body.note || null,
          shopId: body.shopId ? parseInt(body.shopId) : null,
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

      // Deduct stock for each product
      for (const item of items) {
        const productId = parseInt(item.productId.toString())
        const quantity = parseInt(item.quantity.toString())
        
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        })
      }

      return newOrder
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
