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
import { ShoppingCart, Plus, Minus, Trash2, TrendingUp, DollarSign, Loader2, AlertCircle, Package } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

interface Employee {
  id: number
  name: string
  commissionRate: number
}

interface Platform {
  id: number
  name: string
}

interface Shop {
  id: number
  name: string
  platform: Platform
}

interface OrderItem {
  id: number
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Order {
  id: number
  employee: Employee
  platform: Platform
  shop: Shop | null
  items: OrderItem[]
  totalPrice: number
  commission: number
  note: string | null
  createdAt: string
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  stock: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  const [employeeId, setEmployeeId] = useState("")
  const [platformId, setPlatformId] = useState("")
  const [shopId, setShopId] = useState("")
  const [totalPrice, setTotalPrice] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Cart for multiple products
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState("1")

  const fetchData = async () => {
    const [ordersRes, productsRes, employeesRes, platformsRes, shopsRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/products"),
      fetch("/api/employees"),
      fetch("/api/platforms"),
      fetch("/api/shops"),
    ])

    setOrders(await ordersRes.json())
    setProducts(await productsRes.json())
    setEmployees(await employeesRes.json())
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

  const addToCart = () => {
    if (!selectedProductId || !selectedQuantity) return

    const product = products.find((p) => p.id === parseInt(selectedProductId))
    if (!product) return

    const quantity = parseInt(selectedQuantity)
    if (quantity <= 0) return

    // Check if product already in cart
    const existingIndex = cart.findIndex((item) => item.productId === selectedProductId)
    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity,
          stock: product.stock,
        },
      ])
    }

    setSelectedProductId("")
    setSelectedQuantity("1")
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setError("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ")
      return
    }
    
    setLoading(true)
    setError("")

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        platformId,
        shopId: shopId || null,
        totalPrice,
        note,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด")
      setLoading(false)
      return
    }

    // Reset form
    setEmployeeId("")
    setPlatformId("")
    setShopId("")
    setTotalPrice("")
    setNote("")
    setCart([])
    setLoading(false)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบออเดอร์นี้?")) return

    await fetch(`/api/orders/${id}`, { method: "DELETE" })
    fetchData()
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0)

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">จัดการออเดอร์</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Plus className="h-5 w-5" />
            บันทึกออเดอร์ใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Add product to cart */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                เพิ่มสินค้า
              </h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="product">สินค้า</Label>
                  <Select
                    id="product"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">เลือกสินค้า</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (คงเหลือ: {p.stock})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">จำนวน</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addToCart} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มสินค้า
                  </Button>
                </div>
              </div>
            </div>

            {/* Cart items */}
            {cart.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  รายการสินค้าในออเดอร์ ({cart.length} รายการ)
                </h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 rounded border gap-2"
                    >
                      <span className="font-medium truncate">{item.productName}</span>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <Label htmlFor="employee">พนักงาน</Label>
                <Select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </div>
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
              <div>
                <Label htmlFor="totalPrice">ราคารวม (บาท)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  step="0.01"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="note">หมายเหตุ</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="หมายเหตุ (ถ้ามี)"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading || cart.length === 0} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      บันทึกออเดอร์
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              ยอดขายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              ฿{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              คอมมิชชั่นรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              ฿{totalCommission.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <ShoppingCart className="h-5 w-5" />
            รายการออเดอร์ ({orders.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="hidden sm:table-cell">พนักงาน</TableHead>
                  <TableHead className="hidden md:table-cell">แพลตฟอร์ม</TableHead>
                  <TableHead className="hidden lg:table-cell">ร้านค้า</TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">คอมมิชชั่น</TableHead>
                  <TableHead className="hidden lg:table-cell">หมายเหตุ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleDateString("th-TH")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[100px] sm:max-w-none">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-xs sm:text-sm truncate">
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
                    <TableCell className="hidden lg:table-cell">{order.shop?.name || "-"}</TableCell>
                    <TableCell className="text-right font-medium text-xs sm:text-sm">
                      ฿{order.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 hidden sm:table-cell">
                      ฿{order.commission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">
                      {order.note || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">ลบ</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      ยังไม่มีออเดอร์
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
