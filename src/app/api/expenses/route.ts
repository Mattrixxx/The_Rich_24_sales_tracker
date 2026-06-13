import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCompany } from "@/lib/session"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { companyId } = await requireCompany()
    const expenses = await prisma.expense.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
      include: {
        platform: true,
        shop: true,
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(expenses)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, companyId } = await requireCompany()
    const body = await request.json()
    const isAdCost = body.isAdCost === true || body.isAdCost === "true"

    const platformId = isAdCost && body.platformId ? parseInt(body.platformId) : null
    const shopId = isAdCost && body.shopId ? parseInt(body.shopId) : null

    // Referenced platform/shop must belong to the current company
    if (platformId) {
      const platform = await prisma.platform.findFirst({
        where: { id: platformId, companyId },
      })
      if (!platform) {
        return NextResponse.json({ error: "ไม่พบแพลตฟอร์ม" }, { status: 400 })
      }
    }
    if (shopId) {
      const shop = await prisma.shop.findFirst({
        where: { id: shopId, companyId },
      })
      if (!shop) {
        return NextResponse.json({ error: "ไม่พบร้านค้า" }, { status: 400 })
      }
    }

    const expense = await prisma.expense.create({
      data: {
        description: body.description,
        amount: parseFloat(body.amount),
        category: isAdCost ? "ค่าโฆษณา" : body.category,
        isAdCost,
        platformId,
        shopId,
        date: new Date(body.date),
        companyId,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        platform: true,
        shop: true,
      },
    })
    return NextResponse.json(expense)
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error.message === "NO_COMPANY_ACCESS") {
      return NextResponse.json({ error: "No company access" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
