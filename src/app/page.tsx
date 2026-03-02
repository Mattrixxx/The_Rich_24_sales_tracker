"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { MonthPicker } from "@/components/ui/month-picker"
import { YearPicker } from "@/components/ui/year-picker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TrendingUp,
  Megaphone,
  CreditCard,
  BarChart3,
  Users,
  ShoppingCart,
  Calendar,
  RotateCcw,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Store,
  Loader2,
  Percent,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface OrderItem {
  id: number
  product: { name: string }
  quantity: number
}

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalCost: number
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
    commissionType: string
    commissionValue: number
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
  // Returns data
  totalReturns: number
  totalReturnAmount: number
  totalReturnedToStock: number
  totalDamaged: number
  returnsByReason: Array<{
    reason: string
    count: number
    amount: number
    quantity: number
  }>
  recentReturns: Array<{
    id: number
    product: string
    quantity: number
    amount: number
    returnToStock: boolean
    reason: string | null
    createdAt: string
  }>
  filterInfo: {
    type: string
    startDate: string
    endDate: string
  }
}

// Colors for charts
const CHART_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `฿${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `฿${(value / 1000).toFixed(0)}K`
  }
  return `฿${value}`
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [filterType, setFilterType] = useState("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date())
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(true)

  // Helper function to format date without timezone issues
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = `/api/dashboard?filterType=${filterType}`
      
      if (filterType === "range") {
        const start = startDate ? formatDateLocal(startDate) : formatDateLocal(new Date())
        const end = endDate ? formatDateLocal(endDate) : formatDateLocal(new Date())
        url += `&startDate=${start}&endDate=${end}`
      } else {
        const dateStr = filterDate ? formatDateLocal(filterDate) : formatDateLocal(new Date())
        url += `&filterDate=${dateStr}`
      }
      
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filterType, filterDate, startDate, endDate])

  const getFilterLabel = () => {
    if (filterType === "all") return "ทั้งหมด"
    if (filterType === "range") {
      const start = startDate?.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
      const end = endDate?.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
      return `${start} - ${end}`
    }
    if (!filterDate) return ""
    switch (filterType) {
      case "day":
        return filterDate.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
      case "month":
        return filterDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })
      case "year":
        return `ปี ${filterDate.getFullYear() + 543}`
      default:
        return ""
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-muted-foreground">กำลังโหลดข้อมูล...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pt-12 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">แดชบอร์ด</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center text-sm">ช่วงเวลา</Label>
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="day">รายวัน</SelectItem>
                <SelectItem value="range">ช่วงวัน</SelectItem>
                <SelectItem value="month">รายเดือน</SelectItem>
                <SelectItem value="year">รายปี</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filterType !== "all" && (
            <>
              {filterType === "range" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="flex items-center text-sm">วันที่เริ่มต้น</Label>
                    <DatePicker
                      date={startDate}
                      onDateChange={setStartDate}
                      placeholder="เลือกวันที่เริ่มต้น"
                      className="w-full sm:w-52"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center text-sm">วันที่สิ้นสุด</Label>
                    <DatePicker
                      date={endDate}
                      onDateChange={setEndDate}
                      placeholder="เลือกวันที่สิ้นสุด"
                      className="w-full sm:w-52"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label className="flex items-center text-sm">
                    {filterType === "day" ? "วันที่" : filterType === "month" ? "เดือน" : "ปี"}
                  </Label>
                  {filterType === "day" ? (
                    <DatePicker
                      date={filterDate}
                      onDateChange={setFilterDate}
                      placeholder="เลือกวันที่"
                      className="w-full sm:w-52"
                    />
                  ) : filterType === "month" ? (
                    <MonthPicker
                      date={filterDate}
                      onDateChange={setFilterDate}
                      placeholder="เลือกเดือน"
                      className="w-full sm:w-52"
                    />
                  ) : (
                    <YearPicker
                      date={filterDate}
                      onDateChange={setFilterDate}
                      placeholder="เลือกปี"
                      className="w-full sm:w-40"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <p className="text-blue-800 font-medium">
          แสดงข้อมูล: <span className="font-bold">{getFilterLabel()}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">ยอดขายรวม</CardTitle>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">
              ฿{data.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{data.totalOrders} ออเดอร์</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">ค่าโฆษณา</CardTitle>
            <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">
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
            <CardTitle className="text-xs md:text-sm font-medium">ค่าใช้จ่ายอื่นๆ</CardTitle>
            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">
              ฿{data.totalOtherExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.expensesByCategory.reduce((sum, e) => sum + e.count, 0)} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">กำไรสุทธิ</CardTitle>
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg md:text-2xl font-bold ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
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
            <CardTitle className="text-xs md:text-sm font-medium">ค่าคอมมิชชั่น</CardTitle>
            <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-purple-600">
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
            <CardTitle className="text-xs md:text-sm font-medium">จำนวนออเดอร์</CardTitle>
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              เฉลี่ย ฿{data.totalOrders > 0 
                ? (data.totalRevenue / data.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                : 0}/ออเดอร์
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <PieChartIcon className="w-5 h-5 text-green-600" />
              สัดส่วนยอดขายตามแพลตฟอร์ม
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ordersByPlatform.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.ordersByPlatform
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((item, index) => ({
                        name: item.platform,
                        value: item.revenue,
                        count: item.count,
                      }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      (percent ?? 0) > 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
                    }
                  >
                    {data.ordersByPlatform.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'ยอดขาย']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue vs Ad Costs Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              เปรียบเทียบยอดขาย vs ค่าโฆษณา
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.platformPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data.platformPerformance
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 6)}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="platform" 
                    tick={{ fontSize: 12 }} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickFormatter={formatCurrency}
                    width={65}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `฿${Number(value).toLocaleString()}`, 
                      name === 'revenue' ? 'ยอดขาย' : 'ค่าโฆษณา'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === 'revenue' ? 'ยอดขาย' : 'ค่าโฆษณา'}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" name="revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adCost" fill="#f97316" name="adCost" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Employee Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Users className="w-5 h-5 text-purple-600" />
              ยอดขายตามพนักงาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.ordersByEmployee.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={data.ordersByEmployee
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11 }} 
                    tickFormatter={formatCurrency}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="employee" 
                    tick={{ fontSize: 12 }} 
                    width={55}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `฿${Number(value).toLocaleString()}`, 
                      name === 'revenue' ? 'ยอดขาย' : 'คอมมิชชั่น'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === 'revenue' ? 'ยอดขาย' : 'คอมมิชชั่น'}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="revenue" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="commission" fill="#06b6d4" name="commission" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <CreditCard className="w-5 h-5 text-red-600" />
              สัดส่วนค่าใช้จ่าย
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data.expensesByCategory.length === 0 && data.totalAdCosts === 0) ? (
              <p className="text-muted-foreground text-center py-8">ไม่มีข้อมูล</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      ...(data.totalAdCosts > 0 ? [{ name: 'ค่าโฆษณา', value: data.totalAdCosts }] : []),
                      ...data.expensesByCategory
                        .sort((a, b) => b.amount - a.amount)
                        .map((item) => ({
                          name: item.category,
                          value: item.amount,
                        }))
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      (percent ?? 0) > 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
                    }
                  >
                    {[
                      ...(data.totalAdCosts > 0 ? [{ name: 'ค่าโฆษณา' }] : []),
                      ...data.expensesByCategory
                    ].map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 && data.totalAdCosts > 0 ? '#f97316' : CHART_COLORS[(index + (data.totalAdCosts > 0 ? 0 : 1)) % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`฿${Number(value).toLocaleString()}`, 'จำนวน']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shop Performance Bar Chart */}
      {data.shopPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Store className="w-5 h-5 text-indigo-600" />
              เปรียบเทียบยอดขายร้านค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.shopPerformance
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 8)}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shop" 
                  tick={{ fontSize: 11 }} 
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  tickFormatter={formatCurrency}
                  width={65}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `฿${Number(value).toLocaleString()}`, 
                    name === 'revenue' ? 'ยอดขาย' : name === 'adCost' ? 'ค่าโฆษณา' : 'กำไร'
                  ]}
                  labelFormatter={(label) => `ร้าน: ${label}`}
                />
                <Legend 
                  formatter={(value) => value === 'revenue' ? 'ยอดขาย' : value === 'adCost' ? 'ค่าโฆษณา' : 'กำไร'}
                />
                <Bar dataKey="revenue" fill="#22c55e" name="revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adCost" fill="#f97316" name="adCost" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#3b82f6" name="profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Returns Summary */}
      {data.totalReturns > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <RotateCcw className="w-5 h-5" />
              สรุปสินค้าตีกลับ/ยกเลิก
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl md:text-2xl font-bold text-orange-600">{data.totalReturns}</div>
                <div className="text-xs md:text-sm text-muted-foreground">รายการตีกลับ</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl md:text-2xl font-bold text-red-600">฿{data.totalReturnAmount.toLocaleString()}</div>
                <div className="text-xs md:text-sm text-muted-foreground">มูลค่าความเสียหาย</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xl md:text-2xl font-bold text-green-600">{data.totalReturnedToStock}</span>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">ชิ้นคืนสต็อก</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-xl md:text-2xl font-bold text-gray-600">{data.totalDamaged}</span>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">ชิ้นเสียหาย</div>
              </div>
            </div>
            
            {data.returnsByReason.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  สาเหตุการตีกลับ
                </h4>
                <div className="space-y-2">
                  {data.returnsByReason.map((item) => (
                    <div key={item.reason} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 rounded gap-2">
                      <span className="font-medium text-sm">{item.reason}</span>
                      <div className="flex gap-4 text-xs sm:text-sm">
                        <span>{item.count} รายการ</span>
                        <span>{item.quantity} ชิ้น</span>
                        <span className="text-red-600 font-semibold">฿{item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Platform Performance - Sales vs Ad Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Globe className="w-5 h-5 text-blue-600" />
            ประสิทธิภาพแพลตฟอร์ม (ยอดขาย vs ค่าโฆษณา)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.platformPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลในช่วงนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>แพลตฟอร์ม</TableHead>
                    <TableHead className="text-right">ยอดขาย</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ค่าโฆษณา</TableHead>
                    <TableHead className="text-right hidden md:table-cell">กำไร</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ออเดอร์</TableHead>
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
                        <TableCell className="text-right text-orange-600 hidden sm:table-cell">
                          ฿{platform.adCost.toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right font-semibold hidden md:table-cell ${platform.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
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
                        <TableCell className="text-right hidden sm:table-cell">{platform.orderCount}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Performance - Sales vs Ad Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Store className="w-5 h-5 text-purple-600" />
            ประสิทธิภาพร้านค้า (ยอดขาย vs ค่าโฆษณา)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.shopPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีข้อมูลร้านค้าในช่วงนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ร้านค้า</TableHead>
                    <TableHead className="hidden sm:table-cell">แพลตฟอร์ม</TableHead>
                    <TableHead className="text-right">ยอดขาย</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ค่าโฆษณา</TableHead>
                    <TableHead className="text-right hidden md:table-cell">กำไร</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ออเดอร์</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.shopPerformance
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((shop) => (
                      <TableRow key={shop.shopId}>
                        <TableCell className="font-medium">{shop.shop}</TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">{shop.platform}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          ฿{shop.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-orange-600 hidden sm:table-cell">
                          ฿{shop.adCost.toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right font-semibold hidden md:table-cell ${shop.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
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
                        <TableCell className="text-right hidden sm:table-cell">{shop.orderCount}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad Costs by Platform & Expense by Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Megaphone className="w-5 h-5 text-orange-600" />
              ค่าโฆษณาตามแพลตฟอร์ม
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
                    <div key={ad.platform} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ad.platform}</span>
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
                  <div className="flex justify-between font-bold text-sm">
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
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <CreditCard className="w-5 h-5 text-red-600" />
              ค่าใช้จ่ายอื่นๆ (ไม่รวมค่าแอด)
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
                    <div key={expense.category} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{expense.category}</span>
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
                  <div className="flex justify-between font-bold text-sm">
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
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Globe className="w-5 h-5 text-green-600" />
            ยอดขายตามแพลตฟอร์ม
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
                  <div key={platform.platform} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{platform.platform}</span>
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
                <div className="flex justify-between font-bold text-sm">
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
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Users className="w-5 h-5 text-purple-600" />
            ยอดขายตามพนักงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.ordersByEmployee.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มียอดขายในช่วงนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">ออเดอร์</TableHead>
                    <TableHead className="text-right">ยอดขาย</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">คอมมิชชั่น</TableHead>
                    <TableHead className="text-right">สัดส่วน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {data.ordersByEmployee
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((emp) => (
                    <TableRow key={emp.employee}>
                      <TableCell className="font-medium">{emp.employee}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{emp.count}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        ฿{emp.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-blue-600 hidden sm:table-cell">
                        {emp.commissionType === "fixed" ? (
                          <span>฿{emp.commission.toLocaleString()} (฿{emp.commissionValue.toFixed(0)}/ออเดอร์)</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <span>฿{emp.commission.toLocaleString()} ({(emp.commissionValue * 100).toFixed(1)}%)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {((emp.revenue / data.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <ShoppingCart className="w-5 h-5 text-slate-600" />
            ออเดอร์ล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">ไม่มีออเดอร์ในช่วงนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สินค้า</TableHead>
                    <TableHead className="hidden sm:table-cell">พนักงาน</TableHead>
                    <TableHead className="hidden md:table-cell">แพลตฟอร์ม</TableHead>
                    <TableHead className="text-right">ยอดขาย</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-xs sm:text-sm">
                              {item.product.name} x{item.quantity}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{order.items.length - 2} รายการ
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{order.employee.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.platform.name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ฿{order.totalPrice.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Info */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Package className="w-5 h-5 text-blue-600" />
              ข้อมูลสรุป
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
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
