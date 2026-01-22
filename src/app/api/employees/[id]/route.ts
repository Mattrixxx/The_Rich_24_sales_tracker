import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: { id: parseInt(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const commissionType = body.commissionType || "percentage"
    const commissionValue = parseFloat(body.commissionValue)
    
    // Convert percentage to decimal (e.g., 5 -> 0.05), keep fixed amount as is
    const finalValue = commissionType === "percentage" ? commissionValue / 100 : commissionValue
    
    const employee = await prisma.employee.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        commissionType,
        commissionValue: finalValue,
        commissionRate: commissionType === "percentage" ? finalValue : 0.05, // backward compatibility
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}
