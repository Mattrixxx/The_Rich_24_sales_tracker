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
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        commissionRate: parseFloat(body.commissionRate) / 100,
      },
    })
    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
