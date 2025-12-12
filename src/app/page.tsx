"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface OrderItem {
  id: number
  product: { name: string }
  quantity: number
}

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalExpenses: number
  totalAdCosts: number
  totalOtherExpenses: number
  totalCommission: number
  totalProducts: number
  totalEmployees: number
  profit: number
  recentOrders: Array<{
    id: number
    items: OrderItem[]
    employee: { name: string }
    platform: { name: string }
    totalPrice: number
    createdAt: string
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    count: number
  }>
  ordersByPlatform: Array<{
    platform: string
    revenue: number
    count: number
  }>
  ordersByEmployee: Array<{
    employee: string
    revenue: number
    commission: number
    count: number
  }>
  adCostsByPlatform: Array<{
    platform: string
    amount: number
    count: number
  }>
  platformPerformance: Array<{
    platform: string
    revenue: number
    adCost: number
    profit: number
    orderCount: number
    roas: string
  }>
  ordersByShop: Array<{
    shop: string
    platform: string
    revenue: number
    count: number
  }>
  adCostsByShop: Array<{
    shop: string
    platform: string
    amount: number
    count: number
  }>
  shopPerformance: Array<{
    shop: string
    shopId: number
    platform: string
    platformId: number
    revenue: number
    adCost: number
    profit: number
    orderCount: number
    roas: string
  }>
  filterInfo: {
    type: string
    startDate: string
    endDate: string
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [filterType, setFilterType] = useState("all")
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?filterType=${filterType}&filterDate=${filterDate}`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filterType, filterDate])

  const getFilterLabel = () => {
    if (filterType === "all") return "ทั้งหมด"
    const date = new Date(filterDate)
    switch (filterType) {
      case "day":
        return date.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
      case "month":
        return date.toLocaleDateString("th-TH", { month: "long", year: "numeric" })
      case "year":
        return `ปี ${date.getFullYear() + 543}`
      default:
        return ""
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
        <div className="flex gap-4 items-end">
          <div>
            <Label htmlFor="filterType">ช่วงเวลา</Label>
            <Select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-32"
            >
              <option value="all">ทั้งหมด</option>
              <option value="day">รายวัน</option>
              <option value="month">รายเดือน</option>
              <option value="year">รายปี</option>
            </Select>
          </div>
          {filterType !== "all" && (
            <div>
              <Label htmlFor="filterDate">
                {filterType === "day" ? "วันที่" : filterType === "month" ? "เดือน" : "ปี"}
              </Label>
              <Input
                id="filterDate"
                type={filterType === "day" ? "date" : filterType === "month" ? "month" : "number"}
                value={filterType === "year" ? new Date(filterDate).getFullYear().toString() : filterDate}
                onChange={(e) => {
                  if (filterType === "year") {
                    setFilterDate(`${e.target.value}-01-01`)
                  } else {
                    setFilterDate(e.target.value)
                  }
                }}
                className="w-40"
                min={filterType === "year" ? "2020" : undefined}
                max={filterType === "year" ? "2030" : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-800 font-medium">
          📅 แสดงข้อมูล: <span className="font-bold">{getFilterLabel()}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{data.totalOrders} ออเดอร์</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📢 ค่าโฆษณา</CardTitle>
            <span className="text-2xl">📢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{data.totalAdCosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalRevenue > 0 
                ? `${((data.totalAdCosts / data.totalRevenue) * 100).toFixed(1)}% ของยอดขาย` 
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ค่าใช้จ่ายอื่นๆ</CardTitle>
            <span className="text-2xl">💸</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ฿{data.totalOtherExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.expensesByCategory.reduce((sum, e) => sum + e.count, 0)} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ฿{data.profit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalRevenue > 0 
                ? `${((data.profit / data.totalRevenue) * 100).toFixed(1)}% margin` 
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ค่าคอมมิชชั่น</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{data.totalCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalRevenue > 0 
                ? `${((data.totalCommission / data.totalRevenue) * 100).toFixed(1)}% ของยอดขาย` 
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">จำนวนออเดอร์</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              เฉลี่ย ฿{data.totalOrders > 0 
                ? (data.totalRevenue / data.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                : 0}/ออเดอร์
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance - Sales vs Ad Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 ประสิทธิภาพแพลตฟอร์ม (ยอดขาย vs ค่าโฆษณา)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.platformPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลในช่วงนี้</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>แพลตฟอร์ม</TableHead>
                  <TableHead className="text-right">ยอดขาย</TableHead>
                  <TableHead className="text-right">ค่าโฆษณา</TableHead>
                  <TableHead className="text-right">กำไรจากแพลตฟอร์ม</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">ออเดอร์</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.platformPerformance
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((platform) => (
                    <TableRow key={platform.platform}>
                      <TableCell className="font-medium">{platform.platform}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ฿{platform.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        ฿{platform.adCost.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${platform.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ฿{platform.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {platform.roas === "N/A" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={parseFloat(platform.roas) >= 2 ? "text-green-600 font-semibold" : "text-yellow-600"}>
                            {platform.roas}x
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{platform.orderCount}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Shop Performance - Sales vs Ad Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏪 ประสิทธิภาพร้านค้า (ยอดขาย vs ค่าโฆษณา)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.shopPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลร้านค้าในช่วงนี้</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ร้านค้า</TableHead>
                  <TableHead>แพลตฟอร์ม</TableHead>
                  <TableHead className="text-right">ยอดขาย</TableHead>
                  <TableHead className="text-right">ค่าโฆษณา</TableHead>
                  <TableHead className="text-right">กำไรจากร้านค้า</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">ออเดอร์</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.shopPerformance
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((shop) => (
                    <TableRow key={shop.shopId}>
                      <TableCell className="font-medium">{shop.shop}</TableCell>
                      <TableCell className="text-muted-foreground">{shop.platform}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ฿{shop.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        ฿{shop.adCost.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${shop.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ฿{shop.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {shop.roas === "N/A" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={parseFloat(shop.roas) >= 2 ? "text-green-600 font-semibold" : "text-yellow-600"}>
                            {shop.roas}x
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{shop.orderCount}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ad Costs by Platform & Expense by Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📢 ค่าโฆษณาตามแพลตฟอร์ม
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.adCostsByPlatform.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">ไม่มีค่าโฆษณาในช่วงนี้</p>
            ) : (
              <div className="space-y-3">
                {data.adCostsByPlatform
                  .sort((a, b) => b.amount - a.amount)
                  .map((ad) => (
                    <div key={ad.platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ad.platform}</span>
                        <span className="text-xs text-muted-foreground">({ad.count} รายการ)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-600">฿{ad.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({((ad.amount / data.totalAdCosts) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>รวมค่าโฆษณา</span>
                    <span className="text-orange-600">฿{data.totalAdCosts.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💸 ค่าใช้จ่ายอื่นๆ (ไม่รวมค่าแอด)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.expensesByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">ไม่มีค่าใช้จ่ายในช่วงนี้</p>
            ) : (
              <div className="space-y-3">
                {data.expensesByCategory
                  .sort((a, b) => b.amount - a.amount)
                  .map((expense) => (
                    <div key={expense.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.category}</span>
                        <span className="text-xs text-muted-foreground">({expense.count} รายการ)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-600">฿{expense.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({((expense.amount / data.totalOtherExpenses) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>รวมค่าใช้จ่าย</span>
                    <span className="text-red-600">฿{data.totalOtherExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌐 ยอดขายตามแพลตฟอร์ม
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.ordersByPlatform.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มียอดขายในช่วงนี้</p>
          ) : (
            <div className="space-y-3">
              {data.ordersByPlatform
                .sort((a, b) => b.revenue - a.revenue)
                .map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{platform.platform}</span>
                      <span className="text-xs text-muted-foreground">({platform.count} ออเดอร์)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">฿{platform.revenue.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({((platform.revenue / data.totalRevenue) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>รวมทั้งหมด</span>
                  <span className="text-green-600">฿{data.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 ยอดขายตามพนักงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.ordersByEmployee.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มียอดขายในช่วงนี้</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead className="text-right">จำนวนออเดอร์</TableHead>
                  <TableHead className="text-right">ยอดขาย</TableHead>
                  <TableHead className="text-right">ค่าคอมมิชชั่น</TableHead>
                  <TableHead className="text-right">สัดส่วน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ordersByEmployee
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((emp) => (
                    <TableRow key={emp.employee}>
                      <TableCell className="font-medium">{emp.employee}</TableCell>
                      <TableCell className="text-right">{emp.count}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ฿{emp.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-blue-600">
                        ฿{emp.commission.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {((emp.revenue / data.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛒 ออเดอร์ล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีออเดอร์ในช่วงนี้</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>แพลตฟอร์ม</TableHead>
                  <TableHead className="text-right">ยอดขาย</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            {item.product.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{order.employee.name}</TableCell>
                    <TableCell>{order.platform.name}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ฿{order.totalPrice.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📦 ข้อมูลสรุป</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>จำนวนสินค้าทั้งหมด</span>
                <span className="font-semibold">{data.totalProducts} รายการ</span>
              </div>
              <div className="flex justify-between">
                <span>จำนวนพนักงาน</span>
                <span className="font-semibold">{data.totalEmployees} คน</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
