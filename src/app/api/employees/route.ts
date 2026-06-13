import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { companyId } = await requireCompany()
    const employees = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(employees)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const commissionType = body.commissionType || "percentage"
    const commissionValue = parseFloat(body.commissionValue)

    // Convert percentage to decimal (e.g., 5 -> 0.05), keep fixed amount as is
    const finalValue = commissionType === "percentage" ? commissionValue / 100 : commissionValue

    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        commissionType,
        commissionValue: finalValue,
        commissionRate: commissionType === "percentage" ? finalValue : 0.05,
        companyId,
        createdById: userId,
        updatedById: userId,
      },
    })
    return NextResponse.json(employee)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
