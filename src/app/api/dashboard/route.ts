import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filterType = searchParams.get("filterType") || "all"
    const filterDate = searchParams.get("filterDate") || new Date().toISOString().split("T")[0]

    let startDate: Date
    let endDate: Date

    const now = new Date(filterDate)

    switch (filterType) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        break
      default:
        // All time - use very wide range
        startDate = new Date(2000, 0, 1)
        endDate = new Date(2100, 11, 31)
    }

    const dateFilter = filterType !== "all" ? {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    } : {}

    const expenseDateFilter = filterType !== "all" ? {
      date: {
        gte: startDate,
        lte: endDate,
      }
    } : {}

    const [
      orders,
      expenses,
      totalProducts,
      totalEmployees,
      recentOrders,
      expensesByCategory,
      ordersByPlatform,
      ordersByEmployee,
      adCostsByPlatform,
      ordersByShop,
      adCostsByShop,
      productReturns,
    ] = await Promise.all([
      prisma.order.findMany({
        where: dateFilter,
        include: { 
          employee: true, 
          platform: true,
          shop: true,
          items: { include: { product: true } },
        },
      }),
      prisma.expense.findMany({
        where: expenseDateFilter,
        include: { platform: true, shop: true },
      }),
      prisma.product.count(),
      prisma.employee.count(),
      prisma.order.findMany({
        where: dateFilter,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { 
          employee: true, 
          platform: true,
          shop: true,
          items: { include: { product: true } },
        },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        where: { ...expenseDateFilter, isAdCost: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["platformId"],
        where: dateFilter,
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.order.groupBy({
        by: ["employeeId"],
        where: dateFilter,
        _sum: { totalPrice: true, commission: true },
        _count: true,
      }),
      // Ad costs grouped by platform
      prisma.expense.groupBy({
        by: ["platformId"],
        where: { ...expenseDateFilter, isAdCost: true },
        _sum: { amount: true },
        _count: true,
      }),
      // Orders grouped by shop
      prisma.order.groupBy({
        by: ["shopId"],
        where: { ...dateFilter, shopId: { not: null } },
        _sum: { totalPrice: true },
        _count: true,
      }),
      // Ad costs grouped by shop
      prisma.expense.groupBy({
        by: ["shopId"],
        where: { ...expenseDateFilter, isAdCost: true, shopId: { not: null } },
        _sum: { amount: true },
        _count: true,
      }),
      // Product returns
      prisma.productReturn.findMany({
        where: dateFilter,
        include: { product: true },
      }),
    ])

    // Get platform, employee, and shop names
    const platforms = await prisma.platform.findMany()
    const employees = await prisma.employee.findMany()
    const shops = await prisma.shop.findMany({ include: { platform: true } })

    const platformMap = Object.fromEntries(platforms.map(p => [p.id, p.name]))
    const employeeMap = Object.fromEntries(employees.map(e => [e.id, e.name]))
    const shopMap = Object.fromEntries(shops.map(s => [s.id, { name: s.name, platform: s.platform.name }]))

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalAdCosts = expenses.filter(e => e.isAdCost).reduce((sum, e) => sum + e.amount, 0)
    const totalOtherExpenses = totalExpenses - totalAdCosts
    const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0)
    const totalOrders = orders.length

    // Calculate returns data
    const totalReturns = productReturns.length
    const totalReturnAmount = productReturns.reduce((sum, r) => sum + r.amount, 0)
    const totalReturnedToStock = productReturns.filter(r => r.returnToStock).reduce((sum, r) => sum + r.quantity, 0)
    const totalDamaged = productReturns.filter(r => !r.returnToStock).reduce((sum, r) => sum + r.quantity, 0)

    // Group returns by reason
    const returnsByReason = productReturns.reduce((acc, r) => {
      const reason = r.reason || "ไม่ระบุเหตุผล"
      if (!acc[reason]) {
        acc[reason] = { count: 0, amount: 0, quantity: 0 }
      }
      acc[reason].count++
      acc[reason].amount += r.amount
      acc[reason].quantity += r.quantity
      return acc
    }, {} as Record<string, { count: number; amount: number; quantity: number }>)

    // Calculate platform performance (sales vs ad costs)
    const platformPerformance = platforms.map(platform => {
      const platformOrders = ordersByPlatform.find(o => o.platformId === platform.id)
      const platformAdCosts = adCostsByPlatform.find(a => a.platformId === platform.id)
      
      const revenue = platformOrders?._sum.totalPrice || 0
      const adCost = platformAdCosts?._sum.amount || 0
      const orderCount = platformOrders?._count || 0
      
      return {
        platform: platform.name,
        platformId: platform.id,
        revenue,
        adCost,
        profit: revenue - adCost,
        orderCount,
        roas: adCost > 0 ? (revenue / adCost).toFixed(2) : "N/A", // Return on Ad Spend
      }
    }).filter(p => p.revenue > 0 || p.adCost > 0)

    // Calculate shop performance (sales vs ad costs per shop)
    const shopPerformance = shops.map(shop => {
      const shopOrders = ordersByShop.find(o => o.shopId === shop.id)
      const shopAdCosts = adCostsByShop.find(a => a.shopId === shop.id)
      
      const revenue = shopOrders?._sum.totalPrice || 0
      const adCost = shopAdCosts?._sum.amount || 0
      const orderCount = shopOrders?._count || 0
      
      return {
        shop: shop.name,
        shopId: shop.id,
        platform: shop.platform.name,
        platformId: shop.platformId,
        revenue,
        adCost,
        profit: revenue - adCost,
        orderCount,
        roas: adCost > 0 ? (revenue / adCost).toFixed(2) : "N/A",
      }
    }).filter(s => s.revenue > 0 || s.adCost > 0)

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalExpenses,
      totalAdCosts,
      totalOtherExpenses,
      totalCommission,
      totalProducts,
      totalEmployees,
      profit: totalRevenue - totalExpenses,
      recentOrders,
      expensesByCategory: expensesByCategory.map(e => ({
        category: e.category,
        amount: e._sum.amount || 0,
        count: e._count,
      })),
      ordersByPlatform: ordersByPlatform.map(o => ({
        platform: platformMap[o.platformId] || "Unknown",
        revenue: o._sum.totalPrice || 0,
        count: o._count,
      })),
      ordersByEmployee: ordersByEmployee.map(o => ({
        employee: employeeMap[o.employeeId] || "Unknown",
        revenue: o._sum.totalPrice || 0,
        commission: o._sum.commission || 0,
        count: o._count,
      })),
      adCostsByPlatform: adCostsByPlatform.map(a => ({
        platform: platformMap[a.platformId || 0] || "ไม่ระบุ",
        amount: a._sum.amount || 0,
        count: a._count,
      })),
      ordersByShop: ordersByShop.map(o => ({
        shop: shopMap[o.shopId || 0]?.name || "ไม่ระบุ",
        platform: shopMap[o.shopId || 0]?.platform || "ไม่ระบุ",
        revenue: o._sum.totalPrice || 0,
        count: o._count,
      })),
      adCostsByShop: adCostsByShop.map(a => ({
        shop: shopMap[a.shopId || 0]?.name || "ไม่ระบุ",
        platform: shopMap[a.shopId || 0]?.platform || "ไม่ระบุ",
        amount: a._sum.amount || 0,
        count: a._count,
      })),
      platformPerformance,
      shopPerformance,
      // Returns data
      totalReturns,
      totalReturnAmount,
      totalReturnedToStock,
      totalDamaged,
      returnsByReason: Object.entries(returnsByReason).map(([reason, data]) => ({
        reason,
        count: data.count,
        amount: data.amount,
        quantity: data.quantity,
      })).sort((a, b) => b.amount - a.amount),
      recentReturns: productReturns.slice(0, 5).map(r => ({
        id: r.id,
        product: r.product.name,
        quantity: r.quantity,
        amount: r.amount,
        returnToStock: r.returnToStock,
        reason: r.reason,
        createdAt: r.createdAt,
      })),
      filterInfo: {
        type: filterType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
