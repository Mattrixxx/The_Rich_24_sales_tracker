"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Wallet, Plus, Trash2, Loader2, Megaphone, CreditCard, Store, Calendar, Globe, FolderOpen } from "lucide-react"

interface Platform {
  id: number
  name: string
}

interface Shop {
  id: number
  name: string
  platform: Platform
}

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  isAdCost: boolean
  platform: Platform | null
  shop: Shop | null
  date: string
  createdAt: string
}

const categories = [
  "ค่าขนส่ง",
  "ค่าแพ็คเกจ",
  "ค่าเช่า",
  "เงินเดือน",
  "ค่าสาธารณูปโภค",
  "ค่าวัสดุ",
  "อื่นๆ",
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [isAdCost, setIsAdCost] = useState(false)
  const [platformId, setPlatformId] = useState("")
  const [shopId, setShopId] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = async () => {
    const [expensesRes, platformsRes, shopsRes] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/platforms"),
      fetch("/api/shops"),
    ])
    setExpenses(await expensesRes.json())
    setPlatforms(await platformsRes.json())
    setShops(await shopsRes.json())
    setPageLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter shops by selected platform
  const filteredShops = shops.filter(
    (shop) => shop.platform.id === parseInt(platformId)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Format date without timezone issues
    const formatDateLocal = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount,
        category: isAdCost ? "ค่าโฆษณา" : category,
        isAdCost,
        platformId: isAdCost ? platformId : null,
        shopId: isAdCost ? shopId : null,
        date: date ? formatDateLocal(date) : formatDateLocal(new Date()),
      }),
    })

    setDescription("")
    setAmount("")
    setCategory("")
    setIsAdCost(false)
    setPlatformId("")
    setShopId("")
    setDate(new Date())
    setLoading(false)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)

    await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" })
    
    setDeleteLoading(false)
    setDeleteId(null)
    fetchData()
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalAdCosts = expenses.filter((e) => e.isAdCost).reduce((sum, e) => sum + e.amount, 0)
  const totalOtherExpenses = totalExpenses - totalAdCosts

  // Group by category (excluding ad costs)
  const expensesByCategory = expenses
    .filter((e) => !e.isAdCost)
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

  // Group ad costs by platform and shop
  const adCostsByPlatformShop = expenses
    .filter((e) => e.isAdCost)
    .reduce((acc, e) => {
      const platformName = e.platform?.name || "ไม่ระบุแพลตฟอร์ม"
      const shopName = e.shop?.name || "ไม่ระบุร้าน"
      const key = `${platformName} - ${shopName}`
      acc[key] = (acc[key] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">จัดการค่าใช้จ่าย</h1>
            <p className="text-sm text-muted-foreground">บันทึกค่าใช้จ่ายและค่าโฆษณา</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <CreditCard className="h-3 w-3" />
          {expenses.length} รายการ
        </Badge>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            บันทึกค่าใช้จ่าย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad cost toggle */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Checkbox
                id="isAdCost"
                checked={isAdCost}
                onCheckedChange={(checked) => {
                  setIsAdCost(checked === true)
                  if (checked) {
                    setCategory("")
                  } else {
                    setPlatformId("")
                  }
                }}
                className="h-5 w-5 border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
              />
              <Label htmlFor="isAdCost" className="text-orange-800 font-medium cursor-pointer flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                นี่คือค่าโฆษณา (Ad Cost)
              </Label>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <div className="sm:col-span-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isAdCost ? "เช่น: ค่าแอด Facebook ธันวาคม" : "รายละเอียดค่าใช้จ่าย"}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {isAdCost ? (
                <>
                  <div>
                    <Label htmlFor="platform" className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      แพลตฟอร์ม
                    </Label>
                    <Select
                      value={platformId}
                      onValueChange={(value) => {
                        setPlatformId(value)
                        setShopId("") // Reset shop when platform changes
                      }}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกแพลตฟอร์ม" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shop" className="flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      ร้านค้า
                    </Label>
                    <Select
                      value={shopId}
                      onValueChange={setShopId}
                      disabled={!platformId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกร้านค้า (ถ้ามี)" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredShops.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="category" className="flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    หมวดหมู่
                  </Label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="date" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  วันที่
                </Label>
                <DatePicker
                  date={date}
                  onDateChange={setDate}
                  placeholder="เลือกวันที่"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  บันทึกค่าใช้จ่าย
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-600" />
              ค่าใช้จ่ายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-red-600">
              ฿{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-orange-600" />
              ค่าโฆษณารวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-orange-600">
              ฿{totalAdCosts.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-red-600" />
              ค่าใช้จ่ายอื่นๆ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-3xl font-bold text-red-600">
              ฿{totalOtherExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Megaphone className="h-5 w-5 text-orange-600" />
              ค่าโฆษณาตามแพลตฟอร์ม/ร้าน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(adCostsByPlatformShop).map(([key, amount]) => (
                <div key={key} className="flex justify-between text-sm sm:text-base">
                  <span className="truncate mr-2">{key}</span>
                  <span className="font-semibold text-orange-600 whitespace-nowrap">฿{amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(adCostsByPlatformShop).length === 0 && (
                <p className="text-muted-foreground">ยังไม่มีค่าโฆษณา</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Wallet className="h-5 w-5 text-red-600" />
              ค่าใช้จ่ายตามหมวดหมู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between text-sm sm:text-base">
                  <span>{cat}</span>
                  <span className="font-semibold text-red-600">฿{amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(expensesByCategory).length === 0 && (
                <p className="text-muted-foreground">ยังไม่มีค่าใช้จ่าย</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <CreditCard className="h-5 w-5" />
            รายการค่าใช้จ่าย ({expenses.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="hidden sm:table-cell">ประเภท</TableHead>
                  <TableHead className="hidden md:table-cell">แพลตฟอร์ม/ร้าน</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(expense.date).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell className="max-w-[100px] sm:max-w-none truncate">{expense.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {expense.isAdCost ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          <Megaphone className="h-3 w-3" />
                          ค่าโฆษณา
                        </span>
                      ) : (
                        expense.category
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {expense.platform ? (
                        <div>
                          <div>{expense.platform.name}</div>
                          {expense.shop && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Store className="h-3 w-3" />
                              {expense.shop.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-medium text-xs sm:text-sm ${expense.isAdCost ? "text-orange-600" : "text-red-600"}`}>
                      ฿{expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">ยังไม่มีค่าใช้จ่าย</p>
                      <p className="text-sm">เริ่มต้นด้วยการบันทึกค่าใช้จ่ายใหม่</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="ลบค่าใช้จ่าย"
        description="คุณแน่ใจหรือไม่ที่จะลบรายการค่าใช้จ่ายนี้?"
        loading={deleteLoading}
      />
    </div>
  )
}
