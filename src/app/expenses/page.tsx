"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const [expensesRes, platformsRes, shopsRes] = await Promise.all([
      fetch("/api/expenses"),
      fetch("/api/platforms"),
      fetch("/api/shops"),
    ])
    setExpenses(await expensesRes.json())
    setPlatforms(await platformsRes.json())
    setShops(await shopsRes.json())
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
        date,
      }),
    })

    setDescription("")
    setAmount("")
    setCategory("")
    setIsAdCost(false)
    setPlatformId("")
    setShopId("")
    setDate(new Date().toISOString().split("T")[0])
    setLoading(false)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบรายการนี้?")) return

    await fetch(`/api/expenses/${id}`, { method: "DELETE" })
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">จัดการค่าใช้จ่าย</h1>

      <Card>
        <CardHeader>
          <CardTitle>บันทึกค่าใช้จ่าย</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad cost toggle */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="isAdCost"
                checked={isAdCost}
                onChange={(e) => {
                  setIsAdCost(e.target.checked)
                  if (e.target.checked) {
                    setCategory("")
                  } else {
                    setPlatformId("")
                  }
                }}
                className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isAdCost" className="text-blue-800 font-medium cursor-pointer">
                📢 นี่คือค่าโฆษณา (Ad Cost)
              </Label>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
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
                    <Label htmlFor="platform">แพลตฟอร์ม</Label>
                    <Select
                      id="platform"
                      value={platformId}
                      onChange={(e) => {
                        setPlatformId(e.target.value)
                        setShopId("") // Reset shop when platform changes
                      }}
                      required
                    >
                      <option value="">เลือกแพลตฟอร์ม</option>
                      {platforms.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shop">ร้านค้า</Label>
                    <Select
                      id="shop"
                      value={shopId}
                      onChange={(e) => setShopId(e.target.value)}
                      disabled={!platformId}
                    >
                      <option value="">เลือกร้านค้า (ถ้ามี)</option>
                      {filteredShops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึกค่าใช้จ่าย"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ค่าใช้จ่ายรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ฿{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📢 ค่าโฆษณารวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ฿{totalAdCosts.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ค่าใช้จ่ายอื่นๆ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ฿{totalOtherExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📢 ค่าโฆษณาตามแพลตฟอร์ม/ร้าน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(adCostsByPlatformShop).map(([key, amount]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span className="font-semibold text-orange-600">฿{amount.toLocaleString()}</span>
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
            <CardTitle>ค่าใช้จ่ายตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between">
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
          <CardTitle>รายการค่าใช้จ่าย ({expenses.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>แพลตฟอร์ม/ร้าน</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.isAdCost ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        📢 ค่าโฆษณา
                      </span>
                    ) : (
                      expense.category
                    )}
                  </TableCell>
                  <TableCell>
                    {expense.platform ? (
                      <div>
                        <div>{expense.platform.name}</div>
                        {expense.shop && (
                          <div className="text-xs text-muted-foreground">
                            🏪 {expense.shop.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${expense.isAdCost ? "text-orange-600" : "text-red-600"}`}>
                    ฿{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    ยังไม่มีค่าใช้จ่าย
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
