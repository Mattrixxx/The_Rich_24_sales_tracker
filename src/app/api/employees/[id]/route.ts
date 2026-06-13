import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { companyId } = await requireCompany()
    const existing = await prisma.employee.findFirst({
      where: { id: parseInt(params.id), companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await prisma.employee.delete({
      where: { id: existing.id },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, companyId } = await requireCompany()
    const existing = await prisma.employee.findFirst({
      where: { id: parseInt(params.id), companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const body = await request.json()
    const commissionType = body.commissionType || "percentage"
    const commissionValue = parseFloat(body.commissionValue)

    // Convert percentage to decimal (e.g., 5 -> 0.05), keep fixed amount as is
    const finalValue = commissionType === "percentage" ? commissionValue / 100 : commissionValue

    const employee = await prisma.employee.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        commissionType,
        commissionValue: finalValue,
        commissionRate: commissionType === "percentage" ? finalValue : 0.05,
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
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}
