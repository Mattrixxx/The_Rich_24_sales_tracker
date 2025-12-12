import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: {
        platform: true,
        shop: true,
      },
    })
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const isAdCost = body.isAdCost === true || body.isAdCost === "true"
    
    const expense = await prisma.expense.create({
      data: {
        description: body.description,
        amount: parseFloat(body.amount),
        category: isAdCost ? "ค่าโฆษณา" : body.category,
        isAdCost,
        platformId: isAdCost && body.platformId ? parseInt(body.platformId) : null,
        shopId: isAdCost && body.shopId ? parseInt(body.shopId) : null,
        date: new Date(body.date),
      },
      include: {
        platform: true,
        shop: true,
      },
    })
    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
