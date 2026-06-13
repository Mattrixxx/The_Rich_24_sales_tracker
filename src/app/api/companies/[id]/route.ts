import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    const name = (body.name || "").trim()
    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่อบริษัท" }, { status: 400 })
    }
    const company = await prisma.company.update({
      where: { id: parseInt(params.id) },
      data: { name },
    })
    return NextResponse.json(company)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "มีบริษัทชื่อนี้อยู่แล้ว" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const id = parseInt(params.id)

    // Block delete if the company still has data
    const [orders, products, employees, platforms, expenses] = await Promise.all([
      prisma.order.count({ where: { companyId: id } }),
      prisma.product.count({ where: { companyId: id } }),
      prisma.employee.count({ where: { companyId: id } }),
      prisma.platform.count({ where: { companyId: id } }),
      prisma.expense.count({ where: { companyId: id } }),
    ])
    if (orders + products + employees + platforms + expenses > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบบริษัทที่มีข้อมูลอยู่ได้" },
        { status: 400 }
      )
    }

    await prisma.company.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 })
  }
}
