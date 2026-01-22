import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
        commissionRate: commissionType === "percentage" ? finalValue : 0.05, // backward compatibility
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
