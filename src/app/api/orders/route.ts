import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const employeeId = searchParams.get("employeeId");
    const platformId = searchParams.get("platformId");
    const shopId = searchParams.get("shopId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (platformId) where.platformId = parseInt(platformId);
    if (shopId) where.shopId = parseInt(shopId);
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom + "T00:00:00") } : {}),
        ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          employee: true,
          platform: true,
          shop: true,
          items: {
            include: {
              product: true,
            },
          },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
    
    // Get all products in the order
    const items: OrderItemInput[] = body.items || []
    if (items.length === 0) {
      return NextResponse.json({ error: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ" }, { status: 400 })
    }

    const productIds = items.map((item) => parseInt(item.productId.toString()))
    
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
    const userId = await getCurrentUserId()
    // Commission: 50 THB per order if isWholesale, else normal logic
    let commission = 0;
    if (body.isWholesale) {
      commission = 50;
    } else {
      commission = (employee as any).commissionType === "percentage" 
        ? totalPrice * ((employee as any).commissionValue ?? employee.commissionRate)
        : (employee as any).commissionType === "fixed"
        ? (employee as any).commissionValue
        : totalPrice * employee.commissionRate;
    }

    // Create order with items and deduct stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      // Parse order date if provided, otherwise use current date
      const orderDate = body.orderDate ? new Date(body.orderDate + 'T00:00:00') : new Date()

      const newOrder = await tx.order.create({
        data: {
          employeeId: parseInt(body.employeeId),
          platformId: parseInt(body.platformId),
          totalPrice,
          commission,
          note: body.note || null,
          shopId: body.shopId ? parseInt(body.shopId) : null,
          createdAt: orderDate,
          createdById: userId,
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
